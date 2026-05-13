import os
import urllib.request
import hashlib
import random
import time

THEMES = [
    ("qixi", ["milky way", "romantic night", "starry sky", "love", "magpie bridge"]),
    ("mazu", ["temple festival", "lantern", "traditional chinese ceremony", "sea goddess", "blessing"]),
    ("halloween", ["pumpkin lantern", "halloween night", "spooky forest", "jack o lantern", "autumn celebration"]),
    ("buddha", ["buddha statue", "lotus flower", "temple zen", "peaceful meditation", "spiritual light"]),
    ("easter", ["easter egg", "spring meadow", "rabbit bunny", "floral easter", "joyful spring"]),
    ("whiteday", ["white chocolate", "romantic gift", "pure love", "flowers", "sweet surprise"]),
    ("earthgod", ["tudi gong", "wealth gold", "traditional temple", "prosperity", "fortune"]),
    ("earthday", ["planet earth", "green nature", "sustainable environment", "clean ocean", "reforestation"]),
    ("diwali", ["diwali oil lamp", "rangoli", "fireworks celebration", "festival of lights", "sparkling diya"])
]

BG_DIR = "public/backgrounds"
NUM_IMAGES = 4

def get_md5(data):
    return hashlib.md5(data).hexdigest()

def download_images():
    downloaded_hashes = set()

    for theme_id, queries in THEMES:
        target_dir = os.path.join(BG_DIR, theme_id)
        os.makedirs(target_dir, exist_ok=True)
        print(f"Processing theme: {theme_id}...")

        count = 0
        while count < NUM_IMAGES:
            index = count + 1
            # Use unique query per image to ensure variety
            query = queries[count % len(queries)].replace(" ", ",")
            lock = random.randint(1, 1000000)
            url = f"https://loremflickr.com/1200/900/{query}/all?lock={lock}{index}"

            try:
                req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req, timeout=15) as response:
                    img_data = response.read()
                    h = get_md5(img_data)

                    if h in downloaded_hashes:
                        print(f"  Duplicate image detected for {theme_id}, retrying...")
                        continue

                    downloaded_hashes.add(h)
                    filepath = os.path.join(target_dir, f"0{index}.jpg")
                    with open(filepath, "wb") as f:
                        f.write(img_data)
                    print(f"  Downloaded image {index}: {query}")
                    count += 1
                    time.sleep(0.5)
            except Exception as e:
                print(f"  Error downloading image {index}: {e}")
                time.sleep(1)

if __name__ == "__main__":
    download_images()
