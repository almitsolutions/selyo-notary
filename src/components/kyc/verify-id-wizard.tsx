"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Check, CheckCircle2, CreditCard, IdCard, QrCode, ShieldCheck, Upload, X } from "lucide-react";
import { Button, Card, Checkbox, Field, Logo, Select, Spinner } from "@/components/ui";
import { CameraView } from "@/components/camera";
import { PaymentMethods, type PayMethod } from "@/components/payment-methods";
import { useApp } from "@/lib/store";
import { useStoreReady } from "@/components/store-hydrator";
import { idTypes, KYC_FEE } from "@/lib/mock/content";
import { cn, sleep } from "@/lib/utils";

const STEPS = ["Consent & fee", "Choose ID", "Scan ID", "Face scan", "Confirm"];

export function VerifyIdWizard() {
  const params = useSearchParams();
  const ready = useStoreReady();
  const principal = useApp((s) => s.principal);
  const signInPrincipal = useApp((s) => s.signInPrincipal);
  const completeKyc = useApp((s) => s.completeKyc);

  const [step, setStep] = useState(0);
  const [consent, setConsent] = useState(false);
  const [pay, setPay] = useState<PayMethod>("gcash");
  const [paid, setPaid] = useState(false);
  const [paying, setPaying] = useState(false);
  const [method, setMethod] = useState<"philsys" | "gov_id">("philsys");
  const [idType, setIdType] = useState(idTypes[0]);
  const [captured, setCaptured] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [face, setFace] = useState(0);
  const [faceRunning, setFaceRunning] = useState(false);
  const [done, setDone] = useState(false);

  const next = params.get("next") ?? "/app";

  // Demo convenience: arriving here signed-out signs you in as the demo principal.
  useEffect(() => {
    if (ready && !principal) signInPrincipal();
  }, [ready, principal, signInPrincipal]);

  useEffect(() => {
    if (!faceRunning) return;
    const t = setInterval(() => setFace((f) => Math.min(100, f + 4)), 110);
    return () => clearInterval(t);
  }, [faceRunning]);
  useEffect(() => {
    if (face >= 100 && faceRunning) {
      setFaceRunning(false);
      setTimeout(() => setStep(4), 500);
    }
  }, [face, faceRunning]);

  if (ready && principal?.kyc.status === "verified" && !done) {
    return (
      <Shell step={-1}>
        <Result title="You're already verified" body={`Your identity check is valid until ${new Date(principal.kyc.expiresAt!).toLocaleDateString("en-PH", { month: "long", year: "numeric" })}.`} href={next} />
      </Shell>
    );
  }

  if (done) {
    return (
      <Shell step={-1}>
        <Result title="Identity verified" body="You can now book notarizations. Your verification stays valid until your ID expires, up to 3 years." href={next} />
      </Shell>
    );
  }

  const facePrompt = face < 30 ? "Look straight at the camera" : face < 60 ? "Slowly turn your head left" : face < 90 ? "Now blink twice" : "Hold still…";

  return (
    <Shell step={step} onBack={step > 0 ? () => setStep(step - 1) : undefined}>
      {step === 0 && (
        <div className="animate-fade-up">
          <h1 className="text-[30px] leading-tight font-normal sm:text-[36px]">Verify your identity</h1>
          <p className="mt-3 text-[15px]">
            The law requires the notary to confirm who you are. You do this once — we check your ID against government records and
            match your face to it.
          </p>
          <Card className="mt-6 space-y-4 bg-surface-2/60 p-4">
            <div className="flex items-center justify-between">
              <span className="text-[14.5px] text-ink">Verification fee</span>
              <span className="text-[18px] text-ink">₱{KYC_FEE}.00</span>
            </div>
            {paid ? (
              <p className="flex items-center gap-2 rounded-[6px] bg-success-soft px-3 py-2.5 text-[14px] text-success">
                <Check className="size-4" /> Verification fee paid
              </p>
            ) : (
              <PaymentMethods value={pay} onChange={setPay} compact />
            )}
            <Checkbox checked={consent} onChange={setConsent}>
              I consent to the collection of my ID details and a scan of my face to verify my identity, as described in the{" "}
              <Link href="#" className="text-primary underline">privacy notice</Link>.
            </Checkbox>
          </Card>
          <Button
            size="lg"
            className="mt-6 w-full"
            disabled={!consent || paying}
            onClick={async () => {
              if (!paid) {
                setPaying(true);
                await sleep(1200);
                setPaying(false);
                setPaid(true);
              }
              setStep(1);
            }}
          >
            {paying ? <><Spinner /> Processing payment…</> : paid ? "Continue" : `Pay ₱${KYC_FEE} and continue`}
          </Button>
        </div>
      )}

      {step === 1 && (
        <div className="animate-fade-up">
          <h1 className="text-[30px] leading-tight font-normal">Which ID will you use?</h1>
          <div className="mt-6 space-y-3">
            {[
              { v: "philsys" as const, icon: QrCode, t: "PhilSys National ID", d: "Fastest — we read the QR code on the back and check it against the national registry." },
              { v: "gov_id" as const, icon: IdCard, t: "Another government ID", d: "Passport, driver's license, UMID, PRC ID, and others." },
            ].map((o) => (
              <button
                key={o.v}
                onClick={() => setMethod(o.v)}
                className={cn("flex w-full gap-4 rounded-[10px] border bg-surface p-4 text-left transition", method === o.v ? "border-primary ring-1 ring-primary" : "border-line hover:border-line-strong")}
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-primary">
                  <o.icon className="size-5" />
                </span>
                <span>
                  <span className="block font-medium text-ink">{o.t}</span>
                  <span className="mt-0.5 block text-[13.5px] text-muted">{o.d}</span>
                </span>
              </button>
            ))}
          </div>
          {method === "gov_id" && (
            <Field label="ID type" className="mt-5">
              <Select value={idType} onChange={(e) => setIdType(e.target.value)}>
                {idTypes.map((t) => <option key={t}>{t}</option>)}
              </Select>
            </Field>
          )}
          <Button size="lg" className="mt-6 w-full" onClick={() => { setCaptured(false); setStep(2); }}>
            Continue
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="animate-fade-up">
          <h1 className="text-[26px] leading-tight font-normal">{method === "philsys" ? "Scan the QR code on your National ID" : `Take a photo of your ${idType}`}</h1>
          <p className="mt-2 text-[14.5px] text-muted">Place it inside the frame, on a flat surface with good light.</p>
          <CameraView facing="environment" className="mt-5 aspect-[4/3] rounded-[12px]" enabled={!captured}>
            <div className="absolute inset-[12%_8%] rounded-[12px] border-2 border-white/90 shadow-[0_0_0_999px_rgb(11_26_46/0.45)]">
              {capturing && <div className="animate-scan absolute inset-x-2 h-0.5 bg-accent shadow-[0_0_12px_2px] shadow-accent" />}
              {method === "philsys" && !captured && <QrCode className="absolute top-1/2 left-1/2 size-12 -translate-1/2 text-white/40" />}
            </div>
            {captured && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-success/85 text-white">
                <CheckCircle2 className="size-10" />
                <p className="font-medium">{method === "philsys" ? "QR code read · registry match" : "ID captured · details extracted"}</p>
              </div>
            )}
          </CameraView>
          {!captured ? (
            <div className="mt-5 grid grid-cols-[1fr_auto] gap-3">
              <Button
                size="lg"
                disabled={capturing}
                onClick={async () => {
                  setCapturing(true);
                  await sleep(2000);
                  setCapturing(false);
                  setCaptured(true);
                }}
              >
                {capturing ? <><Spinner /> Reading…</> : method === "philsys" ? "Scan QR code" : "Capture"}
              </Button>
              <label className={cn("inline-flex h-12 cursor-pointer items-center gap-2 rounded-[4px] border border-line-strong bg-surface px-4 text-[14px] text-ink hover:bg-surface-2")}>
                <Upload className="size-4" /> Upload
                <input type="file" accept="image/*" className="sr-only" onChange={async () => { setCapturing(true); await sleep(1500); setCapturing(false); setCaptured(true); }} />
              </label>
            </div>
          ) : (
            <Button size="lg" className="mt-5 w-full" onClick={() => { setFace(0); setStep(3); }}>
              Continue to face scan
            </Button>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="animate-fade-up">
          <h1 className="text-[26px] leading-tight font-normal">Face scan</h1>
          <p className="mt-2 text-[14.5px] text-muted">We&apos;ll match your face to your ID photo. Remove glasses and hats.</p>
          <div className="relative mx-auto mt-6 aspect-square w-full max-w-[320px]">
            <CameraView facing="user" className="absolute inset-[6%] rounded-full" />
            <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
              <circle cx="50" cy="50" r="48" fill="none" stroke="var(--color-line)" strokeWidth="2" />
              <circle cx="50" cy="50" r="48" fill="none" stroke="var(--color-accent)" strokeWidth="2.5" strokeDasharray={`${(face / 100) * 301.6} 301.6`} strokeLinecap="round" className="transition-[stroke-dasharray]" />
            </svg>
          </div>
          <p className="mt-5 text-center text-[17px] text-ink">{faceRunning || face > 0 ? facePrompt : "Center your face in the circle"}</p>
          <Button size="lg" className="mt-5 w-full" disabled={faceRunning || face >= 100} onClick={() => setFaceRunning(true)}>
            {faceRunning ? <><Spinner /> Scanning… {face}%</> : "Start face scan"}
          </Button>
        </div>
      )}

      {step === 4 && (
        <ConfirmStep
          name={principal?.name ?? "Juan Dela Cruz"}
          idLabel={method === "philsys" ? "PhilSys National ID" : idType}
          onConfirm={async () => {
            await sleep(900);
            completeKyc(method, method === "philsys" ? "PhilSys National ID" : idType);
            setDone(true);
          }}
        />
      )}
    </Shell>
  );
}

function ConfirmStep({ name, idLabel, onConfirm }: { name: string; idLabel: string; onConfirm: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  return (
    <div className="animate-fade-up">
      <h1 className="text-[26px] leading-tight font-normal">Is this you?</h1>
      <p className="mt-2 text-[14.5px] text-muted">These details come from {idLabel === "PhilSys National ID" ? "the national registry" : "your ID"}. They&apos;ll appear on your notarial certificates.</p>
      <Card className="mt-5 divide-y divide-line">
        {[
          ["Full name", name.toUpperCase()],
          ["Date of birth", "March 14, 1990"],
          ["Sex", "Male"],
          ["Address", "123 Mabini St., Brgy. San Antonio, Makati City, Metro Manila"],
          ["ID used", idLabel],
          ["Face match", "99.2% · live person"],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 px-4 py-3 text-[14px]">
            <span className="text-muted">{k}</span>
            <span className="text-right text-ink">{v}</span>
          </div>
        ))}
      </Card>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Button variant="secondary" size="lg" onClick={() => history.back()}>
          <X className="size-4" /> Not me
        </Button>
        <Button
          size="lg"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            await onConfirm();
          }}
        >
          {busy ? <Spinner /> : <><Check className="size-4" /> Confirm</>}
        </Button>
      </div>
    </div>
  );
}

