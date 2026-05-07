#!/usr/bin/env python3
"""
01_wikidata_fetch.py
====================
Query the Wikidata SPARQL endpoint for all dishes in dish_qids.json.

Fetched properties:
  - rdfs:label@fr       French dish name
  - P571               inception date
  - P495               country of origin
  - P170               creator / chef
  - P138               named after
  - P527               has ingredient (multi-valued)

Output: output/wikidata_raw.json
  {
    "_meta": { ... },
    "by_qid":     { "<QID>": { ...record } },
    "by_dish_id": { "<dish_id>": { ...record } }   # may point to same record for shared QIDs
  }

Run:
  python 01_wikidata_fetch.py
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
SPARQL_ENDPOINT = "https://query.wikidata.org/sparql"
USER_AGENT = (
    "FrenchCuisineHistoryResearch/1.0 "
    "(educational history visualization; https://github.com/example/la-table-du-temps)"
)
REQUEST_DELAY_S = 1.5  # Wikidata rate-limit courtesy delay before single query

SCRIPT_DIR = Path(__file__).parent
QIDS_FILE = SCRIPT_DIR / "dish_qids.json"
OUTPUT_DIR = SCRIPT_DIR / "output"
OUTPUT_FILE = OUTPUT_DIR / "wikidata_raw.json"

# Era ranges used for inception-year → era inference
ERA_RANGES = [
    ("medieval",     1300, 1600),
    ("careme",       1780, 1855),
    ("escoffier",    1880, 1935),
    ("nouvelle",     1960, 1985),
    ("contemporary", 2000, 2100),
]


# ---------------------------------------------------------------------------
# SPARQL query
# ---------------------------------------------------------------------------
def build_sparql_query(qids: list) -> str:
    """
    Build a single batch SPARQL query using a VALUES clause.
    One HTTP round-trip for all dishes — efficient and polite to the endpoint.
    """
    values_block = " ".join(f"(wd:{qid})" for qid in qids)

    return f"""
SELECT DISTINCT
  ?item
  ?itemLabel_fr
  ?inceptionDate
  ?countryOfOrigin
  ?countryOfOriginLabel
  ?creator
  ?creatorLabel
  ?namedAfter
  ?namedAfterLabel
  ?ingredient
  ?ingredientLabel
