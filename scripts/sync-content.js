import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const dataDir = path.join(rootDir, "public", "data");
const backgroundsDir = path.join(rootDir, "public", "backgrounds");
const themesPath = path.join(dataDir, "themes.json");

const FALLBACK_GRADIENT = "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)";
const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, payload) {
  const json = JSON.stringify(payload, null, 2) + "\n";
  fs.writeFileSync(filePath, json, "utf8");
}

function humanizeFilename(base, index) {
  const clean = base.replace(/[_-]+/g, " ").trim();
  if (clean.length === 0) return `背景 ${index + 1}`;
  if (/^\d+$/.test(clean)) return `背景 ${clean}`;
  return clean;
}

if (!fs.existsSync(themesPath)) {
  console.error(`Missing themes.json at ${themesPath}`);
  process.exit(1);
}

const themePayload = readJson(themesPath);
const themes = Array.isArray(themePayload.themes) ? themePayload.themes : [];

const categories = [];
const backgrounds = {};
const phrases = {};

themes.forEach((theme) => {
  if (!theme?.id) return;
  const id = theme.id;
  const themeDir = path.join(backgroundsDir, id);
  const AR_SUBFOLDERS = ["portrait", "square", "landscape"];

  const arFiles = {};
  AR_SUBFOLDERS.forEach((sub) => {
    const subDir = path.join(themeDir, sub);
    if (fs.existsSync(subDir)) {
      arFiles[sub] = fs
        .readdirSync(subDir)
        .filter((file) => IMAGE_EXTS.has(path.extname(file).toLowerCase()));
    }
  });

  const rootFiles = fs.existsSync(themeDir)
    ? fs
        .readdirSync(themeDir)
        .filter((file) => IMAGE_EXTS.has(path.extname(file).toLowerCase()))
    : [];

  if (!fs.existsSync(themeDir)) {
    console.warn(`Theme folder missing: ${themeDir}`);
  }

  const defaultGradient = theme.defaultGradient || FALLBACK_GRADIENT;
  const labelMap = theme.backgroundLabels || {};
  const gradientMap = theme.backgroundGradients || {};

  // Collect all unique filenames across root and AR subfolders
  const allImageNames = new Set([
    ...rootFiles,
    ...Object.values(arFiles).flat(),
  ]);

  const labelKeys = Object.keys(labelMap);
  const gradientKeys = Object.keys(gradientMap);
  const fileSet = new Set([...allImageNames, ...labelKeys, ...gradientKeys]);
  const filesToUse = Array.from(fileSet).sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
  );

  const themeBackgrounds = filesToUse.map((file, index) => {
    const ext = path.extname(file);
    const base = path.basename(file, ext);
    const name = labelMap[file] || humanizeFilename(base, index);
    const gradient = gradientMap[file] || defaultGradient;

    const bgEntry = {
      id: `${id}-${base}`,
      name,
      gradient,
    };

    // Main image: from root if exists, OR if it's a known label/gradient (legacy behavior)
    if (rootFiles.includes(file) || labelMap[file] || gradientMap[file]) {
      bgEntry.image = `/backgrounds/${id}/${file}`;
    }

    // AR-specific images
    const arImages = {};
    AR_SUBFOLDERS.forEach((sub) => {
      if (arFiles[sub]?.includes(file)) {
        arImages[sub] = `/backgrounds/${id}/${sub}/${file}`;
      }
    });

    if (Object.keys(arImages).length > 0) {
      bgEntry.arImages = arImages;
      // If no root image, pick the first AR one as primary
      if (!bgEntry.image) {
        bgEntry.image = Object.values(arImages)[0];
      }
    }

    return bgEntry;
  });

  backgrounds[id] = themeBackgrounds;
  phrases[id] = Array.isArray(theme.phrases) ? theme.phrases : [];

  categories.push({
    id,
    name: theme.name || id,
    icon: theme.icon || "🖼️",
    description: theme.description || "",
    color: theme.color || "bg-slate-100 border-slate-300",
    featuredImage: theme.featuredImage || themeBackgrounds[0]?.image,
  });
});

writeJson(path.join(dataDir, "categories.json"), categories);
writeJson(path.join(dataDir, "backgrounds.json"), backgrounds);
writeJson(path.join(dataDir, "phrases.json"), phrases);

console.log("Content sync complete.");
