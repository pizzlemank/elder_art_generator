#!/usr/bin/env python3
import json
import os
from download_unique import process_theme

THEME_QUERIES = {
    "cny": ["chinese", "newyear", "red", "festive"],
    "morning": ["morning", "sunrise", "sunshine", "landscape"],
    "health": ["nature", "green", "wellness", "forest"],
    "classic": ["scenery", "mountain", "traditional"],
    "buddhist": ["buddhist", "temple", "zen", "lotus"],
    "birthday": ["birthday", "cake", "balloons", "party"],
    "night": ["night", "sky", "stars", "moon"],
    "qingming": ["spring", "rain", "landscape", "mist"],
    "mothersday": ["carnations", "flowers", "mother"],
    "lantern": ["lantern", "festival", "red"],
    "valentine": ["love", "hearts", "roses"],
    "dragonboat": ["dragonboat", "river", "bamboo"],
    "fathersday": ["father", "mountain", "sunset"],
    "midautumn": ["fullmoon", "autumn", "mooncake"],
    "nationalday": ["fireworks", "celebration", "flag"],
    "christmas": ["christmas", "tree", "snow"],
    "newyear": ["fireworks", "newyear", "celebration"],
    "funny": ["funny", "cute", "smile"],
    "peace228": ["peace", "dove", "sky"],
    "children": ["children", "balloons", "play"],
    "labor": ["worker", "tools", "industry"],
    "ghost": ["lantern", "night", "candle"],
    "doubleninth": ["chrysanthemum", "autumn", "mountain"],
    "teachers": ["teacher", "books", "school"],
    "winter": ["winter", "snow", "warm"],
    "womens": ["woman", "flowers", "beauty"],
    "graduation": ["graduation", "university", "cap"],
    "exam": ["study", "books", "pencil"],
    "wedding": ["wedding", "flowers", "bride"],
    "encouragement": ["success", "mountain", "sunrise"],
    "peace": ["apple", "nature", "water"],
    "summer": ["summer", "sea", "beach"],
    "thanksgiving": ["autumn", "harvest", "pumpkin"],
    "whiteday": ["white", "rose", "gift", "chocolate"],
    "easter": ["easter", "egg", "rabbit", "spring"],
    "halloween": ["halloween", "pumpkin", "night"],
    "aprilfools": ["smile", "joke", "fun"],
    "earthday": ["earth", "green", "forest"],
    "youthday": ["youth", "sky", "jump"],
    "armedforces": ["soldier", "flag", "hero"],
    "retrocession": ["taiwan", "landscape", "sunset"],
    "constitution": ["justice", "book", "building"],
    "singlesday": ["shopping", "gift", "party"],
    "mazu": ["temple", "ocean", "statue"],
    "buddhabirthday": ["buddha", "lotus", "peace"],
    "earthgod": ["wealth", "gold", "temple"],
    "qixi": ["milkyway", "stars", "love"],
    "arborday": ["tree", "planting", "green"]
}

def main():
    themes_path = os.path.join("public", "data", "themes.json")
    with open(themes_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    themes = data.get("themes", [])
    print(f"Total themes to verify/download: {len(themes)}")

    for theme in themes:
        theme_id = theme["id"]
        queries = THEME_QUERIES.get(theme_id, ["nature", "festive"])
        process_theme(theme_id, queries, target_count=4)

if __name__ == "__main__":
    main()
