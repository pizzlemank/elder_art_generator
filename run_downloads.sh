#!/bin/bash

declare -A THEMES
THEMES=(
    ["qixi"]="starry,night,couple,magpie"
    ["halloween"]="pumpkin,halloween,ghost,night"
    ["singlesday"]="shopping,cart,gift,celebration"
    ["easter"]="easter,egg,rabbit,spring"
    ["aprilfools"]="clown,joke,funny,laugh"
    ["whiteday"]="white,gift,love,romance"
    ["earthday"]="earth,nature,forest,green"
    ["mazu"]="temple,sea,goddess,taiwan"
    ["buddha"]="buddha,lotus,peace,zen"
    ["youthday"]="youth,run,dream,active"
    ["militaryday"]="soldier,military,hero,guard"
    ["retrocession"]="taiwan,history,flag,celebration"
    ["constitution"]="document,law,peace,taiwan"
    ["earthgod"]="temple,old,man,god,fortune"
    ["cny"]="new,year,festive,red"
    ["morning"]="morning,sunrise,landscape"
    ["health"]="nature,green,healthy"
)

for id in "${!THEMES[@]}"; do
    query="${THEMES[$id]}"
    python3 scripts/download_unique.py "$id" "$query" 4
done
