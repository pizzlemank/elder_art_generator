import os
import sys
import hashlib
import json
import time
import urllib.request
import urllib.parse
import urllib.error

THEMES_SEARCH = {
    "cny": ["chinese new year red lantern", "chinese spring festival celebration", "red lantern festival", "chinese new year red decoration"],
    "morning": ["sunrise landscape morning sun", "morning sunlight landscape", "dawn sky nature", "beautiful sunrise landscape"],
    "health": ["green forest nature landscape", "fresh green leaves nature", "peaceful nature green", "forest sunlight nature"],
    "classic": ["mountain landscape lake scenery", "traditional landscape scenery", "lake mountain nature", "scenic nature landscape"],
    "buddhist": ["buddhist temple lotus zen", "zen garden temple", "pink lotus flower water", "buddha statue temple"],
    "birthday": ["birthday cake balloon celebration", "birthday balloons party", "celebration birthday cake candle", "birthday gifts balloons"],
    "night": ["starry night sky moon", "full moon night sky", "starry sky night landscape", "night moon clouds"],
    "qingming": ["spring rain green landscape", "green tea field landscape", "misty mountain spring landscape", "spring nature green"],
    "mothersday": ["carnation flowers bouquet", "pink roses flowers bouquet", "flowers for mothers day", "mother daughter flowers"],
    "lantern": ["lantern festival red lights", "chinese red lanterns night", "lantern lights festival", "lantern night sky"],
    "valentine": ["red roses bouquet love", "valentine red hearts roses", "romantic red roses", "love heart roses"],
    "dragonboat": ["dragon boat race river", "zongzi bamboo leaves", "dragonboat festival river", "bamboo leaves green"],
    "fathersday": ["mountain sunset landscape", "father child sunset mountain", "scenic mountain hiking sunset", "man mountain landscape"],
    "midautumn": ["full moon autumn night sky", "mid autumn festival moon", "moon night sky clouds", "golden moon autumn"],
    "nationalday": ["fireworks celebration night sky", "national day fireworks", "festive fireworks celebration", "fireworks night sky"],
    "christmas": ["christmas tree snow lights", "christmas lights snow night", "winter christmas decoration", "festive christmas tree"],
    "newyear": ["fireworks new year celebration", "new year lights fireworks", "sparkler new year celebration", "new year night fireworks"],
    "funny": ["happy smile funny cat", "happy dog smile", "funny smiling animal", "happy smiling face"],
    "peace228": ["white dove blue sky peace", "peaceful sky clouds dove", "peaceful nature landscape", "blue sky white clouds dove"],
    "children": ["colorful balloons playground sun", "happy children play park", "colorful balloons sky", "playground sun happy"],
    "labor": ["construction worker tools sunset", "industry hard work sunset", "tools craftsmanship sunset", "building construction worker"],
    "ghost": ["lantern night temple lights", "candle lights night temple", "incense burner temple night", "chinese temple lights"],
    "doubleninth": ["yellow chrysanthemum flower mountain", "autumn mountain chrysanthemum", "chrysanthemum flowers yellow", "climbing mountain autumn"],
    "teachers": ["teacher books school classroom", "library books classroom", "books library study", "chalkboard classroom school"],
    "winter": ["winter snow landscape hot soup", "winter snow mountain landscape", "snowy forest winter landscape", "hot soup winter warmth"],
    "womens": ["spring flowers woman happy", "beautiful pink flowers bouquet", "spring flowers sunshine", "graceful flowers nature"],
    "graduation": ["graduation hat diploma campus", "graduation cap diploma university", "graduation university celebration", "school campus graduation"],
    "exam": ["study books pencil library", "writing book desk study", "library books study desk", "notebook pencil study"],
    "wedding": ["wedding flowers rings bride", "wedding cake flowers bride", "romantic wedding decoration", "wedding bride flowers"],
    "encouragement": ["mountain climber sunrise success", "running sunset sunrise success", "climbing mountain sunrise", "success sunrise mountain"],
    "peace": ["fresh red apple peaceful lake", "calm water lake reflection", "peaceful green nature lake", "fresh green apple nature"],
    "summer": ["summer beach ocean blue sky", "tropical beach sea summer", "blue ocean beach sunlight", "summer sea waves beach"],
    "thanksgiving": ["autumn harvest pumpkin leaves", "thanksgiving pumpkin harvest", "autumn leaves pumpkin harvest", "thanksgiving food harvest"],
    "whiteday": ["white roses chocolate gift", "romantic white flowers bouquet", "white gift box ribbons", "white roses gift box"],
    "easter": ["easter eggs bunny spring", "colorful easter eggs grass", "easter bunny spring flowers", "easter egg hunt spring"],
    "aprilfools": ["smile clown mask happy", "joker clown smile happy", "funny mask smile joy", "happy smiling joker"],
    "earthday": ["planet earth green forest nature", "holding small plant hands soil", "green forest nature earth", "earth green nature landscape"],
    "youthday": ["youth running sunset friends", "young people running sunset", "youth energy sunlight sunset", "friends running sunset"],
    "armedforces": ["national flag military hero", "salute national flag sky", "flag sky honor hero", "military national flag salute"],
    "retrocession": ["taiwan landscape historic building", "taipei 101 sunset landscape", "historic building taiwan", "taiwanese landscape scenery"],
    "constitution": ["constitution law book gavel justice", "justice statue law book", "gavel scale justice law", "constitution paper book"],
    "singlesday": ["shopping bags gift boxes", "shopping mall gifts celebration", "colorful shopping bags gifts", "gift boxes celebration"],
    "mazu": ["mazu ocean temple sea", "chinese sea temple lantern", "goddess mazu temple sea", "temple incense burner ocean"],
    "buddhabday": ["gold buddha statue lotus temple", "buddha statue lotus flower", "peaceful buddha statue temple", "pink lotus buddha statue"],
    "earthgod": ["chinese temple gold fortune red", "fortune red gold temple", "red lantern temple gold", "earth god temple incense"],
    "qixi": ["starry night milky way galaxy", "romantic stars night sky", "galaxy starry night sky", "milky way starry night"],
    "arborday": ["tree planting green forest sprout", "small sprout plant soil hands", "planting green tree forest", "green tree sprout nature"],
    "halloween": ["halloween pumpkin jack o lantern", "jack o lantern autumn night", "scary halloween pumpkin night", "spooky pumpkin halloween"]
}

