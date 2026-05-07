#!/usr/bin/env python3
"""
00_search_qids.py
=================
Search Wikidata for each dish by its French name using the wbsearchentities API.
Outputs candidate QIDs with descriptions so you can identify the correct one
and update dish_qids.json manually.

Run BEFORE the rest of the pipeline to find correct QIDs.

Output: output/qid_search_results.json  (for review)
        Also prints a summary table to the terminal.

Run:
  python 00_search_qids.py
"""

import json
import time
import datetime
from pathlib import Path
from urllib.request import urlopen, Request
from urllib.parse import urlencode
from urllib.error import HTTPError, URLError

WIKIDATA_SEARCH_API = "https://www.wikidata.org/w/api.php"
USER_AGENT = "FrenchCuisineHistoryResearch/1.0 (educational project)"
REQUEST_DELAY_S = 2.0   # Wikidata search API is stricter than SPARQL; 2s is safe
MAX_RETRIES = 4

SCRIPT_DIR  = Path(__file__).parent
DATA_DIR    = SCRIPT_DIR.parent.parent / "data"
DISHES_FILE = DATA_DIR / "dishes.json"
QIDS_FILE   = SCRIPT_DIR / "dish_qids.json"
OUTPUT_DIR  = SCRIPT_DIR / "output"
OUTPUT_FILE = OUTPUT_DIR / "qid_search_results.json"

# Food-related Wikidata type keywords to prioritize in results
FOOD_KEYWORDS = {
    "plat", "mets", "aliment", "boisson", "sauce", "dessert", "pâtisserie",
    "confiserie", "gastronomie", "cuisine", "recette", "potage", "soupe",
    "tarte", "gâteau", "pain", "fromage", "charcuterie", "viande", "dish",
    "food", "beverage", "drink", "pastry", "cake", "soup",
}


def search_entity(name_fr: str, limit: int = 5) -> list:
    """
    Search Wikidata for items matching a French label.
    Returns up to `limit` candidates with id, label, description.
    """
    params = {
        "action":   "wbsearchentities",
        "search":   name_fr,
        "language": "fr",
        "type":     "item",
        "limit":    limit,
        "format":   "json",
        "utf8":     "1",
    }
    url = f"{WIKIDATA_SEARCH_API}?{urlencode(params)}"
    req = Request(url, headers={"User-Agent": USER_AGENT})

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            with urlopen(req, timeout=30) as resp:
                data = json.loads(resp.read().decode("utf-8"))
            break
        except HTTPError as e:
            if e.code == 429:
                wait = 5 * attempt  # 5s, 10s, 15s, 20s
                print(f"\n  [429] Rate limited. Waiting {wait}s before retry {attempt}/{MAX_RETRIES}...")
                time.sleep(wait)
                if attempt == MAX_RETRIES:
                    raise
            else:
                raise
        except (URLError, ConnectionError, OSError) as e:
            if attempt == MAX_RETRIES:
                raise
            wait = 5 * attempt
            print(f"\n  [Connection error] {e}. Waiting {wait}s before retry {attempt}/{MAX_RETRIES}...")
            time.sleep(wait)
    else:
        raise RuntimeError(f"Failed after {MAX_RETRIES} retries")

    candidates = []
    for result in data.get("search", []):
        qid         = result.get("id", "")
        label       = result.get("label", "")
        description = result.get("description", "")
        url_link    = f"https://www.wikidata.org/wiki/{qid}"

        # Score: food-related descriptions rank higher
        desc_lower  = description.lower()
        food_score  = sum(1 for kw in FOOD_KEYWORDS if kw in desc_lower)

        candidates.append({
            "qid":         qid,
            "label":       label,
            "description": description,
            "url":         url_link,
            "food_score":  food_score,
        })

    # Sort: food-related items first
    candidates.sort(key=lambda x: -x["food_score"])
    return candidates


def is_plausibly_correct(current_qid: str, candidates: list) -> bool:
    """Return True if the current QID appears in the top search results."""
    return any(c["qid"] == current_qid for c in candidates)


def main():
    OUTPUT_DIR.mkdir(exist_ok=True)

    with open(DISHES_FILE, encoding="utf-8") as f:
        dishes = json.load(f)
    with open(QIDS_FILE, encoding="utf-8") as f:
        qids_data = json.load(f)

    print(f"Searching Wikidata for {len(dishes)} dishes by French name...\n")
    print(f"{'Dish ID':<36} {'Current QID':<12} {'Best candidate QID':<12} Match?  Best label / description")
    print("-" * 120)

    results = {}
    needs_update = []

    for dish in dishes:
        dish_id  = dish["id"]
        name_fr  = dish["name_fr"].split("（")[0].strip()  # Strip Chinese annotations like "（当代重读）"
        current_qid = (qids_data["dishes"].get(dish_id) or {}).get("qid", "?")

        time.sleep(REQUEST_DELAY_S)
        candidates = search_entity(name_fr, limit=8)

        match = is_plausibly_correct(current_qid, candidates)
        best  = candidates[0] if candidates else {}

        status = "✓" if match else "✗"
        best_label = (best.get("label", "") + " — " + best.get("description", ""))[:60]

        print(
            f"{dish_id:<36} {current_qid:<12} "
            f"{best.get('qid', 'N/A'):<12} [{status}]    {best_label}"
        )

        results[dish_id] = {
            "dish_id":      dish_id,
            "name_fr":      name_fr,
            "current_qid":  current_qid,
            "current_qid_in_results": match,
            "candidates":   candidates,
            "recommended_qid": best.get("qid") if not match else current_qid,
            "recommended_label": best.get("label"),
            "recommended_desc":  best.get("description"),
        }

        if not match:
            needs_update.append(dish_id)

    output = {
        "_meta": {
            "generated_at": datetime.datetime.utcnow().isoformat() + "Z",
            "dishes_searched": len(dishes),
            "qids_needing_update": needs_update,
            "instructions": (
                "For each dish in qids_needing_update, open the candidate URLs, "
                "verify which QID is the correct French cuisine item, "
                "then update dish_qids.json accordingly. "
                "After updating, re-run scripts 01–04."
            ),
        },
        "by_dish_id": results,
    }

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\n{'='*80}")
    print(f"[OK] Full results written to {OUTPUT_FILE}")
    print(f"\n{len(needs_update)} dishes need QID updates:")
    for d in needs_update:
        r = results[d]
        print(f"  {d:<36} recommended: {r['recommended_qid']} ({r['recommended_label']} — {r['recommended_desc']})")

    print(f"\nNext step: verify recommended QIDs, update dish_qids.json, then re-run 01–04.")


if __name__ == "__main__":
    main()
