import { Button } from "@/components/ui/button";
import { ChevronLeft, Download } from "lucide-react";

interface Props {
  imageDataUrl: string;
  textPrefix: string;
  onBack: () => void;
}

function getSmartFilename(textPrefix: string): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const datePart = `${yy}${mm}${dd}`;
  const prefix = textPrefix.replace(/[^\u4e00-\u9fff\w]/g, "").slice(0, 8) || "祝福圖";
  return `${prefix}_${datePart}.jpg`;
}

const StepDownload = ({ imageDataUrl, textPrefix, onBack }: Props) => {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.download = getSmartFilename(textPrefix);
    link.href = imageDataUrl;
    link.click();
  };

  return (
    <div className="flex flex-col items-center gap-6 px-4 py-6 w-full max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-foreground text-center">完成！</h1>
      <p className="text-xl text-muted-foreground text-center">您的祝福圖已經準備好了</p>

      <div className="w-full overflow-hidden rounded-xl border-4 border-border" style={{ aspectRatio: "3/4" }}>
        <img src={imageDataUrl} alt="祝福圖預覽" className="w-full h-full object-contain" />
      </div>

      <Button
        className="w-full min-h-[72px] text-2xl font-bold gap-3 bg-accent text-accent-foreground hover:bg-accent/90"
        onClick={handleDownload}
      >
        <Download size={32} /> 📥 儲存到手機
      </Button>

      <Button variant="secondary" className="w-full min-h-[60px] text-xl gap-2" onClick={onBack}>
        <ChevronLeft size={28} /> 返回編輯
      </Button>
    </div>
  );
};

export default StepDownload;
