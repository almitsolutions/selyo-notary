"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarClock, Plus, Stamp } from "lucide-react";
import { Avatar, Card, EmptyState, LinkButton, NzStatus } from "@/components/ui";
import { PageHeader, pageWrap } from "@/components/app-shell";
import { useApp } from "@/lib/store";
import { findNotary } from "@/lib/mock/notaries";
import { cn, fmtTime, peso, relativeDay } from "@/lib/utils";

export default function NotarizationsPage() {
  const principal = useApp((s) => s.principal)!;
  const all = useApp((s) => s.notarizations).filter((n) => n.principalId === principal.id);
  const [tab, setTab] = useState<"active" | "done">("active");
  const active = all.filter((n) => !["notarized", "cancelled", "declined"].includes(n.status));
  const done = all.filter((n) => ["notarized", "cancelled", "declined"].includes(n.status));
  const list = (tab === "active" ? active : done).sort((a, b) => (tab === "active" ? a.scheduledAt.localeCompare(b.scheduledAt) : b.scheduledAt.localeCompare(a.scheduledAt)));

  return (
    <div className={pageWrap}>
      <PageHeader
        eyebrow="Notarizations"
        title="Your notarizations"
        subtitle="Appointments, sessions, and notarized documents."
        actions={<LinkButton href="/app/notarizations/new"><Plus className="size-4" /> Book a notarization</LinkButton>}
      />
      <div className="mb-5 flex gap-1">
        {([["active", `Upcoming & active`, active.length], ["done", "Completed", done.length]] as const).map(([k, l, c]) => (
          <button key={k} onClick={() => setTab(k)} className={cn("rounded-[6px] border px-3 py-1.5 text-[13.5px]", tab === k ? "border-line bg-surface text-primary shadow-sm" : "border-transparent text-muted")}>
            {l} <span className="ml-1 text-soft">{c}</span>
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <EmptyState icon={<Stamp className="size-5" />} title={tab === "active" ? "Nothing scheduled" : "No completed notarizations yet"} body="Book a notary for any signed document." action={<LinkButton href="/app/notarizations/new">Book a notarization</LinkButton>} />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {list.map((n) => {
            const notary = findNotary(n.notaryId)!;
            return (
              <Link key={n.id} href={`/app/notarizations/${n.id}`}>
                <Card className="h-full p-5 transition hover:border-line-strong hover:shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[15.5px] text-ink">{n.documentTitle}</p>
                    <NzStatus status={n.status} />
                  </div>
                  <p className="mt-2 flex items-center gap-1.5 text-[13.5px] text-muted">
                    <CalendarClock className="size-4" /> {relativeDay(n.scheduledAt)}, {fmtTime(n.scheduledAt)} · {n.act} · {n.mode === "remote" ? "Remote" : "In-person"}
                  </p>
                  <div className="mt-4 flex items-center gap-2.5 border-t border-line pt-3">
                    <Avatar name={notary.name} color={notary.avatarColor} size={28} />
                    <span className="flex-1 truncate text-[13.5px] text-ink">{notary.name}</span>
                    <span className="text-[14px] text-ink">{peso(n.fee)}</span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
