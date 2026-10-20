"use client";

import { useState } from "react";
import { CheckCircle2, Coins } from "lucide-react";
import { Button, Card, Modal, Spinner } from "@/components/ui";
import { PageHeader, pageWrap } from "@/components/app-shell";
import { PaymentMethods, type PayMethod } from "@/components/payment-methods";
import { useApp } from "@/lib/store";
import { creditPackages } from "@/lib/mock/content";
import { cn, peso, pesoExact, sleep } from "@/lib/utils";
import type { CreditPackage } from "@/lib/types";

export default function CreditsPage() {
  const credits = useApp((s) => s.credits);
  const buy = useApp((s) => s.buyCredits);
  const used = useApp((s) => s.notarizations.filter((n) => n.status === "notarized").length);
  const [pkg, setPkg] = useState<CreditPackage | null>(null);
  const [method, setMethod] = useState<PayMethod>("gcash");
  const [stage, setStage] = useState<"pay" | "busy" | "done">("pay");

  return (
    <div className={pageWrap}>
      <PageHeader eyebrow="Billing" title="Credits" subtitle="One credit = one notarized document. No subscription." />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="brush rounded-[12px] p-6 text-white">
          <Coins className="size-5 text-white/80" />
          <p className="mt-6 text-[48px] leading-none tracking-tight">{credits}</p>
          <p className="mt-2 text-[14px] text-white/80">credits available</p>
          {credits < 10 && <p className="mt-3 inline-block rounded bg-white/15 px-2 py-1 text-[12.5px]">Running low — top up to keep accepting sessions</p>}
        </div>
        <Card className="p-6">
          <p className="mono-label">Usage</p>
          <p className="mt-4 text-[32px] leading-none text-ink">{used}</p>
          <p className="mt-1.5 text-[14px] text-muted">documents notarized</p>
          <p className="mt-4 text-[13px] text-muted">Each credit covers the seal, fingerprint, 10-year storage, and register entry.</p>
        </Card>
      </div>

      <h2 className="mt-10 mb-4 text-[18px] font-medium">Buy credits</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {creditPackages.map((c) => (
          <button key={c.id} onClick={() => { setPkg(c); setStage("pay"); }} className={cn("rounded-[10px] border bg-surface p-5 text-left transition hover:border-primary", c.popular ? "border-primary" : "border-line")}>
            <div className="flex items-center justify-between">
              <p className="mono-label">{c.credits} credits</p>
              {c.popular && <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] text-primary-fg">Popular</span>}
            </div>
            <p className="mt-4 text-[30px] leading-none tracking-tight text-ink">{peso(c.price)}</p>
            <p className="mt-1.5 text-[13px] text-muted">{peso(Math.round(c.price / c.credits))}/document + 12% VAT</p>
          </button>
        ))}
      </div>

      <Modal open={!!pkg} onClose={() => setPkg(null)} title={stage === "done" ? undefined : `Buy ${pkg?.credits} credits`}>
        {pkg && stage === "done" ? (
          <div className="py-4 text-center">
            <CheckCircle2 className="mx-auto size-10 text-success" />
            <p className="mt-3 text-[20px] text-ink">{pkg.credits} credits added</p>
            <p className="mt-1 text-[14px] text-muted">New balance: {credits}</p>
            <Button className="mt-5 w-full" onClick={() => setPkg(null)}>Done</Button>
          </div>
        ) : pkg ? (
          <>
            <div className="space-y-1.5 rounded-[8px] bg-surface-2 p-4 text-[14px]">
              <div className="flex justify-between"><span>{pkg.credits} credits</span><span className="text-ink">{pesoExact(pkg.price)}</span></div>
              <div className="flex justify-between"><span>VAT (12%)</span><span className="text-ink">{pesoExact(pkg.price * 0.12)}</span></div>
              <div className="flex justify-between border-t border-line pt-1.5 text-[16px]"><span className="text-ink">Total</span><span className="text-ink">{pesoExact(pkg.price * 1.12)}</span></div>
            </div>
            <div className="mt-4"><PaymentMethods value={method} onChange={setMethod} /></div>
            <Button size="lg" className="mt-5 w-full" disabled={stage === "busy"} onClick={async () => { setStage("busy"); await sleep(1400); buy(pkg.credits); setStage("done"); }}>
              {stage === "busy" ? <Spinner /> : `Pay ${pesoExact(pkg.price * 1.12)}`}
            </Button>
          </>
        ) : null}
      </Modal>
    </div>
  );
}
