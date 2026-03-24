import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const backgroundsDir = path.join(rootDir, "public", "backgrounds");

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const MAX_DIMENSION = 1200;
const QUALITY = 85;

async function walk(dir) {
  let files = [];
  const list = await fs.promises.readdir(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stats = await fs.promises.stat(filePath);
    if (stats.isDirectory()) {
      files = files.concat(await walk(filePath));
    } else {
      files.push(filePath);
    }
  }
  return files;
}

async function optimizeImages() {
  console.log("Starting image optimization...");
  const allFiles = await walk(backgroundsDir);
  const images = allFiles.filter((file) => IMAGE_EXTS.has(path.extname(file).toLowerCase()));

  for (const file of images) {
    const ext = path.extname(file).toLowerCase();
    const dir = path.dirname(file);
    const baseName = path.basename(file, ext);
    const webpPath = path.join(dir, `${baseName}.webp`);

    try {
      const metadata = await sharp(file).metadata();

      const needsResizing = metadata.width > MAX_DIMENSION || metadata.height > MAX_DIMENSION;
      const isNotWebp = ext !== ".webp";

      if (needsResizing || isNotWebp) {
        let pipeline = sharp(file);

        if (needsResizing) {
          pipeline = pipeline.resize({
            width: MAX_DIMENSION,
            height: MAX_DIMENSION,
            fit: "inside",
            withoutEnlargement: true,
          });
          console.log(`Resizing: ${file}`);
        }

        if (isNotWebp) {
          await pipeline.webp({ quality: QUALITY }).toFile(webpPath);
          console.log(`Converted to WebP: ${webpPath}`);
          await fs.promises.unlink(file);
          console.log(`Deleted original: ${file}`);
        } else {
          // It's already a WebP, but needs resizing
          const buffer = await pipeline.webp({ quality: QUALITY }).toBuffer();
          await fs.promises.writeFile(file, buffer);
          console.log(`Resized WebP in place: ${file}`);
        }
      } else {
        // Already WebP and small enough
        // console.log(`Skipping (already optimized): ${file}`);
      }
    } catch (err) {
      console.error(`Error processing ${file}:`, err);
    }
  }
  console.log("Image optimization complete.");
}

optimizeImages();
