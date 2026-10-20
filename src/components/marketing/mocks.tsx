import { Check, CircleDashed, Loader2, Mail, Mic, Video } from "lucide-react";
import { cn } from "@/lib/utils";

export function MockFrame({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-[10px] bg-surface text-[13px] shadow-[0_20px_60px_-20px_rgb(8_30_56/0.45)]", className)}>{children}</div>;
}

export function SigningMock({ className }: { className?: string }) {
  return (
    <MockFrame className={cn("w-[300px] sm:w-[330px]", className)}>
      <div className="flex items-start justify-between gap-3 border-b border-line p-4">
        <p className="font-medium text-ink">SPA — Lot Sale in Tagaytay</p>
        <span className="flex shrink-0 items-center gap-1.5 text-[12px] text-muted">
          <span className="size-1.5 rounded-full bg-accent" /> In progress
        </span>
      </div>
      <div className="m-3 rounded-[6px] border border-line p-4 shadow-sm">
        <p className="text-center font-serif text-[12px] tracking-wide text-ink">SPECIAL POWER OF ATTORNEY</p>
        <div className="mt-3 space-y-1.5">
          <div className="h-1.5 w-11/12 rounded bg-surface-2" />
          <div className="h-1.5 w-full rounded bg-surface-2" />
          <div className="h-1.5 w-2/3 rounded bg-surface-2" />
        </div>
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="border-b border-ink/60 bg-accent-soft px-1 font-script text-[20px] leading-tight text-primary">Juan Dela Cruz</p>
            <p className="mt-1 font-serif text-[10px]">Juan Dela Cruz</p>
          </div>
          <p className="font-serif text-[10px]">Lourdes R. Bautista</p>
        </div>
      </div>
      <div className="px-4 pb-4">
        <div className="mono-label flex items-center gap-2">Recipients <span className="rounded bg-surface-2 px-1.5">2</span></div>
        <div className="mt-2 flex justify-between text-[12.5px] text-ink">
          <span>1 of 2 completed</span>
          <span className="text-muted">50%</span>
        </div>
        <div className="mt-1.5 h-1 rounded bg-surface-2">
          <div className="h-1 w-1/2 rounded bg-accent" />
        </div>
        <div className="mt-3 space-y-3">
          <Row n={1} name="Juan Dela Cruz" role="Signer" state={<span className="text-success"><Check className="mr-1 inline size-3.5" />Signed</span>} />
          <Row n={2} name="Lourdes R. Bautista" role="Signer" state={<span className="text-primary"><Mail className="mr-1 inline size-3.5" />Notified</span>} />
        </div>
      </div>
    </MockFrame>
  );
}

function Row({ n, name, role, state }: { n: number; name: string; role: string; state: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-accent text-[10.5px] text-accent">{n}</span>
      <div className="text-[12.5px]">
        <p className="text-ink">{name}</p>
        <p className="text-muted">{role}</p>
        <p className="mt-0.5">{state}</p>
      </div>
    </div>
  );
}

export function SessionMock({ className }: { className?: string }) {
  const items = [
    { t: "Identity verified", s: "PhilSys · face match", done: true },
    { t: "Location verified", s: "Notary in PH · no VPN", done: true },
    { t: "Recording consent", s: "Every participant", done: true },
    { t: "Notarial act", s: "Acknowledgment", done: false },
  ];
  return (
    <MockFrame className={cn("w-full max-w-[560px]", className)}>
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div>
          <p className="mono-label !text-primary">Notarization · Remote</p>
          <p className="font-medium text-ink">Affidavit of Loss — Juan Dela Cruz</p>
        </div>
        <span className="hidden items-center gap-1.5 text-[12px] text-success sm:flex">
          <span className="size-1.5 animate-pulse rounded-full bg-success" /> In session
        </span>
      </div>
      <div className="grid gap-3 p-3 sm:grid-cols-[1.2fr_1fr]">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-1">
          <VideoTile name="Atty. Santos" label="Notary" initials="MS" active />
          <VideoTile name="Juan" label="Principal" initials="JD" />
        </div>
        <ul className="space-y-3 py-1">
          {items.map((i) => (
            <li key={i.t} className="flex gap-2.5">
              <span className={cn("mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full", i.done ? "bg-surface-2 text-muted" : "bg-accent-soft text-accent")}>
                {i.done ? <Check className="size-3" /> : <Loader2 className="size-3 animate-spin" />}
              </span>
              <div>
                <p className="text-ink">{i.t}</p>
                <p className="font-mono text-[10.5px] text-muted">{i.s}</p>
              </div>
            </li>
          ))}
          <li className="rounded-[6px] bg-warning-soft px-3 py-2 text-[12px] text-warning">Pending payment: ₱600.00</li>
        </ul>
      </div>
    </MockFrame>
  );
}

function VideoTile({ name, label, initials, active }: { name: string; label: string; initials: string; active?: boolean }) {
  return (
    <div className={cn("relative flex aspect-video items-center justify-center rounded-[8px] bg-accent-soft/70", active && "ring-2 ring-accent")}>
      <span className="flex size-11 items-center justify-center rounded-full bg-surface text-[14px] text-primary">{initials}</span>
      <span className="absolute bottom-1.5 left-1.5 rounded bg-surface px-1.5 py-0.5 text-[10.5px] text-ink">
        {name} <span className="text-muted">{label}</span>
      </span>
      <span className="absolute top-1.5 right-1.5 flex gap-1 text-primary/70">
        <Mic className="size-3" />
        <Video className="size-3" />
      </span>
    </div>
  );
}

export function IdCheckMock({ className, step = 1 }: { className?: string; step?: number }) {
  const rows = [
    { t: "Consent & fee", s: "₱99, valid up to 3 years" },
    { t: "Scan your ID", s: "PhilSys QR or government ID" },
    { t: "Face scan", s: "Matched to your ID photo" },
    { t: "Confirm details", s: "Name, birthday, address" },
  ];
  return (
    <MockFrame className={cn("w-full max-w-[440px]", className)}>
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div>
          <p className="mono-label !text-primary">Identity verification</p>
          <p className="font-medium text-ink">Verify once, notarize anytime</p>
        </div>
        <span className="flex items-center gap-1.5 text-[12px] text-muted">
          <CircleDashed className="size-3.5" /> Step {step} of 4
        </span>
      </div>
      <ul className="space-y-3 p-4">
        {rows.map((r, i) => (
          <li key={r.t} className="flex gap-3">
            <span
              className={cn(
                "flex size-5 shrink-0 items-center justify-center rounded-full text-[10.5px]",
                i < step - 1 ? "bg-success-soft text-success" : i === step - 1 ? "bg-accent-soft text-accent" : "bg-surface-2 text-muted",
              )}
            >
              {i < step - 1 ? <Check className="size-3" /> : i + 1}
            </span>
            <div>
              <p className="text-ink">{r.t}</p>
              <p className="font-mono text-[10.5px] text-muted">{r.s}</p>
            </div>
          </li>
        ))}
      </ul>
    </MockFrame>
  );
}

export function CertificateMock({ className }: { className?: string }) {
  return (
    <MockFrame className={cn("w-[280px] p-5", className)}>
      <p className="text-center font-serif text-[11px] tracking-[0.2em] text-ink">NOTARIAL CERTIFICATE</p>
      <div className="mt-3 space-y-1.5">
        <div className="h-1.5 rounded bg-surface-2" />
        <div className="h-1.5 w-5/6 rounded bg-surface-2" />
        <div className="h-1.5 w-4/6 rounded bg-surface-2" />
      </div>
      <div className="mt-4 flex items-end justify-between">
        <div className="font-mono text-[9.5px] leading-relaxed text-muted">
          Doc. No. 124
          <br />
          Page No. 25
          <br />
          Book No. 3
          <br />
          Series of {new Date().getFullYear()}
        </div>
        <div className="grid size-14 grid-cols-5 gap-px rounded bg-surface p-1 ring-1 ring-line">
          {Array.from({ length: 25 }).map((_, i) => (
            <span key={i} className={cn("rounded-[1px]", [0, 1, 2, 4, 5, 7, 10, 12, 14, 16, 18, 20, 21, 22, 24, 9, 13].includes(i) ? "bg-ink" : "bg-transparent")} />
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 rounded bg-success-soft px-2.5 py-1.5 text-[11.5px] text-success">
        <Check className="size-3.5" /> Sealed · fingerprint recorded
      </div>
    </MockFrame>
  );
}
