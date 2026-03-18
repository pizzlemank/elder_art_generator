import { useState } from "react";
import { usePhrases } from "@/hooks/useEditorData";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface Props {
  categoryId: string;
  onAdd: (text: string) => void;
}

const PhraseSelector = ({ categoryId, onAdd }: Props) => {
  const [customText, setCustomText] = useState("");
  const allPhrases = usePhrases();
  const phrases = allPhrases[categoryId] || [];

  const handleAddCustom = () => {
    const trimmed = customText.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setCustomText("");
  };

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 mb-3">
        {phrases.map((p) => (
          <Button key={p} variant="outline" className="min-h-[48px] text-lg font-bold px-4" onClick={() => onAdd(p)}>
            {p}
          </Button>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddCustom()}
          placeholder="輸入自訂文字..."
          className="flex-1 min-h-[48px] text-lg px-4 rounded-xl border-4 border-muted bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
        />
        <Button className="min-h-[48px] min-w-[48px]" onClick={handleAddCustom} disabled={!customText.trim()}>
          <Plus size={24} />
        </Button>
      </div>
    </div>
  );
};

export default PhraseSelector;
