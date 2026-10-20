"use client";

import { useState } from "react";
import { Laptop, Video } from "lucide-react";
import { Button, Segmented } from "@/components/ui";
import { IdCheckMock, MockFrame, SessionMock, SigningMock } from "@/components/marketing/mocks";
import { cn } from "@/lib/utils";
import { KYC_FEE } from "@/lib/mock/content";

const steps = [
  {
    tab: "Verify your identity",
    body: `Create a free account and verify once. Scan the QR code on your PhilSys National ID, or take a photo of another government ID, then do a quick face scan. It costs ₱${KYC_FEE} and stays valid until your ID expires, up to 3 years.`,
    note: "Witnesses need their own account and verification, and join the same session.",
  },
  {
    tab: "Add your document",
    body: "Upload an unsigned PDF and add everyone who needs to sign, in order. Each signer gets a link and signs from their own device. Notarization only proceeds once every signer has signed.",
    note: "Already signed on paper? Upload a scan for Copy Certification instead.",
  },
  {
    tab: "Book a notary",
    body: "Choose a notary from the network, the notarial act you need, and a time. Your request shows as Awaiting review until the notary confirms. A message thread opens so you can ask questions before the session.",
    note: "You can reschedule until the notary's minimum notice period.",
  },
  {
    tab: "Appear on video",
    body: "Join a live audio-video session in your browser — Chrome, Safari, Edge, or Firefox, at 2 Mbps or faster. We check your location (no VPN or proxy), and the notary confirms your identity and that you're signing freely.",
    note: "Sessions are recorded only if the notary asks and everyone consents.",
  },
  {
    tab: "Pay and download",
    body: "The notary sends a payment link — pay with GCash, Maya, or card. They perform the notarial act, and your document moves from Sealing to Notarized. Download the PDF with its certificate page, seal, and QR code.",
    note: "Your entry appears in the notary's register, e.g. Doc. No. 124; Page No. 25; Book No. 3.",
  },
];

export function StepsWalkthrough() {
  const [i, setI] = useState(0);
  const s = steps[i];
  return (
    <div>
      <div className="scrollbar-none -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="relative flex min-w-[680px] justify-between">
          <div className="absolute top-[13px] right-[10%] left-[10%] h-px bg-line-strong" />
          {steps.map((st, idx) => (
            <button key={st.tab} onClick={() => setI(idx)} className="relative z-10 flex w-1/5 flex-col items-center gap-2">
              <span
                className={cn(
                  "flex size-7 items-center justify-center rounded-full border text-[12px] transition",
                  idx === i ? "border-primary bg-primary text-primary-fg ring-4 ring-accent-soft" : idx < i ? "border-accent bg-accent-soft text-primary" : "border-line-strong bg-bg text-muted",
                )}
              >
                {idx + 1}
              </span>
              <span className="mono-label">Step {idx + 1}</span>
              <span className={cn("text-center text-[14px]", idx === i ? "text-ink" : "text-muted")}>{st.tab}</span>
              <span className={cn("h-0.5 w-24 rounded", idx === i ? "bg-accent" : "bg-transparent")} />
            </button>
          ))}
        </div>
      </div>

      <div key={i} className="animate-fade-up mt-10 grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:items-center">
        <div>
          <p className="text-[88px] leading-none font-light tracking-tighter text-ink">0{i + 1}</p>
          <p className="mono-label mt-4">Step {i + 1} of 5</p>
          <h3 className="mt-2 text-[30px] font-normal sm:text-[36px]">{s.tab}</h3>
          <p className="mt-3 text-[16px] leading-relaxed">{s.body}</p>
          <div className="mt-6 flex gap-2">
            <Button variant="secondary" size="sm" disabled={i === 0} onClick={() => setI(i - 1)}>
              Previous
            </Button>
            <Button variant="secondary" size="sm" disabled={i === 4} onClick={() => setI(i + 1)}>
              Next step
            </Button>
          </div>
          <p className="mt-6 border-t border-line pt-5 text-[14px] text-muted">{s.note}</p>
        </div>
        <div className="brush flex min-h-[380px] items-center justify-center rounded-[14px] p-5 sm:p-10">
          {i === 0 && <IdCheckMock step={2} />}
          {i === 1 && <SigningMock />}
          {i === 2 && <BookingMock />}
          {i === 3 && <SessionMock />}
          {i === 4 && <DownloadMock />}
        </div>
      </div>
    </div>
  );
}

