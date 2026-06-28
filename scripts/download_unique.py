import os
import sys
import requests
import hashlib
import random
import time

def get_md5(data):
    return hashlib.md5(data).hexdigest()

def download_image(theme_id, queries, count):
    bg_dir = os.path.join("public", "backgrounds", theme_id)
    os.makedirs(bg_dir, exist_ok=True)

    downloaded_hashes = set()
    # Pre-populate hashes with existing images in the directory
    for filename in os.listdir(bg_dir):
        if filename.endswith((".jpg", ".webp")):
            with open(os.path.join(bg_dir, filename), "rb") as f:
                downloaded_hashes.add(get_md5(f.read()))

    success_count = 0
    query_list = queries.split(",")

    # Map index to "01", "02", etc.
    for i in range(1, count + 1):
        target_filename = f"{i:02d}.jpg"
        target_path = os.path.join(bg_dir, target_filename)
        target_webp = os.path.join(bg_dir, f"{i:02d}.webp")

        if os.path.exists(target_path) or os.path.exists(target_webp):
            print(f"Image {target_filename} or webp already exists. Skipping.")
            continue

        attempts = 0
        max_attempts = 10
        while attempts < max_attempts:
            # Use a random query from the list and a random lock to get different images
            query = random.choice(query_list).strip()
            lock = random.randint(1, 1000000)
            url = f"https://loremflickr.com/1200/900/{query}/all?lock={lock}"

            print(f"  Attempting to download image {i} (attempt {attempts+1}) with query: {query}...")
            try:
                response = requests.get(url, timeout=15)
                if response.status_code == 200:
                    img_data = response.content
                    img_hash = get_md5(img_data)

                    if img_hash not in downloaded_hashes:
                        with open(target_path, "wb") as f:
                            f.write(img_data)
                        downloaded_hashes.add(img_hash)
                        print(f"    Successfully downloaded {target_filename} (hash: {img_hash})")
                        success_count += 1
                        break
                    else:
                        print(f"    Duplicate image found (hash: {img_hash}). Retrying...")
                else:
                    print(f"    Failed to download image. Status code: {response.status_code}")
            except Exception as e:
                print(f"    Error during download: {e}")

            attempts += 1
            time.sleep(1)

        if attempts == max_attempts:
            print(f"  Failed to download a unique image for {target_filename} after {max_attempts} attempts.")

    return success_count

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python scripts/download_unique.py <theme_id> <queries> <count>")
        sys.exit(1)

    theme_id = sys.argv[1]
    queries = sys.argv[2]
    count = int(sys.argv[3])

    download_image(theme_id, queries, count)
