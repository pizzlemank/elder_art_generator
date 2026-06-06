import os
import sys
import requests
import hashlib
import random
import time

def get_md5(data):
    return hashlib.md5(data).hexdigest()

def download_image(theme_id, queries, count):
    target_dir = f"public/backgrounds/{theme_id}"
    os.makedirs(target_dir, exist_ok=True)

    downloaded_hashes = set()
    downloaded_count = 0

    query_list = [q.strip() for q in queries.split(',')]

    print(f"Downloading {count} images for {theme_id} using queries: {query_list}")

    # Try different locks and queries to get unique images
    for i in range(count * 3): # Try more times than needed
        if downloaded_count >= count:
            break

        query = random.choice(query_list)
        lock = random.randint(1, 10000)
        url = f"https://loremflickr.com/1200/900/{query}/all?lock={lock}"

        try:
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                img_data = response.content
                img_hash = get_md5(img_data)

                if img_hash not in downloaded_hashes:
                    downloaded_hashes.add(img_hash)
                    index = downloaded_count + 1
                    filename = f"{index:02d}.jpg"
                    filepath = os.path.join(target_dir, filename)

                    with open(filepath, 'wb') as f:
                        f.write(img_data)

                    print(f"  Saved {filename} (hash: {img_hash})")
                    downloaded_count += 1
                    time.sleep(0.5)
                else:
                    print(f"  Skipped duplicate image (hash: {img_hash})")
        except Exception as e:
            print(f"  Error downloading: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python scripts/download_unique.py <theme_id> <queries> <count>")
        sys.exit(1)

    theme_id = sys.argv[1]
    queries = sys.argv[2]
    count = int(sys.argv[3])

    download_image(theme_id, queries, count)
