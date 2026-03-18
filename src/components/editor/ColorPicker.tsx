import { useState } from "react";
import { textColors, extraColors, type TextColor } from "@/lib/editorData";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  activeColor: string;
  onChange: (hex: string) => void;
}

const ColorSwatch = ({ color, active, onClick }: { color: TextColor; active: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`min-h-[44px] min-w-[52px] rounded-xl border-4 text-base font-bold transition-all ${
      active ? "ring-4 ring-primary/40 scale-110 border-primary" : "border-muted"
    }`}
    style={{
      backgroundColor: color.hex,
      color: color.id === "white" ? "#333" : color.id === "black" ? "#fff" : "#fff",
    }}
  >
    {color.name}
  </button>
);

const ColorPicker = ({ activeColor, onChange }: Props) => {
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2">
        {textColors.map((c) => (
          <ColorSwatch key={c.id} color={c} active={activeColor === c.hex} onClick={() => onChange(c.hex)} />
        ))}
        <button
          onClick={() => setShowMore(!showMore)}
          className="min-h-[44px] min-w-[52px] rounded-xl border-4 border-muted text-base font-bold bg-secondary text-secondary-foreground flex items-center justify-center gap-1"
        >
          更多 {showMore ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>
      {showMore && (
        <div className="flex flex-wrap gap-2 mt-2">
          {extraColors.map((c) => (
            <ColorSwatch key={c.id} color={c} active={activeColor === c.hex} onClick={() => onChange(c.hex)} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
