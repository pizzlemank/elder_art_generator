#!/bin/bash

# Configuration for all themes that might be missing images
THEMES=(
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
    "qixi:stars,love,night"
    "mazu:temple,sea,taiwan"
    "buddha:buddha,lotus"
    "easter:easter,egg,rabbit"
    "whiteday:white,gift,love"
    "earthgod:nature,fortune,old"
    "diwali:diwali,lamp,light"
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
        FILEPATH="$TARGET_DIR/0$i.jpg"
        # Check if any image exists (jpg or webp)
        if [ ! -f "$FILEPATH" ] && [ ! -f "$TARGET_DIR/0$i.webp" ]; then
            echo "  Downloading image $i..."
            # Try with query but if it fails to produce a file, it might be the query format
            # Using commas for loremflickr as per their API
            curl -L "https://loremflickr.com/1200/900/${QUERY}" -o "$FILEPATH" -s

            # Simple check if download was successful and is a real file
            if [ ! -s "$FILEPATH" ]; then
                echo "    Download failed for $FILEPATH, retrying without query..."
                curl -L "https://loremflickr.com/1200/900/nature" -o "$FILEPATH" -s
            fi
            sleep 0.5
        fi
    done
done

echo "Download complete."