function Result({ title, body, href }: { title: string; body: string; href: string }) {
  return (
    <div className="animate-fade-up text-center">
      <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-success-soft text-success">
        <ShieldCheck className="size-8" />
      </span>
      <h1 className="mt-6 text-[30px] font-normal">{title}</h1>
      <p className="mt-3 text-[15px]">{body}</p>
      <Link href={href} className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-[4px] bg-primary text-[15px] font-medium text-primary-fg hover:bg-primary-hover">
        Continue
      </Link>
    </div>
  );
}

function Shell({ step, onBack, children }: { step: number; onBack?: () => void; children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex h-16 max-w-xl items-center justify-between px-4">
        {onBack ? (
          <button onClick={onBack} className="-ml-2 flex items-center gap-1 p-2 text-[14px] text-muted hover:text-ink">
            <ArrowLeft className="size-4" /> Back
          </button>
        ) : (
          <Link href="/">
            <Logo className="text-[19px]" />
          </Link>
        )}
        <Link href="/app" className="text-[14px] text-muted hover:text-ink">
          Do this later
        </Link>
      </header>
      {step >= 0 && (
        <div className="mx-auto max-w-xl px-4">
          <div className="flex gap-1.5">
            {STEPS.map((s, i) => (
              <span key={s} className={cn("h-1 flex-1 rounded-full", i <= step ? "bg-accent" : "bg-line")} />
            ))}
          </div>
          <p className="mono-label mt-3">
            Step {step + 1} of {STEPS.length} · {STEPS[step]}
          </p>
        </div>
      )}
      <main className="mx-auto max-w-xl px-4 pt-6 pb-16">{children}</main>
      <p className="mx-auto flex max-w-xl items-center justify-center gap-1.5 px-4 pb-8 text-[12.5px] text-muted">
        <CreditCard className="size-3.5" /> Demo — no real payment or biometric data is processed.
      </p>
    </div>
  );
}
