#!/bin/bash

THEMES=(
    "lantern:lantern festival red"
    "valentine:love hearts roses"
    "dragonboat:dragon boat zongzi"
    "fathersday:father mountain"
    "midautumn:moon rabbit autumn"
    "nationalday:fireworks celebration"
    "christmas:christmas tree snow"
    "newyear:fireworks"
)

BG_DIR="public/backgrounds"
NUM_IMAGES=4

for item in "${THEMES[@]}"; do
    ID="${item%%:*}"
    QUERY="${item#*:}"
    TARGET_DIR="$BG_DIR/$ID"

    echo "Processing theme: $ID (Query: $QUERY)..."
    mkdir -p "$TARGET_DIR"

    for i in $(seq -w 1 $NUM_IMAGES); do
        FILEPATH="$TARGET_DIR/$i.jpg"
        echo "  Downloading image $i..."
        curl -L "https://loremflickr.com/1200/900/${QUERY// /+}" -o "$FILEPATH" -s
        sleep 0.5
    done
done

echo "Download complete."
