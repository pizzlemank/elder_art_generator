import { useState } from "react";
import { fabric } from "fabric";
import StepProgress from "@/components/StepProgress";
import StepThemeSelection from "@/components/StepThemeSelection";
import StepBackgroundSelection from "@/components/StepBackgroundSelection";
import StepTextEditor from "@/components/StepTextEditor";
import StepDownload from "@/components/StepDownload";
import { type Category, type Background } from "@/lib/editorData";

const TOTAL_STEPS = 4;

const Index = () => {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<Category | null>(null);
  const [background, setBackground] = useState<Background | null>(null);
  const [uploadedBg, setUploadedBg] = useState<string | null>(null);
  const [finalImage, setFinalImage] = useState<string>("");
  const [textPrefix, setTextPrefix] = useState<string>("");

  const handleCategorySelect = (cat: Category) => {
    setCategory(cat);
    setBackground(null);
    setUploadedBg(null);
    setStep(2);
  };

  const handleBgSelect = (bg: Background) => {
    setBackground(bg);
    setUploadedBg(null);
  };

  const handleBgUpload = (dataUrl: string) => {
    setUploadedBg(dataUrl);
    setBackground({ id: "custom", name: "自訂背景", gradient: "" });
  };

  const handleCanvasNext = (canvas: fabric.Canvas) => {
    canvas.discardActiveObject();
    canvas.renderAll();
    // Extract first text for filename
    const textObj = canvas.getObjects().find((o) => o.type === "i-text") as fabric.IText | undefined;
    setTextPrefix(textObj?.text || "");
    const dataUrl = canvas.toDataURL({ format: "jpeg", quality: 0.92 });
    setFinalImage(dataUrl);
    setStep(4);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-card border-b-2 border-border py-3 px-4 text-center">
        <h2 className="text-2xl font-bold text-foreground">🎨 長輩圖製作器</h2>
      </header>
      <StepProgress currentStep={step} totalSteps={TOTAL_STEPS} />
      <main className="flex-1 pb-8">
        {step === 1 && <StepThemeSelection onSelect={handleCategorySelect} />}
        {step === 2 && category && (
          <StepBackgroundSelection
            categoryId={category.id}
            selected={background}
            onSelect={handleBgSelect}
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
            onBack={() => setStep(2)}
            onNext={handleCanvasNext}
          />
        )}
        {step === 4 && (
          <StepDownload imageDataUrl={finalImage} textPrefix={textPrefix} onBack={() => setStep(3)} />
        )}
      </main>
    </div>
  );
};

export default Index;
