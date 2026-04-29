import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const backgroundsDir = path.join(rootDir, "public", "backgrounds");
const outputFile = path.join(rootDir, "public", "lastest.html");

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

async function walk(dir) {
  let files = [];
  const list = await fs.promises.readdir(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stats = await fs.promises.stat(filePath);
    if (stats.isDirectory()) {
      files = files.concat(await walk(filePath));
    } else {
      if (IMAGE_EXTS.has(path.extname(file).toLowerCase())) {
        files.push({
          path: filePath,
          mtime: stats.mtime,
          relPath: path.relative(path.join(rootDir, "public"), filePath)
        });
      }
    }
  }
  return files;
}

async function generatePage() {
  console.log("Generating latest images page...");
  const allImages = await walk(backgroundsDir);

  // Sort by modification time, newest first
  allImages.sort((a, b) => b.mtime - a.mtime);

  const html = `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>最新背景圖 - 長輩圖工作室</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .masonry {
            column-count: 1;
            column-gap: 1rem;
        }
        @media (min-width: 640px) { .masonry { column-count: 2; } }
        @media (min-width: 768px) { .masonry { column-count: 3; } }
        @media (min-width: 1024px) { .masonry { column-count: 4; } }
        .masonry-item {
            break-inside: avoid;
            margin-bottom: 1rem;
        }
    </style>
</head>
<body class="bg-slate-50 p-4 md:p-8">
    <div class="max-w-7xl mx-auto">
        <header class="mb-8">
            <h1 class="text-3xl font-bold text-slate-800">最新上傳背景圖</h1>
            <p class="text-slate-600">按更新時間排序 (從新到舊)</p>
        </header>

        <div class="masonry">
            ${allImages.map(img => `
                <div class="masonry-item bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <img src="${img.relPath}" alt="${path.basename(img.relPath)}" class="w-full h-auto block" loading="lazy">
                    <div class="p-3">
                        <p class="text-xs text-slate-500 truncate">${img.relPath}</p>
                        <p class="text-xs text-slate-400 mt-1">${img.mtime.toLocaleString()}</p>
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>
  `;

  fs.writeFileSync(outputFile, html.trim(), "utf8");
  console.log(`Generated: ${outputFile}`);
}

generatePage();
