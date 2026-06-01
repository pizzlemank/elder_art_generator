import os
import sys
import hashlib
import requests
import random
import time

def get_image_hash(data):
    return hashlib.md5(data).hexdigest()

def download_image(theme_id, queries, count):
    base_dir = f"public/backgrounds/{theme_id}"
    os.makedirs(base_dir, exist_ok=True)

    hashes = set()
    # Pre-populate hashes from existing files if any
    for f in os.listdir(base_dir):
        if f.endswith(('.jpg', '.jpeg', '.png', '.webp')):
            with open(os.path.join(base_dir, f), 'rb') as existing_file:
                hashes.add(get_image_hash(existing_file.read()))

    downloaded = 0
    attempts = 0
    max_attempts = count * 5

    query_list = [q.strip() for q in queries.split(',')]

    print(f"Downloading {count} images for {theme_id}...")

    while downloaded < count and attempts < max_attempts:
        attempts += 1
        query = random.choice(query_list)
        # Using a large random lock to avoid getting the same image
        lock = random.randint(1, 1000000)
        url = f"https://loremflickr.com/1200/900/{query}/all?lock={lock}"

        try:
            response = requests.get(url, timeout=15)
            if response.status_code == 200:
                img_data = response.content
                img_hash = get_image_hash(img_data)

                if img_hash not in hashes:
                    hashes.add(img_hash)
                    downloaded += 1
                    filename = f"{downloaded:02d}.jpg"
                    filepath = os.path.join(base_dir, filename)

                    with open(filepath, 'wb') as f:
                        f.write(img_data)
                    print(f"  [{downloaded}/{count}] Saved {filename} (hash: {img_hash})")
                    time.sleep(0.5)
                else:
                    print(f"  Attempt {attempts}: Duplicate image found, skipping...")
            else:
                print(f"  Attempt {attempts}: Received status code {response.status_code}")
        except Exception as e:
            print(f"  Attempt {attempts}: Error downloading image: {e}")

    if downloaded < count:
        print(f"Warning: Only downloaded {downloaded}/{count} images after {attempts} attempts.")
    else:
        print(f"Successfully downloaded all {count} images.")

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python scripts/download_unique.py <theme_id> <queries_comma_separated> <count>")
        sys.exit(1)

    theme_id = sys.argv[1]
    queries = sys.argv[2]
    count = int(sys.argv[3])

    download_image(theme_id, queries, count)
