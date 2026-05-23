import os
import requests
import hashlib
import time
import random

THEMES = {
    "whiteday": ["white", "heart", "romance", "gift"],
    "aprilfools": ["clown", "funny", "joke", "laugh"],
    "earthday": ["earth", "nature", "green", "forest"],
    "easter": ["easter", "egg", "bunny", "spring"],
    "halloween": ["pumpkin", "halloween", "night", "spooky"],
    "diwali": ["diwali", "lamp", "light", "candle"],
    "qixi": ["galaxy", "starry", "night", "stars"],
    "mazu": ["sea", "temple", "ocean", "waves"],
    "buddha": ["buddha", "lotus", "peace", "zen"],
    "earthgod": ["temple", "shrine", "statue", "taiwan"],
    "youth": ["running", "jumping", "happy", "freedom"],
    "armedforces": ["soldier", "military", "flag", "honor"],
    "retrocession": ["celebration", "fireworks", "parade", "taiwan"],
    "singlesday": ["shopping", "gift", "happy", "bags"]
}

BG_DIR = "public/backgrounds"
NUM_IMAGES = 4
WIDTH = 1200
HEIGHT = 900

def get_md5(data):
    return hashlib.md5(data).hexdigest()

def download_images():
    downloaded_hashes = set()

    for theme_id, queries in THEMES.items():
        target_dir = os.path.join(BG_DIR, theme_id)
        os.makedirs(target_dir, exist_ok=True)

        print(f"Processing theme: {theme_id}")

        count = 1
        attempts = 0
        max_attempts = 15

        while count <= NUM_IMAGES and attempts < max_attempts:
            query = queries[(count - 1) % len(queries)]
            lock = random.randint(1, 10000)
            url = f"https://loremflickr.com/{WIDTH}/{HEIGHT}/{query}/all?lock={lock}{count}{attempts}"

            try:
                response = requests.get(url, timeout=10)
                if response.status_code == 200:
                    img_data = response.content
                    img_hash = get_md5(img_data)

                    if img_hash not in downloaded_hashes:
                        filepath = os.path.join(target_dir, f"0{count}.jpg")
                        with open(filepath, "wb") as f:
                            f.write(img_data)

                        downloaded_hashes.add(img_hash)
                        print(f"  Saved {filepath} (Query: {query}, Hash: {img_hash})")
                        count += 1
                    else:
                        print(f"  Duplicate image found for {theme_id}, retrying...")
                else:
                    print(f"  Failed to download image for {theme_id} (Status: {response.status_code})")
            except Exception as e:
                print(f"  Error downloading image for {theme_id}: {e}")

            attempts += 1
            time.sleep(0.5)

        if count <= NUM_IMAGES:
            print(f"  Warning: Could only download {count-1} images for {theme_id}")

if __name__ == "__main__":
    download_images()
    print("Download complete.")
