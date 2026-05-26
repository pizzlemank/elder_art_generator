import os
import sys
import requests
import hashlib
import time
import random

def download_image(theme_id, queries, count):
    base_dir = os.path.join("public", "backgrounds", theme_id)
    os.makedirs(base_dir, exist_ok=True)

    downloaded_hashes = set()
    query_list = [q.strip() for q in queries.split(",")]

    downloaded_count = 0
    attempts = 0
    max_attempts = count * 5

    print(f"Downloading {count} images for theme: {theme_id}")

    while downloaded_count < count and attempts < max_attempts:
        attempts += 1
        query = random.choice(query_list)
        lock = random.randint(1, 1000000)
        url = f"https://loremflickr.com/1200/900/{query}/all?lock={lock}"

        try:
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                img_content = response.content
                img_hash = hashlib.md5(img_content).hexdigest()

                if img_hash not in downloaded_hashes:
                    downloaded_hashes.add(img_hash)
                    downloaded_count += 1

                    filename = f"{downloaded_count:02d}.jpg"
                    filepath = os.path.join(base_dir, filename)

                    with open(filepath, "wb") as f:
                        f.write(img_content)

                    print(f"  [{downloaded_count}/{count}] Downloaded: {filename} (query: {query})")
                    # Small sleep to avoid hitting rate limits
                    time.sleep(0.5)
                else:
                    print(f"  Attempt {attempts}: Duplicate image found, skipping...")
            else:
                print(f"  Attempt {attempts}: Failed to download image (status {response.status_code})")
        except Exception as e:
            print(f"  Attempt {attempts}: Error: {e}")

    if downloaded_count < count:
        print(f"Warning: Only downloaded {downloaded_count} images out of {count} requested.")

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python scripts/download_unique.py <theme_id> <queries_comma_separated> <count>")
        sys.exit(1)

    theme_id = sys.argv[1]
    queries = sys.argv[2]
    count = int(sys.argv[3])

    download_image(theme_id, queries, count)
