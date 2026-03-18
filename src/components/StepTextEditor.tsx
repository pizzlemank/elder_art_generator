import { useEffect, useRef, useState, useCallback } from "react";
import { fabric } from "fabric";
import { type Background, type AspectRatioOption } from "@/lib/editorData";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PhraseSelector from "@/components/editor/PhraseSelector";
import ColorPicker from "@/components/editor/ColorPicker";
import FontControls from "@/components/editor/FontControls";
import MovementControls from "@/components/editor/MovementControls";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface Props {
  categoryId: string;
  background: Background;
  uploadedBg: string | null;
  aspectRatio: AspectRatioOption;
  onBack: () => void;
  onNext: (canvas: fabric.Canvas) => void;
}

const WATERMARK_TEXT = "LBT🌸";

const StepTextEditor = ({ categoryId, background, uploadedBg, aspectRatio, onBack, onNext }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const [activeColor, setActiveColor] = useState("#dc2626");
  const [activeFont, setActiveFont] = useState("serif");
  const [activeFontSize, setActiveFontSize] = useState(80);
  const [isBold, setIsBold] = useState(true);
  const [isItalic, setIsItalic] = useState(false);
  const [hasOutline, setHasOutline] = useState(false);
  const [hasShadow, setHasShadow] = useState(true);

  const CANVAS_W = aspectRatio.width;
  const CANVAS_H = aspectRatio.height;

  const initCanvas = useCallback(() => {
    if (!canvasRef.current) return;
    if (fabricRef.current) fabricRef.current.dispose();

    const fc = new fabric.Canvas(canvasRef.current, {
      width: CANVAS_W, height: CANVAS_H, backgroundColor: "#ffffff",
    });

    if (uploadedBg) {
      fabric.Image.fromURL(uploadedBg, (img) => {
        img.scaleToWidth(CANVAS_W);
        img.scaleToHeight(CANVAS_H);
        fc.setBackgroundImage(img, fc.renderAll.bind(fc));
      });
    } else {
      const rect = new fabric.Rect({
        left: 0, top: 0, width: CANVAS_W, height: CANVAS_H,
        selectable: false, evented: false,
      });
      rect.set("fill", createFabricGradient(background.gradient, CANVAS_W, CANVAS_H));
      fc.add(rect);
      fc.sendToBack(rect);
    }

    fabricRef.current = fc;
  }, [background, uploadedBg, CANVAS_W, CANVAS_H]);

  useEffect(() => {
    initCanvas();
    return () => { fabricRef.current?.dispose(); };
  }, [initCanvas]);

  const addPhrase = (text: string) => {
    const fc = fabricRef.current;
    if (!fc) return;
    const t = new fabric.IText(text, {
      left: CANVAS_W / 2, top: CANVAS_H / 2,
      originX: "center", originY: "center",
      fontSize: activeFontSize, fontFamily: activeFont, fill: activeColor,
      fontWeight: isBold ? "bold" : "normal",
      fontStyle: isItalic ? "italic" : "normal",
      stroke: hasOutline ? "#000000" : undefined,
      strokeWidth: hasOutline ? 2 : 0,
      shadow: hasShadow
        ? new fabric.Shadow({ color: "rgba(0,0,0,0.5)", blur: 8, offsetX: 4, offsetY: 4 })
        : undefined,
    });
    fc.add(t);
    fc.setActiveObject(t);
    fc.renderAll();
  };

  const applyToActive = (setter: (obj: fabric.IText) => void) => {
    const fc = fabricRef.current;
    const obj = fc?.getActiveObject();
    if (obj && obj.type === "i-text") {
      setter(obj as fabric.IText);
      fc?.renderAll();
    }
  };

  const changeColor = (hex: string) => { setActiveColor(hex); applyToActive((o) => o.set("fill", hex)); };
  const changeFont = (f: string) => { setActiveFont(f); applyToActive((o) => o.set("fontFamily", f)); };
  const changeFontSize = (s: number) => { setActiveFontSize(s); applyToActive((o) => o.set("fontSize", s)); };
  const toggleBold = () => { const n = !isBold; setIsBold(n); applyToActive((o) => o.set("fontWeight", n ? "bold" : "normal")); };
  const toggleItalic = () => { const n = !isItalic; setIsItalic(n); applyToActive((o) => o.set("fontStyle", n ? "italic" : "normal")); };
  const toggleOutline = () => { const n = !hasOutline; setHasOutline(n); applyToActive((o) => { o.set("stroke", n ? "#000000" : undefined); o.set("strokeWidth", n ? 2 : 0); }); };
  const toggleShadow = () => { const n = !hasShadow; setHasShadow(n); applyToActive((o) => { o.set("shadow", n ? new fabric.Shadow({ color: "rgba(0,0,0,0.5)", blur: 8, offsetX: 4, offsetY: 4 }) : undefined); }); };

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

  const handleNext = () => {
    const fc = fabricRef.current;
    if (!fc) return;
    fc.discardActiveObject();

    // Add watermark before export
    const watermark = new fabric.Text(WATERMARK_TEXT, {
      left: CANVAS_W - 16,
      top: CANVAS_H - 16,
      originX: "right",
      originY: "bottom",
      fontSize: 14,
      fontFamily: "sans-serif",
      fill: "rgba(255,255,255,0.3)",
      selectable: false,
      evented: false,
    });
    fc.add(watermark);
    fc.renderAll();

    onNext(fc);

    // Remove watermark from canvas so editing view stays clean
    fc.remove(watermark);
    fc.renderAll();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 px-2 py-4 w-full max-w-6xl mx-auto">
      {/* LEFT: Accordion Controls */}
      <div className="lg:w-[420px] lg:max-h-[calc(100vh-140px)] lg:overflow-y-auto lg:pr-2 flex flex-col gap-2 order-2 lg:order-1">
        <Accordion type="single" defaultValue="phrases" collapsible className="w-full space-y-1">
          <AccordionItem value="phrases" className="border rounded-xl px-3 bg-card">
            <AccordionTrigger className="text-lg font-bold hover:no-underline">✍️ 祝福語</AccordionTrigger>
            <AccordionContent>
              <PhraseSelector categoryId={categoryId} onAdd={addPhrase} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="color" className="border rounded-xl px-3 bg-card">
            <AccordionTrigger className="text-lg font-bold hover:no-underline">🎨 文字顏色</AccordionTrigger>
            <AccordionContent>
              <ColorPicker activeColor={activeColor} onChange={changeColor} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="font" className="border rounded-xl px-3 bg-card">
            <AccordionTrigger className="text-lg font-bold hover:no-underline">🔤 字型設定</AccordionTrigger>
            <AccordionContent>
              <FontControls
                activeFont={activeFont} activeFontSize={activeFontSize}
                isBold={isBold} isItalic={isItalic} hasOutline={hasOutline} hasShadow={hasShadow}
                onFontChange={changeFont} onFontSizeChange={changeFontSize}
                onBoldToggle={toggleBold} onItalicToggle={toggleItalic}
                onOutlineToggle={toggleOutline} onShadowToggle={toggleShadow}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="move" className="border rounded-xl px-3 bg-card">
            <AccordionTrigger className="text-lg font-bold hover:no-underline">↕️ 移動 / 刪除</AccordionTrigger>
            <AccordionContent>
              <MovementControls onMove={moveActive} onDelete={deleteActive} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Nav */}
        <div className="flex gap-4 w-full mt-2">
          <Button variant="secondary" className="flex-1 min-h-[60px] text-xl gap-2" onClick={onBack}>
            <ChevronLeft size={28} /> 上一步
          </Button>
          <Button className="flex-1 min-h-[60px] text-xl gap-2" onClick={handleNext}>
            下一步 <ChevronRight size={28} />
          </Button>
        </div>
      </div>

      {/* RIGHT: Canvas preview */}
      <div className="flex-1 flex flex-col items-center order-1 lg:order-2">
        <h1 className="text-2xl font-bold text-foreground text-center mb-2">編輯文字</h1>
        <div
          className="w-full lg:sticky lg:top-4 overflow-hidden rounded-xl border-4 border-border"
          style={{ aspectRatio: `${CANVAS_W}/${CANVAS_H}`, maxHeight: "calc(100vh - 160px)" }}
        >
          <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
        </div>
      </div>
    </div>
  );
};

function createFabricGradient(css: string, w: number, h: number): fabric.Gradient {
  const colorsMatch = css.match(/#[a-fA-F0-9]{6}/g) || ["#ffffff", "#cccccc"];
  const isVertical = css.includes("180deg");
  const coords = isVertical ? { x1: 0, y1: 0, x2: 0, y2: h } : { x1: 0, y1: 0, x2: w, y2: h };
  const stops = colorsMatch.map((c, i) => ({ offset: i / Math.max(colorsMatch.length - 1, 1), color: c }));
  return new fabric.Gradient({ type: "linear", coords, colorStops: stops });
}

export default StepTextEditor;
