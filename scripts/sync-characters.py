#!/usr/bin/env python3
"""
Sync Arknights character avatars and metadata from PRTS Wiki.

This script:
1. Fetches all avatar images from PRTS Wiki API
2. Fetches character metadata (rarity, class, tags) from wiki pages
3. Downloads images with Chinese names as filenames
4. Auto-generates manifest.json with full metadata

Usage:
    python scripts/sync-characters.py [--dry-run] [--rarity MIN_RARITY]

Options:
    --dry-run       Show what would be downloaded without actually downloading
    --rarity N      Only download characters with rarity >= N (0-5, default: 4)
                    Note: 5 = 6-star, 4 = 5-star, 3 = 4-star, etc.
    --all           Download all characters regardless of rarity
    --force         Re-download even if file exists
    --no-metadata   Skip fetching metadata (faster, but no tags)
    --filter STR    Only process characters whose name contains STR
"""

import argparse
import json
import os
import re
import ssl
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

# Create SSL context that doesn't verify certificates (for environments with SSL issues)
SSL_CONTEXT = ssl.create_default_context()
SSL_CONTEXT.check_hostname = False
SSL_CONTEXT.verify_mode = ssl.CERT_NONE

# Configuration
PRTS_API = "https://prts.wiki/api.php"
OUTPUT_DIR = Path(__file__).parent.parent / "public" / "images" / "arknights"
MANIFEST_FILE = OUTPUT_DIR / "manifest.json"
METADATA_FILE = OUTPUT_DIR / "metadata.json"

# Rarity mapping (PRTS uses 0-5, where 5 is highest)
RARITY_NAMES = {
    5: "6星",
    4: "5星",
    3: "4星",
    2: "3星",
    1: "2星",
    0: "1星",
}

# Class/Profession translations
CLASS_NAMES = {
    "先锋": "先锋",
    "近卫": "近卫",
    "重装": "重装",
    "狙击": "狙击",
    "术师": "术师",
    "医疗": "医疗",
    "辅助": "辅助",
    "特种": "特种",
}


def fetch_all_avatars():
    """Fetch all avatar image names from PRTS Wiki API."""
    avatars = []
    continue_token = None

    print("Fetching avatar list from PRTS Wiki...")

    while True:
        params = {
            "action": "query",
            "list": "allimages",
            "aiprefix": "头像_",
            "ailimit": "500",
            "format": "json",
        }
        if continue_token:
            params["aicontinue"] = continue_token

        url = f"{PRTS_API}?{urllib.parse.urlencode(params)}"

        try:
            with urllib.request.urlopen(url, timeout=30, context=SSL_CONTEXT) as response:
                data = json.loads(response.read().decode("utf-8"))
        except Exception as e:
            print(f"Error fetching API: {e}")
            break

        images = data.get("query", {}).get("allimages", [])
        avatars.extend(images)

        # Check for pagination
        if "continue" in data:
            continue_token = data["continue"].get("aicontinue")
            print(f"  Fetched {len(avatars)} images so far...")
        else:
            break

    print(f"Total avatars found: {len(avatars)}")
    return avatars


def filter_base_avatars(avatars):
    """Filter to only base avatars (no skins, no NPCs, no special variants)."""
    filtered = []

    for avatar in avatars:
        name = avatar.get("name", "")

        # Skip if not a PNG
        if not name.endswith(".png"):
            continue

        # Skip skins (e.g., 头像_阿米娅_skin1.png)
        if "_skin" in name or "_epoque" in name:
            continue

        # Skip NPCs (e.g., 头像_npc_xxx.png)
        if "_npc_" in name.lower() or name.startswith("头像_npc"):
            continue

        # Skip special variants (e.g., 头像_阿米娅_2.png, 头像_黑_V1.png, 头像_阿米娅_1+.png)
        # But keep alter forms which have full names like 浊心斯卡蒂
        if re.search(r"_\d+\+?\.png$", name) or "_V1" in name or "_2_" in name:
            continue

        # Skip enemy versions
        if name.startswith("敌人_") or "敌人" in name:
            continue

        # Skip recruit/other system images
        if "公招" in name or "寻访" in name:
            continue

        # Skip special event/promotional variants in parentheses
        # Keep: 阿米娅(近卫), 阿米娅(医疗) - these are legitimate class-change operators
        # Skip: 阿米娅(于万千宇宙之中), 阿米娅(寰宇独奏) - special event variants
        # Pattern: Skip if parentheses contain more than 2 characters (not just class names)
        parenthesis_match = re.search(r'\(([^)]+)\)', name)
        if parenthesis_match:
            content = parenthesis_match.group(1)
            # Keep only if it's a valid class name (医疗, 近卫, 术师, etc.)
            valid_classes = ["先锋", "近卫", "重装", "狙击", "术师", "医疗", "辅助", "特种"]
            if content not in valid_classes:
                continue

        # Skip internal ID format (char_xxx_xxx)
        if name.startswith("char_"):
            continue

        # Skip summons that might slip through (召唤物_)
        if "召唤物_" in name:
            continue

        filtered.append(avatar)

    return filtered


