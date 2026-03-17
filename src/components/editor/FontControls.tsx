import { fontOptions } from "@/lib/editorData";
import { Button } from "@/components/ui/button";
import { Bold, Italic, Minus, Plus } from "lucide-react";

interface Props {
  activeFont: string;
  activeFontSize: number;
  isBold: boolean;
  isItalic: boolean;
  hasOutline: boolean;
  hasShadow: boolean;
  onFontChange: (family: string) => void;
  onFontSizeChange: (size: number) => void;
  onBoldToggle: () => void;
  onItalicToggle: () => void;
  onOutlineToggle: () => void;
  onShadowToggle: () => void;
}

const FontControls = ({
  activeFont, activeFontSize, isBold, isItalic, hasOutline, hasShadow,
  onFontChange, onFontSizeChange, onBoldToggle, onItalicToggle, onOutlineToggle, onShadowToggle,
}: Props) => {
  return (
    <div className="w-full space-y-3">
      {/* Font Family */}
      <div>
        <p className="text-lg font-bold text-foreground mb-2">字型：</p>
        <div className="flex flex-wrap gap-2">
          {fontOptions.map((f) => (
            <button
              key={f.id}
              onClick={() => onFontChange(f.family)}
              className={`min-h-[48px] px-4 rounded-xl border-4 text-lg transition-all ${
                activeFont === f.family
                  ? "border-primary ring-4 ring-primary/40 bg-primary/10"
                  : "border-muted bg-card"
              }`}
              style={{ fontFamily: f.family }}
            >
              {f.name}
            </button>
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div>
        <p className="text-lg font-bold text-foreground mb-2">字體大小：{activeFontSize}</p>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            className="min-h-[56px] min-w-[56px] text-2xl"
            onClick={() => onFontSizeChange(Math.max(20, activeFontSize - 10))}
          >
            <Minus size={28} />
          </Button>
          <div className="flex-1 h-3 bg-secondary rounded-full relative">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${Math.min(100, ((activeFontSize - 20) / 180) * 100)}%` }}
            />
          </div>
          <Button
            variant="secondary"
            className="min-h-[56px] min-w-[56px] text-2xl"
            onClick={() => onFontSizeChange(Math.min(200, activeFontSize + 10))}
          >
            <Plus size={28} />
          </Button>
        </div>
      </div>

      {/* Style toggles */}
      <div>
        <p className="text-lg font-bold text-foreground mb-2">文字樣式：</p>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={isBold ? "default" : "outline"}
            className="min-h-[48px] min-w-[56px] text-lg font-bold gap-1"
            onClick={onBoldToggle}
          >
            <Bold size={20} /> 粗體
          </Button>
          <Button
            variant={isItalic ? "default" : "outline"}
            className="min-h-[48px] min-w-[56px] text-lg gap-1"
            onClick={onItalicToggle}
          >
            <Italic size={20} /> 斜體
          </Button>
          <Button
            variant={hasOutline ? "default" : "outline"}
            className="min-h-[48px] min-w-[56px] text-lg gap-1"
            onClick={onOutlineToggle}
          >
            🔲 描邊
          </Button>
          <Button
            variant={hasShadow ? "default" : "outline"}
            className="min-h-[48px] min-w-[56px] text-lg gap-1"
            onClick={onShadowToggle}
          >
            💫 陰影
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FontControls;
