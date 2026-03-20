import { useEffect, useRef, useState, useCallback } from "react";
import { fabric } from "fabric";
import { type Background, type AspectRatioOption } from "@/lib/editorData";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RotateCcw, Undo2, Redo2, Lock, Unlock } from "lucide-react";
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
  expertMode?: boolean;
  onBack: () => void;
  onNext: (canvas: fabric.Canvas) => void;
  initialCanvasJson?: string | null;
  onSaveCanvas?: (json: string) => void;
}

type OutlineStyle = "none" | "sticker" | "glow";

const WATERMARK_TEXT = "長輩圖工作室";
const HIGHLIGHT_COLOR = "rgba(255,255,255,0.85)";
const DEFAULT_TEXT_COLOR = "#ffffff";
const DEFAULT_FONT = "'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', 'Heiti TC', sans-serif";
const DEFAULT_FONT_SIZE = 80;
const OUTLINE_COLOR = "#000000";
const STICKER_OUTLINE_SCALE = 0.08;
const GLOW_BLUR = 12;
const SAMPLE_GIFS = [
  { id: "sparkle", name: "✨ 閃亮", url: "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif" },
  { id: "hearts", name: "💕 愛心", url: "https://media.giphy.com/media/26BRv0ThflsHCqDrG/giphy.gif" },
  { id: "confetti", name: "🎊 彩帶", url: "https://media.giphy.com/media/g9582DNuQppxC/giphy.gif" },
];

