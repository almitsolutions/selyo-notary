"use client";

import { use, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarClock, CheckCircle2, ExternalLink, FileText, MapPin, Users, Video, Wallet } from "lucide-react";
import { Avatar, Button, Card, EmptyState, LinkButton, NzStatus, Segmented } from "@/components/ui";
import { PageHeader, pageWrap } from "@/components/app-shell";
import { ActivityList, DownloadNotarizedButton, MessageThread, NzProgress } from "@/components/notarization-parts";
import { useApp } from "@/lib/store";
import { findNotary } from "@/lib/mock/notaries";
import { fmtDate, fmtDateTime, fmtTime, peso, relativeDay } from "@/lib/utils";

export default function NotarizationDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const search = useSearchParams();
  const n = useApp((s) => s.notarizations.find((x) => x.id === id));
  const cancel = useApp((s) => s.cancelNotarization);
  const [tab, setTab] = useState<"messages" | "activity">("messages");

  if (!n) {
    return (
      <div className={pageWrap}>
        <EmptyState icon={<FileText className="size-5" />} title="Notarization not found" body="It may have been removed." action={<LinkButton href="/app/notarizations">Back</LinkButton>} />
      </div>
    );
  }
  const notary = findNotary(n.notaryId)!;
  const canJoin = n.status === "confirmed" || n.status === "in_session" || n.status === "pending_payment";

  return (
    <div className={pageWrap}>
      {search.get("booked") && n.status === "awaiting_review" && (
        <Card className="animate-fade-up mb-6 flex items-start gap-3 border-success/30 bg-success-soft p-4">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" />
          <div className="text-[14px]">
            <p className="font-medium text-ink">Appointment requested</p>
            <p className="text-body">{notary.name} will review it shortly. You&apos;ll get an email and a message here once it&apos;s confirmed.</p>
            <p className="mt-1 text-[12.5px] text-muted">Demo tip: open the notary portal in another tab to confirm it yourself.</p>
          </div>
        </Card>
      )}

      <PageHeader
        back={{ href: "/app/notarizations", label: "Notarizations" }}
        eyebrow={`${n.act} · ${n.mode === "remote" ? "Remote" : "In-person"}`}
        title={n.documentTitle}
        subtitle={<span className="flex flex-wrap items-center gap-2"><NzStatus status={n.status} /> Requested {fmtDate(n.createdAt)}</span>}
        actions={
          <>
            {n.status === "pending_payment" && (
              <LinkButton href={`/app/pay/${n.id}`}><Wallet className="size-4" /> Pay {peso(n.fee)}</LinkButton>
            )}
            {canJoin && n.mode === "remote" && (
              <LinkButton href={`/session/${n.id}`} variant={n.status === "pending_payment" ? "secondary" : "primary"}><Video className="size-4" /> Join session</LinkButton>
            )}
            {n.status === "notarized" && <DownloadNotarizedButton n={n} />}
          </>
        }
      />

      <Card className="mb-6 px-2 py-5 sm:px-6">
        <NzProgress n={n} />
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {n.status === "notarized" && (
            <div className="brush rounded-[12px] p-6 text-white">
              <p className="font-mono text-[11px] tracking-[0.14em] text-white/70">NOTARIZED</p>
              <p className="mt-2 text-[24px] leading-tight">Your document is sealed and ready</p>
              <dl className="mt-5 grid gap-px overflow-hidden rounded-[8px] bg-white/15 font-mono text-[12px] sm:grid-cols-2">
                {[
                  ["Doc. No.", n.register?.docNo],
                  ["Page No.", n.register?.pageNo],
                  ["Book No.", n.register?.bookNo],
                  ["Series of", n.register?.series],
                ].map(([k, v]) => (
                  <div key={k as string} className="bg-white/5 px-3 py-2.5">
                    <dt className="text-white/60">{k}</dt>
                    <dd className="text-white">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 font-mono text-[11px] break-all text-white/60">SHA-256 {n.fileHashes?.at(-1) ?? n.hash}</p>
              <div className="mt-5 grid gap-2 sm:flex">
                <DownloadNotarizedButton n={n} className="bg-white text-primary hover:bg-white/90" />
                <LinkButton href={`/verify?id=${n.id}`} variant="outline-light">
                  <ExternalLink className="size-4" /> Verification page
                </LinkButton>
              </div>
            </div>
          )}

          {n.status === "pending_payment" && (
            <Card className="flex flex-col gap-3 border-warning/30 bg-warning-soft p-5 sm:flex-row sm:items-center">
              <Wallet className="size-6 shrink-0 text-warning" />
              <div className="flex-1 text-[14px]">
                <p className="font-medium text-ink">The notary sent a payment request</p>
                <p>Pay {peso(n.fee)} by GCash, Maya, or card so they can seal your document. Due within 24 hours.</p>
              </div>
              <LinkButton href={`/app/pay/${n.id}`}>Pay now</LinkButton>
            </Card>
          )}

          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
              <Segmented value={tab} onChange={setTab} options={[{ value: "messages", label: "Messages" }, { value: "activity", label: "Activity" }]} />
              <span className="hidden text-[12.5px] text-muted sm:block">Open until 24h after the session</span>
            </div>
            {tab === "messages" ? <MessageThread n={n} as="principal" /> : <ActivityList n={n} />}
          </Card>
        </div>

        <aside className="space-y-4">
          <Card className="p-5">
            <p className="mono-label">Appointment</p>
            <ul className="mt-3 space-y-3 text-[14px]">
              <li className="flex gap-2.5"><CalendarClock className="mt-0.5 size-4 text-muted" /><span><span className="block text-ink">{relativeDay(n.scheduledAt)}, {fmtTime(n.scheduledAt)}</span><span className="text-[12.5px] text-muted">{fmtDateTime(n.scheduledAt)} PHT</span></span></li>
              <li className="flex gap-2.5">{n.mode === "remote" ? <Video className="mt-0.5 size-4 text-muted" /> : <MapPin className="mt-0.5 size-4 text-muted" />}<span className="text-ink">{n.mode === "remote" ? "Remote video session" : `In person · ${notary.city}`}</span></li>
              <li className="flex gap-2.5"><Wallet className="mt-0.5 size-4 text-muted" /><span className="text-ink">{peso(n.fee)} · {n.payment.status === "paid" ? <span className="text-success">Paid via {n.payment.method?.toUpperCase()}</span> : "pay during session"}</span></li>
              {n.witnesses.length > 0 && <li className="flex gap-2.5"><Users className="mt-0.5 size-4 text-muted" /><span className="text-ink">{n.witnesses.map((w) => w.name).join(", ")}</span></li>}
            </ul>
          </Card>
          <Card className="p-5">
            <p className="mono-label">Notary</p>
            <div className="mt-3 flex items-center gap-3">
              <Avatar name={notary.name} color={notary.avatarColor} size={42} />
              <div>
                <p className="text-[14.5px] text-ink">{notary.name}</p>
                <p className="text-[12.5px] text-muted">{notary.commissionNo} · {notary.city}</p>
              </div>
            </div>
            <LinkButton href={`/notaries/${notary.id}`} variant="secondary" size="sm" className="mt-4 w-full">View profile</LinkButton>
          </Card>
          <LinkButton href={`/app/documents/${n.documentId}`} variant="ghost" size="sm" className="w-full justify-start">
            <FileText className="size-4" /> View document
          </LinkButton>
          {(n.status === "awaiting_review" || n.status === "confirmed") && (
            <Button variant="ghost" size="sm" className="w-full justify-start text-danger" onClick={() => confirm("Cancel this appointment?") && cancel(n.id)}>
              Cancel appointment
            </Button>
          )}
        </aside>
      </div>
    </div>
  );
}
