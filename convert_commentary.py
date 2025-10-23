# File Name: convert_commentary.py
# Description: Converts a text file of Torah commentary and keywords into a structured JSON file.
# Version 3: Fixed to handle entries that may not be on separate lines.

import re
import json
from collections import defaultdict
import sys

## --------------------- Configuration --------------------- ##

# --- Input/Output Files ---
INPUT_FILENAME = 'commentary_input.txt'
OUTPUT_FILENAME = 'data.json'

# --- Parsha Definitions ---
PARSHA_RANGES = {
    "Bereshit": ("Genesis", 1, 1, 6, 8),
    "Noah": ("Genesis", 6, 9, 11, 32),
    "Lech Lecha": ("Genesis", 12, 1, 17, 27),
    "Vayera": ("Genesis", 18, 1, 22, 24),
    "Chayei Sara": ("Genesis", 23, 1, 25, 18),
    "Toldot": ("Genesis", 25, 19, 28, 9),
    "Vayetzei": ("Genesis", 28, 10, 32, 3),
    "Vayishlach": ("Genesis", 32, 4, 36, 43),
    "Vayeshev": ("Genesis", 37, 1, 40, 23),
    "Miketz": ("Genesis", 41, 1, 44, 17),
    "Vayigash": ("Genesis", 44, 18, 47, 27),
    "Vayechi": ("Genesis", 47, 28, 50, 26),
}

## --------------------- Helper Functions --------------------- ##

def parse_verse_ref(ref_str):
    """Parses a verse reference string (e.g., 'Genesis 1:1') into book, chapter, verse."""
    match = re.match(r"^\s*(\w+)\s+(\d+):(\d+)\s*$", ref_str)
    if match:
        book, chapter, verse = match.groups()
        return book, int(chapter), int(verse)
    return None, None, None

def get_parsha_name(book, chapter, verse):
    """Determines the parsha name based on book, chapter, and verse."""
    for name, (p_book, sc, sv, ec, ev) in PARSHA_RANGES.items():
        if book == p_book:
            if chapter > sc and chapter < ec: 
                return name
            if chapter == sc and verse >= sv:
                if sc == ec and verse <= ev: 
                    return name
                if sc != ec: 
                    return name
            if chapter == ec and verse <= ev:
                if sc != ec: 
                    return name
    return "Unknown Parsha"

def get_parsha_reference_string(name):
    """Generates the full reference string for a parsha."""
    if name in PARSHA_RANGES:
        p_book, sc, sv, ec, ev = PARSHA_RANGES[name]
        return f"{p_book} {sc}:{sv}–{ec}:{ev}"
    return "Unknown Reference"

## --------------------- Main Processing Logic --------------------- ##

print(f"Starting conversion of '{INPUT_FILENAME}'...")

parsed_data = defaultdict(lambda: defaultdict(lambda: {"commentary": [], "keywords": []}))

# FIXED: Use findall to extract all matches from the entire file content
# This handles cases where entries are not on separate lines
commentary_pattern = re.compile(r'"([^"]+)"\s*-\s*"source":\s*"([^"]+)"\s*-\s*"explanation":\s*"(.+?)"(?=\s+"[^"]+"\s*-\s*"|$)')
keyword_pattern = re.compile(r'"([^"]+)"\s*-\s*"keyword":\s*"([^"]+)"\s*-\s*"definition":\s*"(.+?)"(?=\s+"[^"]+"\s*-\s*"|$)')

entries_processed = 0
entries_matched = 0
unknown_parsha_verses = set()

