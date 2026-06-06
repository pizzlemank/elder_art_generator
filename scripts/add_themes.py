import json

new_themes = [
    {
        "id": "whiteday",
        "name": "白色情人節",
        "icon": "🤍",
        "description": "甜蜜回禮、浪漫三月",
        "color": "bg-slate-50 border-slate-300",
        "defaultGradient": "linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)",
        "phrases": ["白色情人節快樂", "甜蜜如初", "心心相印", "愛的回報"]
    },
    {
        "id": "aprilfools",
        "name": "愚人節",
        "icon": "🤡",
        "description": "幽默玩笑、快樂整人",
        "color": "bg-yellow-100 border-yellow-400",
        "defaultGradient": "linear-gradient(135deg, #fef08a 0%, #f97316 100%)",
        "phrases": ["愚人節快樂", "天天開心", "開個玩笑別介意", "幽默一下"]
    },
    {
        "id": "earthday",
        "name": "世界地球日",
        "icon": "🌍",
        "description": "愛護地球、綠色生活",
        "color": "bg-green-100 border-green-400",
        "defaultGradient": "linear-gradient(135deg, #22c55e 0%, #3b82f6 100%)",
        "phrases": ["守護地球", "綠能生活", "愛護家園", "環保小尖兵"]
    },
    {
        "id": "easter",
        "name": "復活節",
        "icon": "🥚",
        "description": "希望重生、彩蛋驚喜",
        "color": "bg-purple-100 border-purple-400",
        "defaultGradient": "linear-gradient(135deg, #a78bfa 0%, #fbcfe8 100%)",
        "phrases": ["復活節快樂", "充滿希望", "平安喜樂", "新生喜悅"]
    },
    {
        "id": "mazu",
        "name": "媽祖生",
        "icon": "🏮",
        "description": "天上聖母、庇佑平安",
        "color": "bg-red-100 border-red-400",
        "defaultGradient": "linear-gradient(135deg, #ef4444 0%, #f59e0b 100%)",
        "phrases": ["媽祖保佑", "平安吉祥", "順風順水", "聖母慈悲"]
    },
    {
        "id": "buddha",
        "name": "浴佛節",
        "icon": "🪷",
        "description": "佛誕吉祥、法喜充滿",
        "color": "bg-yellow-50 border-yellow-300",
        "defaultGradient": "linear-gradient(135deg, #fef3c7 0%, #fbbf24 100%)",
        "phrases": ["佛誕平安", "法喜充滿", "廣結善緣", "身心清淨"]
    },
    {
        "id": "earthgod",
        "name": "土地公生",
        "icon": "🎋",
        "description": "福德正神、招財進寶",
        "color": "bg-orange-100 border-orange-400",
        "defaultGradient": "linear-gradient(135deg, #fb923c 0%, #f59e0b 100%)",
        "phrases": ["福德庇佑", "招財進寶", "生意興隆", "平安順遂"]
    },
    {
        "id": "qixi",
        "name": "七夕情人節",
        "icon": "🎋",
        "description": "牛郎織女、浪漫七夕",
        "color": "bg-pink-100 border-pink-400",
        "defaultGradient": "linear-gradient(135deg, #db2777 0%, #4338ca 100%)",
        "phrases": ["七夕快樂", "願得一人心", "浪漫長久", "幸福圓滿"]
    },
    {
        "id": "halloween",
        "name": "萬聖節",
        "icon": "🎃",
        "description": "不給糖就搗蛋",
        "color": "bg-orange-200 border-orange-500",
        "defaultGradient": "linear-gradient(135deg, #f97316 0%, #4b5563 100%)",
        "phrases": ["萬聖節快樂", "不給糖就搗蛋", "驚喜無限", "歡樂時光"]
    },
    {
        "id": "singlesday",
        "name": "雙11節",
        "icon": "🛍️",
        "description": "購物狂歡、生活品味",
        "color": "bg-red-50 border-red-300",
        "defaultGradient": "linear-gradient(135deg, #f87171 0%, #facc15 100%)",
        "phrases": ["購物愉快", "犒賞自己", "生活萬歲", "好物分享"]
    },
    {
        "id": "youthday",
        "name": "青年節",
        "icon": "🏃",
        "description": "青春熱血、活力四射",
        "color": "bg-blue-100 border-blue-400",
        "defaultGradient": "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
        "phrases": ["青春無敵", "活力四射", "逐夢踏實", "青年加油"]
    },
    {
        "id": "militaryday",
        "name": "軍人節",
        "icon": "🎖️",
        "description": "致敬國軍、保家衛國",
        "color": "bg-green-200 border-green-600",
        "defaultGradient": "linear-gradient(135deg, #166534 0%, #3f6212 100%)",
        "phrases": ["向英雄致敬", "軍人節快樂", "保家衛國", "辛勞辛苦了"]
    },
    {
        "id": "retrocession",
        "name": "台灣光復節",
        "icon": "🇹🇼",
        "description": "紀念光復、愛我家園",
        "color": "bg-blue-50 border-blue-300",
        "defaultGradient": "linear-gradient(135deg, #2563eb 0%, #ef4444 100%)",
        "phrases": ["光復節快樂", "愛我台灣", "守護家園", "和平繁榮"]
    },
    {
        "id": "constitution",
        "name": "行憲紀念日",
        "icon": "📜",
        "description": "憲法守護、民主法治",
        "color": "bg-stone-100 border-stone-400",
        "defaultGradient": "linear-gradient(135deg, #78716c 0%, #d6d3d1 100%)",
        "phrases": ["行憲紀念日平安", "守法崇德", "民主萬歲", "法治社會"]
    }
]

with open('public/data/themes.json', 'r') as f:
    data = json.load(f)

data['themes'].extend(new_themes)

with open('public/data/themes.json', 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
