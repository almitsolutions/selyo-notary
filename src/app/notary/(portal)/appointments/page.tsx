"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { Card, EmptyState } from "@/components/ui";
import { PageHeader, pageWrap } from "@/components/app-shell";
import { AppointmentRow } from "@/components/notary/appointment-row";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

type Tab = "upcoming" | "review" | "completed" | "closed";

function Appointments() {
  const params = useSearchParams();
  const all = useApp((s) => s.notarizations);
  const [tab, setTab] = useState<Tab>((params.get("tab") as Tab) ?? "upcoming");

  const groups: Record<Tab, typeof all> = {
    upcoming: all.filter((n) => ["confirmed", "in_session", "pending_payment", "sealing"].includes(n.status)).sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt)),
    review: all.filter((n) => n.status === "awaiting_review"),
    completed: all.filter((n) => n.status === "notarized").sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt)),
    closed: all.filter((n) => n.status === "declined" || n.status === "cancelled"),
  };
  const labels: Record<Tab, string> = { upcoming: "Upcoming", review: "Awaiting review", completed: "Completed", closed: "Declined & cancelled" };

  return (
    <div className={pageWrap}>
      <PageHeader eyebrow="Appointments" title="Appointments" subtitle="Review requests and run your sessions." />
      <div className="scrollbar-none -mx-4 mb-5 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {(Object.keys(groups) as Tab[]).map((k) => (
          <button key={k} onClick={() => setTab(k)} className={cn("shrink-0 rounded-[6px] border px-3 py-1.5 text-[13.5px]", tab === k ? "border-line bg-surface text-primary shadow-sm" : "border-transparent text-muted")}>
            {labels[k]} <span className="ml-1 text-soft">{groups[k].length}</span>
          </button>
        ))}
      </div>
      {groups[tab].length ? (
        <Card className="divide-y divide-line">
          {groups[tab].map((n) => <AppointmentRow key={n.id} n={n} />)}
        </Card>
      ) : (
        <EmptyState icon={<CalendarDays className="size-5" />} title={`No ${labels[tab].toLowerCase()} appointments`} body="New requests from clients appear here." />
      )}
    </div>
  );
}

export default function AppointmentsPage() {
  return (
    <Suspense>
      <Appointments />
    </Suspense>
  );
}