def extract_character_name(filename):
    """Extract character name from filename like '头像_银灰.png' -> '银灰'."""
    match = re.match(r"头像_(.+)\.png", filename)
    if match:
        return match.group(1)
    return None


def fetch_character_metadata(name):
    """Fetch character metadata from wiki page."""
    params = {
        "action": "parse",
        "page": name,
        "prop": "wikitext",
        "format": "json",
    }
    url = f"{PRTS_API}?{urllib.parse.urlencode(params)}"

    try:
        request = urllib.request.Request(
            url,
            headers={"User-Agent": "Mozilla/5.0 (compatible; ArkGuess/1.0)"}
        )
        with urllib.request.urlopen(request, timeout=10, context=SSL_CONTEXT) as response:
            data = json.loads(response.read().decode("utf-8"))

        wikitext = data.get("parse", {}).get("wikitext", {}).get("*", "")

        # Parse CharinfoV2 template
        metadata = {}

        # Rarity (稀有度)
        rarity_match = re.search(r"\|稀有度=(\d)", wikitext)
        if rarity_match:
            metadata["rarity"] = int(rarity_match.group(1))

        # Class (职业)
        class_match = re.search(r"\|职业=([^\|\n]+)", wikitext)
        if class_match:
            metadata["class"] = class_match.group(1).strip()

        # Subclass (分支)
        subclass_match = re.search(r"\|分支=([^\|\n]+)", wikitext)
        if subclass_match:
            metadata["subclass"] = subclass_match.group(1).strip()

        # Tags (标签)
        tags_match = re.search(r"\|标签=([^\|\n]+)", wikitext)
        if tags_match:
            tags_str = tags_match.group(1).strip()
            metadata["tags"] = [t.strip() for t in tags_str.split() if t.strip()]

        # Position (位置)
        position_match = re.search(r"\|位置=([^\|\n]+)", wikitext)
        if position_match:
            metadata["position"] = position_match.group(1).strip()

        # Faction (所属国家)
        faction_match = re.search(r"\|所属国家=([^\|\n]+)", wikitext)
        if faction_match:
            metadata["faction"] = faction_match.group(1).strip()

        return metadata

    except Exception as e:
        # Page might not exist or have different format
        return {}


def download_image(url, output_path, force=False, max_retries=2):
    """Download image from URL to output path using curl (more reliable)."""
    if output_path.exists() and not force:
        return False  # Already exists

    import subprocess

    for attempt in range(max_retries):
        try:
            # Use curl which handles SSL better
            result = subprocess.run(
                ["curl", "-f", "-s", "-L", "-o", str(output_path), url],
                timeout=15,
                capture_output=True
            )
            if result.returncode == 0:
                return True
        except Exception:
            pass

        if attempt < max_retries - 1:
            time.sleep(0.5)

    print(f"  Error downloading: {output_path.name}")
    return False


def generate_manifest(characters_data):
    """Generate simple manifest.json for the game (id, name, image only)."""
    manifest = {
        "name": "明日方舟",
        "characters": []
    }

    for name in sorted(characters_data.keys()):
        manifest["characters"].append({
            "id": name,
            "name": name,
            "image": f"{name}.png"
        })

    return manifest


