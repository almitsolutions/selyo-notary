"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function FaqList({ items, defaultOpen = 0 }: { items: { q: string; a: string }[]; defaultOpen?: number | null }) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  return (
    <div className="border-t border-line">
      {items.map((f, i) => (
        <div key={f.q} className="border-b border-line">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-start justify-between gap-6 py-5 text-left text-[16.5px] text-ink sm:text-[18px]"
            aria-expanded={open === i}
          >
            {f.q}
            <Plus className={cn("mt-1 size-4 shrink-0 text-muted transition-transform", open === i && "rotate-45")} />
          </button>
          {open === i && <p className="animate-fade-up -mt-1 max-w-3xl pb-6 text-[15px] leading-relaxed text-body">{f.a}</p>}
        </div>
      ))}
    </div>
  );
}
