import os
import hashlib
import requests
import time
import random

THEMES = {
    "whiteday": ["white", "valentine", "gift", "sweets"],
    "aprilfools": ["clown", "joke", "surprise", "funny"],
    "earthday": ["earth", "nature", "green", "planet"],
    "easter": ["easter", "egg", "bunny", "spring"],
    "halloween": ["halloween", "pumpkin", "spooky", "autumn"],
    "diwali": ["diwali", "lamp", "light", "festival"],
    "qixi": ["romantic", "starry", "sky", "magpie"],
    "mazu": ["temple", "sea", "mazu", "culture"],
    "buddha": ["buddha", "lotus", "peace", "meditation"],
    "earthgod": ["temple", "god", "traditional", "taiwan"],
    "youth": ["youth", "running", "dream", "energy"],
    "armedforces": ["soldier", "military", "flag", "hero"],
    "retrocession": ["taiwan", "history", "victory", "celebration"],
    "singlesday": ["shopping", "cart", "sale", "happy"]
}

BG_DIR = "public/backgrounds"
NUM_IMAGES = 4

def get_md5(data):
    return hashlib.md5(data).hexdigest()

def download_images():
    session = requests.Session()
    # Use a common user agent to avoid being blocked
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    })

    for theme_id, queries in THEMES.items():
        target_dir = os.path.join(BG_DIR, theme_id)
        os.makedirs(target_dir, exist_ok=True)
        print(f"Processing theme: {theme_id}...")

        hashes = set()
        count = 0
        idx = 1

        while count < NUM_IMAGES and idx <= 20: # Limit attempts to 20
            query = random.choice(queries)
            # Add some randomness to lock to avoid duplicates from previous runs
            lock = random.randint(1, 10000)
            url = f"https://loremflickr.com/1200/900/{query}/all?lock={lock}{idx}"

            try:
                response = session.get(url, timeout=10)
                if response.status_code == 200:
                    img_data = response.content
                    img_hash = get_md5(img_data)

                    if img_hash not in hashes:
                        hashes.add(img_hash)
                        filename = f"{count + 1:02d}.jpg"
                        filepath = os.path.join(target_dir, filename)

                        with open(filepath, "wb") as f:
                            f.write(img_data)

                        print(f"  Downloaded {filename} (Query: {query}, Hash: {img_hash})")
                        count += 1
                    else:
                        print(f"  Duplicate image found (Hash: {img_hash}), skipping...")
                else:
                    print(f"  Failed to download from {url} (Status: {response.status_code})")
            except Exception as e:
                print(f"  Error downloading {url}: {e}")

            idx += 1
            time.sleep(0.5)

if __name__ == "__main__":
    download_images()
    print("Download complete.")
