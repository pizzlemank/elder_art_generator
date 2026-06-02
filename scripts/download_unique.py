import os
import sys
import requests
import hashlib
import random
import time

def get_md5(content):
    return hashlib.md5(content).hexdigest()

def download_images(theme_id, queries, count=4):
    target_dir = f"public/backgrounds/{theme_id}"
    os.makedirs(target_dir, exist_ok=True)

    query_list = [q.strip() for q in queries.split(',')]
    hashes = set()

    # Pre-populate hashes with existing images
    for f in os.listdir(target_dir):
        if f.endswith(('.jpg', '.webp')):
            with open(os.path.join(target_dir, f), 'rb') as f_in:
                hashes.add(get_md5(f_in.read()))

    downloaded = 0
    attempts = 0
    max_attempts = count * 5

    print(f"Downloading images for {theme_id}...")

    while downloaded < count and attempts < max_attempts:
        attempts += 1
        query = random.choice(query_list)
        lock = random.randint(1, 1000000)
        url = f"https://loremflickr.com/1200/900/{query}/all?lock={lock}"

        try:
            response = requests.get(url, timeout=15)
            if response.status_code == 200:
                content = response.content
                h = get_md5(content)
                if h not in hashes:
                    hashes.add(h)
                    downloaded += 1
                    filename = f"{downloaded:02d}.jpg"
                    filepath = os.path.join(target_dir, filename)
                    # Check if file exists, if so skip
                    if os.path.exists(filepath) or os.path.exists(filepath.replace('.jpg', '.webp')):
                         print(f"  Image {downloaded:02d} already exists, skipping.")
                         continue

                    with open(filepath, 'wb') as f_out:
                        f_out.write(content)
                    print(f"  Saved {filename} (query: {query}, lock: {lock})")
                else:
                    print(f"  Duplicate image detected for {query}, retrying...")
            else:
                print(f"  Failed to download from {url}")
        except Exception as e:
            print(f"  Error: {e}")

        time.sleep(0.5)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python scripts/download_unique.py <theme_id> <queries> [count]")
        sys.exit(1)

    theme_id = sys.argv[1]
    queries = sys.argv[2]
    count = int(sys.argv[3]) if len(sys.argv) > 3 else 4

    download_images(theme_id, queries, count)
