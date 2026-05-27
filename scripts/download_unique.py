import os
import sys
import hashlib
import urllib.request
import random
import time

def get_image_hash(data):
    return hashlib.md5(data).hexdigest()

def download_image(theme_id, queries, count):
    target_dir = os.path.join("public", "backgrounds", theme_id)
    os.makedirs(target_dir, exist_ok=True)

    query_list = queries.split(",")
    downloaded_hashes = set()

    # Check existing images in the directory
    for f in os.listdir(target_dir):
        if f.endswith((".webp", ".jpg", ".png")):
            with open(os.path.join(target_dir, f), "rb") as existing_file:
                downloaded_hashes.add(get_image_hash(existing_file.read()))

    downloaded_count = 0
    attempts = 0
    max_attempts = count * 5

    print(f"Targeting {count} unique images for {theme_id}...")

    while downloaded_count < count and attempts < max_attempts:
        attempts += 1
        query = random.choice(query_list).strip().replace(" ", "+")
        # Use a random lock to get different images from LoremFlickr
        lock = random.randint(1, 100000)
        url = f"https://loremflickr.com/1200/900/{query}/all?lock={lock}"

        try:
            print(f"  Attempt {attempts}: Downloading from {url}...")
            with urllib.request.urlopen(url, timeout=15) as response:
                image_data = response.read()
                image_hash = get_image_hash(image_data)

                if image_hash in downloaded_hashes:
                    print(f"    Duplicate image found (hash: {image_hash}), skipping...")
                    continue

                # Success - save the file
                file_index = downloaded_count + 1
                # Find an unused filename
                while os.path.exists(os.path.join(target_dir, f"{file_index:02d}.jpg")) or \
                      os.path.exists(os.path.join(target_dir, f"{file_index:02d}.webp")):
                    file_index += 1

                filename = f"{file_index:02d}.jpg"
                filepath = os.path.join(target_dir, filename)

                with open(filepath, "wb") as f:
                    f.write(image_data)

                downloaded_hashes.add(image_hash)
                downloaded_count += 1
                print(f"    Saved to {filepath}")

            # Rate limiting
            time.sleep(1)
        except Exception as e:
            print(f"    Error downloading image: {e}")
            time.sleep(2)

    print(f"Finished {theme_id}. Downloaded {downloaded_count} new images.")

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python scripts/download_unique.py <theme_id> <queries> <count>")
        sys.exit(1)

    theme_id = sys.argv[1]
    queries = sys.argv[2]
    count = int(sys.argv[3])

    download_image(theme_id, queries, count)
