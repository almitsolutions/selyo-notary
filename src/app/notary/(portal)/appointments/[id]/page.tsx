"use client";

import { use, useState } from "react";
import { BadgeCheck, CalendarClock, FileText, Laptop, StickyNote, Users, Video, Wallet } from "lucide-react";
import { Avatar, Button, Card, EmptyState, LinkButton, Modal, NzStatus, Segmented, Textarea } from "@/components/ui";
import { PageHeader, pageWrap } from "@/components/app-shell";
import { ActivityList, MessageThread, NzProgress } from "@/components/notarization-parts";
import { DocumentPaper } from "@/components/document-paper";
import { useApp } from "@/lib/store";
import { fmtDate, fmtDateTime, peso } from "@/lib/utils";

export default function NotaryAppointmentDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const n = useApp((s) => s.notarizations.find((x) => x.id === id));
  const doc = useApp((s) => s.documents.find((d) => d.id === n?.documentId));
  const principal = useApp((s) => s.principal);
  const accept = useApp((s) => s.acceptAppointment);
  const decline = useApp((s) => s.declineAppointment);
  const [tab, setTab] = useState<"messages" | "activity">("messages");
  const [declining, setDeclining] = useState(false);
  const [reason, setReason] = useState("");

  if (!n) {
    return (
      <div className={pageWrap}>
        <EmptyState icon={<FileText className="size-5" />} title="Appointment not found" body="" action={<LinkButton href="/notary/appointments">Back</LinkButton>} />
      </div>
    );
  }
  const idType = principal?.id === n.principalId ? principal.kyc.idType ?? "—" : "PhilSys National ID";

  return (
    <div className={pageWrap}>
      <PageHeader
        back={{ href: "/notary/appointments", label: "Appointments" }}
        eyebrow={`${n.act} · ${n.mode === "remote" ? "Remote" : "In-person"}`}
        title={n.documentTitle}
        subtitle={<span className="flex flex-wrap items-center gap-2"><NzStatus status={n.status} /> Requested {fmtDate(n.createdAt)}</span>}
        actions={
          n.status === "awaiting_review" ? (
            <>
              <Button variant="secondary" onClick={() => setDeclining(true)}>Decline</Button>
              <Button onClick={() => accept(n.id)}>Accept appointment</Button>
            </>
          ) : ["confirmed", "in_session", "pending_payment", "sealing"].includes(n.status) ? (
            <LinkButton href={`/notary/session/${n.id}`}><Video className="size-4" /> {n.status === "confirmed" ? "Start session" : "Rejoin session"}</LinkButton>
          ) : null
        }
      />

      <Card className="mb-6 px-2 py-5 sm:px-6"><NzProgress n={n} /></Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="border-b border-line px-4 py-3"><p className="mono-label">Document</p></div>
            <div className="max-h-[520px] overflow-y-auto bg-surface-2 p-3 sm:p-5">
              {doc ? <DocumentPaper doc={doc} /> : (
                <div className="rounded-[8px] bg-surface p-10 text-center text-[14px] text-muted"><FileText className="mx-auto mb-2 size-6" />{n.documentTitle}<p className="mt-1 text-[12.5px]">Sample request — document preview not stored in this demo.</p></div>
              )}
            </div>
          </Card>
          <Card className="overflow-hidden">
            <div className="border-b border-line px-4 py-2.5">
              <Segmented value={tab} onChange={setTab} options={[{ value: "messages", label: "Messages" }, { value: "activity", label: "Activity" }]} />
            </div>
            {tab === "messages" ? <MessageThread n={n} as="notary" /> : <ActivityList n={n} />}
          </Card>
        </div>

        <aside className="space-y-4">
          <Card className="p-5">
            <p className="mono-label">Principal</p>
            <div className="mt-3 flex items-center gap-3">
              <Avatar name={n.principalName} size={42} />
              <div>
                <p className="text-[14.5px] text-ink">{n.principalName}</p>
                <p className="flex items-center gap-1 text-[12.5px] text-success"><BadgeCheck className="size-3.5" /> Identity verified · {idType}</p>
              </div>
            </div>
            {n.witnesses.length > 0 && (
              <div className="mt-4 border-t border-line pt-3">
                <p className="mono-label mb-2 flex items-center gap-1.5"><Users className="size-3.5" /> Witnesses</p>
                {n.witnesses.map((w) => <p key={w.id} className="text-[13.5px] text-ink">{w.name} <span className="text-muted">· {w.email}</span></p>)}
              </div>
            )}
          </Card>
          <Card className="p-5">
            <p className="mono-label">Appointment</p>
            <ul className="mt-3 space-y-3 text-[14px]">
              <li className="flex gap-2.5"><CalendarClock className="mt-0.5 size-4 text-muted" /><span className="text-ink">{fmtDateTime(n.scheduledAt)}</span></li>
              <li className="flex gap-2.5">{n.mode === "remote" ? <Video className="mt-0.5 size-4 text-muted" /> : <Laptop className="mt-0.5 size-4 text-muted" />}<span className="text-ink">{n.mode === "remote" ? "Remote (REN)" : "In-person (IEN)"}</span></li>
              <li className="flex gap-2.5"><Wallet className="mt-0.5 size-4 text-muted" /><span className="text-ink">{peso(n.fee)} · {n.payment.status === "paid" ? <span className="text-success">Paid ({n.payment.method})</span> : "Unpaid"}</span></li>
              {n.notes && <li className="flex gap-2.5"><StickyNote className="mt-0.5 size-4 text-muted" /><span className="text-ink">{n.notes}</span></li>}
            </ul>
          </Card>
          {n.register && (
            <Card className="p-5">
              <p className="mono-label">Register entry</p>
              <p className="mt-2 font-mono text-[13px] text-ink">Doc. {n.register.docNo} · Page {n.register.pageNo} · Book {n.register.bookNo} · {n.register.series}</p>
              <LinkButton href={`/verify?id=${n.id}`} variant="secondary" size="sm" className="mt-3 w-full">Verification record</LinkButton>
            </Card>
          )}
        </aside>
      </div>

      <Modal open={declining} onClose={() => setDeclining(false)} title="Decline appointment">
        <p className="mb-3 text-[14px] text-muted">The client will see your reason and can book another notary.</p>
        <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g., This document type needs to be signed in wet ink." />
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Button variant="secondary" onClick={() => setDeclining(false)}>Cancel</Button>
          <Button variant="danger" onClick={() => { decline(n.id, reason); setDeclining(false); }}>Decline</Button>
        </div>
      </Modal>
    </div>
  );
}
