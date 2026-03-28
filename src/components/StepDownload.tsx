import { Button } from "@/components/ui/button";
import { ChevronLeft, Download, Share2 } from "lucide-react";
import { type AspectRatioOption } from "@/lib/editorData";

interface Props {
  imageDataUrl: string;
  textPrefix: string;
  aspectRatio: AspectRatioOption;
  onBack: () => void;
}

function getSmartFilename(textPrefix: string, dataUrl: string): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const datePart = `${yy}${mm}${dd}`;
  const prefix = textPrefix.replace(/[^\u4e00-\u9fff\w]/g, "").slice(0, 8) || "祝福圖";
  const ext = dataUrl.startsWith("data:image/png") ? "png" : "jpg";
  return `${prefix}_${datePart}.${ext}`;
}


const StepDownload = ({ imageDataUrl, textPrefix, aspectRatio, onBack }: Props) => {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.download = getSmartFilename(textPrefix, imageDataUrl);
    link.href = imageDataUrl;
    link.click();
  };

  const handleShare = async () => {
    try {
      // Basic check for Web Share API support
      if (!navigator.share) {
        console.log("Web Share API not supported, falling back to download");
        handleDownload();
        return;
      }

      // 1. Convert the data URL to a Blob first
      const response = await fetch(imageDataUrl);
      const blob = await response.blob();

      // 2. Generate a smart filename for the shared file (same logic as download)
      const filename = getSmartFilename(textPrefix, imageDataUrl);
      
      // 3. Create a File object from the blob
      // Using the detected blob type and the smart filename
      const file = new File([blob], filename, { type: blob.type });

      // 4. Construct the share data object
      // Some apps prefer the URL in its own field, others in the text
      const shareData: ShareData = {
        title: "長輩圖工作室",
        text: "我做了一張祝福圖🖼️,你也來做一個吧🖌️",
        url: "https://lbt.studiozinc.com/",
      };

      // 5. Check if the browser specifically supports sharing this exact file + text combo
      // navigator.canShare is the most reliable way to check for file support
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        shareData.files = [file];
      } else {
        console.warn("This device/browser doesn't support sharing files via Web Share API.");
        // We will still try to share the text/URL if files aren't supported
      }

      await navigator.share(shareData);
      console.log("Share successful");
    } catch (error) {
      // AbortError means user manually cancelled the share dialog - ignore it
      if (error instanceof Error && error.name === 'AbortError') {
        console.log("Share cancelled by user");
        return;
      }

      // For other errors, log them and fall back to a direct download
      console.error("Share failed:", error);
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
