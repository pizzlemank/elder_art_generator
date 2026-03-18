=====================================================
  長輩圖製作器 — 資料管理說明 (Moderator Guide)
=====================================================

本資料夾包含所有使用者可選用的主題、背景及祝福語。
修改這些 JSON 檔案後，重新部署即可生效。

-----------------------------------------------------
📁 檔案結構
-----------------------------------------------------

public/data/
├── categories.json     ← 主題分類 (Theme categories)
├── backgrounds.json    ← 各主題的背景選項 (Backgrounds per theme)
├── phrases.json        ← 各主題的祝福語 (Blessing phrases per theme)
└── README.txt          ← 本說明檔

-----------------------------------------------------
📝 如何新增主題 (Adding a new theme)
-----------------------------------------------------

1. 開啟 categories.json，新增一個物件：

   {
     "id": "birthday",          ← 唯一識別碼 (英文, 不可重複)
     "name": "生日快樂",         ← 顯示名稱 (繁體中文)
     "icon": "🎂",              ← Emoji 圖示
     "description": "生日祝福",  ← 簡短描述
     "color": "bg-purple-100 border-purple-400"  ← Tailwind 顏色 class
   }

   可用顏色: red, orange, yellow, green, blue, purple, pink
   格式: bg-{color}-100 border-{color}-400

2. 在 backgrounds.json 中新增對應 key：

   "birthday": [
     {
       "id": "bd1",
       "name": "繽紛彩虹",
       "gradient": "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)"
     }
   ]

   gradient 格式: linear-gradient(角度, 顏色1 位置%, 顏色2 位置%)
   角度: 135deg (對角) 或 180deg (垂直)
   顏色: 使用 hex 色碼 (例如 #dc2626)
   可使用 https://cssgradient.io/ 產生漸層

3. 在 phrases.json 中新增對應 key：

   "birthday": ["生日快樂", "年年有今日", "心想事成", "青春永駐"]

-----------------------------------------------------
📝 如何修改現有內容
-----------------------------------------------------

- 修改祝福語: 直接編輯 phrases.json 中對應主題的陣列
- 修改背景: 編輯 backgrounds.json 中對應主題的物件
- 修改主題名稱/圖示: 編輯 categories.json 中對應物件

-----------------------------------------------------
⚠️ 注意事項
-----------------------------------------------------

- 所有 JSON 檔案必須是合法 JSON 格式
  (可用 https://jsonlint.com/ 驗證)
- id 欄位必須唯一，不可重複
- categories.json 中的 id 必須與 backgrounds.json 
  和 phrases.json 中的 key 一致
- 修改後需重新部署才會生效
- 建議先在本機測試後再部署

-----------------------------------------------------
🎨 背景漸層工具
-----------------------------------------------------

推薦使用以下工具產生 CSS 漸層：
- https://cssgradient.io/
- https://www.grabient.com/

將產生的 CSS gradient 複製到 backgrounds.json 的 
gradient 欄位即可。

=====================================================
