import os
import glob
import hashlib
import random
import time
import requests
from concurrent.futures import ThreadPoolExecutor

THEME_QUERIES = {
    "cny": ["chinese,new,year", "red,lantern", "spring,festival", "red,envelope"],
    "morning": ["morning,sunrise", "sunlight,nature", "morning,dew", "coffee,morning"],
    "health": ["nature,forest", "healthy,lifestyle", "fresh,green,leaves", "peaceful,landscape"],
    "classic": ["mountain,landscape", "traditional,scenery", "misty,mountains", "chinese,painting,scenery"],
    "buddhist": ["zen,garden", "buddha,statue", "lotus,flower", "temple,peaceful"],
    "birthday": ["birthday,cake", "party,balloons", "celebration,confetti", "birthday,candle"],
    "night": ["starry,night", "moonlight,sky", "calm,night", "milky,way"],
    "qingming": ["spring,rain", "green,tea,field", "misty,forest", "willow,tree"],
    "mothersday": ["carnation,flowers", "mother,holding,hand", "pink,roses", "warm,family"],
    "lantern": ["lantern,festival", "red,lantern,lights", "night,lantern", "glowing,lanterns"],
    "valentine": ["red,roses", "heart,love", "romantic,sunset", "pink,flowers"],
    "dragonboat": ["dragon,boat", "zongzi,rice", "green,bamboo,leaves", "river,racing"],
    "fathersday": ["father,son,mountain", "father,holding,hand", "classic,watch,tie", "mountain,sunset"],
    "midautumn": ["full,moon", "mooncake", "autumn,moon", "lantern,night"],
    "nationalday": ["fireworks,night", "celebration,flag", "festive,lights", "city,fireworks"],
    "christmas": ["christmas,tree", "winter,snow,decorations", "cozy,christmas,lights", "santa,gift"],
    "newyear": ["fireworks,new,year", "sparkler,celebration", "new,year,lights", "countdown,fireworks"],
    "funny": ["cute,cat,smile", "funny,dog", "happy,animal", "playful,pet"],
    "peace228": ["peace,dove", "white,lily,flower", "calm,blue,sky", "peaceful,lake"],
    "children": ["colorful,balloons", "children,park", "soap,bubbles", "playground,sunshine"],
    "labor": ["craftsman,hands", "tools,workshop", "sunrise,field", "hardwork,smile"],
    "ghost": ["lantern,night", "incense,smoke", "temple,lights", "peaceful,night"],
    "doubleninth": ["chrysanthemum,flower", "autumn,mountain,climbing", "golden,autumn", "chrysanthemum,tea"],
    "teachers": ["books,glasses", "chalkboard,school", "teacher,desk", "autumn,library"],
    "winter": ["hot,soup,dumplings", "winter,snow", "cozy,fire", "sweet,tangyuan"],
    "womens": ["spring,blooms", "women,empowerment", "beautiful,tulips", "graceful,flowers"],
    "graduation": ["graduation,cap", "diploma,scroll", "university,campus", "celebration,caps"],
    "exam": ["study,desk", "pencils,notebook", "focused,reading", "success,light"],
    "wedding": ["wedding,rings", "wedding,flower,arch", "bride,bouquet", "romantic,celebration"],
    "encouragement": ["mountain,peak,sunrise", "runner,finish,line", "reaching,star,sky", "sunburst,clouds"],
    "peace": ["fresh,red,apple", "peaceful,green,valley", "tranquil,water", "gentle,sunlight"],
    "summer": ["tropical,beach", "blue,ocean,waves", "ice,cream,summer", "palm,trees,sun"],
    "thanksgiving": ["autumn,pumpkin", "thanksgiving,harvest", "fall,leaves", "warm,family,dinner"],
    "whiteday": ["white,rose", "white,chocolate", "sweet,gift,box", "pure,love,flowers"],
    "easter": ["easter,eggs", "spring,easter,bunny", "colorful,eggs,grass", "spring,flowers,bloom"],
    "earthday": ["planet,earth,green", "hands,holding,plant", "forest,sunlight", "clean,ocean"],
    "aprilfools": ["jester,hat", "party,streamers", "funny,face,emoji", "bright,confetti"],
    "halloween": ["carved,pumpkin", "jack,o,lantern", "spooky,autumn,night", "halloween,decorations"],
    "singlesday": ["shopping,bags", "gift,boxes,red", "celebration,sparkles", "happy,shopping"],
    "arbor": ["planting,tree,sapling", "green,forest,trees", "hand,holding,soil", "lush,greenery"],
    "mazu": ["traditional,temple,architecture", "red,temple,lantern", "incense,burner", "sea,goddess,scenery"],
    "qixi": ["starry,night,sky", "romantic,bridge", "magpie,bird", "purple,galaxy"],
    "buddhabirthday": ["lotus,flower,water", "buddha,statue,golden", "zen,temple,water", "peaceful,lotus"],
    "earthgod": ["traditional,temple,gold", "gold,ingot,red", "red,lantern,temple", "festive,chinese,gold"],
    "youth": ["youth,running,sunshine", "active,sports,outdoor", "friends,jumping,sunset", "bright,blue,sky"],
    "armedforces": ["military,flag,sky", "honor,guard", "hero,salute", "peaceful,sky,flag"],
    "retrocession": ["taiwan,landscape", "taroko,gorge", "taipei,101,sunset", "beautiful,taiwan,mountains"],
    "constitution": ["law,book,gavel", "justice,balance,scale", "classic,building,pillars", "peaceful,blue,sky"]
}

