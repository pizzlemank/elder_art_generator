import os
import sys
import requests
import hashlib
import random
import time

def get_md5(data):
    return hashlib.md5(data).hexdigest()

def download_image(theme_id, queries, count):
    base_dir = f"public/backgrounds/{theme_id}"
    os.makedirs(base_dir, exist_ok=True)

    downloaded_hashes = set()
    # Pre-populate hashes of existing images to avoid duplicates
    for f in os.listdir(base_dir):
        if f.endswith(('.jpg', '.webp')):
            with open(os.path.join(base_dir, f), 'rb') as existing_file:
                downloaded_hashes.add(get_md5(existing_file.read()))

    query_list = queries.split(',')

    success_count = 0
    attempts = 0
    max_attempts = count * 3

    print(f"Downloading {count} images for {theme_id}...")

    while success_count < count and attempts < max_attempts:
        attempts += 1
        query = random.choice(query_list).strip()
        lock = random.randint(1, 10000)
        url = f"https://loremflickr.com/1200/900/{query}/all?lock={lock}"

        try:
            response = requests.get(url, timeout=15)
            if response.status_code == 200:
                img_data = response.content
                img_hash = get_md5(img_data)

                if img_hash in downloaded_hashes:
                    print(f"  Attempt {attempts}: Duplicate image found, skipping...")
                    continue

                # Check if it's a placeholder (LoremFlickr sometimes returns a "no image found" placeholder)
                # We could check dimensions or specific hashes if we knew them,
                # but MD5 check usually handles duplicates.

                file_idx = success_count + 1
                filename = f"{file_idx:02d}.jpg"
                filepath = os.path.join(base_dir, filename)

                # Ensure we don't overwrite if 01.webp exists
                webp_path = os.path.join(base_dir, f"{file_idx:02d}.webp")
                if os.path.exists(webp_path):
                    print(f"  {webp_path} already exists, skipping index {file_idx}")
                    success_count += 1
                    continue

                with open(filepath, 'wb') as f:
                    f.write(img_data)

                downloaded_hashes.add(img_hash)
                success_count += 1
                print(f"  Saved {filepath} (Attempt {attempts})")
                time.sleep(0.5)
            else:
                print(f"  Attempt {attempts}: Failed to download (Status {response.status_code})")
        except Exception as e:
            print(f"  Attempt {attempts}: Error: {e}")

    print(f"Finished. Downloaded {success_count} images for {theme_id}.")

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python scripts/download_unique.py <theme_id> <queries> <count>")
        sys.exit(1)

    theme_id = sys.argv[1]
    queries = sys.argv[2]
    count = int(sys.argv[3])

    download_image(theme_id, queries, count)