const StepTextEditor = ({
  categoryId,
  background,
  uploadedBg,
  aspectRatio,
  expertMode = false,
  onBack,
  onNext,
  initialCanvasJson,
  onSaveCanvas,
}: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const historyRef = useRef<{ stack: string[]; index: number; isRestoring: boolean }>({
    stack: [],
    index: -1,
    isRestoring: false,
  });

  const [activeColor, setActiveColor] = useState(DEFAULT_TEXT_COLOR);
  const [activeFont, setActiveFont] = useState(DEFAULT_FONT);
  const [activeFontSize, setActiveFontSize] = useState(DEFAULT_FONT_SIZE);
  const [isBold, setIsBold] = useState(true);
  const [isItalic, setIsItalic] = useState(false);
  const [outlineStyle, setOutlineStyle] = useState<OutlineStyle>("none");
  const [hasShadow, setHasShadow] = useState(true);
  const [hasHighlight, setHasHighlight] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [displayScale, setDisplayScale] = useState(1);
  const [bgLocked, setBgLocked] = useState(true);
  const bgLockedRef = useRef(true);

  const CANVAS_W = aspectRatio.width;
  const CANVAS_H = aspectRatio.height;

  const updateHistoryState = useCallback(() => {
    const { stack, index } = historyRef.current;
    setCanUndo(index > 0);
    setCanRedo(index >= 0 && index < stack.length - 1);
  }, []);

  const isBoldWeight = (weight: fabric.IText["fontWeight"]) => {
    if (typeof weight === "number") return weight >= 600;
    if (typeof weight === "string") {
      if (weight.toLowerCase() === "bold") return true;
      const parsed = Number.parseInt(weight, 10);
      return Number.isFinite(parsed) && parsed >= 600;
    }
    return false;
  };

  const syncUiFromText = useCallback((obj?: fabric.Object) => {
    if (!obj || obj.type !== "i-text") return;
    const textObj = obj as fabric.IText;
    setActiveColor(typeof textObj.fill === "string" ? textObj.fill : DEFAULT_TEXT_COLOR);
    setActiveFont(textObj.fontFamily || DEFAULT_FONT);
    setActiveFontSize(textObj.fontSize || DEFAULT_FONT_SIZE);
    setIsBold(isBoldWeight(textObj.fontWeight));
    setIsItalic(textObj.fontStyle === "italic");
    setHasShadow(Boolean(textObj.shadow));
    setHasHighlight(Boolean(textObj.textBackgroundColor));
    const style = (textObj.data as { outlineStyle?: OutlineStyle } | undefined)?.outlineStyle ?? "none";
    setOutlineStyle(style);
  }, []);

  const ensureTextId = useCallback((obj: fabric.IText) => {
    const data = (obj.data || {}) as { textId?: string; outlineStyle?: OutlineStyle };
    if (!data.textId) {
      data.textId = `text_${Math.random().toString(36).slice(2, 10)}`;
      obj.set("data", data);
    }
    return data.textId;
  }, []);

  const findOutlineForText = useCallback((fc: fabric.Canvas, textId: string) => {
    return fc
      .getObjects()
      .find((o) => (o as fabric.Object).data?.outlineFor === textId) as fabric.Text | undefined;
  }, []);

  const applyOutlineVisuals = useCallback(
    (outline: fabric.Text, textObj: fabric.IText, style: OutlineStyle) => {
      const baseScaleX = textObj.scaleX ?? 1;
      const baseScaleY = textObj.scaleY ?? 1;

      if (style === "sticker") {
        outline.set({
          fill: OUTLINE_COLOR,
          shadow: undefined,
          opacity: 1,
          scaleX: baseScaleX * (1 + STICKER_OUTLINE_SCALE),
          scaleY: baseScaleY * (1 + STICKER_OUTLINE_SCALE),
        });
        return;
      }

      if (style === "glow") {
        outline.set({
          fill: OUTLINE_COLOR,
          opacity: 1,
          scaleX: baseScaleX,
          scaleY: baseScaleY,
          shadow: new fabric.Shadow({
            color: "rgba(0,0,0,0.7)",
            blur: GLOW_BLUR,
            offsetX: 0,
            offsetY: 0,
          }),
        });
      }
    },
    [],
  );

  const syncOutlineForText = useCallback(
    (textObj: fabric.IText) => {
      const fc = fabricRef.current;
      if (!fc) return;
      const data = (textObj.data || {}) as { textId?: string; outlineStyle?: OutlineStyle };
      const style = data.outlineStyle ?? "none";
      const textId = ensureTextId(textObj);
      const existing = findOutlineForText(fc, textId);

      if (style === "none") {
        if (existing) fc.remove(existing);
        return;
      }

      const outline =
        existing ||
        new fabric.Text(textObj.text || "", {
          left: textObj.left,
          top: textObj.top,
          originX: textObj.originX,
          originY: textObj.originY,
          angle: textObj.angle,
          scaleX: textObj.scaleX,
          scaleY: textObj.scaleY,
          skewX: textObj.skewX,
          skewY: textObj.skewY,
          flipX: textObj.flipX,
          flipY: textObj.flipY,
          fontFamily: textObj.fontFamily,
          fontSize: textObj.fontSize,
          fontWeight: textObj.fontWeight,
          fontStyle: textObj.fontStyle,
          textAlign: textObj.textAlign,
          charSpacing: textObj.charSpacing,
          lineHeight: textObj.lineHeight,
          selectable: false,
          evented: false,
          hasControls: false,
          hoverCursor: "default",
          excludeFromExport: true,
          data: { isOutline: true, outlineFor: textId },
        });

      outline.set({
        text: textObj.text || "",
        left: textObj.left,
        top: textObj.top,
        originX: textObj.originX,
        originY: textObj.originY,
        angle: textObj.angle,
        scaleX: textObj.scaleX,
        scaleY: textObj.scaleY,
        skewX: textObj.skewX,
        skewY: textObj.skewY,
        flipX: textObj.flipX,
        flipY: textObj.flipY,
        fontFamily: textObj.fontFamily,
        fontSize: textObj.fontSize,
        fontWeight: textObj.fontWeight,
        fontStyle: textObj.fontStyle,
        textAlign: textObj.textAlign,
        charSpacing: textObj.charSpacing,
        lineHeight: textObj.lineHeight,
      });

      applyOutlineVisuals(outline, textObj, style);

      if (!existing) {
        const textIndex = fc.getObjects().indexOf(textObj);
        const insertIndex = Math.max(0, textIndex);
        fc.insertAt(outline, insertIndex, false);
      }

      outline.setCoords();
    },
    [applyOutlineVisuals, ensureTextId, findOutlineForText],
  );

  const removeOutlineForText = useCallback(
    (textObj: fabric.IText) => {
      const fc = fabricRef.current;
      if (!fc) return;
      const textId = ensureTextId(textObj);
      const outline = findOutlineForText(fc, textId);
      if (outline) fc.remove(outline);
    },
    [ensureTextId, findOutlineForText],
  );

  const attachOutlineHandlers = useCallback(
    (obj: fabric.IText) => {
      const anyObj = obj as fabric.IText & { __outlineHandlersAttached?: boolean };
      if (anyObj.__outlineHandlersAttached) return;
      anyObj.__outlineHandlersAttached = true;
      obj.on("moving", () => syncOutlineForText(obj));
      obj.on("scaling", () => syncOutlineForText(obj));
      obj.on("rotating", () => syncOutlineForText(obj));
      obj.on("skewing", () => syncOutlineForText(obj));
      obj.on("modified", () => syncOutlineForText(obj));
      obj.on("changed", () => syncOutlineForText(obj));
    },
    [syncOutlineForText],
  );

  const styleTextObject = useCallback((obj: fabric.Object) => {
    if (obj.type !== "i-text") return;
    obj.set({
      borderColor: "#ef4444",
      cornerColor: "#ef4444",
      cornerStyle: "circle",
      cornerSize: 14,
      transparentCorners: false,
    });
    const textObj = obj as fabric.IText;
    attachOutlineHandlers(textObj);
    syncOutlineForText(textObj);
  }, [attachOutlineHandlers, syncOutlineForText]);

  const pushHistory = useCallback((fc: fabric.Canvas) => {
    if (historyRef.current.isRestoring) return;
    const json = JSON.stringify(fc.toJSON(["data"]));
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

  const updateDisplayScale = useCallback(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const parent = wrapper.parentElement;
    const buffer = 32;
    const availableWidth = parent?.clientWidth ? parent.clientWidth - buffer : window.innerWidth - buffer;
    const availableHeight = parent?.clientHeight ? parent.clientHeight - buffer : window.innerHeight - buffer;
    const scale = Math.min(1, availableWidth / CANVAS_W, availableHeight / CANVAS_H);
    setDisplayScale(scale);
  }, [CANVAS_W, CANVAS_H]);

  const fitImageToCanvas = useCallback((img: fabric.Image, locked = true) => {
    const scaleVal = Math.max(CANVAS_W / (img.width || 1), CANVAS_H / (img.height || 1));
    img.scale(scaleVal);
    img.set({
      left: CANVAS_W / 2,
      top: CANVAS_H / 2,
      originX: "center",
      originY: "center",
      selectable: !locked,
      evented: !locked,
      hasControls: !locked,
      lockMovementX: locked,
      lockMovementY: locked,
      hoverCursor: locked ? "default" : "move",
      data: { isBgImage: true },
    });
  }, [CANVAS_W, CANVAS_H]);

  const getHighlightPadding = (size: number) => Math.max(8, Math.round(size * 0.2));

  const applyHighlightToText = useCallback(
    (obj: fabric.IText, fontSize: number, highlightFlag = hasHighlight) => {
      if (!highlightFlag) {
        obj.set({
          textBackgroundColor: undefined,
          textBackgroundPadding: 0,
        });
        return;
      }
      obj.set({
        textBackgroundColor: HIGHLIGHT_COLOR,
        textBackgroundPadding: getHighlightPadding(fontSize),
      });
    },
    [hasHighlight],
  );

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
        data: { isBgImage: true },
      });
      rect.set("fill", createFabricGradient(background.gradient, CANVAS_W, CANVAS_H));
      fc.add(rect);
      fc.sendToBack(rect);
    };

    const finalizeBackground = () => {
      if (initialCanvasJson) {
        historyRef.current.isRestoring = true;
        fc.loadFromJSON(initialCanvasJson, () => {
          fc.getObjects().forEach((o) => styleTextObject(o));
          fc.renderAll();
          historyRef.current.isRestoring = false;
          pushHistory(fc);
        });
      } else {
        pushHistory(fc);
      }
    };

    const loadImage = (src: string, onSuccess: (img: fabric.Image) => void, onFail: () => void) => {
      const imgEl = new Image();
      imgEl.crossOrigin = "anonymous";
      imgEl.onload = () => onSuccess(new fabric.Image(imgEl));
      imgEl.onerror = () => onFail();
      imgEl.src = src;
    };

    const applyImageBackground = (src: string) => {
      loadImage(
        src,
        (img) => {
          fitImageToCanvas(img, bgLockedRef.current);
          fc.add(img);
          fc.sendToBack(img);
          fc.renderAll();
          finalizeBackground();
        },
        () => {
          setGradientBackground();
          finalizeBackground();
        },
      );
    };

    if (uploadedBg) {
      applyImageBackground(uploadedBg);
    } else if (background.arImages?.[aspectRatio.id]) {
      applyImageBackground(background.arImages[aspectRatio.id]);
    } else if (background.image) {
      applyImageBackground(background.image);
    } else {
      setGradientBackground();
      finalizeBackground();
    }

    fc.on("object:moving", (e) => {
      const obj = e.target;
      if (!obj) return;
      clampToCanvas(obj);
    });

    fc.on("object:scaling", (e) => {
      const obj = e.target;
      if (!obj) return;
      clampToCanvas(obj);
    });

    fc.on("object:modified", () => {
      pushHistory(fc);
    });

    fc.on("object:added", (e) => {
      if (historyRef.current.isRestoring) return;
      if (e.target?.type === "i-text") {
        styleTextObject(e.target);
        pushHistory(fc);
      }
    });

    fc.on("object:removed", (e) => {
      const obj = e.target;
      if (obj?.type === "i-text") {
        removeOutlineForText(obj as fabric.IText);
      }
      if (obj?.data?.isOutline) return;
      if (historyRef.current.isRestoring) return;
      pushHistory(fc);
    });

    fc.on("selection:created", (e) => {
      if (historyRef.current.isRestoring) return;
      const target = e.selected?.[0] || e.target;
      syncUiFromText(target);
    });

    fc.on("selection:updated", (e) => {
      if (historyRef.current.isRestoring) return;
      const target = e.selected?.[0] || e.target;
      syncUiFromText(target);
    });

    fc.on("mouse:up", () => {
      fc.clearContext(fc.contextTop);
    });

    fabricRef.current = fc;
    updateDisplayScale();
  }, [
    background.gradient,
    background.image,
    uploadedBg,
    CANVAS_W,
    CANVAS_H,
    clampToCanvas,
    pushHistory,
    fitImageToCanvas,
    styleTextObject,
    removeOutlineForText,
    syncUiFromText,
    initialCanvasJson,
  ]);

  useEffect(() => {
    initCanvas();
    updateHistoryState();
    return () => {
      fabricRef.current?.dispose();
    };
  }, [initCanvas, updateHistoryState]);

  useEffect(() => {
    updateDisplayScale();
    window.addEventListener("resize", updateDisplayScale);
    return () => window.removeEventListener("resize", updateDisplayScale);
  }, [updateDisplayScale]);

  useEffect(() => {
    const fc = fabricRef.current;
    if (!fc) return;
    fc.setZoom(displayScale);
    fc.requestRenderAll();
  }, [displayScale]);

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
    applyHighlightToText(t, activeFontSize);
    t.set("data", { ...(t.data || {}), outlineStyle });
    syncOutlineForText(t);
  };

  const applyToActive = (setter: (obj: fabric.IText) => void, highlightFlag = hasHighlight) => {
    const fc = fabricRef.current;
    const obj = fc?.getActiveObject();
    if (obj && obj.type === "i-text") {
      const textObj = obj as fabric.IText;
      setter(textObj);
      applyHighlightToText(textObj, activeFontSize, highlightFlag);
      syncOutlineForText(textObj);
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
  const toggleStickerOutline = () => {
    const next = outlineStyle === "sticker" ? "none" : "sticker";
    setOutlineStyle(next);
    applyToActive((o) => o.set("data", { ...(o.data || {}), outlineStyle: next }));
  };
  const toggleGlowOutline = () => {
    const next = outlineStyle === "glow" ? "none" : "glow";
    setOutlineStyle(next);
    applyToActive((o) => o.set("data", { ...(o.data || {}), outlineStyle: next }));
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

  const toggleHighlight = () => {
    const next = !hasHighlight;
    setHasHighlight(next);
    applyToActive(() => {
      /* reapply highlight state without other changes */
    }, next);
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

  const toggleBgLock = () => {
    const fc = fabricRef.current;
    if (!fc) return;
    const newLocked = !bgLocked;
    setBgLocked(newLocked);
    bgLockedRef.current = newLocked;
    fc.getObjects().forEach((obj) => {
      if (obj.data?.isBgImage) {
        obj.set({
          selectable: !newLocked,
          evented: !newLocked,
          hasControls: !newLocked,
          lockMovementX: newLocked,
          lockMovementY: newLocked,
          hoverCursor: newLocked ? "default" : "move",
        });
      }
    });
    fc.discardActiveObject();
    fc.renderAll();
  };

  const addGifSticker = (url: string) => {
    const fc = fabricRef.current;
    if (!fc) return;
    const imgEl = new Image();
    imgEl.crossOrigin = "anonymous";
    imgEl.onload = () => {
      const fImg = new fabric.Image(imgEl, {
        left: CANVAS_W / 2,
        top: CANVAS_H / 2,
        originX: "center",
        originY: "center",
        scaleX: Math.min(200 / (imgEl.width || 200), 1),
        scaleY: Math.min(200 / (imgEl.height || 200), 1),
        data: { isGifSticker: true },
      });
      fImg.set({
        borderColor: "#ef4444",
        cornerColor: "#ef4444",
        cornerStyle: "circle",
        cornerSize: 14,
        transparentCorners: false,
      });
      fc.add(fImg);
      fc.setActiveObject(fImg);
      fc.renderAll();
      pushHistory(fc);
    };
    imgEl.src = url;
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
    onSaveCanvas?.(JSON.stringify(fc.toJSON(["data"])));

    const prevZoom = fc.getZoom();
    if (prevZoom !== 1) {
      fc.setZoom(1);
      fc.renderAll();
    }

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
    if (prevZoom !== 1) {
      fc.setZoom(prevZoom);
    }
    fc.renderAll();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 px-2 py-4 w-full max-w-6xl mx-auto lg:items-start">
      <div className="lg:w-[360px] lg:flex-shrink-0 lg:sticky lg:top-4 lg:max-h-[calc(100vh-140px)] lg:overflow-y-auto lg:pr-2 flex flex-col gap-2 order-2 lg:order-1">
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
          <Button
            variant={bgLocked ? "outline" : "secondary"}
            className="min-h-[44px] text-base gap-2"
            onClick={toggleBgLock}
            title={bgLocked ? "背景已鎖定" : "背景已解鎖"}
          >
            {bgLocked ? <Lock size={18} /> : <Unlock size={18} />}
            {bgLocked ? "背景鎖定" : "背景解鎖"}
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
                outlineStyle={outlineStyle}
                hasShadow={hasShadow}
                hasHighlight={hasHighlight}
                onFontChange={changeFont}
                onFontSizeChange={changeFontSize}
                onBoldToggle={toggleBold}
                onItalicToggle={toggleItalic}
                onStickerOutlineToggle={toggleStickerOutline}
                onGlowOutlineToggle={toggleGlowOutline}
                onShadowToggle={toggleShadow}
                onHighlightToggle={toggleHighlight}
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="move" className="border rounded-xl px-3 bg-card">
            <AccordionTrigger className="text-lg font-bold hover:no-underline">移動與刪除</AccordionTrigger>
            <AccordionContent>
              <MovementControls onMove={moveActive} onDelete={deleteActive} />
            </AccordionContent>
          </AccordionItem>

          {expertMode && (
            <AccordionItem value="gif" className="border rounded-xl px-3 bg-card border-amber-400">
              <AccordionTrigger className="text-lg font-bold hover:no-underline">🧪 GIF 貼圖 (Beta)</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground mb-2">點選加入 GIF 貼圖（匯出為 PNG 靜態圖）</p>
                <div className="grid grid-cols-3 gap-2">
                  {SAMPLE_GIFS.map((gif) => (
                    <button
                      key={gif.id}
                      onClick={() => addGifSticker(gif.url)}
                      className="flex flex-col items-center gap-1 rounded-xl border-2 border-border p-2 hover:border-primary transition-colors"
                    >
                      <img src={gif.url} alt={gif.name} className="w-16 h-16 object-cover rounded" />
                      <span className="text-xs font-medium">{gif.name}</span>
                    </button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
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

      <div className="flex-1 min-w-0 flex flex-col items-center order-1 lg:order-2">
        <h1 className="text-2xl font-bold text-foreground text-center mb-2">拖曳文字到喜歡的位置</h1>
        <div
          ref={wrapperRef}
          className="overflow-hidden rounded-xl border-4 border-border bg-white"
          style={{
            width: `${CANVAS_W * displayScale}px`,
            height: `${CANVAS_H * displayScale}px`,
            maxWidth: "100%",
            maxHeight: "calc(100vh - 180px)",
          }}
        >
          <canvas
            ref={canvasRef}
            style={{
              width: `${CANVAS_W}px`,
              height: `${CANVAS_H}px`,
              display: "block",
            }}
          />
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