function BookingMock() {
  return (
    <MockFrame className="w-full max-w-[400px]">
      <div className="border-b border-line px-4 py-3">
        <p className="mono-label !text-primary">Appointment</p>
        <p className="font-medium text-ink">Atty. Maria Isabel Santos</p>
      </div>
      <div className="p-4">
        <p className="mono-label mb-2">Thu, Oct 23</p>
        <div className="grid grid-cols-3 gap-2">
          {["9:00 AM", "10:30 AM", "1:00 PM", "2:30 PM", "4:00 PM", "5:30 PM"].map((t, k) => (
            <span key={t} className={cn("rounded-[4px] border py-2 text-center text-[12.5px]", k === 3 ? "border-primary bg-primary text-primary-fg" : "border-line text-ink")}>
              {t}
            </span>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between rounded-[6px] bg-surface-2 px-3 py-2.5 text-[12.5px]">
          <span>Acknowledgment · Remote</span>
          <span className="font-medium text-ink">₱600.00</span>
        </div>
        <div className="mt-3 flex items-center gap-2 text-[12px] text-warning">
          <span className="size-1.5 rounded-full bg-warning" /> Awaiting review
        </div>
      </div>
    </MockFrame>
  );
}

function DownloadMock() {
  return (
    <MockFrame className="w-full max-w-[400px]">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <p className="font-medium text-ink">Affidavit of Loss</p>
        <span className="flex items-center gap-1.5 text-[12px] text-success">
          <span className="size-1.5 rounded-full bg-success" /> Notarized
        </span>
      </div>
      <div className="space-y-2 p-4 font-mono text-[11.5px] text-muted">
        <p>Doc. No. 124; Page No. 25; Book No. 3; Series of {new Date().getFullYear()}</p>
        <p className="truncate">SHA-256 9f2c4e71b0a8d36e55c1f0b7a2e4d9c8…</p>
      </div>
      <div className="grid grid-cols-2 gap-2 px-4 pb-4">
        <span className="rounded-[4px] bg-primary py-2 text-center text-[12.5px] text-primary-fg">Download PDF</span>
        <span className="rounded-[4px] border border-line py-2 text-center text-[12.5px] text-ink">Share link</span>
      </div>
    </MockFrame>
  );
}

export function ModeToggle() {
  const [mode, setMode] = useState<"remote" | "in_person">("remote");
  const remote = mode === "remote";
  return (
    <div>
      <Segmented
        value={mode}
        onChange={setMode}
        options={[
          { value: "remote", label: <><Video className="size-4" /> Remote</> },
          { value: "in_person", label: <><Laptop className="size-4" /> In-person</> },
        ]}
      />
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="grid gap-px overflow-hidden rounded-[10px] border border-line bg-line sm:grid-cols-3">
          {(remote
            ? [["You", "Anywhere in the world"], ["Witnesses", "Anywhere, own device"], ["Notary", "In the Philippines"]]
            : [["You", "At the notary's office"], ["Witnesses", "Same room"], ["Notary", "Signs on the platform"]]
          ).map(([w, where]) => (
            <div key={w} className="bg-surface p-5">
              <p className="mono-label">{w}</p>
              <p className="mt-2 text-[16px] text-ink">{where}</p>
            </div>
          ))}
        </div>
        <div>
          <p className="mono-label mb-3">What the platform checks</p>
          <ul className="space-y-2 text-[14.5px]">
            {(remote
              ? ["Live video and audio for everyone", "Location — blocks VPN, proxy, and Tor", "Verified identity for each person appearing", "Consent before any recording"]
              : ["Verified identity for each person appearing", "Electronic signatures captured on the notary's device", "Electronic seal and register entry"]
            ).map((x) => (
              <li key={x} className="flex gap-2">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                {x}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
