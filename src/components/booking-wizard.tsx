"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, ArrowLeft, Check, FileText, Laptop, Plus, ScanFace, Trash2, Upload, Video } from "lucide-react";
import { Avatar, Button, Card, DocStatus, Field, Input, LinkButton, Spinner, Textarea } from "@/components/ui";
import { pageWrap } from "@/components/app-shell";
import { NotaryCard } from "@/components/notary-card";
import { useApp } from "@/lib/store";
import { findNotary, notaries } from "@/lib/mock/notaries";
import { notarialActs } from "@/lib/mock/content";
import type { AppearanceMode, NotarialAct } from "@/lib/types";
import { cn, fmtDate, peso, sleep } from "@/lib/utils";

const STEPS = ["Document", "Notarial act", "Notary", "Schedule", "Review"];

function slotsFor(day: Date, notaryId: string, minNoticeHours: number) {
  const out: { iso: string; label: string; disabled: boolean }[] = [];
  const earliest = Date.now() + minNoticeHours * 3600_000;
  for (let h = 9; h < 18; h++) {
    for (const m of [0, 30]) {
      const d = new Date(day);
      d.setHours(h, m, 0, 0);
      // Deterministic "already booked" slots so the grid looks lived-in.
      const taken = (d.getDate() * 7 + h * 3 + m + notaryId.charCodeAt(1)) % 5 === 0;
      out.push({
        iso: d.toISOString(),
        label: d.toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" }),
        disabled: taken || d.getTime() < earliest,
      });
    }
  }
  return out;
}

