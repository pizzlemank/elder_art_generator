import os
import sys
import requests
import hashlib
import random
import time

def get_image_hash(content):
    return hashlib.md5(content).hexdigest()

def download_image(theme_id, queries, count, target_dir):
    os.makedirs(target_dir, exist_ok=True)
    downloaded_hashes = set()

    # Pre-populate hashes if files already exist
    for f in os.listdir(target_dir):
        if f.endswith(('.jpg', '.jpeg', '.webp')):
            with open(os.path.join(target_dir, f), 'rb') as existing_file:
                downloaded_hashes.add(get_image_hash(existing_file.read()))

    query_list = [q.strip() for q in queries.split(',')]

    downloaded_count = 0
    attempts = 0
    max_attempts = count * 5

    print(f"Downloading {count} images for theme '{theme_id}' with queries: {query_list}")

    while downloaded_count < count and attempts < max_attempts:
        attempts += 1
        query = random.choice(query_list)
        lock = random.randint(1, 100000)
        # Using 1200x900 as per project standards
        url = f"https://loremflickr.com/1200/900/{query}/all?lock={lock}"

        try:
            response = requests.get(url, timeout=15)
            if response.status_code == 200:
                content = response.content
                img_hash = get_image_hash(content)

                if img_hash not in downloaded_hashes:
                    # Find the next available index
                    index = 1
                    while True:
                        filename = f"{index:02d}.jpg"
                        filepath = os.path.join(target_dir, filename)
                        webp_filepath = os.path.join(target_dir, f"{index:02d}.webp")
                        if not os.path.exists(filepath) and not os.path.exists(webp_filepath):
                            break
                        index += 1

                    with open(filepath, 'wb') as f:
                        f.write(content)

                    downloaded_hashes.add(img_hash)
                    downloaded_count += 1
                    print(f"  [+] Saved {filename} (Hash: {img_hash})")
                else:
                    print(f"  [-] Duplicate image detected, skipping...")
            else:
                print(f"  [!] Failed to download from {url}: Status {response.status_code}")
        except Exception as e:
            print(f"  [!] Error: {e}")

        time.sleep(0.5)

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python scripts/download_unique.py <theme_id> <queries> <count>")
        print("Example: python scripts/download_unique.py halloween 'halloween,pumpkin,spooky' 4")
        sys.exit(1)

    theme_id = sys.argv[1]
    queries = sys.argv[2]
    count = int(sys.argv[3])
    target_dir = os.path.join("public", "backgrounds", theme_id)

    download_image(theme_id, queries, count, target_dir)