def generate_metadata(characters_data):
    """
    Generate rich metadata.json for future gameplay features.

    Structure:
    {
        "version": "1.0",
        "lastUpdated": "2026-01-26",
        "characters": {
            "银灰": {
                "name": "银灰",
                "image": "银灰.png",
                "rarity": 5,
                "rarityLabel": "6星",
                "class": "近卫",
                "subclass": "领主",
                "position": "近战位",
                "faction": "谢拉格",
                "tags": ["输出", "支援"]
            }
        },
        "indexes": {
            "byRarity": { "6星": ["银灰", ...], "5星": [...] },
            "byClass": { "近卫": ["银灰", ...], "医疗": [...] },
            "byTag": { "输出": ["银灰", ...], "治疗": [...] },
            "byFaction": { "谢拉格": ["银灰", ...] },
            "byPosition": { "近战位": [...], "远程位": [...] }
        }
    }
    """
    from datetime import datetime

    metadata = {
        "version": "1.0",
        "lastUpdated": datetime.now().strftime("%Y-%m-%d"),
        "characters": {},
        "indexes": {
            "byRarity": {},
            "byClass": {},
            "bySubclass": {},
            "byTag": {},
            "byFaction": {},
            "byPosition": {},
        }
    }

    for name in sorted(characters_data.keys()):
        data = characters_data[name]

        char_entry = {
            "name": name,
            "image": f"{name}.png",
        }

        # Add all metadata fields
        if "rarity" in data:
            char_entry["rarity"] = data["rarity"]
            char_entry["rarityLabel"] = RARITY_NAMES.get(data["rarity"], f"{data['rarity']+1}星")

            # Index by rarity
            rarity_label = char_entry["rarityLabel"]
            if rarity_label not in metadata["indexes"]["byRarity"]:
                metadata["indexes"]["byRarity"][rarity_label] = []
            metadata["indexes"]["byRarity"][rarity_label].append(name)

        if "class" in data:
            char_entry["class"] = data["class"]
            # Index by class
            cls = data["class"]
            if cls not in metadata["indexes"]["byClass"]:
                metadata["indexes"]["byClass"][cls] = []
            metadata["indexes"]["byClass"][cls].append(name)

        if "subclass" in data:
            char_entry["subclass"] = data["subclass"]
            # Index by subclass
            subcls = data["subclass"]
            if subcls not in metadata["indexes"]["bySubclass"]:
                metadata["indexes"]["bySubclass"][subcls] = []
            metadata["indexes"]["bySubclass"][subcls].append(name)

        if "tags" in data and data["tags"]:
            char_entry["tags"] = data["tags"]
            # Index by tags
            for tag in data["tags"]:
                if tag not in metadata["indexes"]["byTag"]:
                    metadata["indexes"]["byTag"][tag] = []
                metadata["indexes"]["byTag"][tag].append(name)

        if "position" in data:
            char_entry["position"] = data["position"]
            # Index by position
            pos = data["position"]
            if pos not in metadata["indexes"]["byPosition"]:
                metadata["indexes"]["byPosition"][pos] = []
            metadata["indexes"]["byPosition"][pos].append(name)

        if "faction" in data:
            char_entry["faction"] = data["faction"]
            # Index by faction
            faction = data["faction"]
            if faction not in metadata["indexes"]["byFaction"]:
                metadata["indexes"]["byFaction"][faction] = []
            metadata["indexes"]["byFaction"][faction].append(name)

        metadata["characters"][name] = char_entry

    return metadata


