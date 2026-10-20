"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Clock, Mail, PenLine, Stamp, Trash2, Users } from "lucide-react";
import { Button, Card, DocStatus, EmptyState, LinkButton, NzStatus } from "@/components/ui";
import { PageHeader, pageWrap } from "@/components/app-shell";
import { DocumentPaper } from "@/components/document-paper";
import { SignatureModal } from "@/components/signature-pad";
import { useApp } from "@/lib/store";
import { cn, fmtDate, fmtDateTime } from "@/lib/utils";

export default function DocumentDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const principal = useApp((s) => s.principal)!;
  const doc = useApp((s) => s.documents.find((d) => d.id === id));
  const nz = useApp((s) => (doc?.notarizationId ? s.notarizations.find((n) => n.id === doc.notarizationId) : undefined));
  const signDocument = useApp((s) => s.signDocument);
  const simulate = useApp((s) => s.simulateOtherSigners);
  const remove = useApp((s) => s.deleteDocument);
  const [signing, setSigning] = useState(false);

  if (!doc) {
    return (
      <div className={pageWrap}>
        <EmptyState icon={<Stamp className="size-5" />} title="Document not found" body="It may have been deleted." action={<LinkButton href="/app/documents">Back to documents</LinkButton>} />
      </div>
    );
  }

  const me = doc.signers.find((s) => s.email === principal.email);
  const myTurn = me?.status === "notified";
  const signed = doc.signers.filter((s) => s.status === "signed").length;
  const othersPending = doc.signers.some((s) => s.status !== "signed" && s.id !== me?.id);
  const pct = Math.round((signed / doc.signers.length) * 100);
  const orders = Array.from(new Set(doc.signers.map((s) => s.order))).sort((a, b) => a - b);

  return (
    <div className={pageWrap}>
      <PageHeader
        back={{ href: "/app/documents", label: "Documents" }}
        eyebrow={doc.type}
        title={doc.title}
        subtitle={<span className="flex flex-wrap items-center gap-2"><DocStatus status={doc.status} /> Created {fmtDate(doc.createdAt)} · {doc.pages} page{doc.pages > 1 ? "s" : ""} · {doc.sizeKb} KB</span>}
        actions={
          <>
            {myTurn && (
              <Button onClick={() => setSigning(true)}>
                <PenLine className="size-4" /> Sign now
              </Button>
            )}
            {doc.status === "completed" && !nz && (
              <LinkButton href={`/app/notarizations/new?doc=${doc.id}`}>
                <Stamp className="size-4" /> Get it notarized
              </LinkButton>
            )}
          </>
        }
      />

      {myTurn && (
        <Card className="mb-5 flex items-center gap-3 border-accent/30 bg-accent-soft p-4 text-[14px] text-primary">
          <PenLine className="size-5 shrink-0" />
          <span className="flex-1">It&apos;s your turn to sign. Review the document, then tap <b>Sign now</b>.</span>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="rounded-[12px] bg-surface-2 p-3 sm:p-6">
          <DocumentPaper doc={doc} highlightSignerId={myTurn ? me?.id : undefined} />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <Card className="p-5">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-muted" />
              <p className="mono-label">Recipients · {doc.signers.length}</p>
            </div>
            <div className="mt-3 flex justify-between text-[13.5px] text-ink">
              <span>{signed} of {doc.signers.length} completed</span>
              <span className="text-muted">{pct}%</span>
            </div>
            <div className="mt-1.5 h-1.5 rounded bg-surface-2">
              <div className="h-1.5 rounded bg-accent transition-all" style={{ width: `${pct}%` }} />
            </div>
            <div className="mt-4 space-y-4">
              {orders.map((o) => {
                const group = doc.signers.filter((s) => s.order === o);
                return (
                  <div key={o}>
                    <p className="mono-label mb-2 border-t border-line pt-3">Step {o}{group.length > 1 ? " (any order)" : ""}</p>
                    <ul className="space-y-3">
                      {group.map((s) => (
                        <li key={s.id} className="flex gap-3">
                          <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-full border text-[11px]", s.status === "signed" ? "border-success bg-success-soft text-success" : "border-accent text-accent")}>
                            {s.status === "signed" ? <Check className="size-3.5" /> : o}
                          </span>
                          <div className="min-w-0 text-[13.5px]">
                            <p className="truncate text-ink">{s.name}{s.id === me?.id && <span className="text-muted"> (you)</span>}</p>
                            <p className="text-[12px] text-muted">{s.role === "approver" ? "Approver" : "Signer"} · {s.email}</p>
                            <p className="mt-0.5 text-[12.5px]">
                              {s.status === "signed" ? (
                                <span className="text-success">Signed {s.signedAt && fmtDateTime(s.signedAt)}</span>
                              ) : s.status === "notified" ? (
                                <span className="flex items-center gap-1 text-primary"><Mail className="size-3.5" /> Notified</span>
                              ) : (
                                <span className="flex items-center gap-1 text-muted"><Clock className="size-3.5" /> Waiting</span>
                              )}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
            {othersPending && me?.status === "signed" && (
              <div className="mt-5 rounded-[8px] border border-dashed border-line-strong p-3">
                <p className="mono-label !text-primary">Demo shortcut</p>
                <p className="mt-1 text-[12.5px] text-muted">In real use, other signers sign from their own email link.</p>
                <Button variant="secondary" size="sm" className="mt-2 w-full" onClick={() => simulate(doc.id)}>
                  Simulate other signers signing
                </Button>
              </div>
            )}
          </Card>

          {nz ? (
            <Card className="p-5">
              <p className="mono-label">Notarization</p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <p className="text-[14.5px] text-ink">{nz.act}</p>
                <NzStatus status={nz.status} />
              </div>
              <LinkButton href={`/app/notarizations/${nz.id}`} variant="secondary" size="sm" className="mt-3 w-full">
                View notarization
              </LinkButton>
            </Card>
          ) : (
            <Card className="p-5">
              <p className="mono-label">Next step</p>
              <p className="mt-2 text-[14px]">
                {doc.status === "completed" ? "Everyone has signed. Book a notary to notarize it." : "Once everyone signs, you can book a notary."}
              </p>
              <LinkButton href={`/app/notarizations/new?doc=${doc.id}`} variant={doc.status === "completed" ? "primary" : "secondary"} size="sm" className="mt-3 w-full">
                <Stamp className="size-4" /> Book a notarization
              </LinkButton>
            </Card>
          )}

          <button
            onClick={() => {
              if (confirm("Delete this document?")) {
                remove(doc.id);
                router.push("/app/documents");
              }
            }}
            className="flex items-center gap-1.5 px-1 text-[13px] text-danger hover:underline"
          >
            <Trash2 className="size-3.5" /> Delete document
          </button>
        </aside>
      </div>

      {me && (
        <SignatureModal
          open={signing}
          onClose={() => setSigning(false)}
          name={me.name}
          onSign={(sig) => {
            signDocument(doc.id, me.id, sig);
            setSigning(false);
          }}
        />
      )}
    </div>
  );
}
