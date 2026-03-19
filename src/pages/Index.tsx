import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { fabric } from "fabric";
import StepProgress from "@/components/StepProgress";
import StepThemeSelection from "@/components/StepThemeSelection";
import StepBackgroundSelection from "@/components/StepBackgroundSelection";
import StepTextEditor from "@/components/StepTextEditor";
import StepDownload from "@/components/StepDownload";
import { type Category, type Background, type AspectRatioOption, aspectRatios } from "@/lib/editorData";

const TOTAL_STEPS = 4;
const STEP_LABELS: Record<number, string> = {
  1: "選主題",
  2: "選背景",
  3: "加文字",
  4: "下載/分享",
};

const Index = () => {
  const [searchParams] = useSearchParams();
  const expertMode = searchParams.get("mode") === "expert";
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<Category | null>(null);
  const [background, setBackground] = useState<Background | null>(null);
  const [uploadedBg, setUploadedBg] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>(aspectRatios[0]);
  const [finalImage, setFinalImage] = useState<string>("");
  const [textPrefix, setTextPrefix] = useState<string>("");
  const [canvasJson, setCanvasJson] = useState<string | null>(null);

  const handleCategorySelect = (cat: Category) => {
    setCategory(cat);
    setBackground(null);
    setUploadedBg(null);
    setCanvasJson(null);
    setStep(2);
  };

  const handleBgSelect = (bg: Background) => {
    setBackground(bg);
    setUploadedBg(null);
    setCanvasJson(null);
  };

  const createCustomAspectRatio = (width: number, height: number): AspectRatioOption => {
    const maxDim = 1200;
    const scale = Math.min(maxDim / width, maxDim / height, 1);
    const scaledWidth = Math.max(400, Math.round(width * scale));
    const scaledHeight = Math.max(400, Math.round(height * scale));
    return {
      id: "custom",
      name: "自訂",
      label: `${Math.round(width)} × ${Math.round(height)}`,
      width: scaledWidth,
      height: scaledHeight,
    };
  };

  const handleBgUpload = (dataUrl: string) => {
    const img = new Image();
    img.onload = () => {
      const ratio = createCustomAspectRatio(img.width, img.height);
      setAspectRatio(ratio);
      setUploadedBg(dataUrl);
      setBackground({ id: "custom", name: "自訂照片", gradient: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)" });
      setCanvasJson(null);
      toast.success("上傳順利，已前往下一步");
      setStep(3);
    };
    img.onerror = () => {
      toast.error("背景圖讀取失敗，請再試一次");
    };
    img.src = dataUrl;
  };

  const handleCanvasNext = (canvas: fabric.Canvas) => {
    canvas.discardActiveObject();
    canvas.renderAll();
    const textObj = canvas.getObjects().find((o) => o.type === "i-text") as fabric.IText | undefined;
    setTextPrefix(textObj?.text || "");
    const dataUrl = canvas.toDataURL({ format: "jpeg", quality: 0.92 });
    setFinalImage(dataUrl);
    setStep(4);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {step === 1 && (
        <header className="bg-card border-b-2 border-border py-3 px-4 text-center">
          <h2 className="text-2xl font-bold text-foreground">長輩圖工作室</h2>
        </header>
      )}
      <StepProgress currentStep={step} totalSteps={TOTAL_STEPS} label={STEP_LABELS[step]} />
      <main className="flex-1 pb-8">
        {step === 1 && <StepThemeSelection onSelect={handleCategorySelect} />}
        {step === 2 && category && (
          <StepBackgroundSelection
            categoryId={category.id}
            selected={background}
            aspectRatio={aspectRatio}
            onSelect={handleBgSelect}
            onAspectRatioChange={setAspectRatio}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
            onUpload={handleBgUpload}
          />
        )}
        {step === 3 && category && background && (
          <StepTextEditor
            categoryId={category.id}
            background={background}
            uploadedBg={uploadedBg}
            aspectRatio={aspectRatio}
            onBack={() => setStep(2)}
            onNext={handleCanvasNext}
            initialCanvasJson={canvasJson}
            onSaveCanvas={setCanvasJson}
          />
        )}
        {step === 4 && (
          <StepDownload
            imageDataUrl={finalImage}
            textPrefix={textPrefix}
            aspectRatio={aspectRatio}
            onBack={() => setStep(3)}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
