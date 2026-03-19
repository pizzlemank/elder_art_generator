import { Button } from "@/components/ui/button";
import { ChevronLeft, Download, Share2 } from "lucide-react";
import { type AspectRatioOption } from "@/lib/editorData";

interface Props {
  imageDataUrl: string;
  textPrefix: string;
  aspectRatio: AspectRatioOption;
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

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, data] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] || "image/jpeg";
  const binary = atob(data);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    array[i] = binary.charCodeAt(i);
  }
  return new Blob([array], { type: mime });
}

const StepDownload = ({ imageDataUrl, textPrefix, aspectRatio, onBack }: Props) => {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.download = getSmartFilename(textPrefix);
    link.href = imageDataUrl;
    link.click();
  };

  const handleShare = async () => {
    const filename = getSmartFilename(textPrefix);
    try {
      const blob = dataUrlToBlob(imageDataUrl);
      const file = new File([blob], filename, { type: blob.type });
      if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
        await navigator.share({
          files: [file],
          title: "長輩圖工作室",
          text: "我做了一張祝福圖",
        });
      } else {
        handleDownload();
      }
    } catch {
      handleDownload();
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 px-4 py-6 w-full max-w-lg mx-auto">
      <p className="text-xl text-muted-foreground text-center">存檔後就可以分享給親朋好友。</p>

      <div
        className="w-full overflow-hidden rounded-xl border-4 border-border"
        style={{ aspectRatio: `${aspectRatio.width}/${aspectRatio.height}` }}
      >
        <img src={imageDataUrl} alt="完成的祝福圖" className="w-full h-full object-contain" />
      </div>

      <div className="flex gap-3 w-full">
        <Button
          className="flex-1 min-h-[72px] text-2xl font-bold gap-3 bg-accent text-accent-foreground hover:bg-accent/90"
          onClick={handleDownload}
        >
          <Download size={32} /> 下載
        </Button>
        <Button
          className="flex-1 min-h-[72px] text-2xl font-bold gap-3"
          onClick={handleShare}
        >
          <Share2 size={32} /> 分享
        </Button>
      </div>

      <Button variant="secondary" className="w-full min-h-[60px] text-xl gap-2" onClick={onBack}>
        <ChevronLeft size={28} /> 回到編輯
      </Button>
    </div>
  );
};

export default StepDownload;
