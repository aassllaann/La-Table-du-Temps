#!/usr/bin/env python3
"""
02_wikipedia_enrich.py
======================
Fetch French Wikipedia intro extracts for all dishes in dish_qids.json.

Uses the MediaWiki action API:
  action=query&prop=extracts|pageprops&exintro=1&explaintext=1&redirects=1

Also fetches ppprop=wikibase_item so we can cross-validate that the Wikipedia
article points to the same Wikidata QID we have in dish_qids.json.

Output: output/wikipedia_raw.json
  {
    "_meta": { ... },
    "by_dish_id": {
      "<dish_id>": {
        "found": true/false,
        "extract": "...",
        "wikidata_qid": "Q...",
        ...
      }
    }
  }

Run:
  python 02_wikipedia_enrich.py
"""

import json
import time
import sys
import datetime
from pathlib import Path
from urllib.request import urlopen, Request
from urllib.parse import urlencode
from urllib.error import HTTPError, URLError

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
WIKI_API = "https://fr.wikipedia.org/w/api.php"
USER_AGENT = (
    "FrenchCuisineHistoryResearch/1.0 "
    "(educational history visualization; contact via project repository)"
)
BATCH_SIZE = 20       # MediaWiki supports up to 50; 20 is conservative and safe
REQUEST_DELAY_S = 1.0

SCRIPT_DIR = Path(__file__).parent
QIDS_FILE = SCRIPT_DIR / "dish_qids.json"
OUTPUT_DIR = SCRIPT_DIR / "output"
OUTPUT_FILE = OUTPUT_DIR / "wikipedia_raw.json"


# ---------------------------------------------------------------------------
# Wikipedia API
# ---------------------------------------------------------------------------
def fetch_extracts_batch(titles: list) -> dict:
    """
    Fetch plaintext intro extracts for a batch of French Wikipedia article titles.
    Returns dict keyed by normalized article title as returned by the API.
    """
    params = {
        "action": "query",
        "prop": "extracts|pageprops",
        "exintro": "1",
        "explaintext": "1",
        "exsectionformat": "plain",
        "ppprop": "wikibase_item",   # Get the Wikidata QID linked from each article
        "titles": "|".join(titles),
        "format": "json",
        "utf8": "1",
        "redirects": "1",            # Follow redirects automatically
    }

    url = f"{WIKI_API}?{urlencode(params)}"
    req = Request(url, headers={"User-Agent": USER_AGENT})

    try:
        with urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except HTTPError as e:
        print(f"[ERROR] Wikipedia API HTTP {e.code}: {e.reason}", file=sys.stderr)
        raise
    except URLError as e:
        print(f"[ERROR] Network error: {e.reason}", file=sys.stderr)
        raise

    # Build redirect lookup: original title → resolved title
    redirects = {
        r["from"]: r["to"]
        for r in data.get("query", {}).get("redirects", [])
    }

    results = {}
    for page_id, page in data.get("query", {}).get("pages", {}).items():
        title = page.get("title", "")
        extract = page.get("extract", "") or ""
        wikidata_qid = page.get("pageprops", {}).get("wikibase_item")

        if page_id == "-1":
            results[title] = {
                "title": title,
                "found": False,
                "extract": None,
                "wikidata_qid": None,
                "extract_length_chars": 0,
            }
        else:
            results[title] = {
                "title": title,
                "found": True,
                "extract": extract,
                "wikidata_qid": wikidata_qid,
                "extract_length_chars": len(extract),
            }

    return results, redirects


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    OUTPUT_DIR.mkdir(exist_ok=True)

    print(f"[1/3] Loading {QIDS_FILE.name}")
    with open(QIDS_FILE, encoding="utf-8") as f:
        qids_data = json.load(f)

    # Build dish_id → wp_fr_title, deduplicate titles for API efficiency
    dish_to_title = {}
    for dish_id, info in qids_data["dishes"].items():
        title = info.get("wp_fr_title")
        if title:
            dish_to_title[dish_id] = title

    unique_titles = list(set(dish_to_title.values()))
    print(f"      {len(dish_to_title)} dish entries → {len(unique_titles)} unique Wikipedia titles")

    # Split into batches
    batches = [
        unique_titles[i : i + BATCH_SIZE]
        for i in range(0, len(unique_titles), BATCH_SIZE)
    ]
    print(f"\n[2/3] Fetching {len(batches)} batch(es) from {WIKI_API}")

    all_results = {}
    all_redirects = {}

    for batch_idx, batch in enumerate(batches, 1):
        print(f"      Batch {batch_idx}/{len(batches)} ({len(batch)} titles) ...", end=" ")
        time.sleep(REQUEST_DELAY_S)
        batch_results, batch_redirects = fetch_extracts_batch(batch)
        all_results.update(batch_results)
        all_redirects.update(batch_redirects)
        found_in_batch = sum(1 for r in batch_results.values() if r.get("found"))
        print(f"{found_in_batch}/{len(batch)} found")

    print("\n[3/3] Building dish-keyed output")

    by_dish_id = {}
    for dish_id, title in dish_to_title.items():
        expected_qid = qids_data["dishes"][dish_id].get("qid")

        # The API may return the page under a redirected title
        record = all_results.get(title)
        if record is None:
            # Try looking up the redirect target
            redirected_title = all_redirects.get(title)
            if redirected_title:
                record = all_results.get(redirected_title)

        if record is None:
            record = {
                "title": title,
                "found": False,
                "extract": None,
                "wikidata_qid": None,
                "extract_length_chars": 0,
            }

        # Cross-validate: does this Wikipedia article link to the QID we expect?
        wp_qid = record.get("wikidata_qid")
        qid_consistent = (wp_qid == expected_qid) if wp_qid else None

        by_dish_id[dish_id] = {
            "dish_id": dish_id,
            "wp_fr_title_requested": title,
            "qid_cross_validation": {
                "expected_qid": expected_qid,
                "wikipedia_reported_qid": wp_qid,
                "consistent": qid_consistent,
            },
            **record,
        }

    # Summary
    found_count = sum(1 for r in by_dish_id.values() if r.get("found"))
    not_found = [d for d, r in by_dish_id.items() if not r.get("found")]
    qid_mismatches = [
        d for d, r in by_dish_id.items()
        if r["qid_cross_validation"]["consistent"] is False
    ]

    output = {
        "_meta": {
            "generated_at": datetime.datetime.utcnow().isoformat() + "Z",
            "wiki_api": WIKI_API,
            "unique_titles_requested": len(unique_titles),
            "found": found_count,
            "not_found_count": len(not_found),
            "not_found_dish_ids": not_found,
            "qid_mismatch_dish_ids": qid_mismatches,
        },
        "by_dish_id": by_dish_id,
    }

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\n[OK] Written to {OUTPUT_FILE}")
    if not_found:
        print(f"[WARN] Not found on French Wikipedia: {not_found}")
        print("       Check wp_fr_title values in dish_qids.json.")
    if qid_mismatches:
        print(f"[WARN] QID mismatch (Wikipedia article → different Wikidata item): {qid_mismatches}")
        print("       These dishes may be mapped to the wrong Wikipedia article.")


if __name__ == "__main__":
    main()
