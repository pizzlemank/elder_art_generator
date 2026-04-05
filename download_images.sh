#!/bin/bash

# Configuration
THEMES=(
    "cny:new+year+festive+red"
    "morning:morning+sunrise+landscape"
    "health:nature+green+healthy"
    "classic:scenery+traditional"
    "buddhist:buddhist+temple+zen"
    "birthday:birthday+cake+celebration"
    "night:night+sky+stars"
    "womensday:elegant+woman+flowers"
    "childrensday:happy+children+balloons"
    "qingming:spring+rain+landscape"
    "laborday:tools+construction+labor"
    "mothersday:carnations+flowers"
    "lantern:lantern+festival+red"
    "valentine:love+hearts+roses"
    "dragonboat:dragon+boat+zongzi"
    "fathersday:father+mountain"
    "teachersday:teacher+classroom+books"
    "midautumn:moon+rabbit+autumn"
    "doubleninth:chrysanthemum+elderly"
    "nationalday:fireworks+celebration"
    "christmas:christmas+tree+snow"
    "newyear:fireworks+2026"
    "funny:funny+animals+meme"
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

    for i in $(seq -w 1 $NUM_IMAGES); do
        # Use Unsplash Source with a fixed seed to get consistent but unique images
        # We also add a timestamp or unique ID to avoid caching issues during a single run
        FILEPATH="$TARGET_DIR/stock_$i.jpg"
        if [ ! -f "$FILEPATH" ] && [ ! -f "$TARGET_DIR/stock_$i.webp" ]; then
            echo "  Downloading image $i for $ID..."
            # Unsplash Source is deprecated, but sometimes still works.
            # Alternatively, using images.unsplash.com with specific parameters.
            # Using a slightly more robust URL pattern.
            curl -L "https://images.unsplash.com/photo-$(date +%s%N | cut -b1-13)?fit=crop&w=1200&h=900&q=80&auto=format&query=$QUERY&sig=$ID$i" -o "$FILEPATH" -s

            # If the download failed or returned an error page (size < 1000 bytes), try another source
            FILE_SIZE=$(stat -c%s "$FILEPATH" 2>/dev/null || echo 0)
            if [ "$FILE_SIZE" -lt 1000 ]; then
                echo "    Fallback download for $ID image $i..."
                curl -L "https://loremflickr.com/1200/900/$QUERY?lock=$i" -o "$FILEPATH" -s
            fi
            sleep 1
        fi
    done
done

echo "Download complete."
