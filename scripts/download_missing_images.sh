#!/bin/bash

THEMES=(
    "cny:chinese+new+year,red,festive"
    "morning:sunrise,morning,nature"
    "health:nature,green,forest"
    "birthday:birthday,cake,celebration"
    "night:night,stars,sky"
    "qingming:spring,rain,nature"
    "mothersday:flowers,carnation"
    "lantern:lantern,festival,night"
    "valentine:love,hearts,roses"
    "dragonboat:dragonboat,zongzi"
    "fathersday:father,mountain"
    "midautumn:moon,autumn"
    "nationalday:fireworks,celebration"
    "christmas:christmas,tree,snow"
    "newyear:fireworks,celebration"
    "funny:funny,animals"
    "buddhist:buddhist,temple,zen"
    "children:children,toys,happy"
    "labor:tools,construction,work"
    "ghost:lantern,ghost,temple"
    "teachers:teacher,book,classroom"
    "double-ninth:chrysanthemum,mountain"
    "halloween:pumpkin,halloween"
    "solstice:soup,winter,fire"
    "peace:dove,peace,olive"
)

BG_DIR="public/backgrounds"
NUM_IMAGES=4

for item in "${THEMES[@]}"; do
    ID="${item%%:*}"
    QUERY="${item#*:}"
    TARGET_DIR="$BG_DIR/$ID"

    mkdir -p "$TARGET_DIR"

    # Check current count
    COUNT=$(ls "$TARGET_DIR" | grep -E "\.(jpg|jpeg|png|webp)$" | wc -l)

    if [ "$COUNT" -lt "$NUM_IMAGES" ]; then
        echo "Processing theme: $ID (Current: $COUNT, Target: $NUM_IMAGES)..."
        START=$((COUNT + 1))
        for i in $(seq $START $NUM_IMAGES); do
            FILEPATH="$TARGET_DIR/stock_$i.jpg"
            echo "  Downloading image $i for $ID..."
            curl -L "https://loremflickr.com/1200/900/$QUERY?lock=$i" -o "$FILEPATH" -s
            sleep 0.5
        done
    else
        echo "Theme $ID already has $COUNT images. Skipping."
    fi
done

echo "Download complete."
