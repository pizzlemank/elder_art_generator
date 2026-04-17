#!/bin/bash

THEMES=(
    "labor:labor worker construction"
    "ghost:chinese lantern ghost festival"
    "teachers:teacher book school"
    "doubleninth:autumn mountain scenery"
    "winter:tangyuan soup winter"
    "peace228:pigeon peace memorial"
    "womensday:woman flower beautiful"
    "childrensday:child play happy"
    "graduation:graduation cap campus"
    "exams:exam study success"
    "wedding:wedding ring marriage"
    "encourage:sunrise landscape mountain"
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
        # Using LoremFlickr as a fallback
        curl -L "https://loremflickr.com/1200/900/${QUERY// /+}" -o "$FILEPATH" -s
        sleep 0.5
    done
done

echo "Download complete."
