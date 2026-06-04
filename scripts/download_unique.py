import os
import sys
import hashlib
import requests
import random
import time

def download_image(theme_id, queries, count):
    base_dir = os.path.join("public", "backgrounds", theme_id)
    os.makedirs(base_dir, exist_ok=True)

    downloaded_hashes = set()
    # Pre-populate hashes from existing files if any
    for f in os.listdir(base_dir):
        if f.endswith(('.jpg', '.jpeg', '.png', '.webp')):
            with open(os.path.join(base_dir, f), 'rb') as existing_file:
                downloaded_hashes.add(hashlib.md5(existing_file.read()).hexdigest())

    query_list = [q.strip() for q in queries.split(',')]

    idx = 1
    success_count = 0
    attempts = 0
    max_attempts = count * 5

    print(f"Starting download for theme: {theme_id}")

    while success_count < count and attempts < max_attempts:
        attempts += 1
        # Cycle through queries and add some randomness
        q = random.choice(query_list)
        lock = random.randint(1, 100000)
        url = f"https://loremflickr.com/1200/900/{q}/all?lock={lock}"

        try:
            response = requests.get(url, timeout=10, allow_redirects=True)
            if response.status_code == 200:
                img_data = response.content
                img_hash = hashlib.md5(img_data).hexdigest()

                if img_hash in downloaded_hashes:
                    print(f"Duplicate image found for {q} (lock={lock}), skipping...")
                    continue

                # Check if it's the "not found" or generic placeholder image
                # (Some APIs return a specific "no image found" image)

                filename = f"{success_count + 1:02d}.jpg"
                filepath = os.path.join(base_dir, filename)

                with open(filepath, "wb") as f:
                    f.write(img_data)

                downloaded_hashes.add(img_hash)
                success_count += 1
                print(f"Successfully downloaded {filename} using query '{q}'")

                # Small delay to be polite
                time.sleep(0.5)
            else:
                print(f"Failed to download from {url}, status code: {response.status_code}")
        except Exception as e:
            print(f"Error downloading {url}: {e}")

    if success_count < count:
        print(f"Only downloaded {success_count}/{count} images for {theme_id} after {attempts} attempts.")
    else:
        print(f"Finished downloading {count} images for {theme_id}.")

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python scripts/download_unique.py <theme_id> <queries> <count>")
        sys.exit(1)

    theme_id = sys.argv[1]
    queries = sys.argv[2]
    count = int(sys.argv[3])

    download_image(theme_id, queries, count)
