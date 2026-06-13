import os
import requests
import hashlib
import time
import sys
import random
import json

def get_md5(content):
    return hashlib.md5(content).hexdigest()

def download_image(theme_id, queries, count=4):
    target_dir = f"public/backgrounds/{theme_id}"
    os.makedirs(target_dir, exist_ok=True)

    downloaded_hashes = set()
    # Pre-populate hashes of existing images
    if os.path.exists(target_dir):
        for filename in os.listdir(target_dir):
            if filename.endswith(('.jpg', '.webp')):
                try:
                    with open(os.path.join(target_dir, filename), 'rb') as f:
                        downloaded_hashes.add(get_md5(f.read()))
                except:
                    pass

    query_list = queries.split(',')

    # Check how many images already exist (01, 02, etc.)
    existing_images = [f for f in os.listdir(target_dir) if (f.endswith('.jpg') or f.endswith('.webp'))]
    success_count = len(existing_images)

    if success_count >= count:
        print(f"Theme {theme_id} already has {success_count} images. Skipping.")
        return

    print(f"Processing theme: {theme_id} (Queries: {queries})")

    # Try more times than count to account for duplicates
    for i in range(1, 20):
        if success_count >= count:
            break

        index_str = str(success_count + 1).zfill(2)
        # Check if 01.jpg, 01.webp etc exist
        if any(os.path.exists(os.path.join(target_dir, f"{index_str}{ext}")) for ext in ['.jpg', '.webp', '.png', '.jpeg']):
             # If it exists but isn't counted correctly somehow (maybe named differently), we still try to reach the count
             pass

        q = query_list[i % len(query_list)].strip()
        lock = random.randint(1, 1000000)
        url = f"https://loremflickr.com/1200/900/{q}/all?lock={lock}"

        try:
            print(f"  Downloading image for {theme_id} from {url}...")
            response = requests.get(url, timeout=20)
            if response.status_code == 200:
                content = response.content
                h = get_md5(content)

                if h in downloaded_hashes:
                    print(f"    Duplicate image detected for {theme_id}, skipping...")
                    continue

                # Find the next available index
                current_idx = 1
                while True:
                    candidate = str(current_idx).zfill(2)
                    if not any(os.path.exists(os.path.join(target_dir, f"{candidate}{ext}")) for ext in ['.jpg', '.webp', '.png', '.jpeg']):
                        filepath = os.path.join(target_dir, f"{candidate}.jpg")
                        break
                    current_idx += 1

                with open(filepath, 'wb') as f:
                    f.write(content)

                downloaded_hashes.add(h)
                success_count += 1
                print(f"    Saved to {filepath}")
                time.sleep(1.0) # Be nice to the API
            else:
                print(f"    Failed to download: Status {response.status_code}")
        except Exception as e:
            print(f"    Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) >= 3:
        theme_id = sys.argv[1]
        queries = sys.argv[2]
        count = int(sys.argv[3]) if len(sys.argv) > 3 else 4
        download_image(theme_id, queries, count)
    else:
        # Load from themes.json
        with open('public/data/themes.json', 'r') as f:
            data = json.load(f)

        # Mapping of IDs to specific queries if needed, else use ID/description
        query_map = {
            "cny": "chinese,new,year,red,lantern",
            "morning": "sunrise,morning,nature",
            "health": "nature,green,healthy,fruit",
            "classic": "landscape,traditional,chinese",
            "buddhist": "buddhist,temple,zen,statue",
            "birthday": "birthday,cake,celebration",
            "night": "night,sky,stars,moon",
            "qingming": "spring,rain,landscape,nature",
            "mothersday": "flowers,carnation,love",
            "lantern": "lantern,festival,night,red",
            "valentine": "romance,love,heart,rose",
            "dragonboat": "dragon,boat,river,zongzi",
            "fathersday": "father,mountain,hand",
            "midautumn": "moon,full,autumn,rabbit",
            "nationalday": "fireworks,celebration,flag",
            "christmas": "christmas,tree,snow,gift",
            "newyear": "fireworks,new,year,celebration",
            "funny": "funny,animal,dog,cat",
            "peace228": "peace,dove,white,flower",
            "children": "children,playing,joy,balloon",
            "labor": "labor,worker,tools,construction",
            "ghost": "ghost,festival,lantern,temple",
            "doubleninth": "chrysanthemum,autumn,mountain",
            "teachers": "teacher,book,classroom,apple",
            "winter": "winter,snow,cold,ice",
            "womens": "woman,happy,flower,power",
            "graduation": "graduation,cap,campus,success",
            "exam": "study,exam,book,pencil",
            "wedding": "wedding,bride,groom,flower",
            "encouragement": "mountain,success,climbing,sunset",
            "peace": "peace,nature,lake,zen",
            "summer": "summer,beach,sea,sun",
            "thanksgiving": "gratitude,thanksgiving,autumn",
            "qixi": "starry,night,couple,magpie",
            "halloween": "pumpkin,halloween,ghost,night",
            "singlesday": "shopping,cart,gift,box",
            "easter": "easter,egg,rabbit,spring",
            "aprilfools": "clown,joke,funny,laugh",
            "whiteday": "white,gift,love,romance",
            "earthday": "earth,nature,forest,green",
            "mazu": "temple,sea,goddess,taiwan",
            "buddha": "buddha,lotus,peace,zen",
            "youthday": "youth,run,dream,active",
            "militaryday": "soldier,military,hero,guard",
            "retrocession": "taiwan,history,flag,celebration",
            "constitution": "document,law,peace,taiwan",
            "earthgod": "temple,old,man,god,fortune"
        }

        for theme in data['themes']:
            tid = theme['id']
            queries = query_map.get(tid, tid)
            download_image(tid, queries, 4)
