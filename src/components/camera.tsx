"use client";

import { useEffect, useRef, useState } from "react";
import { CameraOff } from "lucide-react";
import { cn } from "@/lib/utils";

/** Live camera preview. Falls back to a placeholder when permission is denied or no camera exists. */
export function CameraView({
  facing = "user",
  className,
  mirrored = true,
  enabled = true,
  children,
}: {
  facing?: "user" | "environment";
  className?: string;
  mirrored?: boolean;
  enabled?: boolean;
  children?: React.ReactNode;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<"loading" | "live" | "unavailable">("loading");

  useEffect(() => {
    if (!enabled) return;
    let stream: MediaStream | null = null;
    let cancelled = false;
    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error("no camera api");
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing }, audio: false });
        if (cancelled) return stream.getTracks().forEach((t) => t.stop());
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setState("live");
      } catch {
        if (!cancelled) setState("unavailable");
      }
    })();
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [facing, enabled]);

  return (
    <div className={cn("relative overflow-hidden bg-night", className)}>
      <video
        ref={videoRef}
        playsInline
        muted
        className={cn("absolute inset-0 size-full object-cover", mirrored && facing === "user" && "-scale-x-100", state !== "live" && "opacity-0")}
      />
      {state === "unavailable" && (
        <div className="brush-soft @container absolute inset-0 flex flex-col items-center justify-center gap-2 text-center text-white/70">
          <CameraOff className="size-6" />
          <p className="hidden px-6 text-[13px] @[220px]:block">Camera not available — demo will simulate the capture.</p>
        </div>
      )}
      {children}
    </div>
  );
}
