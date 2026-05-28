import os
import requests
import hashlib
import time
import random
import sys

def download_image(theme_id, queries, count=4):
    base_dir = "public/backgrounds"
    target_dir = os.path.join(base_dir, theme_id)
    os.makedirs(target_dir, exist_ok=True)

    hashes = set()
    downloaded = 0
    attempts = 0
    max_attempts = 20

    query_list = queries.split(',')

    print(f"Downloading {count} images for theme: {theme_id}")

    while downloaded < count and attempts < max_attempts:
        attempts += 1
        query = random.choice(query_list).strip()
        lock = random.randint(1, 10000)
        url = f"https://loremflickr.com/1200/900/{query}/all?lock={lock}"

        try:
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                img_content = response.content
                img_hash = hashlib.md5(img_content).hexdigest()

                if img_hash not in hashes:
                    hashes.add(img_hash)
                    downloaded += 1
                    filename = f"{downloaded:02d}.jpg"
                    filepath = os.path.join(target_dir, filename)

                    with open(filepath, 'wb') as f:
                        f.write(img_content)
                    print(f"  Successfully downloaded image {downloaded}: {filepath} (Query: {query}, Lock: {lock})")
                else:
                    print(f"  Duplicate image detected (Hash: {img_hash}), skipping...")
            else:
                print(f"  Failed to download image (Status: {response.status_code})")
        except Exception as e:
            print(f"  Error downloading image: {e}")

        time.sleep(0.5)

    if downloaded < count:
        print(f"Warning: Only downloaded {downloaded}/{count} images for {theme_id}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python scripts/download_unique.py <theme_id> <queries> [count]")
    else:
        tid = sys.argv[1]
        qs = sys.argv[2]
        c = int(sys.argv[3]) if len(sys.argv) > 3 else 4
        download_image(tid, qs, c)
