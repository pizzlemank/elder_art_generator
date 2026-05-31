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

    hashes = set()
    # Check existing files for hashes to avoid duplicates if possible
    for f in os.listdir(base_dir):
        if f.endswith(('.jpg', '.webp')):
            with open(os.path.join(base_dir, f), 'rb') as existing_file:
                hashes.add(get_md5(existing_file.read()))

    downloaded = 0
    attempts = 0
    max_attempts = count * 5

    query_list = [q.strip() for q in queries.split(',')]

    while downloaded < count and attempts < max_attempts:
        attempts += 1
        query = random.choice(query_list)
        lock = random.randint(1, 100000)
        url = f"https://loremflickr.com/1200/900/{query}/all?lock={lock}"

        print(f"Attempt {attempts}: Downloading from {url}...")
        try:
            response = requests.get(url, timeout=15)
            if response.status_code == 200:
                img_data = response.content
                img_hash = get_md5(img_data)

                if img_hash in hashes:
                    print(f"Duplicate image found (hash: {img_hash}), skipping.")
                    continue

                # Success
                hashes.add(img_hash)
                downloaded += 1
                filename = f"{downloaded:02d}.jpg"
                filepath = os.path.join(base_dir, filename)

                # Find a filename that doesn't exist
                while os.path.exists(filepath) or os.path.exists(filepath.replace('.jpg', '.webp')):
                    # If 01.jpg exists, maybe we are adding more?
                    # Let's find the next available index
                    idx = 1
                    while os.path.exists(os.path.join(base_dir, f"{idx:02d}.jpg")) or \
                          os.path.exists(os.path.join(base_dir, f"{idx:02d}.webp")):
                        idx += 1
                    filename = f"{idx:02d}.jpg"
                    filepath = os.path.join(base_dir, filename)

                with open(filepath, 'wb') as f:
                    f.write(img_data)
                print(f"Saved {filepath}")
                time.sleep(0.5)
            else:
                print(f"Failed to download: {response.status_code}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python scripts/download_unique.py <theme_id> <queries> <count>")
        sys.exit(1)

    theme_id = sys.argv[1]
    queries = sys.argv[2]
    count = int(sys.argv[3])

    download_image(theme_id, queries, count)
