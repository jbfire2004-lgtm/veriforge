"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  onSign: (dataUrl: string) => void;
  label?: string;
};

export function SignaturePad({ onSign, label = "Sign below" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);

  function getCtx() {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext("2d");
  }

  function start(e: React.MouseEvent | React.TouchEvent) {
    setDrawing(true);
    const ctx = getCtx();
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0]!.clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0]!.clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    if (!drawing) return;
    const ctx = getCtx();
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0]!.clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0]!.clientY - rect.top : e.clientY - rect.top;
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#2A2E33";
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function end() {
    setDrawing(false);
  }

  function clear() {
    const canvas = canvasRef.current;
    const ctx = getCtx();
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function save() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onSign(canvas.toDataURL("image/png"));
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-[#64748b]">{label}</p>
      <canvas
        ref={canvasRef}
        width={400}
        height={120}
        className="w-full rounded-xl border border-[#2A2E33]/10 bg-white touch-none"
        onMouseDown={start}
        onMouseMove={draw}
        onMouseUp={end}
        onMouseLeave={end}
        onTouchStart={start}
        onTouchMove={draw}
        onTouchEnd={end}
      />
      <div className="flex gap-2">
        <Button type="button" size="sm" variant="outline" onClick={clear}>
          Clear
        </Button>
        <Button type="button" size="sm" onClick={save}>
          Apply signature
        </Button>
      </div>
    </div>
  );
}