export function BookingWizard() {
  const router = useRouter();
  const params = useSearchParams();
  const principal = useApp((s) => s.principal)!;
  const documents = useApp((s) => s.documents).filter((d) => d.ownerId === principal.id && !d.notarizationId);
  const request = useApp((s) => s.requestNotarization);

  const presetNotary = params.get("notary");
  const [step, setStep] = useState(params.get("doc") ? 1 : 0);
  const [docId, setDocId] = useState(params.get("doc") ?? "");
  const [act, setAct] = useState<NotarialAct>("Acknowledgment");
  const [mode, setMode] = useState<AppearanceMode>("remote");
  const [notaryId, setNotaryId] = useState(presetNotary ?? "");
  const [dayIdx, setDayIdx] = useState(0);
  const [slot, setSlot] = useState("");
  const [witnesses, setWitnesses] = useState<{ name: string; email: string }[]>([]);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const doc = useApp((s) => s.documents.find((d) => d.id === docId));
  const notary = notaryId ? findNotary(notaryId) : undefined;
  const fee = notary?.services.find((s) => s.act === act)?.fee ?? 0;
  const days = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        d.setHours(0, 0, 0, 0);
        return d;
      }),
    [],
  );
  const slots = notary ? slotsFor(days[dayIdx], notary.id, notary.minNoticeHours) : [];
  const eligible = notaries.filter((n) => n.modes.includes(mode) && n.services.some((s) => s.act === act));

  if (principal.kyc.status !== "verified") {
    return (
      <div className={cn(pageWrap, "max-w-[640px]")}>
        <Card className="p-8 text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-accent-soft text-primary">
            <ScanFace className="size-6" />
          </span>
          <h1 className="mt-5 text-[26px] font-normal">Verify your identity first</h1>
          <p className="mt-2 text-[15px] text-muted">The notary must be able to confirm who you are. It takes about 3 minutes and you only do it once.</p>
          <LinkButton href={`/onboarding/verify-id?next=${encodeURIComponent("/app/notarizations/new" + (params.toString() ? `?${params}` : ""))}`} size="lg" className="mt-6">
            Verify my identity
          </LinkButton>
        </Card>
      </div>
    );
  }

  const canNext = [!!docId, !!act, !!notaryId && eligible.some((n) => n.id === notaryId), !!slot, true][step];

  const submit = async () => {
    setBusy(true);
    await sleep(800);
    const id = request({ documentId: docId, notaryId, act, mode, scheduledAt: slot, fee, witnesses: witnesses.filter((w) => w.name && w.email), notes: notes || undefined });
    router.push(`/app/notarizations/${id}?booked=1`);
  };

  return (
    <div className={cn(pageWrap, "max-w-[920px]")}>
      <div className="mb-6 flex items-center gap-3">
        {step > 0 ? (
          <button onClick={() => setStep(step - 1)} className="-ml-2 rounded p-2 text-muted hover:bg-surface-2" aria-label="Back">
            <ArrowLeft className="size-5" />
          </button>
        ) : (
          <Link href="/app/notarizations" className="-ml-2 rounded p-2 text-muted hover:bg-surface-2" aria-label="Back">
            <ArrowLeft className="size-5" />
          </Link>
        )}
        <div>
          <p className="mono-label !text-primary">Book a notarization · Step {step + 1} of 5</p>
          <h1 className="text-[24px] font-normal sm:text-[28px]">{["Which document?", "What do you need?", "Choose a notary", "Pick a time", "Review & request"][step]}</h1>
        </div>
      </div>
      <div className="mb-8 flex gap-1.5">
        {STEPS.map((s, i) => (
          <button key={s} disabled={i > step} onClick={() => setStep(i)} className="flex-1 text-left">
            <span className={cn("block h-1 rounded-full", i <= step ? "bg-accent" : "bg-line")} />
            <span className={cn("mt-1.5 hidden text-[12px] sm:block", i === step ? "text-ink" : "text-muted")}>{s}</span>
          </button>
        ))}
      </div>

      {step === 0 && (
        <div className="animate-fade-up space-y-3">
          {documents.map((d) => {
            const unsigned = d.status !== "completed";
            return (
              <button key={d.id} onClick={() => setDocId(d.id)} className={cn("flex w-full items-center gap-3 rounded-[10px] border bg-surface p-4 text-left transition", docId === d.id ? "border-primary ring-1 ring-primary" : "border-line hover:border-line-strong")}>
                <span className="flex size-10 shrink-0 items-center justify-center rounded-[6px] bg-danger-soft font-mono text-[10px] text-danger">PDF</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] text-ink">{d.title}</p>
                  <p className="text-[12.5px] text-muted">{d.type} · {fmtDate(d.updatedAt)}</p>
                  {unsigned && <p className="mt-1 flex items-center gap-1 text-[12.5px] text-warning"><AlertTriangle className="size-3.5" /> Not everyone has signed yet — they must before the session</p>}
                </div>
                <DocStatus status={d.status} />
              </button>
            );
          })}
          <Link href="/app/documents/new" className="flex items-center gap-3 rounded-[10px] border border-dashed border-line-strong p-4 text-[15px] text-primary hover:bg-surface">
            <span className="flex size-10 items-center justify-center rounded-[6px] bg-accent-soft"><Upload className="size-4" /></span>
            Upload a new document
          </Link>
          {!documents.length && <p className="text-[14px] text-muted">All your documents already have a notarization. Upload a new one to continue.</p>}
        </div>
      )}

      {step === 1 && (
        <div className="animate-fade-up">
          <p className="mb-3 text-[14px] font-medium text-ink">How will you appear?</p>
          <div className="grid grid-cols-2 gap-3">
            {([["remote", Video, "Remote", "Video call from anywhere"], ["in_person", Laptop, "In-person", "At the notary's office"]] as const).map(([v, I, t, d]) => (
              <button key={v} onClick={() => setMode(v)} className={cn("rounded-[10px] border bg-surface p-4 text-left", mode === v ? "border-primary ring-1 ring-primary" : "border-line")}>
                <I className="size-5 text-accent" />
                <p className="mt-3 text-[15px] text-ink">{t}</p>
                <p className="text-[13px] text-muted">{d}</p>
              </button>
            ))}
          </div>
          <p className="mt-8 mb-3 text-[14px] font-medium text-ink">Notarial act</p>
          <div className="space-y-2">
            {notarialActs.map((a) => (
              <button key={a.act} onClick={() => setAct(a.act)} className={cn("flex w-full items-start gap-3 rounded-[10px] border bg-surface p-4 text-left", act === a.act ? "border-primary ring-1 ring-primary" : "border-line")}>
                <span className={cn("mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border", act === a.act ? "border-primary bg-primary text-white" : "border-line-strong")}>
                  {act === a.act && <Check className="size-3" />}
                </span>
                <span>
                  <span className="block text-[15px] text-ink">{a.act}</span>
                  <span className="block text-[13px] text-muted">{a.description}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="animate-fade-up">
          <p className="mb-4 text-[14px] text-muted">{eligible.length} notaries offer {act} {mode === "remote" ? "remotely" : "in person"}. Fees shown are for {act}.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {eligible.map((n) => (
              <NotaryCard key={n.id} notary={n} feeFor={act} selected={notaryId === n.id} onSelect={() => { setNotaryId(n.id); setSlot(""); }} />
            ))}
          </div>
        </div>
      )}

      {step === 3 && notary && (
        <div className="animate-fade-up">
          <Card className="mb-5 flex items-center gap-3 p-3">
            <Avatar name={notary.name} color={notary.avatarColor} size={36} />
            <div className="flex-1">
              <p className="text-[14.5px] text-ink">{notary.name}</p>
              <p className="text-[12.5px] text-muted">Books at least {notary.minNoticeHours}h ahead · Philippine time</p>
            </div>
          </Card>
          <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
            {days.map((d, i) => (
              <button key={i} onClick={() => { setDayIdx(i); setSlot(""); }} className={cn("flex w-16 shrink-0 flex-col items-center rounded-[8px] border py-2.5", dayIdx === i ? "border-primary bg-primary text-primary-fg" : "border-line bg-surface text-ink")}>
                <span className={cn("text-[11px] uppercase", dayIdx === i ? "text-primary-fg/80" : "text-muted")}>{i === 0 ? "Today" : d.toLocaleDateString("en-PH", { weekday: "short" })}</span>
                <span className="text-[20px] leading-tight">{d.getDate()}</span>
                <span className={cn("text-[11px]", dayIdx === i ? "text-primary-fg/80" : "text-muted")}>{d.toLocaleDateString("en-PH", { month: "short" })}</span>
              </button>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {slots.map((s) => (
              <button
                key={s.iso}
                disabled={s.disabled}
                onClick={() => setSlot(s.iso)}
                className={cn("rounded-[6px] border py-2.5 text-[13.5px] transition", slot === s.iso ? "border-primary bg-primary text-primary-fg" : s.disabled ? "border-line bg-surface-2 text-soft line-through" : "border-line bg-surface text-ink hover:border-primary")}
              >
                {s.label}
              </button>
            ))}
          </div>
          {slots.every((s) => s.disabled) && <p className="mt-4 text-[14px] text-muted">No open slots this day — try another date.</p>}
        </div>
      )}

      {step === 4 && notary && doc && (
        <div className="animate-fade-up grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-5">
            <Card className="divide-y divide-line">
              {[
                ["Document", <span key="d" className="flex items-center gap-1.5"><FileText className="size-4 text-muted" />{doc.title}</span>],
                ["Notarial act", act],
                ["Appearance", mode === "remote" ? "Remote — video session" : "In-person"],
                ["Notary", notary.name],
                ["When", `${fmtDate(slot, { weekday: "long", month: "long", day: "numeric" })} · ${new Date(slot).toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" })}`],
              ].map(([k, v]) => (
                <div key={k as string} className="flex flex-col gap-0.5 px-4 py-3 text-[14px] sm:flex-row sm:justify-between sm:gap-4">
                  <span className="text-muted">{k}</span>
                  <span className="text-ink sm:text-right">{v}</span>
                </div>
              ))}
            </Card>

            <div>
              <p className="mb-1 text-[14px] font-medium text-ink">Witnesses <span className="font-normal text-muted">(optional)</span></p>
              <p className="mb-3 text-[13px] text-muted">Each witness needs their own verified account and joins the same session.</p>
              {witnesses.map((w, i) => (
                <div key={i} className="mb-2 grid grid-cols-[1fr_1fr_auto] gap-2">
                  <Input placeholder="Name" value={w.name} onChange={(e) => setWitnesses(witnesses.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
                  <Input placeholder="Email" type="email" value={w.email} onChange={(e) => setWitnesses(witnesses.map((x, j) => (j === i ? { ...x, email: e.target.value } : x)))} />
                  <Button variant="ghost" onClick={() => setWitnesses(witnesses.filter((_, j) => j !== i))} aria-label="Remove witness"><Trash2 className="size-4" /></Button>
                </div>
              ))}
              {witnesses.length < 2 && (
                <Button variant="secondary" size="sm" onClick={() => setWitnesses([...witnesses, { name: "", email: "" }])}>
                  <Plus className="size-4" /> Add witness
                </Button>
              )}
            </div>
            <Field label="Note to the notary (optional)">
              <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g., The buyer will join from Dubai." />
            </Field>
          </div>
          <aside>
            <Card className="p-5 lg:sticky lg:top-6">
              <p className="mono-label">Summary</p>
              <dl className="mt-3 space-y-2 text-[14px]">
                <div className="flex justify-between"><dt>{act}</dt><dd className="text-ink">{peso(fee)}</dd></div>
                <div className="flex justify-between"><dt>Identity verification</dt><dd className="text-success">Done</dd></div>
                <div className="flex justify-between border-t border-line pt-2 text-[16px]"><dt className="text-ink">Total</dt><dd className="text-ink">{peso(fee)}</dd></div>
              </dl>
              <p className="mt-3 text-[12.5px] text-muted">You pay during the session, after the notary confirms everything. Nothing is charged now.</p>
              <Button size="lg" className="mt-5 w-full" onClick={submit} disabled={busy}>
                {busy ? <Spinner /> : "Request appointment"}
              </Button>
            </Card>
          </aside>
        </div>
      )}

      {step < 4 && (
        <div className="sticky bottom-20 mt-8 flex justify-end rounded-[10px] border border-line bg-surface/95 p-3 backdrop-blur lg:bottom-4">
          <Button size="lg" className="w-full sm:w-auto" disabled={!canNext} onClick={() => setStep(step + 1)}>
            Continue
          </Button>
        </div>
      )}
    </div>
  );
}
