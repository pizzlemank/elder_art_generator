import os
import requests
import hashlib
import random
import time

THEMES = {
    "cny": ["chinese new year", "red lantern", "spring festival", "cny celebration"],
    "health": ["healthy lifestyle", "green nature", "wellness", "fresh fruits"],
    "morning": ["sunrise", "morning coffee", "dew on grass", "early morning"],
    "qixi": ["starry sky", "milky way", "romantic night", "lovers silhouette"],
    "mazu": ["ocean goddess", "temple architecture", "sea view", "peaceful sea"],
    "halloween": ["pumpkin", "halloween night", "spooky forest", "jack o lantern"],
    "buddha": ["lotus flower", "buddha statue", "zen garden", "temple"],
    "easter": ["easter eggs", "spring flowers", "bunny", "colorful eggs"],
    "whiteday": ["white flowers", "sweet dessert", "romantic gift", "white roses"],
    "earthgod": ["traditional temple", "fortune", "rural landscape", "harvest"],
    "earthday": ["earth from space", "forest", "clean ocean", "planting tree"],
    "diwali": ["diya lamps", "fireworks", "diwali celebration", "lights"],
    "birthday": ["birthday cake", "balloons", "celebration", "party"],
    "buddhist": ["zen", "meditation", "incense", "monastery"],
    "mothersday": ["carnations", "mother child", "warm hug", "pink flowers"],
    "qingming": ["rainy spring", "ancestor worship", "willow tree", "tomb sweeping"]
}

BG_DIR = "public/backgrounds"
NUM_IMAGES = 4

def get_image_hash(content):
    return hashlib.md5(content).hexdigest()

def download_images():
    seen_hashes = set()

    for theme_id, queries in THEMES.items():
        target_dir = os.path.join(BG_DIR, theme_id)
        os.makedirs(target_dir, exist_ok=True)

        print(f"Processing theme: {theme_id}")

        count = 0
        for i in range(NUM_IMAGES):
            # Check if image already exists (either .jpg or .webp)
            # filenames might be 01.jpg, 02.jpg etc.
            filename_jpg = f"0{i+1}.jpg"
            filename_webp = f"0{i+1}.webp"

            if os.path.exists(os.path.join(target_dir, filename_jpg)) or \
               os.path.exists(os.path.join(target_dir, filename_webp)):
                print(f"  Image {i+1} already exists, skipping.")
                continue

            query = queries[i % len(queries)]
            # Add some randomness to query to avoid duplicates from loremflickr
            lock = random.randint(1, 100000)
            url = f"https://loremflickr.com/1200/900/{query.replace(' ', ',')}/all?lock={lock}"

            try:
                print(f"  Downloading image {i+1} for {theme_id} (query: {query})...")
                response = requests.get(url, timeout=15)
                if response.status_code == 200:
                    img_hash = get_image_hash(response.content)
                    if img_hash in seen_hashes:
                        print(f"    Duplicate image detected for {theme_id}, retrying with different lock...")
                        # One retry
                        lock = random.randint(1, 100000)
                        url = f"https://loremflickr.com/1200/900/{query.replace(' ', ',')}/all?lock={lock}"
                        response = requests.get(url, timeout=15)
                        img_hash = get_image_hash(response.content)

                    seen_hashes.add(img_hash)
                    filepath = os.path.join(target_dir, filename_jpg)
                    with open(filepath, 'wb') as f:
                        f.write(response.content)
                    print(f"    Saved to {filepath}")
                else:
                    print(f"    Failed to download image from {url}")
            except Exception as e:
                print(f"    Error downloading {url}: {e}")

            time.sleep(0.5)

if __name__ == "__main__":
    download_images()
