import os
import requests
import hashlib
import time
import random

THEMES = {
    "qixi": "couple,stars,love",
    "mazu": "temple,ocean,statue",
    "halloween": "pumpkin,spooky,halloween",
    "buddha": "buddha,lotus,peace",
    "easter": "easter,egg,spring",
    "whiteday": "white,gift,chocolate",
    "earthgod": "temple,nature,forest",
    "earthday": "earth,green,nature",
    "diwali": "lamp,candle,diwali"
}

BG_DIR = "public/backgrounds"
NUM_IMAGES = 4

def download_image(theme_id, query, index):
    target_dir = os.path.join(BG_DIR, theme_id)
    os.makedirs(target_dir, exist_ok=True)

    filename = f"0{index}.jpg"
    filepath = os.path.join(target_dir, filename)
    webp_path = os.path.join(target_dir, f"0{index}.webp")

    if os.path.exists(filepath) or os.path.exists(webp_path):
        print(f"  Image {index} already exists for {theme_id}. Skipping.")
        return

    print(f"  Downloading image {index} for {theme_id}...")

    # Try different search terms for variety
    queries = query.split(',')
    search_term = random.choice(queries)

    # Use lock and search term for uniqueness as per memory
    lock = random.randint(1, 10000)
    url = f"https://loremflickr.com/1200/900/{search_term}/all?lock={lock}{index}"

    try:
        response = requests.get(url, timeout=15)
        if response.status_code == 200:
            with open(filepath, 'wb') as f:
                f.write(response.content)
            print(f"    Saved to {filepath}")
        else:
            print(f"    Failed to download {url}. Status code: {response.status_code}")
    except Exception as e:
        print(f"    Error downloading {url}: {e}")

    time.sleep(0.5)

def main():
    for theme_id, query in THEMES.items():
        print(f"Processing theme: {theme_id}...")
        for i in range(1, NUM_IMAGES + 1):
            download_image(theme_id, query, i)

if __name__ == "__main__":
    main()