def main():
    parser = argparse.ArgumentParser(description="Sync Arknights character avatars from PRTS Wiki")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be downloaded")
    parser.add_argument("--rarity", type=int, default=4, help="Minimum rarity 0-5 (default: 4 = 5-star+)")
    parser.add_argument("--all", action="store_true", help="Download all characters")
    parser.add_argument("--force", action="store_true", help="Re-download existing files")
    # Note: --no-metadata is no longer supported since we need metadata to filter valid operators
    # parser.add_argument("--no-metadata", action="store_true", help="Skip fetching metadata")
    parser.add_argument("--filter", type=str, help="Only process characters matching pattern")
    parser.add_argument("--workers", type=int, default=3, help="Number of parallel workers for metadata")
    args = parser.parse_args()

    # Ensure output directory exists
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Fetch all avatars
    avatars = fetch_all_avatars()

    # Filter to base avatars only
    avatars = filter_base_avatars(avatars)
    print(f"Base avatars (no skins): {len(avatars)}")

    # Extract character names and URLs
    characters = {}
    for avatar in avatars:
        name = extract_character_name(avatar.get("name", ""))
        if name:
            # Apply pattern filter if specified
            if args.filter and args.filter.lower() not in name.lower():
                continue
            characters[name] = {"url": avatar.get("url", "")}

    print(f"Characters found: {len(characters)}")

    # Fetch metadata - REQUIRED to validate valid operators
    print(f"\nFetching character metadata to validate operators... (0/{len(characters)})")
    total = len(characters)
    completed = 0
    failed = 0

    def fetch_meta(name):
        try:
            return name, fetch_character_metadata(name), None
        except Exception as e:
            return name, {}, str(e)

    with ThreadPoolExecutor(max_workers=args.workers) as executor:
        futures = {executor.submit(fetch_meta, name): name for name in characters}

        for future in as_completed(futures):
            name, metadata, error = future.result()
            if error:
                failed += 1
            else:
                characters[name].update(metadata)
            completed += 1

            # Show progress every 10 or at milestones
            if completed % 10 == 0 or completed == total:
                print(f"  Progress: {completed}/{total} ({failed} failed)")

            # Small delay to be nice to the server
            time.sleep(0.05)

    # Filter to ONLY valid operators (have both rarity and class metadata)
    print("\nFiltering to valid operators only...")
    valid_operators = {}
    invalid_count = 0
    for name, data in characters.items():
        # Valid operators MUST have both rarity and class
        # This automatically excludes summons, robots, and special units
        if "rarity" in data and "class" in data:
            valid_operators[name] = data
        else:
            invalid_count += 1
            if invalid_count <= 5:  # Show first few invalid ones
                print(f"  Excluded (no metadata): {name}")

    print(f"Valid operators: {len(valid_operators)} (excluded {invalid_count} without metadata)")
    characters = valid_operators

    # Filter by rarity if not downloading all
    if not args.all:
        filtered = {}
        for name, data in characters.items():
            rarity = data.get("rarity", -1)
            if rarity >= args.rarity:
                filtered[name] = data
        print(f"After rarity filter (>= {args.rarity}): {len(filtered)} characters")
        characters = filtered

    if args.dry_run:
        print("\n[DRY RUN] Would process:")
        for name in sorted(characters.keys()):
            data = characters[name]
            output_path = OUTPUT_DIR / f"{name}.png"
            status = "EXISTS" if output_path.exists() else "NEW"
            rarity = RARITY_NAMES.get(data.get("rarity", -1), "?星")
            char_class = data.get("class", "?")
            print(f"  {status}: {name}.png [{rarity}] [{char_class}]")
        return

    # Download images
    downloaded = 0
    skipped = 0
    failed = 0

    print("\nDownloading images...")
    for name, data in sorted(characters.items()):
        output_path = OUTPUT_DIR / f"{name}.png"

        if output_path.exists() and not args.force:
            skipped += 1
            continue

        url = data.get("url", "")
        if not url:
            failed += 1
            continue

        print(f"  Downloading: {name}.png")
        if download_image(url, output_path, args.force):
            downloaded += 1
        else:
            failed += 1

        # Rate limiting
        time.sleep(0.2)

    print(f"\nDownload complete: {downloaded} new, {skipped} skipped, {failed} failed")

    # Generate manifest from all existing images + metadata
    print("\nGenerating manifest...")

    # Get all existing images and merge with metadata
    final_characters = {}
    for f in OUTPUT_DIR.glob("*.png"):
        name = f.stem
        if name in characters:
            final_characters[name] = characters[name]
        else:
            # Image exists but no metadata
            final_characters[name] = {}

    # Generate simple manifest.json (for current game)
    manifest = generate_manifest(final_characters)
    with open(MANIFEST_FILE, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
    print(f"manifest.json saved: {len(manifest['characters'])} characters")

    # Generate rich metadata.json (for future gameplay features)
    metadata = generate_metadata(final_characters)
    with open(METADATA_FILE, "w", encoding="utf-8") as f:
        json.dump(metadata, f, ensure_ascii=False, indent=2)
    print(f"metadata.json saved with indexes for rarity, class, tags, etc.")

    # Print summary by rarity
    rarity_counts = metadata["indexes"]["byRarity"]
    print("\nCharacters by rarity:")
    for rarity in ["6星", "5星", "4星", "3星", "2星", "1星"]:
        if rarity in rarity_counts:
            print(f"  {rarity}: {len(rarity_counts[rarity])}")

    # Print summary by class
    class_counts = metadata["indexes"]["byClass"]
    print("\nCharacters by class:")
    for cls in ["近卫", "狙击", "术师", "医疗", "重装", "辅助", "特种", "先锋"]:
        if cls in class_counts:
            print(f"  {cls}: {len(class_counts[cls])}")


if __name__ == "__main__":
    main()
