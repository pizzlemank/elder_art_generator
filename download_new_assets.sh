#!/bin/bash

# Configuration for all themes that might be missing images
THEMES=(
    "cny:chinese,new,year,red"
    "morning:morning,sunrise,coffee"
    "health:health,wellness,nature"
    "birthday:birthday,cake,celebration"
    "qingming:willow,nature,spring"
    "buddhist:zen,buddha,temple"
    "night:night,moon,stars"
    "mothersday:carnation,mother,love"
    "funny:funny,smile,happy"
    "lantern:lantern,festival"
    "valentine:love,hearts"
    "dragonboat:dragon,boat,zongzi"
    "fathersday:father,mountain"
    "midautumn:moon,autumn"
    "nationalday:fireworks,celebration"
    "christmas:christmas,tree"
    "newyear:fireworks,new,year"
    "peace228:peace,dove"
    "children:children,play"
    "labor:worker,tools"
    "ghost:lantern,night"
    "doubleninth:flower,autumn"
    "teachers:teacher,school"
    "winter:winter,snow"
    "womens:woman,happy"
    "graduation:graduation"
    "exam:study,exam"
    "wedding:wedding"
    "encouragement:success,motivation"
    "peace:apple,nature"
    "summer:summer,sea"
    "thanksgiving:gratitude,thanks"
    "halloween:halloween,pumpkin"
    "qixi:starry,night,love"
    "mazu:temple,sea,goddess"
    "easter:easter,egg,rabbit"
    "whiteday:white,gift,love"
    "buddha:buddha,lotus,peace"
    "earthgod:temple,old,man,blessing"
)

BG_DIR="public/backgrounds"
NUM_IMAGES=4

# Loop through themes
for item in "${THEMES[@]}"; do
    ID="${item%%:*}"
    QUERY="${item#*:}"
    TARGET_DIR="$BG_DIR/$ID"

    echo "Processing theme: $ID (Query: $QUERY)..."
    mkdir -p "$TARGET_DIR"

    for i in $(seq 1 $NUM_IMAGES); do
        FILEPATH_JPG="$TARGET_DIR/0$i.jpg"
        FILEPATH_WEBP="$TARGET_DIR/0$i.webp"

        echo "  Downloading image $i for $ID..."
        # Force download even if exists to fix duplicates, using lock to ensure uniqueness
        # We use i as lock
        curl -L "https://loremflickr.com/1200/900/${QUERY}/all?lock=$i" -o "$FILEPATH_JPG" -s

        # Simple check if download was successful and is a real file
        if [ ! -s "$FILEPATH_JPG" ]; then
            echo "    Download failed for $FILEPATH_JPG, retrying with nature..."
            curl -L "https://loremflickr.com/1200/900/nature/all?lock=$i" -o "$FILEPATH_JPG" -s
        fi

        # Remove webp if it exists so sync-content can regenerate it from the new jpg
        if [ -f "$FILEPATH_WEBP" ]; then
            rm "$FILEPATH_WEBP"
        fi

        sleep 0.5
    done
done

echo "Download complete."
