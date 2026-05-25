import os
import requests
import hashlib
import random
import sys
import time

def get_md5(data):
    return hashlib.md5(data).hexdigest()

def download_image(url, theme_id, index, target_dir, existing_hashes):
    print(f"  Trying to download image {index} for {theme_id}...")
    try:
        response = requests.get(url, timeout=15)
        if response.status_code == 200:
            content = response.content
            h = get_md5(content)
            if h in existing_hashes:
                print(f"    Duplicate image detected (hash: {h}), skipping.")
                return False

            filename = f"{index:02d}.jpg"
            filepath = os.path.join(target_dir, filename)
            with open(filepath, 'wb') as f:
                f.write(content)
            existing_hashes.add(h)
            print(f"    Successfully downloaded {filename}")
            return True
        else:
            print(f"    Failed to download: Status {response.status_code}")
    except Exception as e:
        print(f"    Error: {e}")
    return False

def main():
    if len(sys.argv) < 3:
        print("Usage: python download_unique.py <theme_id> <query1,query2,...> [num_images]")
        sys.exit(1)

    theme_id = sys.argv[1]
    queries = sys.argv[2].split(',')
    num_images = int(sys.argv[3]) if len(sys.argv) > 3 else 4

    target_dir = os.path.join('public', 'backgrounds', theme_id)
    os.makedirs(target_dir, exist_ok=True)

    # Load existing hashes to avoid duplicates across runs if needed,
    # but primarily to avoid duplicates within this run.
    existing_hashes = set()

    # Also scan existing images in the directory
    for f in os.listdir(target_dir):
        if f.endswith(('.jpg', '.webp', '.png')):
            with open(os.path.join(target_dir, f), 'rb') as img_file:
                existing_hashes.add(get_md5(img_file.read()))

    count = 0
    # Find the next available index
    idx = 1
    while os.path.exists(os.path.join(target_dir, f"{idx:02d}.jpg")) or \
          os.path.exists(os.path.join(target_dir, f"{idx:02d}.webp")):
        idx += 1

    attempts = 0
    max_attempts = num_images * 3

    while count < num_images and attempts < max_attempts:
        query = random.choice(queries)
        lock = random.randint(1, 100000)
        url = f"https://loremflickr.com/1200/900/{query}/all?lock={lock}"

        if download_image(url, theme_id, idx, target_dir, existing_hashes):
            count += 1
            idx += 1
            time.sleep(1) # Be nice to the API

        attempts += 1

    if count < num_images:
        print(f"Finished with {count}/{num_images} images downloaded for {theme_id}.")
    else:
        print(f"Successfully downloaded {num_images} images for {theme_id}.")

if __name__ == "__main__":
    main()
