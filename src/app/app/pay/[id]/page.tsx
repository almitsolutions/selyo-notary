"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Lock, Smartphone } from "lucide-react";
import { Button, Card, Field, Input, LinkButton, Spinner } from "@/components/ui";
import { pageWrap } from "@/components/app-shell";
import { PaymentMethods, type PayMethod } from "@/components/payment-methods";
import { useApp } from "@/lib/store";
import { findNotary } from "@/lib/mock/notaries";
import { cn, pesoExact, sleep } from "@/lib/utils";

export default function PayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const n = useApp((s) => s.notarizations.find((x) => x.id === id));
  const pay = useApp((s) => s.payNotarization);
  const [method, setMethod] = useState<PayMethod>("gcash");
  const [stage, setStage] = useState<"choose" | "wallet" | "processing" | "done">("choose");

  if (!n) return null;
  const notary = findNotary(n.notaryId)!;

  if (n.payment.status === "paid" && stage !== "done") {
    return (
      <div className={cn(pageWrap, "max-w-[520px]")}>
        <Card className="p-8 text-center">
          <CheckCircle2 className="mx-auto size-10 text-success" />
          <p className="mt-4 text-[22px] text-ink">Already paid</p>
          <p className="mt-1 text-[14px] text-muted">Reference {n.payment.reference}</p>
          <LinkButton href={`/app/notarizations/${n.id}`} className="mt-6">Back to notarization</LinkButton>
        </Card>
      </div>
    );
  }

  const go = async () => {
    if (method !== "card" && stage === "choose") return setStage("wallet");
    setStage("processing");
    await sleep(1600);
    pay(n.id, method);
    setStage("done");
  };

  return (
    <div className={cn(pageWrap, "max-w-[520px]")}>
      {stage === "done" ? (
        <Card className="animate-fade-up p-8 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-success-soft text-success"><CheckCircle2 className="size-7" /></span>
          <p className="mt-5 text-[24px] text-ink">Payment successful</p>
          <p className="mt-1 text-[14.5px] text-muted">{pesoExact(n.fee)} paid to {notary.name}. The notary can now seal your document.</p>
          <div className="mt-6 grid gap-2">
            {n.mode === "remote" && <Button size="lg" onClick={() => router.push(`/session/${n.id}`)}>Return to session</Button>}
            <LinkButton href={`/app/notarizations/${n.id}`} variant="secondary" size="lg">View notarization</LinkButton>
          </div>
        </Card>
      ) : (
        <>
          <p className="mono-label !text-primary">Secure checkout</p>
          <h1 className="mt-1 text-[28px] font-normal">Pay your notary</h1>
          <Card className="mt-6 p-5">
            <div className="flex justify-between text-[14px]"><span className="text-muted">{n.act}</span><span className="text-ink">{pesoExact(n.fee)}</span></div>
            <div className="mt-1 flex justify-between text-[14px]"><span className="text-muted">Notary</span><span className="text-ink">{notary.name}</span></div>
            <div className="mt-4 flex justify-between border-t border-line pt-4 text-[18px]"><span className="text-ink">Total</span><span className="text-ink">{pesoExact(n.fee)}</span></div>
          </Card>

          {stage === "wallet" ? (
            <Card className="animate-fade-up mt-4 p-6 text-center">
              <span className={cn("mx-auto flex size-14 items-center justify-center rounded-[12px] text-[22px] font-bold text-white", method === "gcash" ? "bg-[#007dfe]" : "bg-[#00b464]")}>{method === "gcash" ? "G" : "M"}</span>
              <p className="mt-4 text-[17px] text-ink">Approve in your {method === "gcash" ? "GCash" : "Maya"} app</p>
              <p className="mt-1 flex items-center justify-center gap-1.5 text-[13.5px] text-muted"><Smartphone className="size-4" /> We sent a request to +63 917 ••• 4821</p>
              <Button size="lg" className="mt-6 w-full" onClick={go}>I&apos;ve approved it</Button>
              <button className="mt-3 text-[13.5px] text-muted underline" onClick={() => setStage("choose")}>Use another method</button>
            </Card>
          ) : (
            <>
              <p className="mt-6 mb-3 text-[14px] font-medium text-ink">Payment method</p>
              <PaymentMethods value={method} onChange={setMethod} />
              {method === "card" && (
                <div className="animate-fade-up mt-4 grid grid-cols-2 gap-3">
                  <Field label="Card number" className="col-span-2"><Input inputMode="numeric" placeholder="4242 4242 4242 4242" defaultValue="4242 4242 4242 4242" /></Field>
                  <Field label="Expiry"><Input placeholder="MM / YY" defaultValue="12 / 28" /></Field>
                  <Field label="CVC"><Input inputMode="numeric" placeholder="123" defaultValue="123" /></Field>
                </div>
              )}
              <Button size="lg" className="mt-6 w-full" onClick={go} disabled={stage === "processing"}>
                {stage === "processing" ? <><Spinner /> Processing…</> : `Pay ${pesoExact(n.fee)}`}
              </Button>
            </>
          )}
          <p className="mt-4 flex items-center justify-center gap-1.5 text-[12.5px] text-muted"><Lock className="size-3.5" /> Demo checkout — no money moves. Real build: PayMongo.</p>
        </>
      )}
    </div>
  );
}
