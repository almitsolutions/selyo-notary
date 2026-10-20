"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bot,
  Check,
  CheckCircle2,
  Circle,
  FileText,
  Loader2,
  MapPin,
  MessageSquare,
  Mic,
  MicOff,
  PhoneOff,
  ShieldCheck,
  Stamp,
  Video,
  VideoOff,
  Wallet,
} from "lucide-react";
import { Avatar, Button, Modal, NzStatus, Spinner } from "@/components/ui";
import { CameraView } from "@/components/camera";
import { DocumentPaper } from "@/components/document-paper";
import { DownloadNotarizedButton, MessageThread } from "@/components/notarization-parts";
import { useApp } from "@/lib/store";
import { findNotary } from "@/lib/mock/notaries";
import { cn, peso, sleep } from "@/lib/utils";
import type { Notarization } from "@/lib/types";

type Side = "principal" | "notary";

export function SessionRoom({ id, as }: { id: string; as: Side }) {
  const n = useApp((s) => s.notarizations.find((x) => x.id === id));
  const [joined, setJoined] = useState(false);
  if (!n) return <div className="flex min-h-dvh items-center justify-center bg-night text-white/70">Session not found.</div>;
  return joined ? <Room n={n} as={as} /> : <Lobby n={n} as={as} onJoin={() => setJoined(true)} />;
}

/* ---------------- Lobby: device + location check ---------------- */

