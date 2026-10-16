import sys
import os
import urllib.request
import hashlib
import random
import time

def get_md5(data):
    return hashlib.md5(data).hexdigest()

def download_image_for_theme(theme_id, queries, target_count=4):
    target_dir = os.path.join("public", "backgrounds", theme_id)
    os.makedirs(target_dir, exist_ok=True)

    existing_hashes = set()
    existing_files = []

    for f in os.listdir(target_dir):
        if f.endswith((".jpg", ".png", ".webp", ".jpeg")):
            fpath = os.path.join(target_dir, f)
            try:
                with open(fpath, "rb") as fp:
                    existing_hashes.add(get_md5(fp.read()))
            except Exception:
                pass
            existing_files.append(f)

    current_count = len(existing_files)
    if current_count >= target_count:
        print(f"[{theme_id}] Already has {current_count} images. Skipping.")
        return

    print(f"[{theme_id}] Downloading images until target count of {target_count} is reached (currently {current_count})...")

    attempts = 0
    max_attempts = 30

    while current_count < target_count and attempts < max_attempts:
        attempts += 1
        # Generate seed derived from theme_id, attempts, and random lock
        seed = f"{theme_id}-{current_count + 1}-{attempts}-{random.randint(100, 999)}"
        url = f"https://picsum.photos/seed/{seed}/1200/900"

        try:
            req = urllib.request.Request(
                url,
                headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                content = resp.read()
                if len(content) < 5000:
                    continue

                h = get_md5(content)
                if h in existing_hashes:
                    print(f"  Attempt {attempts}: Duplicate image hash, skipping.")
                    continue

                existing_hashes.add(h)
                filename = f"{current_count + 1:02d}.jpg"
                filepath = os.path.join(target_dir, filename)

                with open(filepath, "wb") as fp:
                    fp.write(content)

                current_count += 1
                print(f"  Saved {filepath} (Seed: {seed})")
                time.sleep(0.1)

        except Exception as e:
            print(f"  Attempt {attempts} failed: {e}")
            time.sleep(0.2)

    print(f"[{theme_id}] Finished with {current_count} images.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scripts/download_unique.py <theme_id> [queries] [target_count]")
        sys.exit(1)

    theme_id = sys.argv[1]
    queries = sys.argv[2] if len(sys.argv) > 2 else "nature,holiday,festive"
    target_count = int(sys.argv[3]) if len(sys.argv) > 3 else 4

    download_image_for_theme(theme_id, queries, target_count)
