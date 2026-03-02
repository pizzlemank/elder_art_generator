

# 長輩圖製作器 (Longbei Tu Editor)
## 專為長輩設計的祝福圖片編輯器

---

### 概覽 (Overview)
A step-by-step greeting card editor designed for senior citizens, with extra-large UI elements, Traditional Chinese throughout, and a portrait (3:4) canvas powered by Fabric.js.

---

### 步驟一：選擇主題 (Step 1: Theme Selection)
- Three large, illustrated category cards:
  - 🧧 **農曆新年** (Chinese New Year)
  - 🌅 **早安問候** (Good Morning)
  - 💚 **健康祝福** (Health & Wellness)
- Each card is at minimum 60px tall with large icons and text (20px+)
- High-contrast colors on a warm, light background
- A progress bar at the top showing "步驟 1/4"

---

### 步驟二：選擇背景 (Step 2: Background Selection)
- Grid of background options per category:
  - Placeholder gradient/color backgrounds to start
  - Ability to upload your own background images later
  - Can be replaced with stock images over time
- Large thumbnail previews with a highlighted selection border
- "上一步" (Back) and "下一步" (Next) navigation buttons

---

### 步驟三：編輯文字 (Step 3: Text Editor)
- **Fabric.js canvas** (900×1200px portrait) showing the selected background
- **Preset blessing phrases** as large clickable buttons (e.g., "恭喜發財", "早安吉祥", "身體健康")
- Clicking a phrase places it on the canvas
- **Text color buttons**: 紅 (Red), 金 (Gold), 白 (White), 黑 (Black) — large, clearly labeled
- **Arrow movement controls**: Four oversized arrow buttons (↑↓←→) to move text precisely — designed for shaky hands
- All controls use minimum 60px touch targets and 20px+ font

---

### 步驟四：儲存圖片 (Step 4: Download)
- Large preview of the final image
- A giant green "📥 儲存到手機" (Save to Phone) button that downloads the canvas as JPG
- Option to go back and edit

---

### 設計原則 (Design Principles)
- **All Traditional Chinese** UI text and blessing phrases
- **Minimum 60px button height**, 20px+ font size everywhere
- **High contrast** color scheme (dark text on light backgrounds)
- **Simple wizard flow** — only one step visible at a time
- **Mobile-first** responsive layout for phone use
- **No backend needed** — everything runs in the browser

---

### 技術細節 (Technical Notes)
- Fabric.js for canvas manipulation
- Lucide React icons for navigation
- All backgrounds start as color gradients (you can upload real images anytime)
- Categories are data-driven so new ones can be added easily

