import { useState } from "react";
import { blessingPhrases } from "@/lib/editorData";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface Props {
  categoryId: string;
  onAdd: (text: string) => void;
}

const PhraseSelector = ({ categoryId, onAdd }: Props) => {
  const [customText, setCustomText] = useState("");
  const phrases = blessingPhrases[categoryId] || [];

  const handleAddCustom = () => {
    const trimmed = customText.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setCustomText("");
  };

  return (
    <div className="w-full">
      <p className="text-lg font-bold text-foreground mb-2">選擇祝福語：</p>
      <div className="flex flex-wrap gap-2 mb-3">
        {phrases.map((p) => (
          <Button
            key={p}
            variant="outline"
            className="min-h-[52px] text-lg font-bold px-4"
            onClick={() => onAdd(p)}
          >
            {p}
          </Button>
        ))}
      </div>

      {/* Custom text input */}
      <p className="text-lg font-bold text-foreground mb-2">✍️ 輸入自訂文字：</p>
      <div className="flex gap-2">
        <input
          type="text"
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddCustom()}
          placeholder="輸入您想要的文字..."
          className="flex-1 min-h-[52px] text-lg px-4 rounded-xl border-4 border-muted bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
        />
        <Button
          className="min-h-[52px] min-w-[52px] text-lg"
          onClick={handleAddCustom}
          disabled={!customText.trim()}
        >
          <Plus size={24} />
        </Button>
      </div>
    </div>
  );
};

export default PhraseSelector;
