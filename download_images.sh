#!/bin/bash

# Configuration
THEMES=(
    "cny:new year festive red"
    "morning:morning sunrise landscape"
    "health:nature green healthy"
    "classic:scenery traditional"
    "buddhist:buddhist temple zen"
    "birthday:birthday cake celebration"
    "night:night sky stars"
    "qingming:spring rain landscape"
    "mothersday:flowers carnations"
    "lantern:lantern festival red"
    "valentine:love hearts roses"
    "dragonboat:dragon boat zongzi"
    "fathersday:father mountain"
    "midautumn:moon rabbit autumn"
    "nationalday:fireworks celebration"
    "christmas:christmas tree snow"
    "newyear:fireworks 2024"
    "funny:funny animals meme"
)

BG_DIR="public/backgrounds"
NUM_IMAGES=12

# Loop through themes
for item in "${THEMES[@]}"; do
    ID="${item%%:*}"
    QUERY="${item#*:}"
    TARGET_DIR="$BG_DIR/$ID"

    echo "Processing theme: $ID (Query: $QUERY)..."
    mkdir -p "$TARGET_DIR"

    for i in $(seq -w 1 $NUM_IMAGES); do
        FILEPATH="$TARGET_DIR/$i.jpg"
        if [ ! -f "$FILEPATH" ] && [ ! -f "$TARGET_DIR/$i.webp" ]; then
            echo "  Downloading image $i..."
            curl -L "https://source.unsplash.com/featured/1200x900/?${QUERY// /+}&sig=$i" -o "$FILEPATH" -s
            sleep 0.2
        fi
    done
done

echo "Download complete."
