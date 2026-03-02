import { useEffect, useRef, useState, useCallback } from "react";
import { fabric } from "fabric";
import { blessingPhrases, textColors, type Background } from "@/lib/editorData";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Trash2 } from "lucide-react";

interface Props {
  categoryId: string;
  background: Background;
  uploadedBg: string | null;
  onBack: () => void;
  onNext: (canvas: fabric.Canvas) => void;
}

const CANVAS_W = 900;
const CANVAS_H = 1200;
const MOVE_STEP = 20;

const StepTextEditor = ({ categoryId, background, uploadedBg, onBack, onNext }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const [activeColor, setActiveColor] = useState("#dc2626");

  const initCanvas = useCallback(() => {
    if (!canvasRef.current) return;
    if (fabricRef.current) fabricRef.current.dispose();

    const fc = new fabric.Canvas(canvasRef.current, {
      width: CANVAS_W,
      height: CANVAS_H,
      backgroundColor: "#ffffff",
    });

    // Set background
    if (uploadedBg) {
      fabric.Image.fromURL(uploadedBg, (img) => {
        img.scaleToWidth(CANVAS_W);
        img.scaleToHeight(CANVAS_H);
        fc.setBackgroundImage(img, fc.renderAll.bind(fc));
      });
    } else {
      // Use gradient as background rect
      const rect = new fabric.Rect({
        left: 0, top: 0, width: CANVAS_W, height: CANVAS_H,
        selectable: false, evented: false,
      });
      // Parse gradient from CSS string
      rect.set("fill", createFabricGradient(background.gradient, CANVAS_W, CANVAS_H));
      fc.add(rect);
      fc.sendToBack(rect);
    }

    fabricRef.current = fc;
  }, [background, uploadedBg]);

  useEffect(() => {
    initCanvas();
    return () => { fabricRef.current?.dispose(); };
  }, [initCanvas]);

  const addPhrase = (text: string) => {
    const fc = fabricRef.current;
    if (!fc) return;
    const t = new fabric.IText(text, {
      left: CANVAS_W / 2,
      top: CANVAS_H / 2,
      originX: "center",
      originY: "center",
      fontSize: 80,
      fontFamily: "serif",
      fill: activeColor,
      fontWeight: "bold",
      shadow: new fabric.Shadow({ color: "rgba(0,0,0,0.4)", blur: 6, offsetX: 3, offsetY: 3 }),
    });
    fc.add(t);
    fc.setActiveObject(t);
    fc.renderAll();
  };

  const changeColor = (hex: string) => {
    setActiveColor(hex);
    const fc = fabricRef.current;
    const obj = fc?.getActiveObject();
    if (obj && obj.type === "i-text") {
      (obj as fabric.IText).set("fill", hex);
      fc?.renderAll();
    }
  };

  const moveActive = (dx: number, dy: number) => {
    const fc = fabricRef.current;
    const obj = fc?.getActiveObject();
    if (!obj) return;
    obj.set({ left: (obj.left || 0) + dx, top: (obj.top || 0) + dy });
    obj.setCoords();
    fc?.renderAll();
  };

  const deleteActive = () => {
    const fc = fabricRef.current;
    const obj = fc?.getActiveObject();
    if (!obj) return;
    fc?.remove(obj);
    fc?.renderAll();
  };

  const phrases = blessingPhrases[categoryId] || [];

  return (
    <div className="flex flex-col items-center gap-4 px-2 py-4 w-full max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-foreground text-center">編輯文字</h1>

      {/* Canvas */}
      <div className="w-full overflow-hidden rounded-xl border-4 border-border" style={{ aspectRatio: "3/4" }}>
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      </div>

      {/* Phrases */}
      <div className="w-full">
        <p className="text-lg font-bold text-foreground mb-2">選擇祝福語：</p>
        <div className="flex flex-wrap gap-2">
          {phrases.map((p) => (
            <Button
              key={p}
              variant="outline"
              className="min-h-[52px] text-lg font-bold px-4"
              onClick={() => addPhrase(p)}
            >
              {p}
            </Button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div className="w-full">
        <p className="text-lg font-bold text-foreground mb-2">文字顏色：</p>
        <div className="flex gap-3">
          {textColors.map((c) => (
            <button
              key={c.id}
              onClick={() => changeColor(c.hex)}
              className={`min-h-[52px] min-w-[64px] rounded-xl border-4 text-lg font-bold ${c.borderClass} ${
                activeColor === c.hex ? "ring-4 ring-primary/40 scale-110" : ""
              }`}
              style={{ backgroundColor: c.hex, color: c.id === "white" ? "#333" : c.id === "black" ? "#fff" : "#fff" }}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Movement controls */}
      <div className="w-full">
        <p className="text-lg font-bold text-foreground mb-2">移動文字：</p>
        <div className="grid grid-cols-3 gap-2 w-[220px] mx-auto">
          <div />
          <Button variant="secondary" className="min-h-[60px] text-2xl" onClick={() => moveActive(0, -MOVE_STEP)}>
            <ArrowUp size={32} />
          </Button>
          <div />
          <Button variant="secondary" className="min-h-[60px] text-2xl" onClick={() => moveActive(-MOVE_STEP, 0)}>
            <ArrowLeft size={32} />
          </Button>
          <Button variant="destructive" className="min-h-[60px] text-xl" onClick={deleteActive}>
            <Trash2 size={28} />
          </Button>
          <Button variant="secondary" className="min-h-[60px] text-2xl" onClick={() => moveActive(MOVE_STEP, 0)}>
            <ArrowRight size={32} />
          </Button>
          <div />
          <Button variant="secondary" className="min-h-[60px] text-2xl" onClick={() => moveActive(0, MOVE_STEP)}>
            <ArrowDown size={32} />
          </Button>
          <div />
        </div>
      </div>

      {/* Nav */}
      <div className="flex gap-4 w-full mt-2">
        <Button variant="secondary" className="flex-1 min-h-[60px] text-xl gap-2" onClick={onBack}>
          <ChevronLeft size={28} /> 上一步
        </Button>
        <Button className="flex-1 min-h-[60px] text-xl gap-2" onClick={() => fabricRef.current && onNext(fabricRef.current)}>
          下一步 <ChevronRight size={28} />
        </Button>
      </div>
    </div>
  );
};

// Helper: parse CSS linear-gradient to fabric gradient
function createFabricGradient(css: string, w: number, h: number): fabric.Gradient {
  const colorsMatch = css.match(/#[a-fA-F0-9]{6}/g) || ["#ffffff", "#cccccc"];
  const isVertical = css.includes("180deg");
  const coords = isVertical
    ? { x1: 0, y1: 0, x2: 0, y2: h }
    : { x1: 0, y1: 0, x2: w, y2: h };

  const stops = colorsMatch.map((c, i) => ({
    offset: i / Math.max(colorsMatch.length - 1, 1),
    color: c,
  }));

  return new fabric.Gradient({ type: "linear", coords, colorStops: stops });
}

export default StepTextEditor;