# --- Read entire file content ---
try:
    with open(INPUT_FILENAME, 'r', encoding='utf-8') as infile:
        content = infile.read()
    
    print("File read successfully. Parsing entries...")
    
    # Find all commentary entries
    for match in commentary_pattern.finditer(content):
        entries_processed += 1
        ref_str, source, explanation = match.groups()
        book, chapter, verse_num = parse_verse_ref(ref_str)
        
        if book:
            parsha = get_parsha_name(book, chapter, verse_num)
            if parsha == "Unknown Parsha":
                unknown_parsha_verses.add(ref_str)
            parsed_data[parsha][ref_str]["commentary"].append({
                "source": source.strip(),
                "explanation": explanation.strip()
            })
            entries_matched += 1
        else:
            print(f"   Warning: Could not parse verse reference in commentary: '{ref_str}'")
    
    # Find all keyword entries
    for match in keyword_pattern.finditer(content):
        entries_processed += 1
        ref_str, word, definition = match.groups()
        book, chapter, verse_num = parse_verse_ref(ref_str)
        
        if book:
            parsha = get_parsha_name(book, chapter, verse_num)
            if parsha == "Unknown Parsha":
                unknown_parsha_verses.add(ref_str)
            parsed_data[parsha][ref_str]["keywords"].append({
                "word": word.strip(),
                "definition": definition.strip()
            })
            entries_matched += 1
        else:
            print(f"   Warning: Could not parse verse reference in keyword: '{ref_str}'")

except FileNotFoundError:
    print(f"FATAL ERROR: Input file '{INPUT_FILENAME}' not found.")
    sys.exit(1)
except Exception as e:
    print(f"FATAL ERROR: An unexpected error occurred during parsing: {e}")
    sys.exit(1)

print(f"\nParsing complete. Total entries found: {entries_processed}. Successfully matched: {entries_matched}.")

if unknown_parsha_verses:
    print(f"   Warning: Could not assign {len(unknown_parsha_verses)} verse(s) to a known Parsha: {', '.join(sorted(list(unknown_parsha_verses)))}")

# --- Convert to final JSON format ---
final_json_structure = {"parshas": []}

parsha_order = list(PARSHA_RANGES.keys())
sorted_parsha_names = sorted(
    parsed_data.keys(),
    key=lambda p: parsha_order.index(p) if p in parsha_order else float('inf')
)

print("\nStructuring JSON output...")
found_valid_parsha = False

for parsha_name in sorted_parsha_names:
    if parsha_name == "Unknown Parsha":
        continue

    print(f"   Processing Parsha: {parsha_name}")
    found_valid_parsha = True
    parsha_entry = {
        "name": parsha_name,
        "reference": get_parsha_reference_string(parsha_name),
        "verses": []
    }

    verse_refs_sorted = sorted(
        parsed_data[parsha_name].keys(),
        key=lambda ref: parse_verse_ref(ref)[1:3]
    )

    for verse_ref_str in verse_refs_sorted:
        verse_data = parsed_data[parsha_name][verse_ref_str]
        verse_entry = {
            "ref": verse_ref_str,
            "commentary": verse_data["commentary"],
            "keywords": verse_data["keywords"]
        }
        if verse_entry["commentary"] or verse_entry["keywords"]:
            parsha_entry["verses"].append(verse_entry)

    if parsha_entry["verses"]:
        final_json_structure["parshas"].append(parsha_entry)
    else:
        print(f"   Note: Parsha '{parsha_name}' had no verses with commentary/keywords.")

if not found_valid_parsha:
    print("\nFATAL ERROR: No valid Parshas processed. Check input file format.")
    sys.exit(1)

# --- Write JSON output ---
print(f"\nWriting structured data to '{OUTPUT_FILENAME}'...")
try:
    with open(OUTPUT_FILENAME, 'w', encoding='utf-8') as outfile:
        json.dump(final_json_structure, outfile, indent=2, ensure_ascii=False)
    print(f"✅ Success! Converted {entries_matched} entries to '{OUTPUT_FILENAME}'")
    print(f"\nSummary:")
    print(f"  - Parshas processed: {len(final_json_structure['parshas'])}")
    for parsha in final_json_structure['parshas']:
        print(f"    • {parsha['name']}: {len(parsha['verses'])} verses")
except Exception as e:
    print(f"FATAL ERROR: An error occurred while writing the JSON file: {e}")
    sys.exit(1)
