import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const backgroundsDir = path.join(rootDir, "public", "backgrounds");
const outputPath = path.join(rootDir, "public", "lastest.html");

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
      files.push({
        path: filePath,
        mtime: stats.mtime,
      });
    }
  }
  return files;
}

async function generateLatestPage() {
  console.log("Generating latest images page...");
  const allFiles = await walk(backgroundsDir);
  const images = allFiles
    .filter((file) => IMAGE_EXTS.has(path.extname(file.path).toLowerCase()))
    .sort((a, b) => b.mtime - a.mtime);

  const html = `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>最新背景圖庫 | Elder Art Generator</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .masonry {
            column-count: 2;
            column-gap: 1rem;
        }
        @media (min-width: 768px) {
            .masonry {
                column-count: 3;
            }
        }
        @media (min-width: 1024px) {
            .masonry {
                column-count: 4;
            }
        }
        .masonry-item {
            break-inside: avoid;
            margin-bottom: 1rem;
        }
    </style>
</head>
<body class="bg-gray-50 text-gray-900 p-4 md:p-8">
    <header class="max-w-7xl mx-auto mb-8 text-center">
        <h1 class="text-3xl font-bold mb-2">最新背景圖庫 (按上傳時間排序)</h1>
        <p class="text-gray-600">共有 ${images.length} 張背景圖</p>
    </header>

    <main class="max-w-7xl mx-auto">
        <div class="masonry">
            ${images.map(img => {
                const relativePath = path.relative(path.join(rootDir, "public"), img.path);
                const themeName = path.basename(path.dirname(img.path));
                const fileName = path.basename(img.path);
                const dateString = img.mtime.toLocaleString('zh-TW');

                return `
                <div class="masonry-item bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
                    <img src="/${relativePath}" alt="${fileName}" class="w-full h-auto block" loading="lazy">
                    <div class="p-3 text-xs">
                        <div class="font-bold text-gray-700 mb-1">${themeName} / ${fileName}</div>
                        <div class="text-gray-400">${dateString}</div>
                    </div>
                </div>
                `;
            }).join('')}
        </div>
    </main>

    <footer class="mt-12 text-center text-gray-400 text-sm">
        &copy; ${new Date().getFullYear()} Elder Art Generator. All rights reserved.
    </footer>
</body>
</html>
  `;

  fs.writeFileSync(outputPath, html, "utf8");
  console.log(`Latest images page generated at ${outputPath}`);
}

generateLatestPage();
