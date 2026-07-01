import os
import sys
import hashlib
import requests
import time
import random

def get_md5(file_path):
    hash_md5 = hashlib.md5()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_md5.update(chunk)
    return hash_md5.hexdigest()

def download_image(theme_id, queries, count):
    base_dir = os.path.join("public", "backgrounds", theme_id)
    os.makedirs(base_dir, exist_ok=True)

    downloaded_hashes = set()
    # Pre-populate hashes from existing files in the directory
    for f in os.listdir(base_dir):
        if f.endswith((".jpg", ".webp")):
            downloaded_hashes.add(get_md5(os.path.join(base_dir, f)))

    query_list = queries.split(",")
    downloaded_count = 0
    attempts = 0
    max_attempts = count * 3

    print(f"Downloading {count} unique images for theme '{theme_id}' with queries {query_list}...")

    while downloaded_count < count and attempts < max_attempts:
        attempts += 1
        query = random.choice(query_list)
        lock = random.randint(1, 100000)
        url = f"https://loremflickr.com/1200/900/{query}/all?lock={lock}"

        temp_file = os.path.join(base_dir, f"temp_{lock}.jpg")
        try:
            response = requests.get(url, timeout=15)
            if response.status_code == 200:
                with open(temp_file, "wb") as f:
                    f.write(response.content)

                file_hash = get_md5(temp_file)
                if file_hash not in downloaded_hashes:
                    # Find a gap in the naming 01, 02, 03...
                    index = 1
                    while True:
                        target_file = os.path.join(base_dir, f"{index:02d}.jpg")
                        target_webp = os.path.join(base_dir, f"{index:02d}.webp")
                        if not os.path.exists(target_file) and not os.path.exists(target_webp):
                            break
                        index += 1

                    final_path = os.path.join(base_dir, f"{index:02d}.jpg")
                    os.rename(temp_file, final_path)
                    downloaded_hashes.add(file_hash)
                    downloaded_count += 1
                    print(f"  [+] Saved {final_path} (Hash: {file_hash})")
                else:
                    print(f"  [-] Duplicate image found (Hash: {file_hash}), skipping...")
                    os.remove(temp_file)
            else:
                print(f"  [!] Failed to download image (Status: {response.status_code})")
        except Exception as e:
            print(f"  [!] Error: {e}")
            if os.path.exists(temp_file):
                os.remove(temp_file)

        time.sleep(0.5)

    print(f"Finished. Downloaded {downloaded_count} images for '{theme_id}'.")

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python3 scripts/download_unique.py <theme_id> <queries_comma_separated> <count>")
        sys.exit(1)

    theme_id = sys.argv[1]
    queries = sys.argv[2]
    count = int(sys.argv[3])

    download_image(theme_id, queries, count)
