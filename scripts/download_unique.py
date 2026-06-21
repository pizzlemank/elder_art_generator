import os
import sys
import requests
import hashlib
import time
import random

def get_md5(data):
    return hashlib.md5(data).hexdigest()

def download_images(theme_id, queries, count=4):
    target_dir = f"public/backgrounds/{theme_id}"
    os.makedirs(target_dir, exist_ok=True)

    downloaded_hashes = set()
    # Check existing files
    for f in os.listdir(target_dir):
        if f.endswith(('.jpg', '.webp')):
            with open(os.path.join(target_dir, f), 'rb') as img_file:
                downloaded_hashes.add(get_md5(img_file.read()))

    query_list = queries.split(',')

    i = 1
    attempts = 0
    max_attempts = count * 5

    print(f"Downloading images for {theme_id}...")

    while len([f for f in os.listdir(target_dir) if f.endswith(('.jpg', '.webp'))]) < count and attempts < max_attempts:
        attempts += 1
        query = random.choice(query_list).strip()
        lock = random.randint(1, 1000000)

        # Using LoremFlickr
        url = f"https://loremflickr.com/1200/900/{query}/all?lock={lock}"

        try:
            response = requests.get(url, timeout=15)
            if response.status_code == 200:
                img_data = response.content
                img_hash = get_md5(img_data)

                if img_hash not in downloaded_hashes:
                    # Find next available filename
                    while True:
                        filename = f"{i:02d}.jpg"
                        if not os.path.exists(os.path.join(target_dir, filename)) and not os.path.exists(os.path.join(target_dir, f"{i:02d}.webp")):
                            break
                        i += 1

                    filepath = os.path.join(target_dir, filename)
                    with open(filepath, 'wb') as f:
                        f.write(img_data)

                    downloaded_hashes.add(img_hash)
                    print(f"  Saved {filename} (hash: {img_hash})")
                else:
                    print(f"  Skipped duplicate image (hash: {img_hash})")
            else:
                print(f"  Failed to download from {url} (status: {response.status_code})")
        except Exception as e:
            print(f"  Error: {e}")

        time.sleep(1)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python scripts/download_unique.py <theme_id> <queries_comma_separated> [count]")
        sys.exit(1)

    theme_id = sys.argv[1]
    queries = sys.argv[2]
    count = int(sys.argv[3]) if len(sys.argv) > 3 else 4

    download_images(theme_id, queries, count)
