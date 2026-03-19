=====================================================
  長輩圖工作室 資料設定指南 (Content Guide)
=====================================================

本專案採用「資料總表 + 資料同步」流程：
1) 只編輯 themes.json
2) 執行 sync-content 產生 categories.json / backgrounds.json / phrases.json

-----------------------------------------------------
檔案位置
-----------------------------------------------------
public/data/
- themes.json        你只需要改這個
- categories.json    自動產生（勿手動修改）
- backgrounds.json   自動產生（勿手動修改）
- phrases.json       自動產生（勿手動修改）
- README.txt         本說明

-----------------------------------------------------
新增主題 + 祝福語 (themes.json)
-----------------------------------------------------
例：
{
  "id": "birthday",
  "name": "生日祝福",
  "icon": "🎂",
  "description": "生日問候、祝福滿滿",
  "color": "bg-purple-100 border-purple-400",
  "featuredImage": "/backgrounds/birthday/01.jpg",
  "defaultGradient": "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)",
  "phrases": ["生日快樂", "福如東海", "平安順心"]
}

說明：
- id 用英數小寫，需與資料夾名稱一致（public/backgrounds/<id>/）
- color 為 Tailwind 色票（例如 bg-red-100 border-red-400）
- featuredImage 為主題卡片的預覽圖（可省略）
- defaultGradient 為圖片失敗時的備用漸層

-----------------------------------------------------
新增背景圖 (資料夾)
-----------------------------------------------------
建議圖片放置：
public/backgrounds/<themeId>/
例如：public/backgrounds/birthday/01.jpg

支援格式：jpg / png / webp
背景名稱預設使用檔名（不含副檔名）。

若要自訂名稱或每張圖的漸層，可在 themes.json 加：
backgroundLabels / backgroundGradients

-----------------------------------------------------
同步資料（重要）
-----------------------------------------------------
在專案根目錄執行：
npm run sync-content

-----------------------------------------------------
注意事項
-----------------------------------------------------
- JSON 必須是正確格式
- themes.json 的 id 必須對應背景資料夾
- 圖片路徑為公開路徑，以 / 開頭

=====================================================
