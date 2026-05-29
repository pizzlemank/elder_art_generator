import os
import sys
import hashlib
import requests
import random
import time

def get_md5(data):
    return hashlib.md5(data).hexdigest()

def download_image(theme_id, queries, count):
    base_dir = f"public/backgrounds/{theme_id}"
    os.makedirs(base_dir, exist_ok=True)

    downloaded_hashes = set()
    # Pre-populate hashes if files exist
    for f in os.listdir(base_dir):
        if f.endswith(('.jpg', '.webp')):
            with open(os.path.join(base_dir, f), 'rb') as rb:
                downloaded_hashes.add(get_md5(rb.read()))

    query_list = queries.split(',')

    downloaded_count = 0
    attempt = 0
    max_attempts = count * 5

    while downloaded_count < count and attempt < max_attempts:
        attempt += 1
        query = random.choice(query_list).strip()
        lock = random.randint(1, 1000000)
        url = f"https://loremflickr.com/1200/900/{query}/all?lock={lock}"

        try:
            print(f"Attempting to download {query} (attempt {attempt})...")
            response = requests.get(url, timeout=15)
            if response.status_code == 200:
                img_data = response.content
                img_hash = get_md5(img_data)

                if img_hash not in downloaded_hashes:
                    index = downloaded_count + 1
                    filename = f"{index:02d}.jpg"
                    filepath = os.path.join(base_dir, filename)

                    with open(filepath, 'wb') as f:
                        f.write(img_data)

                    downloaded_hashes.add(img_hash)
                    downloaded_count += 1
                    print(f"  Successfully downloaded: {filepath}")
                    time.sleep(1)
                else:
                    print("  Duplicate image detected, skipping.")
            else:
                print(f"  Failed to download: {response.status_code}")
        except Exception as e:
            print(f"  Error: {e}")

    print(f"Finished downloading {downloaded_count} images for {theme_id}.")

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python scripts/download_unique.py <theme_id> <queries_comma_separated> <count>")
        sys.exit(1)

    theme_id = sys.argv[1]
    queries = sys.argv[2]
    count = int(sys.argv[3])

    download_image(theme_id, queries, count)
