import os
import requests
import hashlib
import time
import random

THEMES = {
    "cny": ["chinese lunar new year temple", "red chinese lantern festival", "traditional chinese architecture", "dragon dance festival"],
    "morning": ["golden sunrise mountain", "fresh morning dew leaf", "morning sun beam forest", "misty morning lake"],
    "health": ["fresh green salad bowl", "yoga meditation park", "running track park", "healthy fruits basket"],
    "birthday": ["colorful birthday cake", "helium party balloons", "unwrapped birthday gift", "birthday party confetti"],
    "buddhist": ["golden buddha statue", "japanese zen garden", "buddhist monk praying", "pink lotus flower pond"],
    "night": ["clear starry night sky", "neon city lights night", "bright full moon night", "dark forest moonlight"],
    "qingming": ["misty mountain landscape", "ancient chinese tomb", "willow tree spring", "traditional ancestor worship"],
    "mothersday": ["pink carnation bouquet", "mother hugging child", "beautiful flower garden", "family dinner home"],
    "funny": ["face laughing hard", "funny cute cat", "happy dog smiling", "clown performance"],
    "halloween": ["jack o lantern pumpkin", "dark spooky forest", "old gothic castle", "trick or treat candy"],
    "earthgod": ["tudi gong statue", "traditional temple altar", "chinese incense burning", "rural chinese temple"],
    "mazu": ["mazu goddess statue", "matsu temple architecture", "ocean waves beach", "traditional temple parade"],
    "buddhabirthday": ["bathing buddha ceremony", "sacred lotus flower", "buddhist temple festival", "vesak day celebration"],
    "easter": ["colorful easter eggs", "fluffy easter bunny", "spring flowers field", "white lily flower"],
    "diwali": ["diwali oil lamp diyas", "colorful rangoli art", "fireworks night sky", "indian festival celebration"],
    "earthday": ["planet earth from space", "hand planting tree", "clean blue ocean", "lush green rainforest"],
    "qixi": ["starry sky milky way", "couple watching stars", "bridge of birds chinese", "tanabata bamboo wishes"]
}

BG_DIR = "public/backgrounds"

def get_md5(fname):
    hash_md5 = hashlib.md5()
    with open(fname, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_md5.update(chunk)
    return hash_md5.hexdigest()

def download_images():
    for theme, queries in THEMES.items():
        target_dir = os.path.join(BG_DIR, theme)
        os.makedirs(target_dir, exist_ok=True)
        print(f"Processing {theme}...")

        existing_hashes = set()
        # Also check existing webp files if any
        for f in os.listdir(target_dir):
            if f.endswith(".webp"):
                existing_hashes.add(get_md5(os.path.join(target_dir, f)))

        for i, query in enumerate(queries):
            idx = i + 1
            filename = f"{idx:02d}.jpg"
            filepath = os.path.join(target_dir, filename)

            success = False
            for attempt in range(10):
                lock = random.randint(1, 1000000)
                url = f"https://loremflickr.com/1200/900/{query.replace(' ', ',')}/all?lock={lock}"
                try:
                    response = requests.get(url, timeout=15)
                    if response.status_code == 200:
                        with open(filepath, "wb") as f:
                            f.write(response.content)

                        h = get_md5(filepath)
                        if h not in existing_hashes:
                            existing_hashes.add(h)
                            print(f"  Downloaded {filename} (Attempt {attempt}) - Hash: {h}")
                            success = True
                            break
                        else:
                            print(f"  Duplicate hash {h} for {filename} (Attempt {attempt}), retrying...")
                except Exception as e:
                    print(f"  Error downloading {url}: {e}")

                time.sleep(1)

            if not success:
                print(f"  Failed to get unique image for {filename} after 10 attempts")

if __name__ == "__main__":
    download_images()
