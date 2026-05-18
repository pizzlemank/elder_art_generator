import os
import urllib.request
import hashlib
import time
import random

THEMES = {
    "mazu": "ocean,sea,temple",
    "qixi": "stars,milky way,romantic",
    "halloween": "pumpkin,autumn,halloween",
    "buddha": "lotus,buddha,peace",
    "easter": "easter egg,spring,bunny",
    "whiteday": "white,gift,romance",
    "earthgod": "harvest,field,temple",
    "earthday": "earth,nature,green",
    "diwali": "candle,light,festival",
    "aprilfool": "clown,smile,funny",
    "youthday": "youth,jumping,happy",
    "armedforces": "soldier,military,flag",
    "retrocession": "taiwan,landscape,celebration",
    "singlesday": "shopping,gift,happiness",
    "cny": "chinese new year,red,festive",
    "morning": "sunrise,morning,landscape",
    "health": "nature,green,healthy",
    "funny": "funny animal,cute",
    "birthday": "birthday cake,celebration",
    "buddhist": "temple,zen,meditation",
    "mothersday": "carnation,flower,love",
    "qingming": "willow,spring,rain",
    "night": "starry night,moon"
}

BG_DIR = "public/backgrounds"
NUM_IMAGES = 4

def get_image_hash(data):
    return hashlib.md5(data).hexdigest()

def download_images():
    downloaded_hashes = set()

    # Pre-populate hashes with existing images to avoid duplicates
    for root, dirs, files in os.walk(BG_DIR):
        for file in files:
            if file.endswith(('.jpg', '.webp')):
                with open(os.path.join(root, file), 'rb') as f:
                    downloaded_hashes.add(get_image_hash(f.read()))

    for theme_id, query in THEMES.items():
        target_dir = os.path.join(BG_DIR, theme_id)
        os.makedirs(target_dir, exist_ok=True)

        print(f"Processing {theme_id}...")

        count = 0
        # Count existing images
        existing = [f for f in os.listdir(target_dir) if f.endswith(('.jpg', '.webp'))]
        count = len(existing)

        attempts = 0
        max_attempts = 15

        while count < NUM_IMAGES and attempts < max_attempts:
            attempts += 1
            # Add some randomness to query to get different images
            queries = query.split(',')
            q = random.choice(queries).strip().replace(' ', '+')
            lock = random.randint(1, 100000)
            url = f"https://loremflickr.com/1200/900/{q}/all?lock={lock}"

            try:
                print(f"  Attempt {attempts}: Downloading {url}...")
                with urllib.request.urlopen(url, timeout=10) as response:
                    data = response.read()
                    img_hash = get_image_hash(data)

                    if img_hash in downloaded_hashes:
                        print("    Duplicate image, skipping.")
                        continue

                    # Ensure it's a real image and not an error page
                    if len(data) < 1000:
                        print("    File too small, possibly not an image.")
                        continue

                    filename = f"{count+1:02d}.jpg"
                    filepath = os.path.join(target_dir, filename)

                    # If 01.jpg exists, try 02.jpg etc
                    while os.path.exists(filepath) or os.path.exists(filepath.replace('.jpg', '.webp')):
                        count += 1
                        filename = f"{count+1:02d}.jpg"
                        filepath = os.path.join(target_dir, filename)

                    with open(filepath, 'wb') as f:
                        f.write(data)

                    downloaded_hashes.add(img_hash)
                    count += 1
                    print(f"    Saved to {filepath}")
                    time.sleep(0.5)
            except Exception as e:
                print(f"    Error: {e}")
                time.sleep(1)

if __name__ == "__main__":
    download_images()
