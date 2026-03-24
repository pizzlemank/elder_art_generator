# 長輩圖工作室 / Elder Art Generator

Built with Lovable. A simple, friendly tool to make blessing images in 3 steps:
Pick a theme → pick a background → add text → download/share.

---

## English Guide

### Project overview
This is a static Vite + React app. Content is managed by a single file (`public/data/themes.json`) and a sync script that generates the app's runtime JSON.

### Branch Management
The current stable production branch is `jules-1781359672094979605-62b99c51`.
- **Deployments**: Ensure your hosting provider (e.g., Cloudflare Pages) is set to build from this branch.
- **Collaborating**: Always pull the latest changes from this branch before starting new work.

### Content Moderator Guide

This app is designed to be content-driven through simple files and folders. Follow this guide to add or edit themes, background images, and greeting phrases.

#### 1. Folder Structure (Background Images)
Images are stored in `public/backgrounds/`. Each theme has its own folder named after its `id`.

To support different **Aspect Ratios (AR)** without awkward cropping, use the following subfolder structure:

```text
public/backgrounds/
  └── <theme-id>/
      ├── portrait/    (3:4 ratio, e.g., 900x1200)
      │   └── 01.jpg
      ├── square/      (1:1 ratio, e.g., 900x900)
      │   └── 01.jpg
      ├── landscape/   (4:3 ratio, e.g., 1200x900)
      │   └── 01.jpg
      └── 02.jpg       (Root folder: fallback for all ratios)
```

**Automatic Aggregation:**
If you have an image with the **same filename** (e.g., `01.jpg`) in the `portrait`, `square`, and `landscape` folders, the app will automatically group them as **one single background option**. When a user changes the aspect ratio in the app, it will seamlessly switch between these specific versions of the image.

#### 2. Themes and Phrases (`public/data/themes.json`)
All themes and their greeting phrases are defined in this JSON file.

```json
{
  "themes": [
    {
      "id": "birthday",
      "name": "生日快樂",
      "icon": "🎂",
      "description": "溫馨的生日祝福",
      "color": "bg-purple-100 border-purple-400",
      "phrases": [
        "生日快樂！",
        "願你天天開心",
        "心想事成"
      ]
    }
  ]
}
```
- **`id`**: Must match the folder name in `public/backgrounds/`.
- **`phrases`**: This is where you add or edit the preset greetings that appear in the editor.
- **`color`**: Tailwind CSS classes for the theme button's background and border.

#### 3. Content Update Workflow
1.  **Prepare Assets**: Create your images for the 3 aspect ratios and name them identically (e.g., `cake.jpg`).
2.  **Upload**: Place them in the appropriate `portrait/`, `square/`, and `landscape/` subfolders within your theme's folder.
3.  **Update JSON**: Edit `public/data/themes.json` to add new themes or update the `phrases` list.
4.  **Sync & Optimize**: Run `npm run sync-content`. This script will:
    - **Optimize**: Automatically convert images to **WebP** and resize them for faster loading.
    - **Sync**: Read your folders and update the app's internal database.
5.  **Deploy**: Push your changes to the repository. If using Cloudflare Pages, it will build and deploy automatically.

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

### 中文內容管理指南

本專案採資料夾驅動，以下是新增或編輯內容的流程：

#### 1. 圖片資料夾結構
背景圖存放在 `public/backgrounds/`。每個主題有自己的 `id` 資料夾。

若要針對不同比例提供專屬圖片，請使用以下結構：
- `public/backgrounds/<theme-id>/portrait/` (直式 3:4)
- `public/backgrounds/<theme-id>/square/` (方形 1:1)
- `public/backgrounds/<theme-id>/landscape/` (橫式 4:3)

**自動聚合 (Automatic Aggregation)：**
如果您在上述三個資料夾中放入同檔名（如 `morning.jpg`）的圖片，系統會將它們視為**同一張背景圖**。當使用者在 App 中切換比例時，系統會自動載入對應的版本。

#### 2. 主題與祝福語 (`public/data/themes.json`)
- **`phrases`**: 在此編輯主題預設的祝福文字。
- **`id`**: 必須與圖片資料夾名稱一致。

#### 3. 更新流程
1.  準備好圖片（檔名相同），上傳至對應的比例資料夾。
2.  編輯 `public/data/themes.json` 新增主題或修改文字。
3.  執行 `npm run sync-content`。此腳本會：
    - **自動優化**：將圖片轉為 **WebP** 格式並調整大小，加快載入速度。
    - **同步資料**：更新 App 內部的背景圖與文字資料庫。
4.  Push 到 Repo 即可自動部署。

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
