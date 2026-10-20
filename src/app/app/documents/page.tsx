"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FileText, Plus, Search } from "lucide-react";
import { Card, DocStatus, EmptyState, Input, LinkButton } from "@/components/ui";
import { PageHeader, pageWrap } from "@/components/app-shell";
import { useApp } from "@/lib/store";
import { cn, fmtDate, initials } from "@/lib/utils";

const tabs = [
  { key: "all", label: "All" },
  { key: "action", label: "Needs my signature" },
  { key: "waiting", label: "Waiting on others" },
  { key: "completed", label: "Signed" },
  { key: "draft", label: "Drafts" },
] as const;

export default function DocumentsPage() {
  const principal = useApp((s) => s.principal)!;
  const all = useApp((s) => s.documents).filter((d) => d.ownerId === principal.id);
  const [tab, setTab] = useState<(typeof tabs)[number]["key"]>("all");
  const [q, setQ] = useState("");

  const mine = (d: (typeof all)[number]) => d.signers.some((s) => s.email === principal.email && s.status === "notified");
  const list = useMemo(
    () =>
      all.filter((d) => {
        if (q && !d.title.toLowerCase().includes(q.toLowerCase())) return false;
        if (tab === "action") return mine(d);
        if (tab === "waiting") return (d.status === "in_progress" || d.status === "pending") && !mine(d);
        if (tab === "completed") return d.status === "completed";
        if (tab === "draft") return d.status === "draft";
        return true;
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [all, tab, q],
  );

  return (
    <div className={pageWrap}>
      <PageHeader
        eyebrow="Documents"
        title="Your documents"
        subtitle="Upload, send for signature, and keep everything in one place."
        actions={
          <LinkButton href="/app/documents/new">
            <Plus className="size-4" /> New document
          </LinkButton>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="scrollbar-none -mx-4 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          {tabs.map((t) => {
            const count = t.key === "all" ? all.length : t.key === "action" ? all.filter(mine).length : undefined;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "shrink-0 rounded-[6px] border px-3 py-1.5 text-[13.5px]",
                  tab === t.key ? "border-line bg-surface text-primary shadow-sm" : "border-transparent text-muted hover:text-ink",
                )}
              >
                {t.label}
                {count !== undefined && <span className="ml-1.5 text-soft">{count}</span>}
              </button>
            );
          })}
        </div>
        <div className="relative sm:ml-auto sm:w-64">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search documents…" className="h-10 pl-9" />
        </div>
      </div>

      <div className="mt-5">
        {list.length === 0 ? (
          <EmptyState
            icon={<FileText className="size-5" />}
            title="No documents here"
            body="Upload a PDF to sign it and send it to others."
            action={<LinkButton href="/app/documents/new">Upload a document</LinkButton>}
          />
        ) : (
          <Card className="overflow-hidden">
            <div className="hidden grid-cols-[1fr_140px_160px_120px] gap-4 border-b border-line bg-bg px-5 py-2.5 md:grid">
              {["Document", "Status", "Signers", "Updated"].map((h) => (
                <span key={h} className="mono-label">{h}</span>
              ))}
            </div>
            <ul className="divide-y divide-line">
              {list.map((d) => {
                const signed = d.signers.filter((s) => s.status === "signed").length;
                return (
                  <li key={d.id}>
                    <Link href={`/app/documents/${d.id}`} className="grid gap-2 px-4 py-4 hover:bg-bg md:grid-cols-[1fr_140px_160px_120px] md:items-center md:gap-4 md:px-5">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-[6px] bg-danger-soft font-mono text-[9.5px] text-danger">PDF</span>
                        <div className="min-w-0">
                          <p className="truncate text-[14.5px] text-ink">{d.title}</p>
                          <p className="text-[12.5px] text-muted">{d.type} · {d.pages} page{d.pages > 1 ? "s" : ""}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 pl-12 md:block md:pl-0">
                        <DocStatus status={d.status} />
                        <span className="text-[12.5px] text-muted md:hidden">{signed}/{d.signers.length} signed · {fmtDate(d.updatedAt)}</span>
                      </div>
                      <div className="hidden items-center gap-2 md:flex">
                        <div className="flex -space-x-1.5">
                          {d.signers.slice(0, 3).map((s) => (
                            <span key={s.id} className={cn("flex size-6 items-center justify-center rounded-full text-[9.5px] ring-2 ring-surface", s.status === "signed" ? "bg-success-soft text-success" : "bg-accent-soft text-primary")}>
                              {initials(s.name)}
                            </span>
                          ))}
                        </div>
                        <span className="text-[12.5px] text-muted">{signed} of {d.signers.length}</span>
                      </div>
                      <span className="hidden text-[13px] text-muted md:block">{fmtDate(d.updatedAt)}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}