WHERE {{
  VALUES (?item) {{ {values_block} }}

  # French label
  OPTIONAL {{
    ?item rdfs:label ?itemLabel_fr .
    FILTER(LANG(?itemLabel_fr) = "fr")
  }}

  # Inception date (P571)
  OPTIONAL {{ ?item wdt:P571 ?inceptionDate . }}

  # Country of origin (P495)
  OPTIONAL {{
    ?item wdt:P495 ?countryOfOrigin .
    ?countryOfOrigin rdfs:label ?countryOfOriginLabel .
    FILTER(LANG(?countryOfOriginLabel) = "fr")
  }}

  # Creator / chef (P170)
  OPTIONAL {{
    ?item wdt:P170 ?creator .
    ?creator rdfs:label ?creatorLabel .
    FILTER(LANG(?creatorLabel) = "fr")
  }}

  # Named after (P138) — e.g. Tournedos Rossini → Rossini
  OPTIONAL {{
    ?item wdt:P138 ?namedAfter .
    ?namedAfter rdfs:label ?namedAfterLabel .
    FILTER(LANG(?namedAfterLabel) = "fr")
  }}

  # Has ingredient / has part (P527)
  OPTIONAL {{
    ?item wdt:P527 ?ingredient .
    ?ingredient rdfs:label ?ingredientLabel .
    FILTER(LANG(?ingredientLabel) = "fr")
  }}
}}
ORDER BY ?item
"""


# ---------------------------------------------------------------------------
# HTTP
# ---------------------------------------------------------------------------
def sparql_query(query: str) -> dict:
    """Execute a SPARQL query, return parsed JSON. Raises on HTTP/network error."""
    params = urlencode({"query": query, "format": "json"})
    url = f"{SPARQL_ENDPOINT}?{params}"
    req = Request(
        url,
        headers={
            "User-Agent": USER_AGENT,
            "Accept": "application/sparql-results+json",
        },
    )
    try:
        with urlopen(req, timeout=90) as response:
            return json.loads(response.read().decode("utf-8"))
    except HTTPError as e:
        print(f"[ERROR] HTTP {e.code}: {e.reason}", file=sys.stderr)
        if e.code == 429:
            print("[ERROR] Rate limited. Wait a minute and retry.", file=sys.stderr)
        raise
    except URLError as e:
        print(f"[ERROR] Network error: {e.reason}", file=sys.stderr)
        raise


# ---------------------------------------------------------------------------
# Post-processing
# ---------------------------------------------------------------------------
def pivot_results(sparql_results: dict) -> dict:
    """
    SPARQL returns one row per (item × ingredient) combination.
    Pivot into a dict keyed by QID, accumulating ingredient lists.
    """
    records = {}

    for row in sparql_results.get("results", {}).get("bindings", []):
        def val(key):
            return row[key]["value"] if key in row else None

        # Extract QID from URI: http://www.wikidata.org/entity/Q190174 → Q190174
        item_uri = val("item") or ""
        qid = item_uri.rsplit("/", 1)[-1]
        if not qid:
            continue

        if qid not in records:
            records[qid] = {
                "qid": qid,
                "label_fr": val("itemLabel_fr"),
                "inception_date_raw": val("inceptionDate"),
                "country_of_origin_fr": val("countryOfOriginLabel"),
                "creator_fr": val("creatorLabel"),
                "named_after_fr": val("namedAfterLabel"),
                "ingredients_fr": [],
            }

        ingredient = val("ingredientLabel")
        if ingredient and ingredient not in records[qid]["ingredients_fr"]:
            records[qid]["ingredients_fr"].append(ingredient)

    return records


def extract_year(date_str):
    """Extract 4-digit year from Wikidata ISO 8601 date (+1893-00-00T00:00:00Z)."""
    if not date_str:
        return None
    cleaned = date_str.lstrip("+")
    try:
        return int(cleaned[:4])
    except (ValueError, IndexError):
        return None


def infer_era(year):
    """Map inception year to era ID, or describe out-of-range."""
    if year is None:
        return None
    for era_id, start, end in ERA_RANGES:
        if start <= year <= end:
            return era_id
    return f"out_of_range({year})"


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    OUTPUT_DIR.mkdir(exist_ok=True)

    print(f"[1/3] Loading {QIDS_FILE.name}")
    with open(QIDS_FILE, encoding="utf-8") as f:
        qids_data = json.load(f)

    dish_to_qid = {
        dish_id: info["qid"]
        for dish_id, info in qids_data["dishes"].items()
    }
    unique_qids = list(set(dish_to_qid.values()))
    print(f"      {len(dish_to_qid)} dishes → {len(unique_qids)} unique QIDs")

    print(f"\n[2/3] Querying Wikidata SPARQL (waiting {REQUEST_DELAY_S}s first)")
    time.sleep(REQUEST_DELAY_S)
    query = build_sparql_query(unique_qids)
    raw = sparql_query(query)
    row_count = len(raw.get("results", {}).get("bindings", []))
    print(f"      Received {row_count} result rows")

    print("\n[3/3] Pivoting results and inferring eras")
    qid_records = pivot_results(raw)

    for record in qid_records.values():
        year = extract_year(record["inception_date_raw"])
        record["inception_year"] = year
        record["inferred_era"] = infer_era(year)

    # by_dish_id: each dish_id → its QID record (shared QIDs produce shared references)
    by_dish_id = {}
    for dish_id, qid in dish_to_qid.items():
        if qid in qid_records:
            by_dish_id[dish_id] = qid_records[qid]
        else:
            by_dish_id[dish_id] = {
                "qid": qid,
                "error": "not_returned_by_sparql",
                "label_fr": None,
                "inception_year": None,
                "inferred_era": None,
            }

    missing_qids = [qid for qid in unique_qids if qid not in qid_records]

    output = {
        "_meta": {
            "generated_at": datetime.datetime.utcnow().isoformat() + "Z",
            "sparql_endpoint": SPARQL_ENDPOINT,
            "unique_qids_queried": len(unique_qids),
            "qids_with_results": len(qid_records),
            "missing_qids": missing_qids,
        },
        "by_qid": qid_records,
        "by_dish_id": by_dish_id,
    }

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\n[OK] Written to {OUTPUT_FILE}")
    if missing_qids:
        print(f"[WARN] No Wikidata result for QIDs: {missing_qids}")
        print("       These may be incorrect QIDs — verify in dish_qids.json.")


if __name__ == "__main__":
    main()
