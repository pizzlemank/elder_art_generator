# 長輩圖工作室 / Elder Art Generator

Built with Lovable. A simple, friendly tool to make blessing images in 3 steps:
Pick a theme → pick a background → add text → download/share.

---

## English Guide

### Project overview
This is a static Vite + React app. Content is managed by a single file (`public/data/themes.json`) and a sync script that generates the app's runtime JSON.

### Content workflow (MVP, static)
1. Add images to `public/backgrounds/<themeId>/` (jpg/png/webp).
2. Edit `public/data/themes.json` (theme info + phrases).
3. Run `npm run sync-content` (generates `categories.json`, `backgrounds.json`, `phrases.json`).
4. Run `npm run dev` or `npm run build`.

#### Example theme (themes.json)
```json
{
  "id": "birthday",
  "name": "Birthday Wishes",
  "icon": "🎂",
  "description": "Warm birthday greetings",
  "color": "bg-purple-100 border-purple-400",
  "featuredImage": "/backgrounds/birthday/01.jpg",
  "defaultGradient": "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)",
  "phrases": ["Happy Birthday", "Best wishes", "Stay joyful"]
}
```

#### Optional per-image labels/gradients
In `themes.json`, you can override per file:
```json
"backgroundLabels": {
  "01.jpg": "Cake & Balloons"
},
"backgroundGradients": {
  "01.jpg": "linear-gradient(135deg, #f472b6 0%, #a855f7 100%)"
}
```

### Deploy (Cloudflare Pages + custom domain)
Recommended for a static MVP.

1. Create a Cloudflare account.
2. Register a `.com` domain in Cloudflare Registrar (Dashboard → Registrar → Register domains).
3. Create a Pages project (Workers & Pages → Create project → Connect GitHub repo).
   - Build command: `npm run build`
   - Output directory: `dist`
4. Add the custom domain to the Pages project (Workers & Pages → your project → Custom domains → Set up a custom domain).
5. If your domain is with another registrar, add it to Cloudflare and update nameservers at the registrar.

### This week’s roadmap
- **Now**: Replace outline with Sticker Outline + Outer Glow options.
- **Now**: Folder-driven content workflow + sync script.
- **This week**: Deploy to Cloudflare Pages and connect a custom domain.
- **Later**: Optional backend for dynamic content and analytics.
- **Later**: GIF backgrounds and sticker support (animated output).

---

## 中文說明

### 專案簡介
本專案為純前端 Vite + React。內容只需要改 `public/data/themes.json`，再執行同步腳本即可。

### 內容更新流程（MVP, 靜態）
1. 把圖片放進 `public/backgrounds/<themeId>/`（jpg/png/webp）。
2. 修改 `public/data/themes.json`（主題資訊 + 祝福語）。
3. 執行 `npm run sync-content`（自動產生 `categories.json` / `backgrounds.json` / `phrases.json`）。
4. `npm run dev` 或 `npm run build`。

### 部署（Cloudflare Pages + 自訂網域）
建議用於靜態 MVP。

1. 註冊 Cloudflare 帳號。
2. 在 Cloudflare Registrar 購買 `.com` 網域（Dashboard → Registrar → Register domains）。
3. 建立 Pages 專案（Workers & Pages → Create project → 連 GitHub repo）。
   - Build 指令：`npm run build`
   - 輸出目錄：`dist`
4. 在 Pages 專案中設定自訂網域（Workers & Pages → 專案 → Custom domains → Set up a custom domain）。
5. 若網域在其他註冊商，先加入 Cloudflare 並到註冊商更改 Nameservers。

### 本週 roadmap
- **Now**：外框改成「貼紙外框」與「光暈外框」。
- **Now**：資料夾驅動的內容管理 + 同步腳本。
- **本週**：部署到 Cloudflare Pages 並綁定自訂網域。
- **Later**：後端支援動態內容與分析。
- **Later**：支援 GIF 背景與貼圖（含動畫輸出）。

---

## Local Preview

```sh
npm install
npm run dev
```

## Production-like Preview

```sh
npm run build
npm run preview
```
