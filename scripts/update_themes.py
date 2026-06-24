import json
import os

new_themes = [
    {
      "id": "whiteday",
      "name": "白色情人節",
      "icon": "🤍",
      "description": "浪漫回禮、甜蜜心意",
      "color": "bg-slate-50 border-slate-200",
      "defaultGradient": "linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)",
      "backgroundLabels": {
        "01": "純白心意",
        "02": "甜蜜告白",
        "03": "浪漫雪景",
        "04": "溫馨時光"
      },
      "phrases": ["白色情人節快樂", "心心相印", "甜蜜相隨", "永遠愛你"]
    },
    {
      "id": "easter",
      "name": "復活節",
      "icon": "🐰",
      "description": "希望重生、繽紛彩蛋",
      "color": "bg-lime-50 border-lime-200",
      "defaultGradient": "linear-gradient(135deg, #f7fee7 0%, #bef264 100%)",
      "backgroundLabels": {
        "01": "繽紛彩蛋",
        "02": "春意盎然",
        "03": "希望重生",
        "04": "可愛萌兔"
      },
      "phrases": ["復活節快樂", "充滿希望", "主賜平安", "萬象更新"]
    },
    {
      "id": "halloween",
      "name": "萬聖節",
      "icon": "🎃",
      "description": "不給糖就搗蛋、歡樂派對",
      "color": "bg-orange-100 border-orange-500",
      "defaultGradient": "linear-gradient(135deg, #f97316 0%, #1e293b 100%)",
      "backgroundLabels": {
        "01": "南瓜燈火",
        "02": "神祕黑夜",
        "03": "搞怪驚喜",
        "04": "幽靈派對"
      },
      "phrases": ["萬聖節快樂", "不給糖就搗蛋", "驚喜連連", "歡樂驚魂夜"]
    },
    {
      "id": "aprilfools",
      "name": "愚人節",
      "icon": "🤡",
      "description": "幽默整蠱、開懷大笑",
      "color": "bg-yellow-100 border-yellow-400",
      "defaultGradient": "linear-gradient(135deg, #fef08a 0%, #fde047 100%)",
      "backgroundLabels": {
        "01": "幽默時刻",
        "02": "開懷大笑",
        "03": "驚喜派對",
        "04": "歡樂無限"
      },
      "phrases": ["愚人節快樂", "笑一笑沒煩惱", "幽默一下", "天天好心情"]
    },
    {
      "id": "earthday",
      "name": "世界地球日",
      "icon": "🌍",
      "description": "愛護地球、守護家園",
      "color": "bg-emerald-100 border-emerald-400",
      "defaultGradient": "linear-gradient(135deg, #10b981 0%, #3b82f6 100%)",
      "backgroundLabels": {
        "01": "綠意盎然",
        "02": "蔚藍地球",
        "03": "自然之美",
        "04": "守護環境"
      },
      "phrases": ["地球日快樂", "愛護地球", "節能減碳", "守護家園"]
    },
    {
      "id": "youthday",
      "name": "青年節",
      "icon": "🧗",
      "description": "青春無敵、奮鬥向上",
      "color": "bg-blue-100 border-blue-400",
      "defaultGradient": "linear-gradient(135deg, #3b82f6 0%, #2dd4bf 100%)",
      "backgroundLabels": {
        "01": "青春奮鬥",
        "02": "志向遠大",
        "03": "熱血青年",
        "04": "向上能量"
      },
      "phrases": ["青年節快樂", "青春無敵", "奮發向上", "前程似錦"]
    },
    {
      "id": "armedforces",
      "name": "軍人節",
      "icon": "🎖️",
      "description": "致敬英雄、保家衛國",
      "color": "bg-stone-100 border-stone-500",
      "defaultGradient": "linear-gradient(135deg, #44403c 0%, #78716c 100%)",
      "backgroundLabels": {
        "01": "鋼鐵意志",
        "02": "守護和平",
        "03": "榮譽勳章",
        "04": "英勇身影"
      },
      "phrases": ["軍人節快樂", "致敬英雄", "辛苦了", "保家衛國"]
    },
    {
      "id": "retrocession",
      "name": "台灣光復節",
      "icon": "🇹🇼",
      "description": "光復紀念、歡慶團圓",
      "color": "bg-blue-50 border-red-300",
      "defaultGradient": "linear-gradient(135deg, #1d4ed8 0%, #ef4444 100%)",
      "backgroundLabels": {
        "01": "光復喜慶",
        "02": "寶島長青",
        "03": "璀璨台灣",
        "04": "紀念時刻"
      },
      "phrases": ["光復節快樂", "國泰民安", "台灣加油", "紀念光復"]
    },
    {
      "id": "constitution",
      "name": "行憲紀念日",
      "icon": "⚖️",
      "description": "法治精神、民主基石",
      "color": "bg-slate-100 border-slate-400",
      "defaultGradient": "linear-gradient(135deg, #334155 0%, #94a3b8 100%)",
      "backgroundLabels": {
        "01": "法治民主",
        "02": "正義天平",
        "03": "莊嚴建築",
        "04": "紀念憲法"
      },
      "phrases": ["行憲紀念日快樂", "民主自由", "法治社會", "立國基石"]
    },
    {
      "id": "singlesday",
      "name": "雙11購物節",
      "icon": "🛍️",
      "description": "購物狂歡、寵愛自己",
      "color": "bg-red-100 border-red-500",
      "defaultGradient": "linear-gradient(135deg, #ef4444 0%, #f97316 100%)",
      "backgroundLabels": {
        "01": "狂歡購物",
        "02": "寵愛自己",
        "03": "滿載而歸",
        "04": "驚喜回饋"
      },
      "phrases": ["雙11快樂", "購物愉快", "犒賞辛苦的自己", "大買特買"]
    },
    {
      "id": "mazu",
      "name": "媽祖誕辰",
      "icon": "⛪",
      "description": "天上聖母、護國佑民",
      "color": "bg-amber-100 border-amber-600",
      "defaultGradient": "linear-gradient(135deg, #d97706 0%, #fcd34d 100%)",
      "backgroundLabels": {
        "01": "慈悲媽祖",
        "02": "繞境盛事",
        "03": "虔誠信眾",
        "04": "平安祈福"
      },
      "phrases": ["媽祖保佑", "天上聖母聖誕千秋", "平安順心", "護國佑民"]
    },
    {
      "id": "buddha",
      "name": "浴佛節",
      "icon": "🪷",
      "description": "釋迦牟尼佛誕辰、法喜充滿",
      "color": "bg-yellow-50 border-yellow-300",
      "defaultGradient": "linear-gradient(135deg, #fef9c3 0%, #fbbf24 100%)",
      "backgroundLabels": {
        "01": "法喜充滿",
        "02": "浴佛祈福",
        "03": "清淨身心",
        "04": "佛光普照"
      },
      "phrases": ["佛誕節快樂", "法喜充滿", "福慧增長", "同霑法益"]
    },
    {
      "id": "earthgod",
      "name": "土地公誕辰",
      "icon": "👴",
      "description": "福德正神、財源廣進",
      "color": "bg-orange-50 border-orange-400",
      "defaultGradient": "linear-gradient(135deg, #f97316 0%, #fcd34d 100%)",
      "backgroundLabels": {
        "01": "福德正神",
        "02": "財源廣進",
        "03": "闔家平安",
        "04": "五穀豐收"
      },
      "phrases": ["土地公公保佑", "財源滾滾", "五穀豐收", "平安大吉"]
    },
    {
      "id": "qixi",
      "name": "七夕情人節",
      "icon": "🌌",
      "description": "鵲橋相會、浪漫傳說",
      "color": "bg-indigo-100 border-indigo-400",
      "defaultGradient": "linear-gradient(135deg, #4338ca 0%, #ec4899 100%)",
      "backgroundLabels": {
        "01": "鵲橋相會",
        "02": "銀河繁星",
        "03": "浪漫傳說",
        "04": "真愛永恆"
      },
      "phrases": ["七夕快樂", "願天下有情人終成眷屬", "浪漫七夕", "情長意久"]
    },
    {
      "id": "arbor",
      "name": "植樹節",
      "icon": "🌳",
      "description": "十年樹木、百年樹人",
      "color": "bg-green-100 border-green-600",
      "defaultGradient": "linear-gradient(135deg, #166534 0%, #4ade80 100%)",
      "backgroundLabels": {
        "01": "綠意森林",
        "02": "幼苗成長",
        "03": "茂盛大樹",
        "04": "森森不息"
      },
      "phrases": ["植樹節快樂", "綠化家園", "守護森林", "永續發展"]
    }
]

with open('public/data/themes.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

data['themes'].extend(new_themes)

with open('public/data/themes.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Successfully added {len(new_themes)} themes. Total themes: {len(data['themes'])}")