function Lobby({ n, as, onJoin }: { n: Notarization; as: Side; onJoin: () => void }) {
  const [loc, setLoc] = useState<"checking" | "ok">("checking");
  const notary = findNotary(n.notaryId)!;
  useEffect(() => {
    const t = setTimeout(() => setLoc("ok"), 1800);
    return () => clearTimeout(t);
  }, []);
  const back = as === "notary" ? `/notary/appointments/${n.id}` : `/app/notarizations/${n.id}`;
  const blocked = n.status === "awaiting_review" || n.status === "declined" || n.status === "cancelled";

  return (
    <div className="min-h-dvh bg-night text-white">
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-8 lg:grid-cols-[1.3fr_1fr] lg:items-center lg:py-16">
        <CameraView className="aspect-video w-full rounded-[14px]">
          <span className="absolute bottom-3 left-3 rounded bg-black/50 px-2 py-1 text-[12px]">You</span>
        </CameraView>
        <div>
          <p className="font-mono text-[11px] tracking-[0.14em] text-white/60">{as === "notary" ? "HOSTING" : "JOINING"} · {n.act.toUpperCase()}</p>
          <h1 className="mt-2 text-[26px] leading-tight font-normal !text-white">{n.documentTitle}</h1>
          <p className="mt-2 text-[14px] text-white/70">
            {as === "notary" ? `Principal: ${n.principalName}` : `with ${notary.name}`}
          </p>
          <ul className="mt-6 space-y-3 text-[14px]">
            <li className="flex items-center gap-2.5"><Check className="size-4 text-success" /> Camera and microphone ready</li>
            <li className="flex items-center gap-2.5"><Check className="size-4 text-success" /> Connection 12.4 Mbps (2 Mbps needed)</li>
            <li className="flex items-center gap-2.5">
              {loc === "checking" ? <Loader2 className="size-4 animate-spin text-accent" /> : <Check className="size-4 text-success" />}
              {loc === "checking" ? "Checking location…" : as === "notary" ? "Location: Philippines · no VPN, proxy, or Tor" : "Location verified · no VPN, proxy, or Tor"}
            </li>
          </ul>
          {blocked ? (
            <p className="mt-8 rounded-[8px] bg-white/10 p-4 text-[14px] text-white/80">This appointment isn&apos;t confirmed yet, so the session can&apos;t start.</p>
          ) : (
            <Button size="lg" className="mt-8 w-full bg-white text-primary hover:bg-white/90" disabled={loc !== "ok"} onClick={onJoin}>
              {as === "notary" ? "Start session" : "Join session"}
            </Button>
          )}
          <Link href={back} className="mt-4 block text-center text-[14px] text-white/60 hover:text-white">Back</Link>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Room ---------------- */

function Room({ n, as }: { n: Notarization; as: Side }) {
  const router = useRouter();
  const update = useApp((s) => s.updateSession);
  const startSession = useApp((s) => s.startSession);
  const notary = findNotary(n.notaryId)!;
  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(true);
  const [panel, setPanel] = useState<"steps" | "doc" | "chat">("steps");
  const [sheet, setSheet] = useState(false);

  useEffect(() => {
    if (as === "principal" && !n.session.principalJoined) update(n.id, { principalJoined: true }, "Principal joined the session");
    if (as === "notary" && !n.session.notaryJoined) {
      update(n.id, { notaryJoined: true }, "Notary joined the session");
      startSession(n.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const otherJoined = as === "principal" ? n.session.notaryJoined : n.session.principalJoined;
  const otherName = as === "principal" ? notary.name : n.principalName;
  const leave = () => router.push(as === "notary" ? `/notary/appointments/${n.id}` : `/app/notarizations/${n.id}`);

  const panelBody =
    panel === "steps" ? (
      as === "notary" ? <NotaryControls n={n} /> : <PrincipalChecklist n={n} />
    ) : panel === "doc" ? (
      <DocPanel n={n} />
    ) : (
      <MessageThread n={n} as={as} className="h-full" />
    );

  return (
    <div className="flex h-dvh flex-col bg-night text-white">
      {/* Top bar */}
      <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
        <span className="flex items-center gap-1.5 rounded-full bg-danger/90 px-2 py-0.5 text-[11px] font-medium">
          <span className="size-1.5 animate-pulse rounded-full bg-white" /> LIVE
        </span>
        <p className="min-w-0 flex-1 truncate text-[14px]">{n.documentTitle}</p>
        {n.session.consent && <span className="hidden items-center gap-1 text-[12px] text-white/70 sm:flex"><Circle className="size-2.5 fill-danger text-danger" /> Recording</span>}
        <NzStatus status={n.status} />
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Stage */}
        <div className="relative flex min-w-0 flex-1 flex-col p-3 sm:p-4">
          <div className="relative flex flex-1 items-center justify-center overflow-hidden rounded-[14px] bg-[#132a45]">
            {otherJoined ? (
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <span className="absolute inset-0 animate-ping rounded-full bg-accent/20" />
                  <Avatar name={otherName} size={110} className="relative bg-accent-soft!" />
                </div>
                <p className="text-[15px] text-white/90">{otherName}</p>
                <p className="text-[12px] text-white/50">{as === "principal" ? "Electronic Notary Public" : "Principal"} · camera simulated in demo</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 px-6 text-center text-white/70">
                <Loader2 className="size-7 animate-spin" />
                <p>Waiting for {otherName} to join…</p>
                {as === "principal" && <p className="text-[12.5px] text-white/50">Use “Demo autopilot” in the panel to play the notary&apos;s part.</p>}
              </div>
            )}
            <span className="absolute bottom-3 left-3 rounded bg-black/50 px-2 py-1 text-[12px]">{otherName}</span>
            {/* Self view */}
            <div className="absolute top-3 right-3 w-28 overflow-hidden rounded-[10px] ring-2 ring-white/20 sm:w-44">
              {cam ? (
                <CameraView className="aspect-[3/4] sm:aspect-video" />
              ) : (
                <div className="flex aspect-[3/4] items-center justify-center bg-[#1b3757] sm:aspect-video"><VideoOff className="size-5 text-white/60" /></div>
              )}
              <span className="absolute bottom-1 left-1 rounded bg-black/50 px-1.5 text-[10.5px]">You</span>
            </div>
            {(n.status === "sealing" || n.status === "notarized") && <SealOverlay n={n} as={as} />}
          </div>

          {as === "principal" && n.status === "pending_payment" && (
            <Link href={`/app/pay/${n.id}`} className="animate-fade-up mt-3 flex items-center gap-3 rounded-[10px] bg-warning-soft px-4 py-3 text-ink">
              <Wallet className="size-5 shrink-0 text-warning" />
              <span className="flex-1 text-[14px]">The notary requested payment of {peso(n.fee)}</span>
              <span className="rounded-[4px] bg-primary px-3 py-1.5 text-[13px] text-primary-fg">Pay now</span>
            </Link>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-2 pt-3 sm:gap-3">
            <RoundBtn on={mic} onClick={() => setMic(!mic)} label="Mic">{mic ? <Mic className="size-5" /> : <MicOff className="size-5" />}</RoundBtn>
            <RoundBtn on={cam} onClick={() => setCam(!cam)} label="Camera">{cam ? <Video className="size-5" /> : <VideoOff className="size-5" />}</RoundBtn>
            <RoundBtn on onClick={() => { setPanel("doc"); setSheet(true); }} label="Document" className="lg:hidden"><FileText className="size-5" /></RoundBtn>
            <RoundBtn on onClick={() => { setPanel("chat"); setSheet(true); }} label="Chat" className="lg:hidden"><MessageSquare className="size-5" /></RoundBtn>
            <button onClick={leave} className="flex h-12 items-center gap-2 rounded-full bg-danger px-5 text-[14px] font-medium hover:bg-danger/90">
              <PhoneOff className="size-5" /> <span className="hidden sm:inline">Leave</span>
            </button>
          </div>
          {/* Mobile: step panel button */}
          <button onClick={() => { setPanel("steps"); setSheet(true); }} className="mt-3 flex items-center justify-between rounded-[10px] bg-white/10 px-4 py-3 text-left text-[14px] lg:hidden">
            <span>{as === "notary" ? "Session checklist & actions" : "Session progress"}</span>
            <span className="text-white/60">{stepCount(n)}/6</span>
          </button>
        </div>

        {/* Desktop side panel */}
        <aside className="hidden w-[380px] shrink-0 flex-col border-l border-white/10 bg-surface text-body lg:flex">
          <div className="flex gap-1 border-b border-line p-2">
            {([["steps", as === "notary" ? "Checklist" : "Progress"], ["doc", "Document"], ["chat", "Chat"]] as const).map(([k, l]) => (
              <button key={k} onClick={() => setPanel(k)} className={cn("flex-1 rounded-[6px] py-2 text-[13.5px]", panel === k ? "bg-accent-soft text-primary" : "text-muted hover:bg-surface-2")}>{l}</button>
            ))}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">{panelBody}</div>
        </aside>
      </div>

      {/* Mobile bottom sheet */}
      <div className={cn("fixed inset-0 z-40 lg:hidden", !sheet && "pointer-events-none")}>
        <div className={cn("absolute inset-0 bg-black/50 transition-opacity", sheet ? "opacity-100" : "opacity-0")} onClick={() => setSheet(false)} />
        <div className={cn("absolute inset-x-0 bottom-0 flex max-h-[80dvh] flex-col rounded-t-[16px] bg-surface text-body transition-transform", sheet ? "translate-y-0" : "translate-y-full")}>
          <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-line-strong" />
          <div className="flex gap-1 border-b border-line p-2">
            {([["steps", as === "notary" ? "Checklist" : "Progress"], ["doc", "Document"], ["chat", "Chat"]] as const).map(([k, l]) => (
              <button key={k} onClick={() => setPanel(k)} className={cn("flex-1 rounded-[6px] py-2 text-[13.5px]", panel === k ? "bg-accent-soft text-primary" : "text-muted")}>{l}</button>
            ))}
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto pb-[env(safe-area-inset-bottom)]">{panelBody}</div>
        </div>
      </div>

      {as === "principal" && <ConsentPrompt n={n} />}
    </div>
  );
}

function RoundBtn({ on, onClick, label, children, className }: { on: boolean; onClick: () => void; label: string; children: React.ReactNode; className?: string }) {
  return (
    <button onClick={onClick} aria-label={label} className={cn("flex size-12 items-center justify-center rounded-full transition", on ? "bg-white/12 hover:bg-white/20" : "bg-white text-night", className)}>
      {children}
    </button>
  );
}

function stepCount(n: Notarization) {
  const s = n.session;
  return [s.identity, s.location, s.consent, s.actConfirmed, n.payment.status === "paid", n.status === "notarized"].filter(Boolean).length;
}

/* ---------------- Principal side ---------------- */

function PrincipalChecklist({ n }: { n: Notarization }) {
  const s = n.session;
  // Remembered per tab so autopilot resumes after the principal leaves to pay.
  const key = `autopilot:${n.id}`;
  const [auto, setAutoState] = useState(() => {
    try {
      return sessionStorage.getItem(key) === "1";
    } catch {
      return false;
    }
  });
  const setAuto = (v: boolean) => {
    setAutoState(v);
    try {
      sessionStorage.setItem(key, v ? "1" : "0");
    } catch {}
  };
  useAutopilot(n, auto);

  const items = [
    { t: "Identity verified", d: "The notary checks your verified ID", done: s.identity },
    { t: "Location verified", d: "You're connected without VPN or proxy", done: s.location },
    { t: "Recording consent", d: s.consentRequested && !s.consent ? "Waiting for your answer" : "Asked before recording starts", done: s.consent },
    { t: "Notarial act confirmed", d: `${n.act} — the notary confirms you sign freely`, done: s.actConfirmed },
    { t: "Payment", d: n.payment.status === "paid" ? `Paid · ${n.payment.reference}` : n.status === "pending_payment" ? `${peso(n.fee)} requested` : "Requested by the notary", done: n.payment.status === "paid" },
    { t: "Sealed & notarized", d: "Seal, certificate, and register entry", done: n.status === "notarized" },
  ];
  const current = items.findIndex((i) => !i.done);

  return (
    <div className="p-4">
      <ol className="space-y-1">
        {items.map((i, idx) => (
          <li key={i.t} className={cn("flex gap-3 rounded-[8px] p-2.5", idx === current && "bg-accent-soft/60")}>
            <span className={cn("mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full", i.done ? "bg-success-soft text-success" : idx === current ? "bg-surface text-accent" : "bg-surface-2 text-muted")}>
              {i.done ? <Check className="size-3.5" /> : idx === current ? <Loader2 className="size-3.5 animate-spin" /> : <span className="text-[11px]">{idx + 1}</span>}
            </span>
            <div>
              <p className={cn("text-[14px]", i.done || idx === current ? "text-ink" : "text-muted")}>{i.t}</p>
              <p className="font-mono text-[11px] text-muted">{i.d}</p>
            </div>
          </li>
        ))}
      </ol>
      {n.status === "pending_payment" && (
        <Link href={`/app/pay/${n.id}`} className="mt-4 flex items-center justify-center gap-2 rounded-[6px] bg-primary py-3 text-[14.5px] text-primary-fg">
          <Wallet className="size-4" /> Pay {peso(n.fee)} now
        </Link>
      )}
      {n.status !== "notarized" && (
        <div className="mt-5 rounded-[8px] border border-dashed border-line-strong p-3">
          <p className="mono-label flex items-center gap-1.5 !text-primary"><Bot className="size-3.5" /> Demo autopilot</p>
          <p className="mt-1 text-[12.5px] text-muted">Plays the notary&apos;s part so you can see the full flow alone. Or open the notary portal in another tab.</p>
          <Button size="sm" variant={auto ? "secondary" : "primary"} className="mt-2 w-full" onClick={() => setAuto(!auto)}>
            {auto ? "Stop autopilot" : "Start autopilot"}
          </Button>
        </div>
      )}
    </div>
  );
}

/** Simulates the notary's actions step by step. The principal still answers consent and pays. */
function useAutopilot(n: Notarization, on: boolean) {
  const update = useApp((s) => s.updateSession);
  const startSession = useApp((s) => s.startSession);
  const requestPayment = useApp((s) => s.requestPayment);
  const seal = useApp((s) => s.sealNotarization);
  const send = useApp((s) => s.sendMessage);
  const notary = findNotary(n.notaryId)!;
  const busy = useRef(false);

  useEffect(() => {
    if (!on || busy.current) return;
    const s = n.session;
    let action: (() => void) | null = null;
    if (!s.notaryJoined) action = () => { update(n.id, { notaryJoined: true }, "Notary joined the session"); startSession(n.id); };
    else if (!s.identity) action = () => update(n.id, { identity: true }, "Identity confirmed by notary");
    else if (!s.location) action = () => update(n.id, { location: true }, "Location verified");
    else if (!s.consentRequested) action = () => update(n.id, { consentRequested: true }, "Recording consent requested");
    else if (!s.consent) return; // waiting for the principal
    else if (!s.actConfirmed) action = () => { update(n.id, { actConfirmed: true }, `Notarial act confirmed: ${n.act}`); send(n.id, "notary", notary.name, "Thank you. I've confirmed the document and that you're signing voluntarily. Sending the payment link now."); };
    else if (n.payment.status === "unpaid") action = () => requestPayment(n.id);
    else if (n.payment.status === "requested") return; // waiting for payment
    else if (n.status !== "sealing" && n.status !== "notarized") action = () => seal(n.id);
    if (!action) return;
    busy.current = true;
    const t = setTimeout(() => { action!(); busy.current = false; }, 1600);
    return () => { clearTimeout(t); busy.current = false; };
  }, [on, n, update, startSession, requestPayment, seal, send, notary.name]);
}

function ConsentPrompt({ n }: { n: Notarization }) {
  const update = useApp((s) => s.updateSession);
  const open = n.session.consentRequested && !n.session.consent;
  return (
    <Modal open={open} onClose={() => {}} title="Recording consent">
      <p className="text-[14.5px]">The notary would like to record this session as part of the notarial record. The recording is stored securely and only shared as required by law.</p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <Button variant="secondary" size="lg" onClick={() => alert("In a real session the notary would continue without recording or end the session.")}>Decline</Button>
        <Button size="lg" onClick={() => update(n.id, { consent: true }, "All participants consented to recording")}>I consent</Button>
      </div>
    </Modal>
  );
}

/* ---------------- Notary side ---------------- */

function NotaryControls({ n }: { n: Notarization }) {
  const update = useApp((s) => s.updateSession);
  const requestPayment = useApp((s) => s.requestPayment);
  const pay = useApp((s) => s.payNotarization);
  const seal = useApp((s) => s.sealNotarization);
  const credits = useApp((s) => s.credits);
  const principalUser = useApp((s) => s.principal);
  const [busy, setBusy] = useState<string | null>(null);
  const s = n.session;
  const paid = n.payment.status === "paid";
  const idInfo = principalUser?.id === n.principalId && principalUser.kyc.idType ? principalUser.kyc.idType : "PhilSys National ID";

  const run = async (key: string, fn: () => void) => {
    setBusy(key);
    await sleep(900);
    fn();
    setBusy(null);
  };

  const rows: { key: string; t: string; d: string; done: boolean; enabled: boolean; action?: React.ReactNode }[] = [
    {
      key: "identity",
      t: "Identity",
      d: `${n.principalName} · ${idInfo} · face match 99.2%`,
      done: s.identity,
      enabled: s.principalJoined,
      action: <Button size="sm" onClick={() => run("identity", () => update(n.id, { identity: true }, "Identity confirmed by notary"))}>{busy === "identity" ? <Spinner /> : "Confirm identity"}</Button>,
    },
    {
      key: "location",
      t: "Location",
      d: "Notary in the Philippines · principal: no VPN, proxy, or Tor",
      done: s.location,
      enabled: s.identity,
      action: <Button size="sm" onClick={() => run("location", () => update(n.id, { location: true }, "Location verified"))}>{busy === "location" ? <Spinner /> : "Run location check"}</Button>,
    },
    {
      key: "consent",
      t: "Recording consent",
      d: s.consent ? "Every participant consented" : s.consentRequested ? "Waiting for the principal to answer…" : "Ask before recording",
      done: s.consent,
      enabled: s.location && !s.consentRequested,
      action: <Button size="sm" onClick={() => update(n.id, { consentRequested: true }, "Recording consent requested")}>Request consent</Button>,
    },
    {
      key: "act",
      t: "Notarial act",
      d: `${n.act} · ${peso(n.fee)} · ask if signing voluntarily`,
      done: s.actConfirmed,
      enabled: s.consent,
      action: <Button size="sm" onClick={() => run("act", () => update(n.id, { actConfirmed: true }, `Notarial act confirmed: ${n.act}`))}>{busy === "act" ? <Spinner /> : "Confirm act"}</Button>,
    },
    {
      key: "payment",
      t: "Payment",
      d: paid ? `Paid via ${n.payment.method?.toUpperCase()} · ${n.payment.reference}` : n.payment.status === "requested" ? "Link sent · waiting for payment" : `${peso(n.fee)} · GCash, Maya, card, or cash`,
      done: paid,
      enabled: s.actConfirmed && n.payment.status === "unpaid",
      action: (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => requestPayment(n.id)}>Request payment</Button>
          <Button size="sm" variant="secondary" onClick={() => pay(n.id, "cash")}>Cash</Button>
        </div>
      ),
    },
    {
      key: "seal",
      t: "Perform act & seal",
      d: credits > 0 ? `Uses 1 credit · ${credits} left` : "No credits left — buy more",
      done: n.status === "notarized",
      enabled: paid && s.actConfirmed && n.status !== "sealing" && n.status !== "notarized" && credits > 0,
      action: <Button size="sm" onClick={() => seal(n.id)}><Stamp className="size-4" /> Seal document</Button>,
    },
  ];
  const current = rows.findIndex((r) => !r.done);

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center gap-3 rounded-[8px] bg-surface-2 p-3">
        <Avatar name={n.principalName} size={34} />
        <div className="min-w-0 flex-1 text-[13px]">
          <p className="truncate text-ink">{n.principalName}</p>
          <p className="text-muted">{s.principalJoined ? <span className="text-success">● In session</span> : "Not joined yet"}</p>
        </div>
        <ShieldCheck className="size-4 text-success" />
      </div>
      {!s.principalJoined && (
        <div className="mb-3 rounded-[8px] border border-dashed border-line-strong p-3 text-[12.5px] text-muted">
          Waiting for the principal. Demo: open the client app in another tab and join, or{" "}
          <button className="text-primary underline" onClick={() => update(n.id, { principalJoined: true }, "Principal joined the session")}>simulate them joining</button>.
        </div>
      )}
      {s.consentRequested && !s.consent && (
        <div className="mb-3 rounded-[8px] border border-dashed border-line-strong p-3 text-[12.5px] text-muted">
          Waiting for consent.{" "}
          <button className="text-primary underline" onClick={() => update(n.id, { consent: true }, "All participants consented to recording")}>Simulate principal consenting</button>
        </div>
      )}
      {n.payment.status === "requested" && (
        <div className="mb-3 rounded-[8px] border border-dashed border-line-strong p-3 text-[12.5px] text-muted">
          Waiting for payment.{" "}
          <button className="text-primary underline" onClick={() => pay(n.id, "gcash")}>Simulate GCash payment</button>
        </div>
      )}
      <ol className="space-y-2">
        {rows.map((r, idx) => (
          <li key={r.key} className={cn("rounded-[8px] border p-3", idx === current ? "border-accent/40 bg-accent-soft/40" : "border-line")}>
            <div className="flex items-start gap-3">
              <span className={cn("mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full", r.done ? "bg-success-soft text-success" : "bg-surface-2 text-muted")}>
                {r.done ? <Check className="size-3.5" /> : <span className="text-[11px]">{idx + 1}</span>}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] text-ink">{r.t}</p>
                <p className="font-mono text-[11px] text-muted">{r.d}</p>
                {!r.done && r.enabled && idx === current && <div className="mt-2.5">{r.action}</div>}
              </div>
            </div>
          </li>
        ))}
      </ol>
      {credits === 0 && <Link href="/notary/credits" className="mt-3 block text-center text-[13px] text-primary underline">Buy credits</Link>}
    </div>
  );
}

/* ---------------- Shared ---------------- */

function DocPanel({ n }: { n: Notarization }) {
  const doc = useApp((s) => s.documents.find((d) => d.id === n.documentId));
  if (!doc) {
    return (
      <div className="p-4">
        <div className="rounded-[8px] border border-line bg-bg p-6 text-center text-[13.5px] text-muted">
          <FileText className="mx-auto mb-2 size-6" />
          {n.documentTitle}
          <p className="mt-1 text-[12px]">Shared by the principal (preview not in this demo browser)</p>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-surface-2 p-3">
      <DocumentPaper doc={doc} className="text-[11px] sm:text-[11px] sm:px-6 sm:py-6" />
    </div>
  );
}

function SealOverlay({ n, as }: { n: Notarization; as: Side }) {
  const sealing = n.status === "sealing";
  return (
    <div className="animate-fade-up absolute inset-0 flex flex-col items-center justify-center bg-night/85 p-6 text-center backdrop-blur-sm">
      {sealing ? (
        <>
          <div className="relative flex size-24 items-center justify-center">
            <span className="absolute inset-0 animate-spin rounded-full border-2 border-gold border-r-transparent" />
            <Stamp className="size-9 text-gold" />
          </div>
          <p className="mt-5 text-[20px]">Sealing document…</p>
          <p className="mt-1 text-[13px] text-white/60">Applying seal · recording fingerprint · register entry</p>
        </>
      ) : (
        <>
          <CheckCircle2 className="size-14 text-success" />
          <p className="mt-4 text-[24px]">Notarized</p>
          <p className="mt-1 font-mono text-[12px] text-white/60">
            Doc. No. {n.register?.docNo}; Page No. {n.register?.pageNo}; Book No. {n.register?.bookNo}; Series of {n.register?.series}
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            {as === "principal" && <DownloadNotarizedButton n={n} size="lg" className="bg-white text-primary hover:bg-white/90" />}
            <Link href={as === "notary" ? `/notary/appointments/${n.id}` : `/app/notarizations/${n.id}`} className="inline-flex h-12 items-center justify-center rounded-[4px] border border-white/40 px-5 text-[15px] hover:bg-white/10">
              {as === "notary" ? "Back to appointment" : "View details"}
            </Link>
          </div>
          <p className="mt-6 flex items-center gap-1.5 text-[12px] text-white/50"><MapPin className="size-3.5" /> Session ended · thread stays open for 24 hours</p>
        </>
      )}
    </div>
  );
}
