#!/usr/bin/env python3
import os
import sys
import time
import random
import hashlib
import urllib.request

BG_DIR = "public/backgrounds"

def get_md5(data):
    return hashlib.md5(data).hexdigest()

def download_images(theme_id, queries, target_count=4):
    target_dir = os.path.join(BG_DIR, theme_id)
    os.makedirs(target_dir, exist_ok=True)

    # Check existing files and hashes
    existing_files = os.listdir(target_dir)
    hashes = set()
    existing_indices = set()

    for f in existing_files:
        filepath = os.path.join(target_dir, f)
        if os.path.isfile(filepath) and f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
            name_without_ext = os.path.splitext(f)[0]
            if name_without_ext.isdigit():
                existing_indices.add(int(name_without_ext))
            try:
                with open(filepath, 'rb') as fp:
                    hashes.add(get_md5(fp.read()))
            except Exception:
                pass

    print(f"Theme '{theme_id}': found {len(existing_indices)} existing numbered images.")

    query_list = [q.strip() for q in queries.split(',')]
    primary_query = query_list[0] if query_list else "nature"

    for idx in range(1, target_count + 1):
        filename = f"{idx:02d}.jpg"
        filepath = os.path.join(target_dir, filename)
        webp_path = os.path.join(target_dir, f"{idx:02d}.webp")

        if os.path.exists(filepath) or os.path.exists(webp_path):
            print(f"  [{theme_id}] Image {filename} or webp already exists, skipping.")
            continue

        success = False
        attempts = 0

        # Try multiple URLs and providers
        urls_to_try = [
            f"https://loremflickr.com/1200/900/{','.join(query_list)}/all?lock={random.randint(1000, 999999)}",
            f"https://loremflickr.com/1200/900/{primary_query}/all?lock={random.randint(1000, 999999)}",
            f"https://picsum.photos/1200/900?random={random.randint(1000, 999999)}"
        ]

        for url in urls_to_try:
            if success:
                break
            attempts += 1
            try:
                req = urllib.request.Request(
                    url,
                    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
                )
                with urllib.request.urlopen(req, timeout=8) as response:
                    data = response.read()
                    if len(data) < 10000:
                        continue

                    data_md5 = get_md5(data)
                    if data_md5 in hashes:
                        continue

                    with open(filepath, 'wb') as fp:
                        fp.write(data)

                    hashes.add(data_md5)
                    success = True
                    print(f"  [{theme_id}] Downloaded {filename} successfully ({len(data)} bytes).")
            except Exception as e:
                pass

        if not success:
            # Fallback to Picsum
            fallback_url = f"https://picsum.photos/1200/900?random={random.randint(1000, 999999)}"
            try:
                req = urllib.request.Request(fallback_url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req, timeout=8) as response:
                    data = response.read()
                    with open(filepath, 'wb') as fp:
                        fp.write(data)
                    hashes.add(get_md5(data))
                    print(f"  [{theme_id}] Fallback downloaded {filename}.")
            except Exception as e:
                print(f"  [{theme_id}] Fallback failed for {filename}: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python download_unique.py <theme_id> <comma_separated_queries> [count]")
        sys.exit(1)

    theme = sys.argv[1]
    queries = sys.argv[2]
    count = int(sys.argv[3]) if len(sys.argv) > 3 else 4

    download_images(theme, queries, count)
