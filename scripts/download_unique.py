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

    downloaded_hashes = set()
    # Pre-populate hashes from existing files in the directory
    for f in os.listdir(base_dir):
        if f.endswith(('.jpg', '.jpeg', '.png', '.webp')):
            with open(os.path.join(base_dir, f), 'rb') as existing_file:
                downloaded_hashes.add(get_md5(existing_file.read()))

    print(f"Starting download for theme '{theme_id}' with queries '{queries}'...")

    successful = 0
    attempts = 0
    max_attempts = count * 5

    query_list = [q.strip() for q in queries.split(',')]

    while successful < count and attempts < max_attempts:
        attempts += 1
        # Use a random query from the list and a random lock
        query = random.choice(query_list)
        lock = random.randint(1, 1000000)
        url = f"https://loremflickr.com/1200/900/{query}/all?lock={lock}"

        try:
            response = requests.get(url, timeout=15)
            if response.status_code == 200:
                img_data = response.content
                img_hash = get_md5(img_data)

                if img_hash not in downloaded_hashes:
                    successful += 1
                    filename = f"{successful:02d}.jpg"
                    # Ensure we don't overwrite if it already exists (though hash check should handle it)
                    target_path = os.path.join(base_dir, filename)
                    while os.path.exists(target_path):
                        successful += 1
                        filename = f"{successful:02d}.jpg"
                        target_path = os.path.join(base_dir, filename)

                    with open(target_path, 'wb') as f:
                        f.write(img_data)
                    downloaded_hashes.add(img_hash)
                    print(f"  [{successful}/{count}] Downloaded: {filename} (Query: {query}, Lock: {lock})")
                else:
                    print(f"  Attempt {attempts}: Duplicate image found (hash {img_hash}), skipping...")
            else:
                print(f"  Attempt {attempts}: Failed to download (Status {response.status_code})")
        except Exception as e:
            print(f"  Attempt {attempts}: Error: {e}")

        time.sleep(0.5)

    if successful < count:
        print(f"Warning: Only downloaded {successful}/{count} images after {attempts} attempts.")
    else:
        print(f"Successfully downloaded {successful} images for {theme_id}.")

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python3 scripts/download_unique.py <theme_id> <queries> <count>")
        sys.exit(1)

    theme_id = sys.argv[1]
    queries = sys.argv[2]
    count = int(sys.argv[3])

    download_image(theme_id, queries, count)
