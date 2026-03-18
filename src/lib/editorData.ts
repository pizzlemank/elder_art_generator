// Type definitions — data is loaded from public/data/*.json

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export interface Background {
  id: string;
  name: string;
  gradient: string;
}

export interface TextColor {
  id: string;
  name: string;
  hex: string;
}

export interface FontOption {
  id: string;
  name: string;
  family: string;
}

// Static UI config (not content — no need for JSON files)
export const textColors: TextColor[] = [
  { id: "red", name: "紅", hex: "#dc2626" },
  { id: "gold", name: "金", hex: "#d97706" },
  { id: "white", name: "白", hex: "#ffffff" },
  { id: "black", name: "黑", hex: "#1a1a1a" },
];

export const extraColors: TextColor[] = [
  { id: "pink", name: "粉", hex: "#ec4899" },
  { id: "orange", name: "橙", hex: "#f97316" },
  { id: "green", name: "綠", hex: "#16a34a" },
  { id: "blue", name: "藍", hex: "#2563eb" },
  { id: "purple", name: "紫", hex: "#9333ea" },
  { id: "brown", name: "棕", hex: "#92400e" },
];

export const fontOptions: FontOption[] = [
  { id: "serif", name: "明體", family: "serif" },
  { id: "sans", name: "黑體", family: "sans-serif" },
  { id: "cursive", name: "手寫", family: "cursive" },
  { id: "kaiti", name: "楷體", family: "'KaiTi', 'DFKai-SB', 'BiauKai', serif" },
];

// Aspect ratio presets
export interface AspectRatioOption {
  id: string;
  name: string;
  label: string;
  width: number;
  height: number;
}

export const aspectRatios: AspectRatioOption[] = [
  { id: "portrait", name: "直式", label: "3:4", width: 900, height: 1200 },
  { id: "square", name: "方形", label: "1:1", width: 900, height: 900 },
  { id: "landscape", name: "橫式", label: "4:3", width: 1200, height: 900 },
];

// Data loaders
export async function loadCategories(): Promise<Category[]> {
  const res = await fetch("/data/categories.json");
  return res.json();
}

export async function loadBackgrounds(): Promise<Record<string, Background[]>> {
  const res = await fetch("/data/backgrounds.json");
  return res.json();
}

export async function loadPhrases(): Promise<Record<string, string[]>> {
  const res = await fetch("/data/phrases.json");
  return res.json();
}
