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
  activeFont,
  activeFontSize,
  isBold,
  isItalic,
  hasOutline,
  hasShadow,
  onFontChange,
  onFontSizeChange,
  onBoldToggle,
  onItalicToggle,
  onOutlineToggle,
  onShadowToggle,
}: Props) => (
  <div className="w-full space-y-3">
    <div className="flex flex-wrap gap-2">
      {fontOptions.map((f) => (
        <button
          key={f.id}
          onClick={() => onFontChange(f.family)}
          className={`min-h-[44px] px-3 rounded-xl border-4 text-base transition-all ${
            activeFont === f.family ? "border-primary ring-4 ring-primary/40 bg-primary/10" : "border-muted bg-card"
          }`}
          style={{ fontFamily: f.family }}
        >
          {f.name}
        </button>
      ))}
    </div>

    <div>
      <p className="text-base font-bold text-foreground mb-1">字體大小：{activeFontSize}</p>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          className="min-h-[48px] min-w-[48px]"
          onClick={() => onFontSizeChange(Math.max(20, activeFontSize - 10))}
        >
          <Minus size={24} />
        </Button>
        <div className="flex-1 h-2.5 bg-secondary rounded-full relative">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${Math.min(100, ((activeFontSize - 20) / 180) * 100)}%` }}
          />
        </div>
        <Button
          variant="secondary"
          className="min-h-[48px] min-w-[48px]"
          onClick={() => onFontSizeChange(Math.min(200, activeFontSize + 10))}
        >
          <Plus size={24} />
        </Button>
      </div>
    </div>

    <div className="flex flex-wrap gap-2">
      <Button variant={isBold ? "default" : "outline"} className="min-h-[44px] text-base gap-1" onClick={onBoldToggle}>
        <Bold size={18} /> 粗體
      </Button>
      <Button
        variant={isItalic ? "default" : "outline"}
        className="min-h-[44px] text-base gap-1"
        onClick={onItalicToggle}
      >
        <Italic size={18} /> 斜體
      </Button>
      <Button
        variant={hasOutline ? "default" : "outline"}
        className="min-h-[44px] text-base gap-1"
        onClick={onOutlineToggle}
      >
        外框
      </Button>
      <Button
        variant={hasShadow ? "default" : "outline"}
        className="min-h-[44px] text-base gap-1"
        onClick={onShadowToggle}
      >
        陰影
      </Button>
    </div>
  </div>
);

export default FontControls;
