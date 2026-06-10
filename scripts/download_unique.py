import os
import requests
import sys
import hashlib
import random
import time

def get_image_hash(data):
    return hashlib.md5(data).hexdigest()

def download_image(theme_id, queries, count):
    base_dir = f"public/backgrounds/{theme_id}"
    os.makedirs(base_dir, exist_ok=True)

    downloaded_hashes = set()
    query_list = queries.split(',')

    print(f"Downloading {count} images for theme: {theme_id}")

    idx = 1
    attempts = 0
    max_attempts = count * 5

    while idx <= count and attempts < max_attempts:
        attempts += 1
        query = random.choice(query_list).strip()
        lock = random.randint(1, 10000)
        # Using index and lock to increase uniqueness
        url = f"https://loremflickr.com/1200/900/{query}/all?lock={lock}{idx}"

        try:
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                img_data = response.content
                img_hash = get_image_hash(img_data)

                if img_hash not in downloaded_hashes:
                    file_path = os.path.join(base_dir, f"{idx:02d}.jpg")
                    with open(file_path, 'wb') as f:
                        f.write(img_data)
                    downloaded_hashes.add(img_hash)
                    print(f"  [{idx}/{count}] Downloaded: {file_path} (Query: {query}, Lock: {lock})")
                    idx += 1
                else:
                    print(f"  Skipping duplicate image (Hash: {img_hash})")
            else:
                print(f"  Failed to download from {url} (Status: {response.status_code})")
        except Exception as e:
            print(f"  Error downloading {url}: {e}")

        time.sleep(0.5)

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python scripts/download_unique.py <theme_id> <queries> <count>")
        sys.exit(1)

    theme_id = sys.argv[1]
    queries = sys.argv[2]
    count = int(sys.argv[3])

    download_image(theme_id, queries, count)
