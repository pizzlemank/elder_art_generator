#!/bin/bash

# Configuration for themes needing images
# Format: "id:query"
THEMES=(
    "cny:chinese,lunar,new,year,temple"
    "morning:sunrise,mountain,morning"
    "health:healthy,food,green"
    "birthday:birthday,party,celebration"
    "buddhist:zen,meditation,buddha"
    "night:night,city,lights"
    "qingming:misty,forest,landscape"
    "mothersday:carnation,flower,pink"
    "funny:laugh,smile,face"
    "halloween:spooky,house,ghost"
    "earthgod:god,statue,altar"
    "mazu:sea,temple,goddess"
    "buddhabirthday:lotus,flower,buddha"
    "easter:easter,basket,spring"
    "diwali:candle,light,festival"
    "earthday:planet,earth,green"
    "qixi:starry,night,couple"
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
        # Use padded index (01, 02, etc)
        IDX=$(printf "%02d" $i)
        FILEPATH="$TARGET_DIR/$IDX.jpg"

        # Use random string in query to force uniqueness if lock fails
        RANDOM_VAL=$RANDOM
        echo "  Downloading image $IDX..."
        curl -L "https://loremflickr.com/1200/900/${QUERY},${i},${RANDOM_VAL}/all?lock=${ID}${i}${RANDOM_VAL}" -o "$FILEPATH" -s

        if [ ! -s "$FILEPATH" ]; then
            echo "    Download failed for $FILEPATH, retrying with nature..."
            curl -L "https://loremflickr.com/1200/900/nature,${i},${RANDOM_VAL}/all" -o "$FILEPATH" -s
        fi
        sleep 1
    done
done

echo "Download complete."
