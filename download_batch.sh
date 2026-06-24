#!/bin/bash

# Array of themes and their queries
declare -A THEMES
THEMES["whiteday"]="white,romance,gift"
THEMES["easter"]="easter,egg,rabbit"
THEMES["halloween"]="halloween,pumpkin,spooky"
THEMES["aprilfools"]="humor,laugh,joke"
THEMES["earthday"]="earth,nature,green"
THEMES["youthday"]="youth,climb,energy"
THEMES["armedforces"]="military,soldier,honor"
THEMES["retrocession"]="taiwan,celebration,flag"
THEMES["constitution"]="law,justice,building"
THEMES["singlesday"]="shopping,gift,happy"
THEMES["mazu"]="temple,culture,taiwan"
THEMES["buddha"]="buddha,lotus,peace"
THEMES["earthgod"]="temple,wealth,tradition"
THEMES["qixi"]="stars,romance,milkyway"
THEMES["arbor"]="tree,forest,plant"

for ID in "${!THEMES[@]}"; do
    QUERY="${THEMES[$ID]}"
    echo "Processing $ID..."
    python3 scripts/download_unique.py "$ID" "$QUERY" 4
done
