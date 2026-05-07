#!/usr/bin/env python3
"""
03_crosscheck.py
================
Cross-check data/dishes.json against Wikidata and Wikipedia source data.

Checks performed per dish:
  - era vs. Wikidata P571 inception year         (HIGH if mismatch)
  - name_fr vs. Wikidata rdfs:label@fr           (MEDIUM if mismatch)
  - chef vs. Wikidata P170 creator               (MEDIUM if mismatch)
  - keyIngredients overlap with Wikidata P527    (LOW if zero overlap)
  - Wikipedia QID cross-validation               (INFO)

Requires: output/wikidata_raw.json and output/wikipedia_raw.json to exist.
Run 01 and 02 first.

Output: output/crosscheck_report.json
  {
    "_meta": { status_summary, high_priority_dishes, ... },
    "all_issues_flat": [ { dish_id, field, severity, message }, ... ],
    "by_dish_id": { "<dish_id>": { overall_status, issues, diffs, ... } }
  }

Run:
  python 03_crosscheck.py
"""

import json
import datetime
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
DATA_DIR = SCRIPT_DIR.parent.parent / "data"

QIDS_FILE       = SCRIPT_DIR / "dish_qids.json"
WIKIDATA_FILE   = SCRIPT_DIR / "output" / "wikidata_raw.json"
WIKIPEDIA_FILE  = SCRIPT_DIR / "output" / "wikipedia_raw.json"
DISHES_FILE     = DATA_DIR / "dishes.json"
OUTPUT_FILE     = SCRIPT_DIR / "output" / "crosscheck_report.json"

ERA_RANGES = [
    ("medieval",     1300, 1600),
    ("careme",       1780, 1855),
    ("escoffier",    1880, 1935),
    ("nouvelle",     1960, 1985),
    ("contemporary", 2000, 2100),
]


# ---------------------------------------------------------------------------
# Era helpers
# ---------------------------------------------------------------------------
def year_to_era(year):
    if year is None:
        return None
    for era_id, start, end in ERA_RANGES:
        if start <= year <= end:
            return era_id
    return f"out_of_range({year})"


def era_severity(current_era, wikidata_era):
    if wikidata_era is None:
        return "NO_WIKIDATA_DATE"
    if wikidata_era.startswith("out_of_range"):
        return "POSSIBLE_MISMATCH"
    if wikidata_era == current_era:
        return "OK"
    return "CONFIRMED_MISMATCH"


# ---------------------------------------------------------------------------
# String normalization
# ---------------------------------------------------------------------------
_ACCENTS = str.maketrans(
    "éèêàâôûîùœæç",
    "eeeaaouiuoac",
)

def normalize(s):
    if not s:
        return ""
    return s.lower().translate(_ACCENTS).replace("-", " ").replace("  ", " ").strip()


# ---------------------------------------------------------------------------
# Chef name normalization with alias table
# ---------------------------------------------------------------------------
CHEF_ALIASES = {
    "antonin careme":  ["careme", "marie-antonin careme", "marie antonin careme"],
    "auguste escoffier": ["escoffier", "georges auguste escoffier"],
    "paul bocuse":     ["bocuse"],
    "thomas keller":   ["keller", "thomas aloysius keller"],
    "taillevent":      ["guillaume tirel", "tirel"],
}

def normalize_chef(name):
    if not name:
        return ""
    n = normalize(name)
    for canonical, aliases in CHEF_ALIASES.items():
        if n == canonical or any(alias in n for alias in aliases):
            return canonical
    return n

def chef_matches(current, wikidata):
    if current is None and wikidata is None:
        return True
    if current is None or wikidata is None:
        return False
    return normalize_chef(current) == normalize_chef(wikidata)


