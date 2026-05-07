#!/usr/bin/env python3
"""
04_build_candidates.py
======================
Merge Wikidata/Wikipedia findings with current dishes.json to produce
a candidate replacement that is source-traced and ready for editorial review.

Field-level merge policy
------------------------
  era             Overwritten if Wikidata confirms CONFIRMED_MISMATCH; kept otherwise.
  name_fr         Overwritten with Wikidata label_fr if different (normalized mismatch).
  chef            Filled from Wikidata P170 if current is null; replaced if mismatch.
  keyIngredients  Extended with Wikidata P527 items not already present.
  origin          Kept as-is; Wikidata candidate appended as [WIKIDATA_CANDIDATE: ...].
  description     Kept as-is; annotated [NEEDS_REWRITE_BASED_ON: ...] when HIGH/MEDIUM issues exist.
  remySensory     Never modified (purely creative, not source-traceable).
  name_zh         Never modified (requires manual translation review).

Output: output/dishes_candidates.json
  {
    "_meta":               { dishes_with_changes, change_log, ... },
    "candidates_annotated": [ ... ],   # Full provenance + annotation markers
    "candidates_clean":    [ ... ]    # Annotation markers stripped — valid dishes.json replacement
  }

After editorial review of candidates_annotated, copy candidates_clean to data/dishes.json
and run: npx tsc --noEmit

Run:
  python 04_build_candidates.py
"""

import json
import datetime
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent
DATA_DIR   = SCRIPT_DIR.parent.parent / "data"

QIDS_FILE       = SCRIPT_DIR / "dish_qids.json"
WIKIDATA_FILE   = SCRIPT_DIR / "output" / "wikidata_raw.json"
WIKIPEDIA_FILE  = SCRIPT_DIR / "output" / "wikipedia_raw.json"
CROSSCHECK_FILE = SCRIPT_DIR / "output" / "crosscheck_report.json"
DISHES_FILE     = DATA_DIR   / "dishes.json"
OUTPUT_FILE     = SCRIPT_DIR / "output" / "dishes_candidates.json"

VALID_ERA_IDS = {"medieval", "careme", "escoffier", "nouvelle", "contemporary"}

# Wikidata French country name → Chinese
COUNTRY_ZH = {
    "france":      "法国",
    "royaume-uni": "英国",
    "italie":      "意大利",
    "allemagne":   "德国",
    "espagne":     "西班牙",
    "belgique":    "比利时",
    "monaco":      "摩纳哥",
}


# ---------------------------------------------------------------------------
# String helpers
# ---------------------------------------------------------------------------
_ACCENTS = str.maketrans("éèêàâôûîùœæç", "eeeaaouiuoac")

def normalize(s):
    if not s:
        return ""
    return s.lower().translate(_ACCENTS).replace("-", " ").strip()


CHEF_ALIASES = {
    "antonin careme":    ["careme", "marie-antonin careme"],
    "auguste escoffier": ["escoffier", "georges auguste escoffier"],
    "paul bocuse":       ["bocuse"],
    "thomas keller":     ["keller"],
    "taillevent":        ["guillaume tirel"],
}

def normalize_chef(name):
    if not name:
        return ""
    n = normalize(name)
    for canonical, aliases in CHEF_ALIASES.items():
        if n == canonical or any(alias in n for alias in aliases):
            return canonical
    return n


# ---------------------------------------------------------------------------
# Field-level builders
# ---------------------------------------------------------------------------
def build_era(dish_id, current_era, crosscheck):
    notes = []
    era_diff = crosscheck.get("diffs", {}).get("era", {})
    sev      = era_diff.get("severity", "NO_WIKIDATA_DATE")
    wd_era   = era_diff.get("wikidata_inferred_era")
    wd_year  = era_diff.get("wikidata_year")

    if sev == "CONFIRMED_MISMATCH" and wd_era in VALID_ERA_IDS:
        notes.append(
            f"ERA CORRECTED: '{current_era}' → '{wd_era}' "
            f"(Wikidata P571 inception year: {wd_year}). "
            "Manual verification recommended before accepting."
        )
        return wd_era, notes

    if sev == "OK":
        notes.append(f"Era '{current_era}' confirmed by Wikidata (year: {wd_year}).")
    elif sev == "POSSIBLE_MISMATCH":
        notes.append(
            f"Era '{current_era}' — Wikidata year {wd_year} falls between "
            "defined era boundaries. Review manually."
        )
    elif sev == "NO_WIKIDATA_DATE":
        notes.append(f"Era '{current_era}' — no Wikidata inception date to verify against.")

    return current_era, notes


