"use client";

import { Eraser, Undo2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SfButton } from "../ui/SfButton";
import { sfCn } from "../theme/cn";

type Props = {
  label: string;
  value?: string;
  onChange: (dataUrl: string | undefined) => void;
  disabled?: boolean;
  required?: boolean;
};

export function SignaturePad({ label, value, onChange, disabled, required }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const historyRef = useRef<ImageData[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  function snapshot() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    historyRef.current.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    if (historyRef.current.length > 20) historyRef.current.shift();
  }

  function start(e: React.PointerEvent<HTMLCanvasElement>) {
    if (disabled) return;
    snapshot();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    setDrawing(true);
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  }

  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing || disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  }

  function end() {
    if (!drawing) return;
    setDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) onChange(canvas.toDataURL("image/png"));
  }

  function clear() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    historyRef.current = [];
    onChange(undefined);
  }

  function undo() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !historyRef.current.length) return;
    const prev = historyRef.current.pop();
    if (prev) ctx.putImageData(prev, 0, 0);
    onChange(canvas.toDataURL("image/png"));
  }

  return (
    <fieldset className="space-y-2" disabled={disabled}>
      <legend className="text-sm font-medium text-[var(--sf-text)]">
        {label}
        {required ? <span className="text-[var(--sf-danger)]"> *</span> : null}
      </legend>
      <section
        className={sfCn(
          "sf-glass overflow-hidden rounded-[var(--sf-radius-lg)] border border-[var(--sf-border)] p-1 shadow-[var(--sf-shadow-md)]",
        )}
      >
        <canvas
          ref={canvasRef}
          width={480}
          height={140}
          className="w-full touch-none rounded-[var(--sf-radius-md)] bg-white/50"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerLeave={end}
        />
      </section>
      <footer className="flex gap-2">
        <SfButton type="button" variant="ghost" size="sm" onClick={undo} disabled={disabled}>
          <Undo2 className="h-4 w-4" />
          Undo
        </SfButton>
        <SfButton type="button" variant="ghost" size="sm" onClick={clear} disabled={disabled}>
          <Eraser className="h-4 w-4" />
          Clear
        </SfButton>
        {value ? (
          <span className="ml-auto self-center text-xs text-[var(--sf-success)]">Signed</span>
        ) : null}
      </footer>
    </fieldset>
  );
}
