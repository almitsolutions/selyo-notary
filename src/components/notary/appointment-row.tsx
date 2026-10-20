"use client";

import Link from "next/link";
import { Laptop, Users, Video } from "lucide-react";
import { Avatar, Button, NzStatus } from "@/components/ui";
import { useApp } from "@/lib/store";
import { fmtTime, peso, relativeDay } from "@/lib/utils";
import type { Notarization } from "@/lib/types";

export function AppointmentRow({ n, showActions = true }: { n: Notarization; showActions?: boolean }) {
  const accept = useApp((s) => s.acceptAppointment);
  const decline = useApp((s) => s.declineAppointment);
  return (
    <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
      <Link href={`/notary/appointments/${n.id}`} className="flex min-w-0 flex-1 items-center gap-3">
        <div className="w-14 shrink-0 text-center">
          <p className="text-[11px] text-muted uppercase">{relativeDay(n.scheduledAt).split(",")[0]}</p>
          <p className="text-[15px] text-ink">{fmtTime(n.scheduledAt)}</p>
        </div>
        <Avatar name={n.principalName} size={36} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14.5px] text-ink">{n.documentTitle}</p>
          <p className="flex items-center gap-1.5 text-[12.5px] text-muted">
            {n.mode === "remote" ? <Video className="size-3.5" /> : <Laptop className="size-3.5" />}
            {n.principalName} · {n.act} · {peso(n.fee)}
            {n.witnesses.length > 0 && <><Users className="ml-1 size-3.5" /> {n.witnesses.length}</>}
          </p>
        </div>
      </Link>
      <div className="flex items-center gap-2 pl-[68px] sm:pl-0">
        {showActions && n.status === "awaiting_review" ? (
          <>
            <Button size="sm" variant="secondary" onClick={() => decline(n.id, "")}>Decline</Button>
            <Button size="sm" onClick={() => accept(n.id)}>Accept</Button>
          </>
        ) : (
          <NzStatus status={n.status} />
        )}
      </div>
    </div>
  );
}
