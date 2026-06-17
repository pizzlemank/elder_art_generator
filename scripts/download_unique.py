import os
import sys
import hashlib
import requests
import random
import time

def get_md5(data):
    return hashlib.md5(data).hexdigest()

def download_images(theme_id, queries, count):
    target_dir = os.path.join("public", "backgrounds", theme_id)
    os.makedirs(target_dir, exist_ok=True)

    query_list = [q.strip() for q in queries.split(",")]

    downloaded_hashes = set()

    # Pre-populate hashes of existing images
    for root, dirs, files in os.walk(target_dir):
        for file in files:
            if file.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                with open(os.path.join(root, file), "rb") as f:
                    downloaded_hashes.add(get_md5(f.read()))

    print(f"Theme: {theme_id}, Queries: {query_list}, Target Count: {count}")

    successful = 0
    # Find existing indices
    existing_indices = []
    for file in os.listdir(target_dir):
        name, ext = os.path.splitext(file)
        if name.isdigit() and ext.lower() in ('.jpg', '.webp'):
             existing_indices.append(int(name))

    start_index = 1
    if existing_indices:
        # Check how many are actually present
        count_present = len(existing_indices)
        if count_present >= count:
            print(f"Already have {count_present} images for {theme_id}. Skipping.")
            return

    attempts = 0
    max_attempts = count * 5

    while successful < count and attempts < max_attempts:
        attempts += 1
        # Try to fill indices 01, 02, 03...
        idx = successful + 1
        filename = f"{idx:02d}.jpg"
        filepath = os.path.join(target_dir, filename)

        # If file already exists, skip index
        if os.path.exists(filepath) or os.path.exists(os.path.join(target_dir, f"{idx:02d}.webp")):
            successful += 1
            continue

        query = random.choice(query_list)
        lock = random.randint(1, 100000)
        # Use LoremFlickr as it's easy and has a lock feature for uniqueness
        url = f"https://loremflickr.com/1200/900/{query}/all?lock={lock}"

        try:
            print(f"  Attempting to download {url} for {filename}...")
            response = requests.get(url, timeout=15)
            if response.status_code == 200:
                img_data = response.content
                img_hash = get_md5(img_data)

                if img_hash in downloaded_hashes:
                    print(f"    Duplicate image found (hash: {img_hash}). Retrying...")
                    continue

                with open(filepath, "wb") as f:
                    f.write(img_data)

                downloaded_hashes.add(img_hash)
                successful += 1
                print(f"    Successfully downloaded {filename}")
                time.sleep(1) # Be nice
            else:
                print(f"    Failed to download from {url} (Status: {response.status_code})")
        except Exception as e:
            print(f"    Error: {e}")

    if successful < count:
        print(f"Warning: Only downloaded {successful}/{count} images for {theme_id}")

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python scripts/download_unique.py <theme_id> <queries> <count>")
        sys.exit(1)

    theme_id = sys.argv[1]
    queries = sys.argv[2]
    count = int(sys.argv[3])

    download_images(theme_id, queries, count)
