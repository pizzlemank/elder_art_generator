import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const backgroundsDir = path.join(rootDir, "public", "backgrounds");
const outputFile = path.join(rootDir, "public", "lastest.html");

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function getAllImages(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllImages(filePath));
    } else {
      if (IMAGE_EXTS.has(path.extname(file).toLowerCase())) {
        results.push({
          path: filePath,
          relative: path.relative(path.join(rootDir, "public"), filePath),
          mtime: stat.mtime,
        });
      }
    }
  });
  return results;
}

const images = getAllImages(backgroundsDir);
images.sort((a, b) => b.mtime - a.mtime);

const html = `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>最新上傳背景圖</title>
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
<body class="bg-gray-100 min-h-screen p-8">
    <div class="max-w-7xl mx-auto">
        <header class="mb-8">
            <h1 class="text-3xl font-bold text-gray-800">最新上傳背景圖 (${images.length})</h1>
            <p class="text-gray-600">按修改時間排序（從新到舊）</p>
        </header>

        <div class="masonry">
            ${images.map(img => `
                <div class="masonry-item bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <img src="${img.relative}" alt="${img.relative}" class="w-full h-auto display-block" loading="lazy">
                    <div class="p-2 text-xs text-gray-500 bg-white border-t border-gray-100">
                        <div class="font-medium truncate" title="${img.relative}">${img.relative}</div>
                        <div>${img.mtime.toLocaleString('zh-TW')}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>
`;

fs.writeFileSync(outputFile, html, "utf8");
console.log(`Generated lastest.html with ${images.length} images.`);
