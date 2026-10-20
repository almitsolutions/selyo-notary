"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, Coins, Stamp, Video, Wallet } from "lucide-react";
import { Card, LinkButton } from "@/components/ui";
import { pageWrap } from "@/components/app-shell";
import { AppointmentRow } from "@/components/notary/appointment-row";
import { useApp } from "@/lib/store";
import { findNotary } from "@/lib/mock/notaries";
import { fmtDate, fmtTime, peso, relativeDay } from "@/lib/utils";

export default function NotaryDashboard() {
  const user = useApp((s) => s.notaryUser)!;
  const all = useApp((s) => s.notarizations);
  const credits = useApp((s) => s.credits);
  const notary = findNotary(user.notaryId!)!;

  const isToday = (iso: string) => new Date(iso).toDateString() === new Date().toDateString();
  const pending = all.filter((n) => n.status === "awaiting_review");
  const today = all
    .filter((n) => isToday(n.scheduledAt) && !["declined", "cancelled", "awaiting_review"].includes(n.status))
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
  const live = all.find((n) => ["in_session", "pending_payment"].includes(n.status));
  const monthNotarized = all.filter((n) => n.status === "notarized" && new Date(n.notarizedAt!).getMonth() === new Date().getMonth());
  const earnings = monthNotarized.reduce((sum, n) => sum + n.fee, 0);
  const nextUp = today.find((n) => n.status === "confirmed");

  return (
    <div className={pageWrap}>
      <p className="text-[14px] text-muted">{fmtDate(new Date().toISOString(), { weekday: "long", month: "long", day: "numeric" })}</p>
      <h1 className="mt-1 text-[28px] font-normal sm:text-[34px]">Welcome back, {notary.name.split(" ").slice(0, 2).join(" ")}</h1>

      {live && (
        <Card className="mt-6 flex flex-col gap-3 border-success/30 bg-success-soft p-4 sm:flex-row sm:items-center">
          <span className="flex items-center gap-2 text-[14px] text-success"><span className="size-2 animate-pulse rounded-full bg-success" /> Session in progress</span>
          <p className="flex-1 truncate text-[14px] text-ink">{live.documentTitle} · {live.principalName}</p>
          <LinkButton href={`/notary/session/${live.id}`} size="sm"><Video className="size-4" /> Rejoin</LinkButton>
        </Card>
      )}

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { icon: CalendarDays, label: "Sessions today", value: today.length, href: "/notary/appointments" },
          { icon: Stamp, label: "Awaiting review", value: pending.length, href: "/notary/appointments?tab=review" },
          { icon: Wallet, label: "Earned this month", value: peso(earnings), href: "/notary/register" },
          { icon: Coins, label: "Credits left", value: credits, href: "/notary/credits" },
        ].map((s) => (
          <Link key={s.label} href={s.href} className="rounded-[10px] border border-line bg-surface p-4 transition hover:border-line-strong">
            <s.icon className="size-4.5 text-accent" />
            <p className="mt-5 text-[26px] leading-none tracking-tight text-ink">{s.value}</p>
            <p className="mt-1.5 text-[13px] text-muted">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          {nextUp && (
            <div className="brush rounded-[12px] p-5 text-white sm:p-6">
              <p className="font-mono text-[11px] tracking-[0.14em] text-white/70">NEXT SESSION · {relativeDay(nextUp.scheduledAt).toUpperCase()} {fmtTime(nextUp.scheduledAt)}</p>
              <p className="mt-2 text-[22px] leading-tight">{nextUp.documentTitle}</p>
              <p className="mt-1 text-[14px] text-white/80">{nextUp.principalName} · {nextUp.act} · {peso(nextUp.fee)}</p>
              <div className="mt-5 grid grid-cols-2 gap-2 sm:flex">
                <LinkButton href={`/notary/session/${nextUp.id}`} className="bg-white text-primary hover:bg-white/90"><Video className="size-4" /> Start session</LinkButton>
                <LinkButton href={`/notary/appointments/${nextUp.id}`} variant="outline-light">Review</LinkButton>
              </div>
            </div>
          )}

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[18px] font-medium">Requests to review</h2>
              <Link href="/notary/appointments?tab=review" className="flex items-center gap-1 text-[13.5px] text-primary">All <ArrowRight className="size-3.5" /></Link>
            </div>
            <Card className="divide-y divide-line">
              {pending.map((n) => <AppointmentRow key={n.id} n={n} />)}
              {!pending.length && <p className="p-6 text-center text-[14px] text-muted">No pending requests.</p>}
            </Card>
          </section>
        </div>

        <section>
          <h2 className="mb-3 text-[18px] font-medium">Today</h2>
          <Card className="p-4">
            {today.length ? (
              <ol className="relative space-y-4 border-l border-line pl-5">
                {today.map((n) => (
                  <li key={n.id} className="relative">
                    <span className="absolute top-1.5 -left-[25px] size-2.5 rounded-full border-2 border-surface bg-accent" />
                    <Link href={`/notary/appointments/${n.id}`} className="block hover:opacity-80">
                      <p className="font-mono text-[12px] text-muted">{fmtTime(n.scheduledAt)}</p>
                      <p className="text-[14.5px] text-ink">{n.principalName}</p>
                      <p className="text-[12.5px] text-muted">{n.act} · {n.mode === "remote" ? "Remote" : "In-person"}</p>
                    </Link>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="py-6 text-center text-[14px] text-muted">Nothing scheduled today.</p>
            )}
          </Card>
          <p className="mt-3 text-[12.5px] text-muted">Demo: every booking made in the client app shows up here, whichever notary was picked.</p>
        </section>
      </div>
    </div>
  );
}