BG_DIR = "public/backgrounds"
TARGET_COUNT = 4

def get_file_md5(filepath):
    hasher = hashlib.md5()
    with open(filepath, 'rb') as f:
        buf = f.read()
        hasher.update(buf)
    return hasher.hexdigest()

def process_task(task):
    theme_id, idx, target_dir = task
    filename_jpg = f"{idx:02d}.jpg"
    filename_webp = f"{idx:02d}.webp"
    path_jpg = os.path.join(target_dir, filename_jpg)
    path_webp = os.path.join(target_dir, filename_webp)

    if os.path.exists(path_jpg) or os.path.exists(path_webp):
        return (theme_id, idx, True, "Already exists")

    queries = THEME_QUERIES.get(theme_id, ["nature", "scenery"])
    query_str = queries[(idx - 1) % len(queries)]

    # Try sources: picsum, loremflickr, unsplash images
    for attempt in range(6):
        lock_id = random.randint(100, 99999)
        if attempt % 2 == 0:
            url = f"https://loremflickr.com/1200/900/{query_str}/all?lock={lock_id}"
        else:
            term = query_str.split(',')[0]
            url = f"https://picsum.photos/seed/{theme_id}-{idx}-{lock_id}/1200/900"

        try:
            resp = requests.get(url, timeout=8, headers={"User-Agent": "Mozilla/5.0"})
            if resp.status_code == 200 and len(resp.content) > 10000:
                with open(path_jpg, 'wb') as f:
                    f.write(resp.content)
                return (theme_id, idx, True, f"Saved {path_jpg}")
        except Exception as e:
            pass
        time.sleep(0.2)

    return (theme_id, idx, False, "Failed")

def main():
    os.makedirs(BG_DIR, exist_ok=True)
    tasks = []

    for theme_id in THEME_QUERIES.keys():
        target_dir = os.path.join(BG_DIR, theme_id)
        os.makedirs(target_dir, exist_ok=True)

        for i in range(1, TARGET_COUNT + 1):
            tasks.append((theme_id, i, target_dir))

    print(f"Total tasks to check/download: {len(tasks)}")

    with ThreadPoolExecutor(max_workers=8) as executor:
        results = executor.map(process_task, tasks)
        for theme_id, idx, success, msg in results:
            print(f"[{theme_id}] {idx:02d}: {msg}")

    print("Download script finished.")

if __name__ == "__main__":
    main()