BG_DIR = "public/backgrounds"
TARGET_COUNT = 4

def get_md5(data):
    return hashlib.md5(data).hexdigest()

def get_existing_hashes(folder):
    hashes = set()
    if not os.path.exists(folder):
        return hashes
    for fname in os.listdir(folder):
        fpath = os.path.join(folder, fname)
        if os.path.isfile(fpath) and fname.endswith(('.jpg', '.jpeg', '.png', '.webp')):
            with open(fpath, 'rb') as f:
                hashes.add(get_md5(f.read()))
    return hashes

def fetch_wikimedia_images(query, count=6):
    params = {
        "action": "query",
        "generator": "search",
        "gsrsearch": query,
        "gsrnamespace": 6,  # File namespace
        "prop": "imageinfo",
        "iiprop": "url",
        "iiurlwidth": 1200,
        "format": "json"
    }
    url = f"https://commons.wikimedia.org/w/api.php?{urllib.parse.urlencode(params)}"
    headers = {'User-Agent': 'ElderArtGeneratorBot/1.0 (contact@elderartgenerator.org)'}

    image_urls = []
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            pages = data.get("query", {}).get("pages", {})
            for page_id, page in pages.items():
                imageinfo = page.get("imageinfo", [])
                if imageinfo:
                    thumburl = imageinfo[0].get("thumburl")
                    if thumburl:
                        image_urls.append(thumburl)
    except Exception as e:
        print(f"    Wikimedia API search error for '{query}': {e}")

    return image_urls

def download_images_for_theme(theme_id, queries):
    folder = os.path.join(BG_DIR, theme_id)
    os.makedirs(folder, exist_ok=True)

    existing_hashes = get_existing_hashes(folder)
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

    for idx in range(1, TARGET_COUNT + 1):
        num_str = f"{idx:02d}"
        jpg_path = os.path.join(folder, f"{num_str}.jpg")
        webp_path = os.path.join(folder, f"{num_str}.webp")

        if os.path.exists(jpg_path) or os.path.exists(webp_path):
            continue

        query = queries[(idx - 1) % len(queries)]
        print(f"[{theme_id}] Downloading image {num_str} ('{query}')...")

        # Try Wikimedia first
        urls = fetch_wikimedia_images(query)
        success = False

        for img_url in urls:
            try:
                req = urllib.request.Request(img_url, headers=headers)
                with urllib.request.urlopen(req, timeout=10) as response:
                    img_data = response.read()
                    if len(img_data) > 5000:
                        md5_val = get_md5(img_data)
                        if md5_val in existing_hashes:
                            continue
                        with open(jpg_path, 'wb') as f:
                            f.write(img_data)
                        existing_hashes.add(md5_val)
                        print(f"  Downloaded {jpg_path} via Wikimedia ({len(img_data)} bytes).")
                        success = True
                        break
            except Exception as e:
                pass

        # Fallback to Picsum if Wikimedia didn't return a new unique image
        if not success:
            attempts = 0
            while not success and attempts < 3:
                attempts += 1
                seed = int(time.time() * 1000) % 100000 + idx * 37 + attempts * 13
                picsum_url = f"https://picsum.photos/seed/{seed}/1200/900"
                try:
                    req = urllib.request.Request(picsum_url, headers=headers)
                    with urllib.request.urlopen(req, timeout=10) as response:
                        img_data = response.read()
                        if len(img_data) > 5000:
                            md5_val = get_md5(img_data)
                            if md5_val in existing_hashes:
                                continue
                            with open(jpg_path, 'wb') as f:
                                f.write(img_data)
                            existing_hashes.add(md5_val)
                            print(f"  Downloaded {jpg_path} via Picsum fallback ({len(img_data)} bytes).")
                            success = True
                except Exception as e:
                    print(f"  Picsum error: {e}")

def main():
    print("Starting stock photo download process...")
    for theme_id, queries in THEMES_SEARCH.items():
        download_images_for_theme(theme_id, queries)
    print("\nAll downloads finished successfully!")

if __name__ == "__main__":
    main()
