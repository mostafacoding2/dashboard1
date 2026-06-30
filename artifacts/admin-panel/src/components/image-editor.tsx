import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Crop, Scissors, Circle, Undo2, Download, X } from "lucide-react";

interface ImageEditorProps {
  src: string;
  onSave: (newUrl: string) => void;
  onClose: () => void;
}

type Tool = "crop" | "blur" | "mask";

export default function ImageEditor({ src, onSave, onClose }: ImageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [tool, setTool] = useState<Tool>("crop");
  const [isSelecting, setIsSelecting] = useState(false);
  const [start, setStart] = useState<{ x: number; y: number } | null>(null);
  const [end, setEnd] = useState<{ x: number; y: number } | null>(null);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [maskColor, setMaskColor] = useState("#ffffff");

  const drawImage = useCallback((img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
  }, []);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgRef.current = img;
      drawImage(img);
    };
    img.src = src;
  }, [src, drawImage]);

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    setHistory(prev => [...prev, ctx.getImageData(0, 0, canvas.width, canvas.height)]);
  };

  const getRect = () => {
    if (!start || !end || !canvasRef.current) return null;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: Math.min(start.x, end.x) * scaleX,
      y: Math.min(start.y, end.y) * scaleY,
      w: Math.abs(end.x - start.x) * scaleX,
      h: Math.abs(end.y - start.y) * scaleY,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setEnd(null);
    setIsSelecting(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isSelecting) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setEnd({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
  };

  const drawSelection = () => {
    const canvas = canvasRef.current;
    if (!canvas || !start || !end) return;
    const ctx = canvas.getContext("2d")!;
    if (imgRef.current) {
      drawImage(imgRef.current);
    }
    const rect = getRect();
    if (!rect) return;

    ctx.strokeStyle = tool === "crop" ? "#3b82f6" : tool === "blur" ? "#f59e0b" : "#ef4444";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 3]);
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    ctx.setLineDash([]);

    ctx.fillStyle = tool === "crop" ? "rgba(59,130,246,0.15)" : tool === "blur" ? "rgba(245,158,11,0.15)" : "rgba(239,68,68,0.15)";
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  };

  useEffect(() => {
    if (start && end) drawSelection();
  }, [start, end, tool]);

  const applyCrop = () => {
    const canvas = canvasRef.current;
    const rect = getRect();
    if (!canvas || !rect || rect.w < 2 || rect.h < 2) return;
    saveState();
    const ctx = canvas.getContext("2d")!;
    const imageData = ctx.getImageData(rect.x, rect.y, rect.w, rect.h);
    canvas.width = rect.w;
    canvas.height = rect.h;
    ctx.putImageData(imageData, 0, 0);
    setStart(null);
    setEnd(null);
  };

  const applyBlur = () => {
    const canvas = canvasRef.current;
    const rect = getRect();
    if (!canvas || !rect || rect.w < 2 || rect.h < 2) return;
    saveState();
    const ctx = canvas.getContext("2d")!;

    ctx.filter = "blur(12px)";
    ctx.drawImage(canvas, rect.x, rect.y, rect.w, rect.h, rect.x, rect.y, rect.w, rect.h);
    ctx.filter = "none";

    if (imgRef.current) {
      drawImage(imgRef.current);
      ctx.filter = "blur(12px)";
      ctx.drawImage(canvas, rect.x, rect.y, rect.w, rect.h, rect.x, rect.y, rect.w, rect.h);
      ctx.filter = "none";
    }

    setStart(null);
    setEnd(null);
  };

  const applyMask = () => {
    const canvas = canvasRef.current;
    const rect = getRect();
    if (!canvas || !rect || rect.w < 2 || rect.h < 2) return;
    saveState();
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = maskColor;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    setStart(null);
    setEnd(null);
  };

  const handleApply = () => {
    if (tool === "crop") applyCrop();
    else if (tool === "blur") applyBlur();
    else applyMask();
  };

  const undo = () => {
    const canvas = canvasRef.current;
    if (!canvas || history.length === 0) return;
    const ctx = canvas.getContext("2d")!;
    const last = history[history.length - 1];
    canvas.width = last.width;
    canvas.height = last.height;
    ctx.putImageData(last, 0, 0);
    setHistory(prev => prev.slice(0, -1));
  };

  const exportImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    onSave(dataUrl);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-bold text-sm">محرر الصور</h3>
          <div className="flex items-center gap-1.5">
            <Button size="sm" variant={tool === "crop" ? "default" : "outline"} className="h-7 text-[10px] px-2"
              onClick={() => setTool("crop")}>
              <Scissors className="h-3 w-3 ml-1" /> قص
            </Button>
            <Button size="sm" variant={tool === "blur" ? "default" : "outline"} className="h-7 text-[10px] px-2"
              onClick={() => setTool("blur")}>
              <Circle className="h-3 w-3 ml-1" /> بلور
            </Button>
            <Button size="sm" variant={tool === "mask" ? "default" : "outline"} className="h-7 text-[10px] px-2"
              onClick={() => setTool("mask")}>
              <Crop className="h-3 w-3 ml-1" /> تغطية
            </Button>
            {tool === "mask" && (
              <input type="color" value={maskColor} onChange={e => setMaskColor(e.target.value)}
                className="h-7 w-7 rounded border cursor-pointer" />
            )}
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-gray-100 dark:bg-gray-900">
          <canvas
            ref={canvasRef}
            className="max-w-full max-h-[60vh] border cursor-crosshair"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="flex items-center gap-1.5">
            <Button size="sm" variant="outline" className="h-7 text-[10px] px-2" onClick={undo} disabled={history.length === 0}>
              <Undo2 className="h-3 w-3 ml-1" /> تراجع
            </Button>
            <p className="text-[10px] text-muted-foreground">اسحب للتحديد ثم اضغط تطبيق</p>
          </div>
          <div className="flex items-center gap-1.5">
            <Button size="sm" variant="outline" className="h-7 text-[10px] px-2" onClick={onClose}>
              <X className="h-3 w-3 ml-1" /> إلغاء
            </Button>
            <Button size="sm" variant="outline" className="h-7 text-[10px] px-2" onClick={handleApply} disabled={!start || !end}>
              <Scissors className="h-3 w-3 ml-1" /> تطبيق
            </Button>
            <Button size="sm" className="h-7 text-[10px] px-2" onClick={exportImage}>
              <Download className="h-3 w-3 ml-1" /> حفظ
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
