// Type definitions and data loaders

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  featuredImage?: string;
}

export interface Background {
  id: string;
  name: string;
  gradient: string;
  image?: string;
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
  { id: "orange", name: "橘", hex: "#f97316" },
  { id: "yellow", name: "黃", hex: "#eab308" },
  { id: "lime", name: "萊", hex: "#84cc16" },
  { id: "green", name: "綠", hex: "#16a34a" },
  { id: "teal", name: "青", hex: "#14b8a6" },
  { id: "sky", name: "天藍", hex: "#38bdf8" },
  { id: "blue", name: "藍", hex: "#2563eb" },
  { id: "indigo", name: "靛", hex: "#4f46e5" },
  { id: "purple", name: "紫", hex: "#9333ea" },
  { id: "pink", name: "粉", hex: "#ec4899" },
  { id: "rose", name: "玫紅", hex: "#f43f5e" },
  { id: "brown", name: "棕", hex: "#92400e" },
  { id: "gray", name: "灰", hex: "#6b7280" },
  { id: "navy", name: "深藍", hex: "#0f172a" },
];

export const fontOptions: FontOption[] = [
  { id: "serif", name: "明體", family: "'PMingLiU', 'MingLiU', 'Songti TC', serif" },
  { id: "sans", name: "黑體", family: "'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', 'Heiti TC', sans-serif" },
  { id: "cursive", name: "手寫", family: "'DFKai-SB', 'BiauKai', 'KaiTi', cursive" },
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
