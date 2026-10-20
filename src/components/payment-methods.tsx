"use client";

import { CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

export type PayMethod = "gcash" | "maya" | "card";

const methods: { v: PayMethod; label: string; sub: string; badge: React.ReactNode }[] = [
  { v: "gcash", label: "GCash", sub: "Pay with your GCash wallet", badge: <span className="flex size-8 items-center justify-center rounded-[6px] bg-[#007dfe] text-[13px] font-bold text-white">G</span> },
  { v: "maya", label: "Maya", sub: "Pay with your Maya wallet", badge: <span className="flex size-8 items-center justify-center rounded-[6px] bg-[#00b464] text-[13px] font-bold text-white">M</span> },
  { v: "card", label: "Credit / debit card", sub: "Visa, Mastercard, JCB", badge: <span className="flex size-8 items-center justify-center rounded-[6px] bg-ink text-white"><CreditCard className="size-4" /></span> },
];

export function PaymentMethods({ value, onChange, compact }: { value: PayMethod; onChange: (v: PayMethod) => void; compact?: boolean }) {
  return (
    <div className={cn("grid gap-2", compact ? "grid-cols-3" : "")}>
      {methods.map((m) => (
        <button
          key={m.v}
          type="button"
          onClick={() => onChange(m.v)}
          className={cn(
            "flex items-center gap-3 rounded-[8px] border bg-surface text-left transition",
            compact ? "flex-col justify-center gap-1.5 p-2.5 text-center" : "p-3.5",
            value === m.v ? "border-primary ring-1 ring-primary" : "border-line hover:border-line-strong",
          )}
        >
          {m.badge}
          <span>
            <span className={cn("block text-ink", compact ? "text-[12.5px]" : "text-[15px] font-medium")}>{compact && m.v === "card" ? "Card" : m.label}</span>
            {!compact && <span className="block text-[13px] text-muted">{m.sub}</span>}
          </span>
        </button>
      ))}
    </div>
  );
}
