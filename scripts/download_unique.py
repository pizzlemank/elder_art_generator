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
    query_list = queries.split(',')

    # Pre-populate hashes of existing images
    if os.path.exists(base_dir):
        for filename in os.listdir(base_dir):
            if filename.endswith(('.jpg', '.webp')):
                try:
                    with open(os.path.join(base_dir, filename), 'rb') as f:
                        downloaded_hashes.add(get_md5(f.read()))
                except Exception as e:
                    print(f"Error reading {filename}: {e}")

    downloaded_count = 0
    attempt = 0
    max_attempts = count * 10

    print(f"Starting download for theme '{theme_id}' (targeting {count} new images)...")

    while downloaded_count < count and attempt < max_attempts:
        attempt += 1
        query = random.choice(query_list).strip()
        lock = random.randint(1, 1000000)
        # Using 'all' to ensure SFW/Creative Commons where possible on LoremFlickr
        url = f"https://loremflickr.com/1200/900/{query}/all?lock={lock}"

        try:
            print(f"Attempt {attempt}: Downloading {url}...")
            response = requests.get(url, timeout=15, allow_redirects=True)
            if response.status_code == 200:
                img_data = response.content
                img_hash = get_md5(img_data)

                if img_hash not in downloaded_hashes:
                    downloaded_hashes.add(img_hash)

                    # Find next available index
                    file_idx = 1
                    while True:
                        filename_base = f"{file_idx:02d}"
                        if not os.path.exists(os.path.join(base_dir, f"{filename_base}.jpg")) and \
                           not os.path.exists(os.path.join(base_dir, f"{filename_base}.webp")):
                            break
                        file_idx += 1

                    filepath = os.path.join(base_dir, f"{file_idx:02d}.jpg")
                    with open(filepath, 'wb') as f:
                        f.write(img_data)
                    downloaded_count += 1
                    print(f"  Successfully saved as {filepath} (Hash: {img_hash})")
                else:
                    print(f"  Duplicate image detected (Hash: {img_hash}), skipping.")
            else:
                print(f"  Failed to download. Status code: {response.status_code}")
        except Exception as e:
            print(f"  An error occurred: {e}")

        # Avoid hitting the server too hard
        time.sleep(1)

    print(f"Finished. Downloaded {downloaded_count} images for '{theme_id}'.")

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python3 scripts/download_unique.py <theme_id> <queries_comma_separated> <count>")
        sys.exit(1)

    theme_id = sys.argv[1]
    queries = sys.argv[2]
    try:
        count = int(sys.argv[3])
    except ValueError:
        print("Count must be an integer.")
        sys.exit(1)

    download_image(theme_id, queries, count)
