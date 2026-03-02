import { backgrounds, type Background } from "@/lib/editorData";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Upload } from "lucide-react";
import { useRef } from "react";

interface Props {
  categoryId: string;
  selected: Background | null;
  onSelect: (bg: Background) => void;
  onBack: () => void;
  onNext: () => void;
  onUpload: (dataUrl: string) => void;
}

const StepBackgroundSelection = ({ categoryId, selected, onSelect, onBack, onNext, onUpload }: Props) => {
  const bgs = backgrounds[categoryId] || [];
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onUpload(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center gap-6 px-4 py-6 w-full max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-foreground text-center">選擇背景</h1>
      <p className="text-xl text-muted-foreground text-center">請選擇喜歡的背景圖</p>

      <div className="grid grid-cols-2 gap-4 w-full">
        {bgs.map((bg) => (
          <button
            key={bg.id}
            onClick={() => onSelect(bg)}
            className={`aspect-[3/4] rounded-2xl border-4 transition-all ${
              selected?.id === bg.id ? "border-primary ring-4 ring-primary/30 scale-105" : "border-border"
            }`}
            style={{ background: bg.gradient }}
          >
            <span className="text-lg font-bold text-white drop-shadow-md">{bg.name}</span>
          </button>
        ))}
      </div>

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <Button
        variant="outline"
        className="min-h-[60px] text-xl w-full gap-3"
        onClick={() => fileRef.current?.click()}
      >
        <Upload size={28} /> 上傳自己的背景
      </Button>

      <div className="flex gap-4 w-full mt-2">
        <Button variant="secondary" className="flex-1 min-h-[60px] text-xl gap-2" onClick={onBack}>
          <ChevronLeft size={28} /> 上一步
        </Button>
        <Button
          className="flex-1 min-h-[60px] text-xl gap-2"
          onClick={onNext}
          disabled={!selected}
        >
          下一步 <ChevronRight size={28} />
        </Button>
      </div>
    </div>
  );
};

export default StepBackgroundSelection;
