=====================================================
  長輩圖工作室 資料設定指南 (Content Guide)
=====================================================

這裡的 JSON 檔案用來管理「主題、背景、祝福語」。
修改後重新整理頁面即可生效。

-----------------------------------------------------
檔案位置
-----------------------------------------------------
public/data/
- categories.json   主題清單
- backgrounds.json  各主題的背景清單
- phrases.json      各主題的祝福語
- README.txt        本說明

-----------------------------------------------------
新增主題 (categories.json)
-----------------------------------------------------
例：
{
  "id": "birthday",
  "name": "生日祝福",
  "icon": "🎂",
  "description": "生日問候、祝福滿滿",
  "color": "bg-purple-100 border-purple-400",
  "featuredImage": "/backgrounds/birthday/01.jpg"
}

說明：
- id 用英數小寫，需與 backgrounds.json、phrases.json 的 key 一致
- color 為 Tailwind 色票（例如 bg-red-100 border-red-400）
- featuredImage 為主題卡片的預覽圖（可省略）

-----------------------------------------------------
新增背景 (backgrounds.json)
-----------------------------------------------------
例：
"birthday": [
  {
    "id": "birthday-01",
    "name": "生日快樂",
    "gradient": "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)",
    "image": "/backgrounds/birthday/01.jpg"
  }
]

說明：
- image 可省略；如果沒有圖片，會顯示漸層色
- gradient 為 CSS 線性漸層，用來當預設或圖片失敗時的備用

建議圖片放置：
public/backgrounds/<categoryId>/
例如：public/backgrounds/birthday/01.jpg

-----------------------------------------------------
新增祝福語 (phrases.json)
-----------------------------------------------------
例：
"birthday": ["生日快樂", "福如東海", "平安順心"]

-----------------------------------------------------
注意事項
-----------------------------------------------------
- JSON 必須是正確格式（可用 jsonlint.com 檢查）
- categories.json 的 id 必須對應 backgrounds.json 與 phrases.json 的 key
- 圖片路徑為公開路徑，以 / 開頭

=====================================================