# ---------------------------------------------------------------------------
# Per-dish crosscheck
# ---------------------------------------------------------------------------
def crosscheck_dish(dish, qid_info, wikidata_record, wikipedia_record):
    dish_id = dish["id"]
    issues = []
    diffs = {}

    # ── Era ──────────────────────────────────────────────────────────────────
    wd_year = (wikidata_record or {}).get("inception_year")
    wd_era  = year_to_era(wd_year)
    sev     = era_severity(dish["era"], wd_era)

    diffs["era"] = {
        "current":              dish["era"],
        "wikidata_year":        wd_year,
        "wikidata_date_raw":    (wikidata_record or {}).get("inception_date_raw"),
        "wikidata_inferred_era": wd_era,
        "severity":             sev,
    }

    if sev == "CONFIRMED_MISMATCH":
        issues.append({
            "field": "era", "severity": "HIGH",
            "message": (
                f"Era mismatch: current='{dish['era']}', "
                f"Wikidata year={wd_year} → inferred='{wd_era}'"
            ),
        })
    elif sev == "POSSIBLE_MISMATCH":
        issues.append({
            "field": "era", "severity": "MEDIUM",
            "message": (
                f"Possible era mismatch: Wikidata year={wd_year} "
                f"falls between defined era boundaries. Review manually."
            ),
        })
    elif sev == "NO_WIKIDATA_DATE":
        issues.append({
            "field": "era", "severity": "INFO",
            "message": "No Wikidata inception date — era cannot be verified from source.",
        })

    # ── name_fr ──────────────────────────────────────────────────────────────
    wd_name = (wikidata_record or {}).get("label_fr")
    name_match = normalize(dish["name_fr"]) == normalize(wd_name)

    diffs["name_fr"] = {
        "current":  dish["name_fr"],
        "wikidata": wd_name,
        "match":    name_match,
    }
    if wd_name and not name_match:
        issues.append({
            "field": "name_fr", "severity": "MEDIUM",
            "message": f"name_fr differs: current='{dish['name_fr']}', wikidata='{wd_name}'",
        })

    # ── chef ─────────────────────────────────────────────────────────────────
    wd_creator = (wikidata_record or {}).get("creator_fr")
    wd_named   = (wikidata_record or {}).get("named_after_fr")
    chef_ok    = chef_matches(dish.get("chef"), wd_creator)

    diffs["chef"] = {
        "current":         dish.get("chef"),
        "wikidata_creator": wd_creator,
        "wikidata_named_after": wd_named,
        "match":           chef_ok,
    }
    if not chef_ok:
        issues.append({
            "field": "chef", "severity": "MEDIUM",
            "message": (
                f"chef differs: current='{dish.get('chef')}', "
                f"wikidata_creator='{wd_creator}'"
            ),
        })

    # ── keyIngredients ────────────────────────────────────────────────────────
    wd_ingredients  = (wikidata_record or {}).get("ingredients_fr", [])
    cur_ingredients = dish.get("keyIngredients", [])

    overlap = [
        ing for ing in cur_ingredients
        if any(
            normalize(ing) in normalize(w) or normalize(w) in normalize(ing)
            for w in wd_ingredients
        )
    ]
    coverage = round(len(overlap) / len(cur_ingredients) * 100, 1) if cur_ingredients else 0

    diffs["keyIngredients"] = {
        "current":       cur_ingredients,
        "wikidata":      wd_ingredients,
        "overlap":       overlap,
        "coverage_pct":  coverage,
    }
    if wd_ingredients and cur_ingredients and len(overlap) == 0:
        issues.append({
            "field": "keyIngredients", "severity": "LOW",
            "message": (
                "Zero overlap between current and Wikidata ingredients — "
                "either the QID is wrong or ingredient naming differs."
            ),
        })

    # ── Wikipedia QID cross-validation ───────────────────────────────────────
    wp_rec = wikipedia_record or {}
    expected_qid = (qid_info or {}).get("qid")
    wp_qid       = wp_rec.get("qid_cross_validation", {}).get("wikipedia_reported_qid")
    consistent   = wp_rec.get("qid_cross_validation", {}).get("consistent")

    diffs["wikipedia"] = {
        "article_found":       wp_rec.get("found", False),
        "extract_length":      wp_rec.get("extract_length_chars", 0),
        "expected_qid":        expected_qid,
        "wikipedia_qid":       wp_qid,
        "qid_consistent":      consistent,
        "first_200_chars":     (wp_rec.get("extract") or "")[:200].replace("\n", " "),
    }
    if consistent is False:
        issues.append({
            "field": "qid", "severity": "INFO",
            "message": (
                f"Wikipedia article links to {wp_qid}, "
                f"but dish_qids.json expects {expected_qid}. "
                f"Verify which QID is correct."
            ),
        })

    # ── Overall status ───────────────────────────────────────────────────────
    sevs = [i["severity"] for i in issues]
    if "HIGH" in sevs:
        status = "NEEDS_CORRECTION"
    elif "MEDIUM" in sevs:
        status = "NEEDS_REVIEW"
    elif "LOW" in sevs or "INFO" in sevs:
        status = "INFO_ONLY"
    else:
        status = "OK"

    return {
        "dish_id":        dish_id,
        "overall_status": status,
        "issue_count":    len(issues),
        "issues":         issues,
        "diffs":          diffs,
        "wikidata_available":  wikidata_record is not None,
        "wikipedia_available": wp_rec.get("found", False),
    }


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    for path in [WIKIDATA_FILE, WIKIPEDIA_FILE]:
        if not path.exists():
            print(f"[ERROR] Missing: {path}")
            print("        Run 01_wikidata_fetch.py and 02_wikipedia_enrich.py first.")
            raise SystemExit(1)

    print("[1/4] Loading source files")
    with open(QIDS_FILE,      encoding="utf-8") as f: qids_data      = json.load(f)
    with open(WIKIDATA_FILE,  encoding="utf-8") as f: wikidata_data  = json.load(f)
    with open(WIKIPEDIA_FILE, encoding="utf-8") as f: wikipedia_data = json.load(f)
    with open(DISHES_FILE,    encoding="utf-8") as f: dishes         = json.load(f)

    print(f"      {len(dishes)} dishes loaded from dishes.json")

    wd_by_dish = wikidata_data.get("by_dish_id", {})
    wp_by_dish = wikipedia_data.get("by_dish_id", {})

    STATUS_SYMBOL = {
        "OK":               "✓",
        "INFO_ONLY":        "i",
        "NEEDS_REVIEW":     "?",
        "NEEDS_CORRECTION": "✗",
    }

    print("\n[2/4] Running crosscheck")
    print(f"      {'Dish ID':<38} Status")
    print(f"      {'-'*38} ------")

    reports = []
    for dish in dishes:
        dish_id  = dish["id"]
        qid_info = qids_data["dishes"].get(dish_id, {})
        report   = crosscheck_dish(
            dish,
            qid_info,
            wd_by_dish.get(dish_id),
            wp_by_dish.get(dish_id),
        )
        reports.append(report)
        sym = STATUS_SYMBOL.get(report["overall_status"], "?")
        print(f"      [{sym}] {dish_id:<36} {report['overall_status']}")

    print("\n[3/4] Building summary")
    status_counts = {}
    for r in reports:
        status_counts[r["overall_status"]] = status_counts.get(r["overall_status"], 0) + 1

    all_issues = []
    for r in reports:
        for issue in r["issues"]:
            all_issues.append({**issue, "dish_id": r["dish_id"]})

    high_priority = [r["dish_id"] for r in reports if r["overall_status"] == "NEEDS_CORRECTION"]
    needs_review  = [r["dish_id"] for r in reports if r["overall_status"] == "NEEDS_REVIEW"]

    output = {
        "_meta": {
            "generated_at":       datetime.datetime.utcnow().isoformat() + "Z",
            "dishes_checked":     len(reports),
            "status_summary":     status_counts,
            "high_priority_dishes": high_priority,
            "needs_review_dishes":  needs_review,
            "total_issues":       len(all_issues),
        },
        "all_issues_flat": all_issues,
        "by_dish_id":      {r["dish_id"]: r for r in reports},
    }

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\n[OK] Written to {OUTPUT_FILE}")
    print(f"     Status breakdown: {status_counts}")
    if high_priority:
        print(f"\n     NEEDS_CORRECTION ({len(high_priority)}):")
        for d in high_priority:
            era_diff = output["by_dish_id"][d]["diffs"]["era"]
            print(f"       {d}: {era_diff['current']} → {era_diff['wikidata_inferred_era']} "
                  f"(Wikidata year: {era_diff['wikidata_year']})")


if __name__ == "__main__":
    main()
