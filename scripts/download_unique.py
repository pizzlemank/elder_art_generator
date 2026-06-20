import os
import sys
import requests
import hashlib
import random
import time

def get_md5(data):
    return hashlib.md5(data).hexdigest()

def download_images(theme_id, queries, count):
    base_dir = f"public/backgrounds/{theme_id}"
    os.makedirs(base_dir, exist_ok=True)

    query_list = [q.strip() for q in queries.split(",")]
    downloaded_hashes = set()

    # Pre-populate hashes from existing files
    for root, dirs, files in os.walk(base_dir):
        for file in files:
            if file.endswith((".jpg", ".jpeg", ".png", ".webp")):
                with open(os.path.join(root, file), "rb") as f:
                    downloaded_hashes.add(get_md5(f.read()))

    print(f"Starting download for theme: {theme_id} with queries: {query_list}")

    success_count = 0
    attempts = 0
    max_attempts = count * 5

    while success_count < count and attempts < max_attempts:
        attempts += 1
        query = random.choice(query_list)
        # Using a random lock to get different images from LoremFlickr
        lock = random.randint(1, 10000)
        url = f"https://loremflickr.com/1200/900/{query}/all?lock={lock}"

        try:
            response = requests.get(url, timeout=15)
            if response.status_code == 200:
                data = response.content
                file_hash = get_md5(data)

                if file_hash in downloaded_hashes:
                    print(f"  Duplicate image found for query '{query}', skipping...")
                    continue

                # Check if it's a "no image found" fallback (often small or specific hash)
                # LoremFlickr sometimes returns a generic "owner" image if query is too specific
                if len(data) < 5000: # Very small files are likely placeholders
                     print(f"  Image too small for query '{query}', likely placeholder. Skipping...")
                     continue

                file_index = success_count + 1
                # Find a non-conflicting filename
                while os.path.exists(os.path.join(base_dir, f"{file_index:02d}.jpg")) or \
                      os.path.exists(os.path.join(base_dir, f"{file_index:02d}.webp")):
                    file_index += 1

                filename = f"{file_index:02d}.jpg"
                filepath = os.path.join(base_dir, filename)

                with open(filepath, "wb") as f:
                    f.write(data)

                downloaded_hashes.add(file_hash)
                success_count += 1
                print(f"  [{success_count}/{count}] Downloaded: {filepath} (Query: {query})")
                time.sleep(0.5) # Be nice to the API
            else:
                print(f"  Failed to download from {url}, status: {response.status_code}")
        except Exception as e:
            print(f"  Error downloading {url}: {e}")
            time.sleep(1)

    print(f"Completed download for {theme_id}. Total: {success_count} images.")

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python scripts/download_unique.py <theme_id> <queries> <count>")
        sys.exit(1)

    theme_id = sys.argv[1]
    queries = sys.argv[2]
    count = int(sys.argv[3])

    download_images(theme_id, queries, count)
