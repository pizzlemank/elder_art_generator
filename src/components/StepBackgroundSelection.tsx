import { type Background, type AspectRatioOption, aspectRatios } from "@/lib/editorData";
import { useBackgrounds } from "@/hooks/useEditorData";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Upload } from "lucide-react";
import { useRef, type ChangeEvent, type CSSProperties } from "react";
import { toast } from "sonner";

interface Props {
  categoryId: string;
  selected: Background | null;
  aspectRatio: AspectRatioOption;
  onSelect: (bg: Background) => void;
  onAspectRatioChange: (ar: AspectRatioOption) => void;
  onBack: () => void;
  onNext: () => void;
  onUpload: (dataUrl: string) => void;
}

const StepBackgroundSelection = ({
  categoryId,
  selected,
  aspectRatio,
  onSelect,
  onAspectRatioChange,
  onBack,
  onNext,
  onUpload,
}: Props) => {
  const allBackgrounds = useBackgrounds();
  const bgs = allBackgrounds[categoryId] || [];
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("檔案格式不正確，請選擇圖片");
      return;
    }
    const maxMb = 8;
    if (file.size > maxMb * 1024 * 1024) {
      toast.error(`檔案太大，請小於 ${maxMb}MB`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => onUpload(reader.result as string);
    reader.onerror = () => toast.error("上傳失敗，請換一張照片");
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center gap-4 px-4 py-4 w-full max-w-5xl mx-auto">
      <p className="text-xl text-muted-foreground text-center">挑一張背景，或上傳自己的照片。</p>

      <div className="w-full">
        <p className="text-lg font-bold text-foreground mb-2">版面比例</p>
        <div className="flex gap-2">
          {aspectRatios.map((ar) => (
            <button
              key={ar.id}
              onClick={() => onAspectRatioChange(ar)}
              className={`flex-1 min-h-[56px] rounded-xl border-4 text-lg font-bold transition-all ${
                aspectRatio.id === ar.id
                  ? "border-primary ring-4 ring-primary/30 bg-primary/10"
                  : "border-muted bg-card"
              }`}
            >
              {ar.name}
              <br />
              <span className="text-sm text-muted-foreground">{ar.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 w-full">
        {bgs.map((bg) => {
          const style: CSSProperties = bg.image
            ? {
                backgroundImage: `${bg.image ? `url(${bg.image})` : ""}, ${bg.gradient}`,
                backgroundSize: "cover, cover",
                backgroundPosition: "center, center",
              }
            : {
                backgroundImage: bg.gradient,
              };

          return (
            <button
              key={bg.id}
              onClick={() => onSelect(bg)}
              className={`relative overflow-hidden rounded-2xl border-4 transition-all ${
                selected?.id === bg.id ? "border-primary ring-4 ring-primary/30 scale-105" : "border-border"
              }`}
              style={{
                ...style,
                aspectRatio: `${aspectRatio.width}/${aspectRatio.height}`,
                maxHeight: 160,
              }}
            >
              <div className="absolute inset-0 bg-black/25" />
              <span className="relative z-10 text-base font-bold text-white drop-shadow-md">{bg.name}</span>
            </button>
          );
        })}
      </div>

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <Button
        variant="outline"
        className="min-h-[56px] text-lg w-full gap-3"
        onClick={() => fileRef.current?.click()}
      >
        <Upload size={24} /> 上傳自己的照片
      </Button>

      <div className="flex gap-4 w-full mt-1">
        <Button variant="secondary" className="flex-1 min-h-[56px] text-lg gap-2" onClick={onBack}>
          <ChevronLeft size={24} /> 上一步
        </Button>
        <Button className="flex-1 min-h-[56px] text-lg gap-2" onClick={onNext} disabled={!selected}>
          下一步 <ChevronRight size={24} />
        </Button>
      </div>
    </div>
  );
};

export default StepBackgroundSelection;
