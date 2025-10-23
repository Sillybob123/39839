# File Name: convert_commentary.py
# Description: Converts a text file of Torah commentary and keywords into a structured JSON file.
# Version 5: Line-by-line parsing for better accuracy

import re
import json
from collections import defaultdict
import sys

## --------------------- Configuration --------------------- ##

# --- Input/Output Files ---
INPUT_FILENAME = 'Genesis.txt'
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
    """Parses a verse reference string (e.g., 'Genesis 1:1' or 'Genesis 32:2 (32:1 Heb)')."""
    match = re.match(r"^\s*(\w+)\s+(\d+):(\d+)(?:\s*\([^)]+\))?\s*$", ref_str)
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

def split_entries(content):
    """Splits content into individual entries based on the pattern."""
    # Split on lines that start with a quote followed by a verse reference
    entries = []
    current_entry = []
    
    lines = content.split('\n')
    
    for line in lines:
        # Check if line starts a new entry (begins with "Genesis or similar)
        if re.match(r'^\s*"[A-Z][a-z]+\s+\d+:\d+', line):
            if current_entry:
                entries.append('\n'.join(current_entry))
            current_entry = [line]
        elif current_entry:
            current_entry.append(line)
    
    # Don't forget the last entry
    if current_entry:
        entries.append('\n'.join(current_entry))
    
    return entries

def parse_entry(entry_text):
    """Parse a single entry to extract verse ref, type, and content."""
    # Try to match commentary format
    commentary_match = re.match(
        r'^\s*"([^"]+)"\s*-\s*"source":\s*"([^"]+)"\s*-\s*"explanation":\s*"(.+)"$',
        entry_text,
        re.DOTALL
    )
    
    if commentary_match:
        verse_ref, source, explanation = commentary_match.groups()
        return {
            'type': 'commentary',
            'verse_ref': verse_ref.strip(),
            'source': source.strip(),
            'content': explanation.strip()
        }
    
    # Try to match keyword format
    keyword_match = re.match(
        r'^\s*"([^"]+)"\s*-\s*"keyword":\s*"([^"]+)"\s*-\s*"definition":\s*"(.+)"$',
        entry_text,
        re.DOTALL
    )
    
    if keyword_match:
        verse_ref, word, definition = keyword_match.groups()
        return {
            'type': 'keyword',
            'verse_ref': verse_ref.strip(),
            'word': word.strip(),
            'content': definition.strip()
        }
    
    return None

## --------------------- Main Processing Logic --------------------- ##

print(f"Starting conversion of '{INPUT_FILENAME}'...")

parsed_data = defaultdict(lambda: defaultdict(lambda: {"commentary": [], "keywords": []}))

entries_processed = 0
entries_matched = 0
unknown_parsha_verses = set()

# --- Read entire file content ---
try:
    with open(INPUT_FILENAME, 'r', encoding='utf-8') as infile:
        content = infile.read()
    
    print("File read successfully. Splitting into entries...")
    
    entries = split_entries(content)
    print(f"Found {len(entries)} potential entries")
    
    for entry_text in entries:
        entries_processed += 1
        parsed = parse_entry(entry_text)
        
        if not parsed:
            # Try to extract just the verse reference for debugging
            ref_match = re.match(r'^\s*"([^"]+)"', entry_text)
            if ref_match:
                print(f"   Warning: Could not parse entry starting with: '{ref_match.group(1)}'")
            continue
        
        verse_ref = parsed['verse_ref']
        book, chapter, verse_num = parse_verse_ref(verse_ref)
        
        if not book:
            print(f"   Warning: Could not parse verse reference: '{verse_ref}'")
            continue
        
        parsha = get_parsha_name(book, chapter, verse_num)
        if parsha == "Unknown Parsha":
            unknown_parsha_verses.add(verse_ref)
        
        if parsed['type'] == 'commentary':
            parsed_data[parsha][verse_ref]["commentary"].append({
                "source": parsed['source'],
                "explanation": parsed['content']
            })
            entries_matched += 1
        elif parsed['type'] == 'keyword':
            parsed_data[parsha][verse_ref]["keywords"].append({
                "word": parsed['word'],
                "definition": parsed['content']
            })
            entries_matched += 1

except FileNotFoundError:
    print(f"FATAL ERROR: Input file '{INPUT_FILENAME}' not found.")
    sys.exit(1)
except Exception as e:
    print(f"FATAL ERROR: An unexpected error occurred during parsing: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print(f"\nParsing complete. Total entries processed: {entries_processed}. Successfully matched: {entries_matched}.")

if unknown_parsha_verses:
    print(f"   Warning: Could not assign {len(unknown_parsha_verses)} verse(s) to a known Parsha:")
    for verse in sorted(list(unknown_parsha_verses))[:10]:  # Show first 10
        print(f"      - {verse}")
    if len(unknown_parsha_verses) > 10:
        print(f"      ... and {len(unknown_parsha_verses) - 10} more")

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
        key=lambda ref: parse_verse_ref(ref)[1:3] if parse_verse_ref(ref)[0] else (999, 999)
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
        verse_count = len(parsha_entry['verses'])
        commentary_count = sum(len(v['commentary']) for v in parsha_entry['verses'])
        keyword_count = sum(len(v['keywords']) for v in parsha_entry['verses'])
        print(f"      → {verse_count} verses, {commentary_count} commentaries, {keyword_count} keywords")
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
    print(f"\nFinal Summary:")
    print(f"  - Parshas processed: {len(final_json_structure['parshas'])}")
    total_verses = sum(len(p['verses']) for p in final_json_structure['parshas'])
    total_commentary = sum(sum(len(v['commentary']) for v in p['verses']) for p in final_json_structure['parshas'])
    total_keywords = sum(sum(len(v['keywords']) for v in p['verses']) for p in final_json_structure['parshas'])
    print(f"  - Total verses: {total_verses}")
    print(f"  - Total commentaries: {total_commentary}")
    print(f"  - Total keywords: {total_keywords}")
except Exception as e:
    print(f"FATAL ERROR: An error occurred while writing the JSON file: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
