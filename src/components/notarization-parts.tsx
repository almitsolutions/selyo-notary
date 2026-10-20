"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Download, Send } from "lucide-react";
import { Button, Spinner } from "@/components/ui";
import { useApp } from "@/lib/store";
import { findNotary } from "@/lib/mock/notaries";
import { sha256Hex } from "@/lib/hash";
import { cn, fmtDateTime, fmtTime, relativeDay } from "@/lib/utils";
import type { Notarization } from "@/lib/types";

const FLOW = [
  { key: "requested", label: "Requested" },
  { key: "confirmed", label: "Confirmed" },
  { key: "session", label: "Session" },
  { key: "paid", label: "Paid" },
  { key: "notarized", label: "Notarized" },
];

function progressIndex(n: Notarization) {
  if (n.status === "notarized") return 5;
  if (n.status === "sealing") return 4;
  if (n.payment.status === "paid") return 4;
  if (n.status === "in_session" || n.status === "pending_payment") return 2;
  if (n.status === "confirmed") return 1;
  return 0;
}

export function NzProgress({ n }: { n: Notarization }) {
  const idx = progressIndex(n);
  if (n.status === "declined" || n.status === "cancelled") return null;
  return (
    <ol className="flex items-start">
      {FLOW.map((f, i) => (
        <li key={f.key} className="flex flex-1 flex-col items-center gap-1.5 text-center">
          <div className="flex w-full items-center">
            <span className={cn("h-px flex-1", i === 0 ? "bg-transparent" : i <= idx ? "bg-accent" : "bg-line-strong")} />
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full border text-[11px]",
                i < idx ? "border-accent bg-accent text-white" : i === idx ? "border-primary bg-surface text-primary ring-4 ring-accent-soft" : "border-line-strong bg-surface text-muted",
              )}
            >
              {i < idx ? <Check className="size-3.5" /> : i + 1}
            </span>
            <span className={cn("h-px flex-1", i === FLOW.length - 1 ? "bg-transparent" : i < idx ? "bg-accent" : "bg-line-strong")} />
          </div>
          <span className={cn("text-[11.5px] sm:text-[12.5px]", i <= idx ? "text-ink" : "text-muted")}>{f.label}</span>
        </li>
      ))}
    </ol>
  );
}

export function MessageThread({ n, as, className }: { n: Notarization; as: "principal" | "notary"; className?: string }) {
  const send = useApp((s) => s.sendMessage);
  const principal = useApp((s) => s.principal);
  const notary = findNotary(n.notaryId);
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [n.messages.length]);
  const closed = n.status === "notarized" || n.status === "cancelled" || n.status === "declined";

  return (
    <div className={cn("flex flex-col", className)}>
      <div className="max-h-[420px] min-h-[200px] flex-1 space-y-3 overflow-y-auto p-4">
        {n.messages.map((m) =>
          m.from === "system" ? (
            <p key={m.id} className="text-center text-[12px] text-muted">
              {m.text} · {fmtTime(m.at)}
            </p>
          ) : (
            <div key={m.id} className={cn("flex flex-col", m.from === as ? "items-end" : "items-start")}>
              <div className={cn("max-w-[85%] rounded-[12px] px-3.5 py-2 text-[14px]", m.from === as ? "rounded-br-[4px] bg-primary text-primary-fg" : "rounded-bl-[4px] bg-surface-2 text-ink")}>
                {m.text}
              </div>
              <span className="mt-1 text-[11px] text-muted">
                {m.from === as ? "You" : m.name} · {relativeDay(m.at)} {fmtTime(m.at)}
              </span>
            </div>
          ),
        )}
        <div ref={endRef} />
      </div>
      <form
        className="flex gap-2 border-t border-line p-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          send(n.id, as, as === "notary" ? notary?.name ?? "Notary" : principal?.name ?? n.principalName, text.trim());
          setText("");
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={closed}
          placeholder={closed ? "This thread is closed" : "Write a message…"}
          className="h-10 min-w-0 flex-1 rounded-[6px] border border-line-strong bg-surface px-3 text-[14px] focus:border-accent focus:outline-none"
        />
        <Button type="submit" size="md" disabled={!text.trim() || closed} aria-label="Send">
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}

export function ActivityList({ n }: { n: Notarization }) {
  if (!n.activity.length) return <p className="p-4 text-[13.5px] text-muted">No activity yet.</p>;
  return (
    <ol className="space-y-3 p-4">
      {[...n.activity].reverse().map((a) => (
        <li key={a.id} className="flex gap-3 text-[13.5px]">
          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
          <div>
            <p className="text-ink">{a.text}</p>
            <p className="font-mono text-[11px] text-muted">{fmtDateTime(a.at)}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function DownloadNotarizedButton({ n, className, size = "md" }: { n: Notarization; className?: string; size?: "sm" | "md" | "lg" }) {
  const [busy, setBusy] = useState(false);
  const docs = useApp((s) => s.documents);
  const principal = useApp((s) => s.principal);
  const record = useApp((s) => s.recordFileHash);
  return (
    <Button
      className={className}
      size={size}
      disabled={busy || n.status !== "notarized"}
      onClick={async () => {
        setBusy(true);
        try {
          // pdf-lib is heavy; load it only when someone downloads.
          const { buildNotarizedPdf, downloadBytes } = await import("@/lib/pdf");
          const bytes = await buildNotarizedPdf({
            nz: n,
            doc: docs.find((d) => d.id === n.documentId),
            notary: findNotary(n.notaryId)!,
            principal: principal?.id === n.principalId ? principal : null,
            origin: window.location.origin,
          });
          record(n.id, await sha256Hex(bytes));
          downloadBytes(bytes, `${n.documentTitle.replace(/[^\w\- ]+/g, "").trim()} - notarized.pdf`);
        } finally {
          setBusy(false);
        }
      }}
    >
      {busy ? <Spinner /> : <Download className="size-4" />} Download notarized PDF
    </Button>
  );
}
