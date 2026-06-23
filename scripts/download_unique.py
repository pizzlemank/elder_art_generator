import os
import sys
import requests
import hashlib
import time
import random

def get_md5(data):
    return hashlib.md5(data).hexdigest()

def download_image(theme_id, queries, count):
    base_dir = f"public/backgrounds/{theme_id}"
    os.makedirs(base_dir, exist_ok=True)

    downloaded_hashes = set()
    # Check existing files to avoid duplicates if possible
    for f in os.listdir(base_dir):
        if f.endswith(('.jpg', '.webp')):
            with open(os.path.join(base_dir, f), 'rb') as img_file:
                downloaded_hashes.add(get_md5(img_file.read()))

    query_list = queries.split(',')

    success_count = 0
    attempts = 0
    max_attempts = count * 5

    index = 1
    # Find next available index
    while os.path.exists(os.path.join(base_dir, f"{index:02d}.jpg")) or \
          os.path.exists(os.path.join(base_dir, f"{index:02d}.webp")):
        index += 1

    while success_count < count and attempts < max_attempts:
        attempts += 1
        query = random.choice(query_list).strip()
        lock = random.randint(1, 10000)
        url = f"https://loremflickr.com/1200/900/{query}/all?lock={lock}"

        print(f"Attempting to download {query} (lock={lock})...")
        try:
            response = requests.get(url, timeout=15)
            if response.status_code == 200:
                img_data = response.content
                img_hash = get_md5(img_data)

                if img_hash not in downloaded_hashes:
                    filename = f"{index:02d}.jpg"
                    filepath = os.path.join(base_dir, filename)
                    with open(filepath, 'wb') as f:
                        f.write(img_data)
                    downloaded_hashes.add(img_hash)
                    print(f"  Saved to {filepath}")
                    success_count += 1
                    index += 1
                else:
                    print("  Duplicate image detected, skipping.")
            else:
                print(f"  Failed with status code {response.status_code}")
        except Exception as e:
            print(f"  Error: {e}")

        time.sleep(1)

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python scripts/download_unique.py <theme_id> <queries> <count>")
        sys.exit(1)

    theme_id = sys.argv[1]
    queries = sys.argv[2]
    count = int(sys.argv[3])

    download_image(theme_id, queries, count)
