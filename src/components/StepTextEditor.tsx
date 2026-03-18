import { useEffect, useRef, useState, useCallback } from "react";
import { fabric } from "fabric";
import { type Background, type AspectRatioOption } from "@/lib/editorData";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RotateCcw, Undo2, Redo2 } from "lucide-react";
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

const WATERMARK_TEXT = "長輩圖工作室";
const SNAP_THRESHOLD = 12;

const StepTextEditor = ({ categoryId, background, uploadedBg, aspectRatio, onBack, onNext }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const historyRef = useRef<{ stack: string[]; index: number; isRestoring: boolean }>({
    stack: [],
    index: -1,
    isRestoring: false,
  });

  const [activeColor, setActiveColor] = useState("#dc2626");
  const [activeFont, setActiveFont] = useState(
    "'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', 'Heiti TC', sans-serif",
  );
  const [activeFontSize, setActiveFontSize] = useState(80);
  const [isBold, setIsBold] = useState(true);
  const [isItalic, setIsItalic] = useState(false);
  const [hasOutline, setHasOutline] = useState(false);
  const [hasShadow, setHasShadow] = useState(true);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const CANVAS_W = aspectRatio.width;
  const CANVAS_H = aspectRatio.height;

  const updateHistoryState = useCallback(() => {
    const { stack, index } = historyRef.current;
    setCanUndo(index > 0);
    setCanRedo(index >= 0 && index < stack.length - 1);
  }, []);

  const pushHistory = useCallback((fc: fabric.Canvas) => {
    if (historyRef.current.isRestoring) return;
    const json = JSON.stringify(fc.toJSON());
    const { stack, index } = historyRef.current;
    if (stack[index] === json) return;
    historyRef.current.stack = stack.slice(0, index + 1).concat(json);
    historyRef.current.index = index + 1;
    updateHistoryState();
  }, [updateHistoryState]);

  const restoreHistory = useCallback((delta: number) => {
    const fc = fabricRef.current;
    if (!fc) return;
    const target = historyRef.current.index + delta;
    if (target < 0 || target >= historyRef.current.stack.length) return;
    historyRef.current.isRestoring = true;
    const json = historyRef.current.stack[target];
    fc.loadFromJSON(json, () => {
      fc.getObjects().forEach((o) => styleTextObject(o));
      fc.renderAll();
      historyRef.current.isRestoring = false;
      historyRef.current.index = target;
      updateHistoryState();
    });
  }, [styleTextObject, updateHistoryState]);

  const clampToCanvas = useCallback((obj: fabric.Object) => {
    const bounds = obj.getBoundingRect();
    let left = obj.left ?? 0;
    let top = obj.top ?? 0;

    if (bounds.left < 0) left -= bounds.left;
    if (bounds.top < 0) top -= bounds.top;
    if (bounds.left + bounds.width > CANVAS_W) left -= bounds.left + bounds.width - CANVAS_W;
    if (bounds.top + bounds.height > CANVAS_H) top -= bounds.top + bounds.height - CANVAS_H;

    obj.set({ left, top });
    obj.setCoords();
  }, [CANVAS_W, CANVAS_H]);

  const styleTextObject = useCallback((obj: fabric.Object) => {
    if (obj.type !== "i-text") return;
    obj.set({
      borderColor: "#ef4444",
      cornerColor: "#ef4444",
      cornerStyle: "circle",
      cornerSize: 14,
      transparentCorners: false,
    });
  }, []);

  const fitImageToCanvas = useCallback((img: fabric.Image) => {
    const scale = Math.max(CANVAS_W / (img.width || 1), CANVAS_H / (img.height || 1));
    img.scale(scale);
    img.set({
      left: (CANVAS_W - img.getScaledWidth()) / 2,
      top: (CANVAS_H - img.getScaledHeight()) / 2,
      selectable: false,
      evented: false,
    });
  }, [CANVAS_W, CANVAS_H]);

  const initCanvas = useCallback(() => {
    if (!canvasRef.current) return;
    if (fabricRef.current) fabricRef.current.dispose();
    historyRef.current = { stack: [], index: -1, isRestoring: false };
    updateHistoryState();

    const fc = new fabric.Canvas(canvasRef.current, {
      width: CANVAS_W,
      height: CANVAS_H,
      backgroundColor: "#ffffff",
      preserveObjectStacking: true,
    });

    let showCenterV = false;
    let showCenterH = false;

    fc.selectionColor = "rgba(239,68,68,0.12)";
    fc.selectionBorderColor = "#ef4444";

    const setGradientBackground = () => {
      const rect = new fabric.Rect({
        left: 0,
        top: 0,
        width: CANVAS_W,
        height: CANVAS_H,
        selectable: false,
        evented: false,
      });
      rect.set("fill", createFabricGradient(background.gradient, CANVAS_W, CANVAS_H));
      fc.add(rect);
      fc.sendToBack(rect);
    };

    if (uploadedBg) {
      fabric.Image.fromURL(uploadedBg, (img) => {
        fitImageToCanvas(img);
        fc.setBackgroundImage(img, fc.renderAll.bind(fc));
        pushHistory(fc);
      });
    } else if (background.image) {
      fabric.Image.fromURL(background.image, (img) => {
        fitImageToCanvas(img);
        fc.setBackgroundImage(img, fc.renderAll.bind(fc));
        pushHistory(fc);
      });
    } else {
      setGradientBackground();
      pushHistory(fc);
    }

    fc.on("object:moving", (e) => {
      const obj = e.target;
      if (!obj) return;
      const center = obj.getCenterPoint();
      showCenterV = Math.abs(center.x - CANVAS_W / 2) < SNAP_THRESHOLD;
      showCenterH = Math.abs(center.y - CANVAS_H / 2) < SNAP_THRESHOLD;

      if (showCenterV) obj.set({ left: CANVAS_W / 2 - obj.getScaledWidth() / 2 });
      if (showCenterH) obj.set({ top: CANVAS_H / 2 - obj.getScaledHeight() / 2 });

      clampToCanvas(obj);
    });

    fc.on("object:scaling", (e) => {
      const obj = e.target;
      if (!obj) return;
      clampToCanvas(obj);
    });

    fc.on("object:modified", () => {
      pushHistory(fc);
      showCenterV = false;
      showCenterH = false;
      fc.clearContext(fc.contextTop);
    });

    fc.on("object:added", (e) => {
      if (historyRef.current.isRestoring) return;
      if (e.target?.type === "i-text") {
        styleTextObject(e.target);
        pushHistory(fc);
      }
    });

    fc.on("object:removed", () => {
      if (historyRef.current.isRestoring) return;
      pushHistory(fc);
    });

    fc.on("after:render", () => {
      if (!showCenterV && !showCenterH) return;
      const ctx = fc.contextTop;
      if (!ctx) return;
      ctx.save();
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.strokeStyle = "rgba(239,68,68,0.7)";
      ctx.lineWidth = 1;
      if (showCenterV) {
        ctx.beginPath();
        ctx.moveTo(CANVAS_W / 2, 0);
        ctx.lineTo(CANVAS_W / 2, CANVAS_H);
        ctx.stroke();
      }
      if (showCenterH) {
        ctx.beginPath();
        ctx.moveTo(0, CANVAS_H / 2);
        ctx.lineTo(CANVAS_W, CANVAS_H / 2);
        ctx.stroke();
      }
      ctx.restore();
    });

    fc.on("mouse:up", () => {
      showCenterV = false;
      showCenterH = false;
      fc.clearContext(fc.contextTop);
    });

    fabricRef.current = fc;
  }, [background.gradient, background.image, uploadedBg, CANVAS_W, CANVAS_H, clampToCanvas, pushHistory, fitImageToCanvas, styleTextObject]);

  useEffect(() => {
    initCanvas();
    updateHistoryState();
    return () => {
      fabricRef.current?.dispose();
    };
  }, [initCanvas, updateHistoryState]);

  const addPhrase = (text: string) => {
    const fc = fabricRef.current;
    if (!fc) return;
    const t = new fabric.IText(text, {
      left: CANVAS_W / 2,
      top: CANVAS_H / 2,
      originX: "center",
      originY: "center",
      fontSize: activeFontSize,
      fontFamily: activeFont,
      fill: activeColor,
      fontWeight: isBold ? "bold" : "normal",
      fontStyle: isItalic ? "italic" : "normal",
      stroke: hasOutline ? "#000000" : undefined,
      strokeWidth: hasOutline ? 2 : 0,
      shadow: hasShadow
        ? new fabric.Shadow({ color: "rgba(0,0,0,0.5)", blur: 8, offsetX: 4, offsetY: 4 })
        : undefined,
    });
    styleTextObject(t);
    fc.add(t);
    fc.setActiveObject(t);
    clampToCanvas(t);
    fc.renderAll();
    pushHistory(fc);
  };

  const applyToActive = (setter: (obj: fabric.IText) => void) => {
    const fc = fabricRef.current;
    const obj = fc?.getActiveObject();
    if (obj && obj.type === "i-text") {
      setter(obj as fabric.IText);
      fc?.renderAll();
      if (fc) pushHistory(fc);
    }
  };

  const changeColor = (hex: string) => {
    setActiveColor(hex);
    applyToActive((o) => o.set("fill", hex));
  };
  const changeFont = (f: string) => {
    setActiveFont(f);
    applyToActive((o) => o.set("fontFamily", f));
  };
  const changeFontSize = (s: number) => {
    setActiveFontSize(s);
    applyToActive((o) => o.set("fontSize", s));
  };
  const toggleBold = () => {
    const n = !isBold;
    setIsBold(n);
    applyToActive((o) => o.set("fontWeight", n ? "bold" : "normal"));
  };
  const toggleItalic = () => {
    const n = !isItalic;
    setIsItalic(n);
    applyToActive((o) => o.set("fontStyle", n ? "italic" : "normal"));
  };
  const toggleOutline = () => {
    const n = !hasOutline;
    setHasOutline(n);
    applyToActive((o) => {
      o.set("stroke", n ? "#000000" : undefined);
      o.set("strokeWidth", n ? 2 : 0);
    });
  };
  const toggleShadow = () => {
    const n = !hasShadow;
    setHasShadow(n);
    applyToActive((o) => {
      o.set(
        "shadow",
        n ? new fabric.Shadow({ color: "rgba(0,0,0,0.5)", blur: 8, offsetX: 4, offsetY: 4 }) : undefined,
      );
    });
  };

  const moveActive = (dx: number, dy: number) => {
    const fc = fabricRef.current;
    const obj = fc?.getActiveObject();
    if (!obj) return;
    obj.set({ left: (obj.left || 0) + dx, top: (obj.top || 0) + dy });
    clampToCanvas(obj);
    obj.setCoords();
    fc?.renderAll();
    if (fc) pushHistory(fc);
  };

  const deleteActive = () => {
    const fc = fabricRef.current;
    const obj = fc?.getActiveObject();
    if (!obj) return;
    fc?.remove(obj);
    fc?.renderAll();
    if (fc) pushHistory(fc);
  };

  const handleReset = () => {
    const fc = fabricRef.current;
    if (!fc) return;
    fc.getObjects().forEach((obj) => {
      if (obj.type === "i-text") {
        fc.remove(obj);
      }
    });
    fc.discardActiveObject();
    fc.renderAll();
    pushHistory(fc);
  };

  const handleNext = () => {
    const fc = fabricRef.current;
    if (!fc) return;
    fc.discardActiveObject();

    const watermark = new fabric.Text(WATERMARK_TEXT, {
      left: CANVAS_W - 16,
      top: CANVAS_H - 16,
      originX: "right",
      originY: "bottom",
      fontSize: 14,
      fontFamily: "'Noto Sans TC', sans-serif",
      fill: "rgba(255,255,255,0.35)",
      selectable: false,
      evented: false,
    });
    fc.add(watermark);
    fc.renderAll();

    onNext(fc);

    fc.remove(watermark);
    fc.renderAll();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 px-2 py-4 w-full max-w-6xl mx-auto">
      <div className="lg:w-[420px] lg:max-h-[calc(100vh-140px)] lg:overflow-y-auto lg:pr-2 flex flex-col gap-2 order-2 lg:order-1">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="min-h-[44px] text-base gap-2" onClick={() => restoreHistory(-1)} disabled={!canUndo}>
            <Undo2 size={18} /> 復原
          </Button>
          <Button variant="outline" className="min-h-[44px] text-base gap-2" onClick={() => restoreHistory(1)} disabled={!canRedo}>
            <Redo2 size={18} /> 重做
          </Button>
          <Button variant="outline" className="min-h-[44px] text-base gap-2" onClick={handleReset}>
            <RotateCcw size={18} /> 清除文字
          </Button>
        </div>

        <Accordion type="single" defaultValue="phrases" collapsible className="w-full space-y-1">
          <AccordionItem value="phrases" className="border rounded-xl px-3 bg-card">
            <AccordionTrigger className="text-lg font-bold hover:no-underline">選一句祝福語</AccordionTrigger>
            <AccordionContent>
              <PhraseSelector categoryId={categoryId} onAdd={addPhrase} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="color" className="border rounded-xl px-3 bg-card">
            <AccordionTrigger className="text-lg font-bold hover:no-underline">文字顏色</AccordionTrigger>
            <AccordionContent>
              <ColorPicker activeColor={activeColor} onChange={changeColor} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="font" className="border rounded-xl px-3 bg-card">
            <AccordionTrigger className="text-lg font-bold hover:no-underline">字體與樣式</AccordionTrigger>
            <AccordionContent>
              <FontControls
                activeFont={activeFont}
                activeFontSize={activeFontSize}
                isBold={isBold}
                isItalic={isItalic}
                hasOutline={hasOutline}
                hasShadow={hasShadow}
                onFontChange={changeFont}
                onFontSizeChange={changeFontSize}
                onBoldToggle={toggleBold}
                onItalicToggle={toggleItalic}
                onOutlineToggle={toggleOutline}
                onShadowToggle={toggleShadow}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="move" className="border rounded-xl px-3 bg-card">
            <AccordionTrigger className="text-lg font-bold hover:no-underline">移動與刪除</AccordionTrigger>
            <AccordionContent>
              <MovementControls onMove={moveActive} onDelete={deleteActive} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex gap-4 w-full mt-2">
          <Button variant="secondary" className="flex-1 min-h-[60px] text-xl gap-2" onClick={onBack}>
            <ChevronLeft size={28} /> 上一步
          </Button>
          <Button className="flex-1 min-h-[60px] text-xl gap-2" onClick={handleNext}>
            下一步 <ChevronRight size={28} />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center order-1 lg:order-2">
        <h1 className="text-2xl font-bold text-foreground text-center mb-2">拖曳文字到喜歡的位置</h1>
        <div
          className="w-full lg:sticky lg:top-4 overflow-hidden rounded-xl border-4 border-border bg-white"
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
