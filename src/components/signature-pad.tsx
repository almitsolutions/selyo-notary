"use client";

import { useEffect, useRef, useState } from "react";
import { Eraser } from "lucide-react";
import { Button, Checkbox, Input, Modal, Segmented } from "@/components/ui";
import type { Signer } from "@/lib/types";

export function SignatureModal({
  open,
  onClose,
  name,
  onSign,
}: {
  open: boolean;
  onClose: () => void;
  name: string;
  onSign: (sig: NonNullable<Signer["signature"]>) => void;
}) {
  const [mode, setMode] = useState<"draw" | "type">("draw");
  const [typed, setTyped] = useState(name);
  const [agree, setAgree] = useState(false);
  const [hasInk, setHasInk] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  useEffect(() => {
    if (!open || mode !== "draw") return;
    const c = canvasRef.current;
    if (!c) return;
    const ratio = window.devicePixelRatio || 1;
    const rect = c.getBoundingClientRect();
    c.width = rect.width * ratio;
    c.height = rect.height * ratio;
    const ctx = c.getContext("2d")!;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#0e3558";
    setHasInk(false);
  }, [open, mode]);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const clear = () => {
    const c = canvasRef.current;
    if (!c) return;
    c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
    setHasInk(false);
  };

  const submit = () => {
    if (mode === "draw") {
      onSign({ kind: "drawn", value: canvasRef.current!.toDataURL("image/png") });
    } else {
      onSign({ kind: "typed", value: typed.trim() });
    }
  };

  const ready = agree && (mode === "draw" ? hasInk : typed.trim().length > 1);

  return (
    <Modal open={open} onClose={onClose} title="Add your signature">
      <Segmented
        value={mode}
        onChange={setMode}
        className="w-full [&>button]:flex-1 [&>button]:justify-center"
        options={[
          { value: "draw", label: "Draw" },
          { value: "type", label: "Type" },
        ]}
      />
      {mode === "draw" ? (
        <div className="relative mt-4">
          <canvas
            ref={canvasRef}
            className="h-44 w-full touch-none rounded-[8px] border border-line-strong bg-bg"
            onPointerDown={(e) => {
              drawing.current = true;
              e.currentTarget.setPointerCapture(e.pointerId);
              const ctx = e.currentTarget.getContext("2d")!;
              const p = pos(e);
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
            }}
            onPointerMove={(e) => {
              if (!drawing.current) return;
              const ctx = e.currentTarget.getContext("2d")!;
              const p = pos(e);
              ctx.lineTo(p.x, p.y);
              ctx.stroke();
              setHasInk(true);
            }}
            onPointerUp={() => (drawing.current = false)}
            onPointerLeave={() => (drawing.current = false)}
          />
          {!hasInk && <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-[14px] text-soft">Sign here with your finger or mouse</p>}
          <div className="pointer-events-none absolute right-6 bottom-10 left-6 border-b border-dashed border-line-strong" />
          <button onClick={clear} className="absolute top-2 right-2 flex items-center gap-1 rounded bg-surface px-2 py-1 text-[12px] text-muted shadow-sm">
            <Eraser className="size-3.5" /> Clear
          </button>
        </div>
      ) : (
        <div className="mt-4">
          <Input value={typed} onChange={(e) => setTyped(e.target.value)} />
          <div className="mt-3 flex h-28 items-center justify-center rounded-[8px] border border-line-strong bg-bg">
            <span className="font-script text-[38px] text-primary">{typed || " "}</span>
          </div>
        </div>
      )}
      <div className="mt-4">
        <Checkbox checked={agree} onChange={setAgree}>
          I agree this is my electronic signature and has the same legal effect as my handwritten signature (RA 8792).
        </Checkbox>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <Button variant="secondary" size="lg" onClick={onClose}>
          Cancel
        </Button>
        <Button size="lg" disabled={!ready} onClick={submit}>
          Sign document
        </Button>
      </div>
    </Modal>
  );
}
