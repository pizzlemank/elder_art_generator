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

    query_list = queries.split(',')

    existing_hashes = set()
    # Load existing hashes to avoid duplicates
    if os.path.exists(base_dir):
        for f in os.listdir(base_dir):
            if f.endswith(('.jpg', '.jpeg', '.png', '.webp')):
                try:
                    with open(os.path.join(base_dir, f), 'rb') as img_f:
                        existing_hashes.add(get_md5(img_f.read()))
                except Exception as e:
                    print(f"Error reading {f}: {e}")

    downloaded = 0
    attempts = 0
    max_attempts = count * 10 # More attempts to find unique images

    print(f"Starting download for {theme_id}. Target new: {count}. Already have {len(existing_hashes)} unique images.")

    while downloaded < count and attempts < max_attempts:
        attempts += 1
        query = random.choice(query_list).strip()
        lock = random.randint(1, 1000000)
        # Using /all to search all of LoremFlickr, not just one user
        url = f"https://loremflickr.com/1200/900/{query}/all?lock={lock}"

        try:
            print(f"  Attempt {attempts}: Fetching {url}...")
            response = requests.get(url, timeout=20, allow_redirects=True)
            if response.status_code == 200:
                # Check if it's actually an image (LoremFlickr sometimes returns HTML on error)
                content_type = response.headers.get('Content-Type', '')
                if 'image' not in content_type:
                    print(f"    Warning: Received non-image content type: {content_type}")
                    continue

                img_data = response.content
                img_hash = get_md5(img_data)

                if img_hash not in existing_hashes:
                    # Find next available filename 01, 02, etc.
                    i = 1
                    while True:
                        fname = f"{i:02d}.jpg"
                        # Also check for webp as sync script converts them
                        if not os.path.exists(os.path.join(base_dir, fname)) and \
                           not os.path.exists(os.path.join(base_dir, f"{i:02d}.webp")):
                            break
                        i += 1

                    filepath = os.path.join(base_dir, fname)
                    with open(filepath, 'wb') as f:
                        f.write(img_data)

                    existing_hashes.add(img_hash)
                    downloaded += 1
                    print(f"    Successfully downloaded {filepath} (Query: {query}, Lock: {lock})")
                else:
                    print(f"    Duplicate image (hash: {img_hash}) found, skipping...")
            else:
                print(f"    Failed to download: Status {response.status_code}")

            # Small delay to avoid rate limiting
            time.sleep(0.5)
        except Exception as e:
            print(f"    Error during download: {e}")
            time.sleep(1)

    print(f"Finished {theme_id}. Downloaded {downloaded} images.")

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python scripts/download_unique.py <theme_id> <queries_comma_separated> <count>")
        sys.exit(1)

    theme_id = sys.argv[1]
    queries = sys.argv[2]
    count = int(sys.argv[3])

    download_image(theme_id, queries, count)
