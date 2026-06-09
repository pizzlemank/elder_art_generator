import os
import sys
import requests
import hashlib
import random
import time

def get_md5(data):
    return hashlib.md5(data).hexdigest()

def download_unique_images(theme_id, queries, count):
    base_dir = f"public/backgrounds/{theme_id}"
    os.makedirs(base_dir, exist_ok=True)

    downloaded_hashes = set()
    # Pre-populate hashes of existing images in the directory
    for existing_file in os.listdir(base_dir):
        if existing_file.endswith((".jpg", ".webp")):
            with open(os.path.join(base_dir, existing_file), "rb") as f:
                downloaded_hashes.add(get_md5(f.read()))

    query_list = queries.split(",")
    downloaded_count = 0
    attempts = 0
    max_attempts = count * 5

    print(f"Starting download for theme: {theme_id} (Queries: {queries})")

    while downloaded_count < count and attempts < max_attempts:
        attempts += 1
        query = random.choice(query_list).strip()
        lock = random.randint(1, 1000000)
        url = f"https://loremflickr.com/1200/900/{query}/all?lock={lock}"

        try:
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                img_data = response.content
                img_hash = get_md5(img_data)

                if img_hash not in downloaded_hashes:
                    # Find the next available index
                    index = 1
                    while True:
                        filename = f"{index:02d}.jpg"
                        filepath = os.path.join(base_dir, filename)
                        webp_filepath = os.path.join(base_dir, f"{index:02d}.webp")
                        if not os.path.exists(filepath) and not os.path.exists(webp_filepath):
                            break
                        index += 1

                    with open(filepath, "wb") as f:
                        f.write(img_data)

                    downloaded_hashes.add(img_hash)
                    downloaded_count += 1
                    print(f"  [{downloaded_count}/{count}] Downloaded unique image: {filename}")
                else:
                    print(f"  Attempt {attempts}: Duplicate image found (hash {img_hash}), skipping.")
            else:
                print(f"  Attempt {attempts}: Failed to download (Status {response.status_code})")
        except Exception as e:
            print(f"  Attempt {attempts}: Error: {e}")

        time.sleep(0.5)

    if downloaded_count < count:
        print(f"Finished. Only downloaded {downloaded_count} unique images out of {count} requested.")
    else:
        print(f"Finished. Successfully downloaded {count} unique images.")

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python scripts/download_unique.py <theme_id> <queries> <count>")
        sys.exit(1)

    theme_id = sys.argv[1]
    queries = sys.argv[2]
    count = int(sys.argv[3])

    download_unique_images(theme_id, queries, count)
