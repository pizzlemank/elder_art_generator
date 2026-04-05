import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const backgroundsDir = path.join(rootDir, "public", "backgrounds");
const latestHtmlPath = path.join(rootDir, "public", "lastest.html");

const IMAGE_EXTS = new Set([".webp", ".jpg", ".jpeg", ".png"]);

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
          relative: path.relative(path.join(rootDir, "public"), filePath)
        });
      }
    }
  }
  return files;
}

async function generateLatestPage() {
  console.log("Generating lastest.html...");
  const allImages = await walk(backgroundsDir);

  // Sort by modification time (latest first)
  allImages.sort((a, b) => b.mtime - a.mtime);

  const htmlContent = `
<!DOCTYPE html>
<html lang="zh-Hant">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>最新背景圖 - Elder Art Generator</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .img-container {
            break-inside: avoid;
            margin-bottom: 1rem;
        }
    </style>
</head>
<body class="bg-slate-50 p-8">
    <div class="max-w-6xl mx-auto">
        <h1 class="text-3xl font-bold mb-8 text-slate-800">最新背景圖 (Latest to Earliest)</h1>
        <div class="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
            ${allImages.map(img => `
            <div class="img-container bg-white rounded-lg shadow-sm overflow-hidden border border-slate-200">
                <img src="/${img.relative}" alt="${img.relative}" class="w-full h-auto block" loading="lazy">
                <div class="p-3 text-xs text-slate-500">
                    <p class="font-mono truncate">${img.relative}</p>
                    <p>${img.mtime.toLocaleString()}</p>
                </div>
            </div>
            `).join('')}
        </div>
    </div>
</body>
</html>
  `;

  await fs.promises.writeFile(latestHtmlPath, htmlContent.trim(), "utf8");
  console.log(`Successfully generated ${latestHtmlPath} with ${allImages.length} images.`);
}

generateLatestPage();
