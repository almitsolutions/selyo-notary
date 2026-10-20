"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AlertTriangle, CheckCircle2, FileText, Fingerprint, Layers, Link2, Loader2, ShieldCheck, Upload } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { useApp } from "@/lib/store";
import { useStoreReady } from "@/components/store-hydrator";
import { sha256Hex } from "@/lib/hash";
import { findNotary } from "@/lib/mock/notaries";
import { cn, fmtDateTime } from "@/lib/utils";
import type { Notarization } from "@/lib/types";

type Result =
  | { state: "idle" }
  | { state: "checking"; name: string }
  | { state: "match"; name: string; hash: string; nz: Notarization }
  | { state: "nomatch"; name: string; hash: string };

export function VerifyTool() {
  const ready = useStoreReady();
  const notarizations = useApp((s) => s.notarizations);
  const params = useSearchParams();
  const [res, setRes] = useState<Result>({ state: "idle" });
  const [drag, setDrag] = useState(false);

  // QR code deep link: /verify?id=...
  useEffect(() => {
    if (!ready) return;
    const id = params.get("id");
    const nz = id && notarizations.find((n) => n.id === id && n.status === "notarized");
    if (nz) setRes({ state: "match", name: nz.documentTitle, hash: nz.fileHashes?.[0] ?? nz.hash ?? "", nz });
  }, [ready, params, notarizations]);

  const check = useCallback(
    async (file: File) => {
      setRes({ state: "checking", name: file.name });
      const hash = await sha256Hex(await file.arrayBuffer());
      await new Promise((r) => setTimeout(r, 1400));
      const nz = notarizations.find((n) => n.fileHashes?.includes(hash) || n.hash === hash);
      setRes(nz ? { state: "match", name: file.name, hash, nz } : { state: "nomatch", name: file.name, hash });
    },
    [notarizations],
  );

  const sample = () => {
    const nz = notarizations.find((n) => n.status === "notarized");
    if (!nz) return;
    setRes({ state: "checking", name: "sample.pdf" });
    setTimeout(() => setRes({ state: "match", name: `${nz.documentTitle}.pdf`, hash: nz.hash ?? "", nz }), 1200);
  };

  const steps = [
    { icon: Fingerprint, t: "Document hash", s: "SHA-256 of the file you upload" },
    { icon: FileText, t: "Our records", s: "The hash recorded at sealing" },
    { icon: Layers, t: "Register entry", s: "Notary's electronic notarial book" },
    { icon: Link2, t: "Commission", s: "Notary's commission was valid" },
    { icon: ShieldCheck, t: "Result", s: "What the checks found" },
  ];
  const done = res.state === "match" || res.state === "nomatch";

  return (
    <div>
      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <Card className="p-4 sm:p-5">
          {res.state === "idle" || res.state === "checking" ? (
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setDrag(true);
              }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDrag(false);
                const f = e.dataTransfer.files[0];
                if (f) check(f);
              }}
              className={cn(
                "flex min-h-[320px] cursor-pointer flex-col items-center justify-center rounded-[8px] border-2 border-dashed px-6 text-center transition sm:min-h-[440px]",
                drag ? "border-accent bg-accent-soft/50" : "border-line-strong bg-bg",
              )}
            >
              <input type="file" accept="application/pdf" className="sr-only" onChange={(e) => e.target.files?.[0] && check(e.target.files[0])} />
              {res.state === "checking" ? (
                <>
                  <Loader2 className="size-8 animate-spin text-accent" />
                  <p className="mt-4 font-medium text-ink">Checking {res.name}…</p>
                  <p className="mt-1 text-[13.5px] text-muted">Computing fingerprint and looking up records</p>
                </>
              ) : (
                <>
                  <span className="flex size-12 items-center justify-center rounded-[10px] bg-accent-soft text-primary">
                    <Upload className="size-5" />
                  </span>
                  <p className="mt-4 font-medium text-ink">Drag and drop a PDF here</p>
                  <p className="mt-1 text-[13.5px] text-muted">
                    or tap to choose a file ·{" "}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        sample();
                      }}
                      className="text-primary underline underline-offset-2"
                    >
                      try a sample
                    </button>
                  </p>
                  <p className="mt-2 text-[12.5px] text-soft">Your file never leaves your device — only its fingerprint is compared.</p>
                </>
              )}
            </label>
          ) : (
            <ResultPanel res={res} onReset={() => setRes({ state: "idle" })} />
          )}
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <p className="mono-label">Proof of record</p>
            <span className={cn("mono-label flex items-center gap-1.5", done ? (res.state === "match" ? "!text-success" : "!text-danger") : "!text-primary")}>
              <span className="size-1.5 rounded-full bg-current" />
              {res.state === "checking" ? "Checking" : done ? (res.state === "match" ? "Verified" : "No match") : "Ready"}
            </span>
          </div>
          <ol className="mt-4 space-y-2.5">
            {steps.map((s, i) => {
              const ok = res.state === "match" || (res.state === "nomatch" && i === 0);
              const bad = res.state === "nomatch" && i > 0;
              return (
                <li
                  key={s.t}
                  className={cn(
                    "flex items-center gap-3 rounded-[8px] border p-3 transition",
                    ok ? "border-success/30 bg-success-soft" : bad ? "border-danger/20 bg-danger-soft/60" : "border-line bg-bg",
                  )}
                >
                  <span className="flex size-8 items-center justify-center rounded-[6px] bg-surface text-muted">
                    <s.icon className="size-4" />
                  </span>
                  <div>
                    <p className="font-mono text-[10.5px] tracking-widest text-muted uppercase">{s.t}</p>
                    <p className="font-mono text-[12px] text-ink">{s.s}</p>
                  </div>
                </li>
              );
            })}
          </ol>
          <p className="mt-4 text-[13px] leading-relaxed text-muted">
            Every notarized PDF gets a unique SHA-256 fingerprint at sealing. Changing even one byte produces a completely
            different fingerprint, so a match proves this is the exact file the notary sealed.
          </p>
        </Card>
      </div>

      <p className="mono-label mt-12 mb-4">Verification checks</p>
      <div className="grid gap-3 md:grid-cols-3">
        {[
          ["Validity", "The notary's seal and signature are present and their commission was valid on the date of notarization."],
          ["Integrity", "The document hasn't been changed since it was sealed."],
          ["Authenticity", "This exact file matches a record in our electronic notarial register."],
        ].map(([t, b], i) => (
          <div key={t} className="rounded-[10px] bg-surface-2 p-5">
            <p className="mono-label !text-primary">Check 0{i + 1}</p>
            <p className="mt-2 text-[17px] font-medium text-ink">{t}</p>
            <p className="mt-1.5 text-[14px] text-body">{b}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResultPanel({ res, onReset }: { res: Extract<Result, { state: "match" | "nomatch" }>; onReset: () => void }) {
  if (res.state === "nomatch") {
    return (
      <div className="flex min-h-[320px] flex-col justify-center p-2 sm:min-h-[440px] sm:p-6">
        <AlertTriangle className="size-9 text-danger" />
        <h2 className="mt-4 text-[26px] font-normal">No matching record</h2>
        <p className="mt-2 max-w-md text-[15px]">
          We couldn&apos;t find a sealed document with this fingerprint. It may have been edited after notarization, or it
          wasn&apos;t notarized on this platform.
        </p>
        <p className="mt-4 font-mono text-[11.5px] break-all text-muted">SHA-256 {res.hash}</p>
        <Button variant="secondary" className="mt-6 self-start" onClick={onReset}>
          Check another file
        </Button>
      </div>
    );
  }
  const n = findNotary(res.nz.notaryId);
  const reg = res.nz.register;
  return (
    <div className="p-2 sm:p-6">
      <CheckCircle2 className="size-9 text-success" />
      <h2 className="mt-4 text-[26px] font-normal">Authentic and unchanged</h2>
      <p className="mt-1 text-[15px] text-muted">{res.name}</p>
      <dl className="mt-6 grid gap-px overflow-hidden rounded-[8px] border border-line bg-line sm:grid-cols-2">
        {[
          ["Document", res.nz.documentTitle],
          ["Notarial act", `${res.nz.act} · ${res.nz.mode === "remote" ? "Remote" : "In-person"}`],
          ["Principal", res.nz.principalName],
          ["Notary", n?.name ?? "—"],
          ["Commission", n?.commissionNo ?? "—"],
          ["Notarized", res.nz.notarizedAt ? fmtDateTime(res.nz.notarizedAt) : "—"],
          ["Register", reg ? `Doc. ${reg.docNo} · Page ${reg.pageNo} · Book ${reg.bookNo} · ${reg.series}` : "—"],
          ["Record ID", res.nz.id.toUpperCase()],
        ].map(([k, v]) => (
          <div key={k} className="bg-surface p-3.5">
            <dt className="text-[12px] text-muted">{k}</dt>
            <dd className="mt-0.5 text-[14px] text-ink">{v}</dd>
          </div>
        ))}
      </dl>
      {res.hash && <p className="mt-4 font-mono text-[11.5px] break-all text-muted">SHA-256 {res.hash}</p>}
      <Button variant="secondary" className="mt-6" onClick={onReset}>
        Check another file
      </Button>
    </div>
  );
}