def build_name_fr(current, crosscheck):
    diff  = crosscheck.get("diffs", {}).get("name_fr", {})
    wd    = diff.get("wikidata")
    match = diff.get("match", True)
    notes = []

    if wd and not match:
        notes.append(f"name_fr updated: '{current}' → '{wd}' (Wikidata label).")
        return wd, notes

    if wd and match:
        notes.append("name_fr confirmed by Wikidata.")

    return current, notes


def build_chef(current, crosscheck):
    diff       = crosscheck.get("diffs", {}).get("chef", {})
    wd_creator = diff.get("wikidata_creator")
    match      = diff.get("match", True)
    notes      = []

    if wd_creator and current is None:
        notes.append(f"chef filled from Wikidata P170: '{wd_creator}'.")
        return wd_creator, notes

    if wd_creator and not match:
        notes.append(
            f"chef mismatch: current='{current}', Wikidata='{wd_creator}'. "
            "Using Wikidata — verify manually."
        )
        return wd_creator, notes

    return current, notes


def build_ingredients(current, crosscheck, wikidata_record):
    wd_ingredients = (wikidata_record or {}).get("ingredients_fr", [])
    notes = []

    if not wd_ingredients:
        notes.append("keyIngredients — no Wikidata P527 data available.")
        return current, notes

    cur_norm = {normalize(i) for i in current}
    additional = [
        w for w in wd_ingredients
        if normalize(w) not in cur_norm
        and not any(normalize(w) in normalize(c) or normalize(c) in normalize(w) for c in current)
    ]

    merged = list(current)
    if additional:
        notes.append(
            f"Wikidata P527 items not in current list (appended for review): {additional}"
        )
        merged.extend(additional)
    else:
        notes.append("keyIngredients consistent with Wikidata P527 (or no additional items).")

    return merged, notes


def build_origin(current, crosscheck, wikidata_record):
    notes = []
    if not wikidata_record:
        return current, ["origin — no Wikidata data available."]

    country_fr = wikidata_record.get("country_of_origin_fr")
    year       = wikidata_record.get("inception_year")

    if not country_fr:
        return current, ["origin — no Wikidata P495 country of origin."]

    country_zh = COUNTRY_ZH.get(country_fr.lower(), country_fr)
    candidate  = f"{country_zh}，{year}年" if year else country_zh

    if normalize(candidate) != normalize(current):
        notes.append(
            f"Wikidata origin candidate: '{candidate}' (current: '{current}'). "
            "Current value may be more geographically specific — review before replacing."
        )
        return f"{current} [WIKIDATA_CANDIDATE: {candidate}]", notes

    notes.append("origin consistent with Wikidata country/year.")
    return current, notes


