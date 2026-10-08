#!/usr/bin/env python3
import os
import sys
import time
import random
import hashlib
import urllib.request

USER_AGENTS = [
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
]

def get_md5(data):
    return hashlib.md5(data).hexdigest()

def download_image(queries, lock_id, filepath, existing_hashes):
    q_str = ",".join(queries) if isinstance(queries, list) else queries
    urls = [
        f"https://loremflickr.com/1200/900/{q_str}/all?lock={lock_id}",
        f"https://picsum.photos/seed/{lock_id}/1200/900",
    ]

    for url in urls:
        try:
            req = urllib.request.Request(
                url,
                headers={"User-Agent": random.choice(USER_AGENTS)}
            )
            with urllib.request.urlopen(req, timeout=10) as response:
                content = response.read()
                if len(content) < 5000: # Too small, probably an error page
                    continue
                h = get_md5(content)
                if h in existing_hashes:
                    continue

                os.makedirs(os.path.dirname(filepath), exist_ok=True)
                with open(filepath, "wb") as f:
                    f.write(content)
                existing_hashes.add(h)
                print(f" Successfully saved to {filepath} (MD5: {h[:8]})")
                return True
        except Exception as e:
            # Try next URL fallback
            continue
    return False

def process_theme(theme_id, queries, target_count=4):
    target_dir = os.path.join("public", "backgrounds", theme_id)
    os.makedirs(target_dir, exist_ok=True)

    existing_files = []
    existing_hashes = set()

    for root, _, files in os.walk(target_dir):
        for f in files:
            if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                fp = os.path.join(root, f)
                existing_files.append(fp)
                try:
                    with open(fp, 'rb') as file_obj:
                        existing_hashes.add(get_md5(file_obj.read()))
                except Exception:
                    pass

    # Count base files (e.g. 01, 02) or total unique images
    current_count = len(existing_files)
    print(f"Theme '{theme_id}': found {current_count} existing image files.")

    if current_count >= target_count:
        print(f"  Theme '{theme_id}' already has {current_count} >= {target_count} images.")
        return

    for i in range(1, target_count + 1):
        idx_str = f"{i:02d}"
        jpg_path = os.path.join(target_dir, f"{idx_str}.jpg")
        webp_path = os.path.join(target_dir, f"{idx_str}.webp")

        if os.path.exists(jpg_path) or os.path.exists(webp_path):
            continue

        print(f"  Downloading missing image {idx_str} for '{theme_id}'...")
        attempts = 0
        success = False
        while attempts < 10 and not success:
            attempts += 1
            lock_id = random.randint(1000, 999999)
            success = download_image(queries, lock_id, jpg_path, existing_hashes)
            time.sleep(0.3)

        if not success:
            print(f"  Failed to download image {idx_str} for '{theme_id}' after 10 attempts.")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python download_unique.py <theme_id> <comma_separated_queries> [target_count]")
        sys.exit(1)

    theme_id = sys.argv[1]
    queries = sys.argv[2].split(",")
    target_count = int(sys.argv[3]) if len(sys.argv) > 3 else 4
    process_theme(theme_id, queries, target_count)
