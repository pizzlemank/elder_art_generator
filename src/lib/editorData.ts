// 主題分類
export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string; // tailwind bg class
}

export const categories: Category[] = [
  {
    id: "cny",
    name: "農曆新年",
    icon: "🧧",
    description: "新年快樂、恭喜發財",
    color: "bg-red-100 border-red-400",
  },
  {
    id: "morning",
    name: "早安問候",
    icon: "🌅",
    description: "早安吉祥、美好一天",
    color: "bg-orange-100 border-orange-400",
  },
  {
    id: "health",
    name: "健康祝福",
    icon: "💚",
    description: "身體健康、平安喜樂",
    color: "bg-green-100 border-green-400",
  },
];

// 背景選項
export interface Background {
  id: string;
  name: string;
  gradient: string; // CSS gradient
}

export const backgrounds: Record<string, Background[]> = {
  cny: [
    { id: "cny1", name: "喜慶紅", gradient: "linear-gradient(135deg, #dc2626 0%, #f59e0b 100%)" },
    { id: "cny2", name: "金碧輝煌", gradient: "linear-gradient(180deg, #b91c1c 0%, #fbbf24 50%, #dc2626 100%)" },
    { id: "cny3", name: "紅運當頭", gradient: "linear-gradient(135deg, #991b1b 0%, #ef4444 50%, #fcd34d 100%)" },
    { id: "cny4", name: "春暖花開", gradient: "linear-gradient(180deg, #fbbf24 0%, #f87171 50%, #dc2626 100%)" },
  ],
  morning: [
    { id: "m1", name: "朝霞", gradient: "linear-gradient(180deg, #fcd34d 0%, #fb923c 50%, #f97316 100%)" },
    { id: "m2", name: "晨曦", gradient: "linear-gradient(135deg, #a7f3d0 0%, #fde68a 50%, #fdba74 100%)" },
    { id: "m3", name: "清晨藍", gradient: "linear-gradient(180deg, #93c5fd 0%, #fde68a 100%)" },
    { id: "m4", name: "日出", gradient: "linear-gradient(180deg, #1e3a5f 0%, #f97316 40%, #fbbf24 100%)" },
  ],
  health: [
    { id: "h1", name: "生機盎然", gradient: "linear-gradient(135deg, #22c55e 0%, #a7f3d0 100%)" },
    { id: "h2", name: "寧靜", gradient: "linear-gradient(180deg, #86efac 0%, #34d399 50%, #059669 100%)" },
    { id: "h3", name: "自然", gradient: "linear-gradient(135deg, #4ade80 0%, #a3e635 50%, #fde68a 100%)" },
    { id: "h4", name: "清新", gradient: "linear-gradient(180deg, #bfdbfe 0%, #86efac 50%, #22c55e 100%)" },
  ],
};

// 祝福語
export const blessingPhrases: Record<string, string[]> = {
  cny: ["恭喜發財", "新年快樂", "萬事如意", "龍馬精神", "大吉大利", "福星高照"],
  morning: ["早安吉祥", "美好的一天", "早安您好", "今天也要開心", "平安喜樂", "心想事成"],
  health: ["身體健康", "長命百歲", "健康快樂", "精神百倍", "福壽安康", "事事順心"],
};

// 文字顏色 — grouped into "常用" and "更多"
export interface TextColor {
  id: string;
  name: string;
  hex: string;
}

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

// 字型選擇
export interface FontOption {
  id: string;
  name: string;
  family: string;
}

export const fontOptions: FontOption[] = [
  { id: "serif", name: "明體", family: "serif" },
  { id: "sans", name: "黑體", family: "sans-serif" },
  { id: "cursive", name: "手寫", family: "cursive" },
  { id: "kaiti", name: "楷體", family: "'KaiTi', 'DFKai-SB', 'BiauKai', serif" },
];