def build_description(current, crosscheck, wikipedia_record, changes_made):
    high_issues   = [i for i in crosscheck.get("issues", []) if i.get("severity") == "HIGH"]
    medium_issues = [i for i in crosscheck.get("issues", []) if i.get("severity") == "MEDIUM"]

    if not high_issues and not medium_issues and not changes_made:
        return current

    changed_facts = [i["message"] for i in high_issues + medium_issues]

    wp_extract = (wikipedia_record or {}).get("extract") or ""
    if wp_extract:
        snippet = wp_extract[:300].replace("\n", " ")
        changed_facts.append(f"Wikipedia intro: {snippet}...")

    annotation = "[NEEDS_REWRITE_BASED_ON: " + " | ".join(changed_facts) + "]"
    return f"{current}\n{annotation}"


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main():
    for path in [WIKIDATA_FILE, WIKIPEDIA_FILE, CROSSCHECK_FILE]:
        if not path.exists():
            print(f"[ERROR] Missing: {path}")
            print("        Run scripts 01–03 first.")
            raise SystemExit(1)

    print("[1/5] Loading source files")
    with open(QIDS_FILE,       encoding="utf-8") as f: qids_data      = json.load(f)
    with open(WIKIDATA_FILE,   encoding="utf-8") as f: wikidata_data  = json.load(f)
    with open(WIKIPEDIA_FILE,  encoding="utf-8") as f: wikipedia_data = json.load(f)
    with open(CROSSCHECK_FILE, encoding="utf-8") as f: crosscheck_data= json.load(f)
    with open(DISHES_FILE,     encoding="utf-8") as f: dishes         = json.load(f)

    wd_by_dish  = wikidata_data.get("by_dish_id",  {})
    wp_by_dish  = wikipedia_data.get("by_dish_id", {})
    cc_by_dish  = crosscheck_data.get("by_dish_id", {})

    print(f"\n[2/5] Building candidates for {len(dishes)} dishes")
    print(f"      {'Dish ID':<38} Changes")
    print(f"      {'-'*38} -------")

    annotated  = []
    clean      = []
    change_log = []

    for dish in dishes:
        dish_id    = dish["id"]
        crosscheck = cc_by_dish.get(dish_id, {})
        wd_record  = wd_by_dish.get(dish_id)
        wp_record  = wp_by_dish.get(dish_id)

        provenance = {}
        changes    = []

        new_era, era_notes = build_era(dish_id, dish["era"], crosscheck)
        provenance["era"] = era_notes
        if new_era != dish["era"]:
            changes.append(f"era: '{dish['era']}' → '{new_era}'")

        new_name_fr, name_notes = build_name_fr(dish["name_fr"], crosscheck)
        provenance["name_fr"] = name_notes
        if new_name_fr != dish["name_fr"]:
            changes.append(f"name_fr: '{dish['name_fr']}' → '{new_name_fr}'")

        new_chef, chef_notes = build_chef(dish.get("chef"), crosscheck)
        provenance["chef"] = chef_notes
        if new_chef != dish.get("chef"):
            changes.append(f"chef: '{dish.get('chef')}' → '{new_chef}'")

        new_ingredients, ing_notes = build_ingredients(
            dish.get("keyIngredients", []), crosscheck, wd_record
        )
        provenance["keyIngredients"] = ing_notes
        if new_ingredients != dish.get("keyIngredients", []):
            added = [x for x in new_ingredients if x not in dish.get("keyIngredients", [])]
            changes.append(f"keyIngredients: +{added}")

        new_origin, origin_notes = build_origin(
            dish.get("origin", ""), crosscheck, wd_record
        )
        provenance["origin"] = origin_notes

        new_description = build_description(
            dish["description"], crosscheck, wp_record, changes
        )

        candidate = {
            "id":             dish_id,
            "name_fr":        new_name_fr,
            "name_zh":        dish["name_zh"],
            "era":            new_era,
            "origin":         new_origin,
            "description":    new_description,
            "remySensory":    dish["remySensory"],
            "keyIngredients": new_ingredients,
            "chef":           new_chef,
            "_provenance": {
                "pipeline_version":  "1.0",
                "wikidata_qid":      (qids_data["dishes"].get(dish_id) or {}).get("qid"),
                "crosscheck_status": crosscheck.get("overall_status", "NOT_CHECKED"),
                "fields_changed":    changes,
                "notes":             provenance,
            },
        }
        annotated.append(candidate)

        # Clean version: strip markers and _provenance
        clean_origin = new_origin.split(" [WIKIDATA_CANDIDATE:")[0]
        clean_desc   = new_description.split("\n[NEEDS_REWRITE_BASED_ON:")[0]
        clean.append({
            "id":             dish_id,
            "name_fr":        new_name_fr,
            "name_zh":        dish["name_zh"],
            "era":            new_era,
            "origin":         clean_origin,
            "description":    clean_desc,
            "remySensory":    dish["remySensory"],
            "keyIngredients": new_ingredients,
            "chef":           new_chef,
        })

        if changes:
            change_log.append({"dish_id": dish_id, "changes": changes})
            print(f"      [CHANGED] {dish_id:<34} {', '.join(changes)}")
        else:
            print(f"      [OK]      {dish_id}")

    print(f"\n[3/5] Validating clean candidates against TypeScript schema")
    errors = []
    for c in clean:
        missing = [f for f in ["id","name_fr","name_zh","era","origin","description","remySensory","keyIngredients"] if f not in c]
        if missing:
            errors.append(f"{c['id']}: missing fields {missing}")
        if c["era"] not in VALID_ERA_IDS:
            errors.append(f"{c['id']}: invalid era '{c['era']}'")
    if errors:
        print(f"[WARN] Schema issues found:")
        for e in errors: print(f"       {e}")
    else:
        print(f"      All {len(clean)} candidates pass schema check.")

    output = {
        "_meta": {
            "generated_at":       datetime.datetime.utcnow().isoformat() + "Z",
            "source_dish_count":  len(dishes),
            "dishes_with_changes": len(change_log),
            "schema_errors":      errors,
            "change_log":         change_log,
            "next_step": (
                "Review candidates_annotated for editorial sign-off. "
                "Then copy candidates_clean to data/dishes.json "
                "and run: npx tsc --noEmit"
            ),
        },
        "candidates_annotated": annotated,
        "candidates_clean":     clean,
    }

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\n[OK] Written to {OUTPUT_FILE}")
    print(f"     {len(change_log)} dishes have proposed changes.")
    if change_log:
        print("\n     Change summary:")
        for entry in change_log:
            print(f"       {entry['dish_id']}: {entry['changes']}")


if __name__ == "__main__":
    main()
