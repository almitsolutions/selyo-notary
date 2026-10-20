"use client";

import Link from "next/link";
import { ArrowRight, CalendarClock, FilePlus2, FileSignature, ScanFace, Search, ShieldAlert, Video, Wallet } from "lucide-react";
import { Avatar, Card, DocStatus, LinkButton, NzStatus } from "@/components/ui";
import { pageWrap } from "@/components/app-shell";
import { useApp } from "@/lib/store";
import { findNotary } from "@/lib/mock/notaries";
import { fmtDate, fmtTime, peso, relativeDay } from "@/lib/utils";

export default function ClientHome() {
  const principal = useApp((s) => s.principal)!;
  const documents = useApp((s) => s.documents).filter((d) => d.ownerId === principal.id);
  const nzs = useApp((s) => s.notarizations).filter((n) => n.principalId === principal.id);

  const upcoming = nzs
    .filter((n) => ["confirmed", "in_session", "pending_payment", "awaiting_review"].includes(n.status))
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
  const next = upcoming[0];
  const toSign = documents.filter((d) => d.signers.some((s) => s.email === principal.email && s.status === "notified"));
  const toPay = nzs.filter((n) => n.status === "pending_payment");
  const verified = principal.kyc.status === "verified";
  const hour = new Date().getHours();

  return (
    <div className={pageWrap}>
      <p className="text-[14px] text-muted">{fmtDate(new Date().toISOString(), { weekday: "long", month: "long", day: "numeric" })}</p>
      <h1 className="mt-1 text-[28px] font-normal sm:text-[36px]">
        Good {hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening"}, {principal.name.split(" ")[0]}
      </h1>

      {!verified && (
        <Card className="mt-6 flex flex-col gap-4 border-warning/30 bg-warning-soft p-5 sm:flex-row sm:items-center">
          <ShieldAlert className="size-6 shrink-0 text-warning" />
          <div className="flex-1">
            <p className="font-medium text-ink">Verify your identity to book a notary</p>
            <p className="text-[14px] text-body">Takes about 3 minutes with your PhilSys ID or another government ID. One-time ₱99.</p>
          </div>
          <LinkButton href="/onboarding/verify-id">
            <ScanFace className="size-4" /> Verify now
          </LinkButton>
        </Card>
      )}

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        {/* Next appointment */}
        {next ? (
          <div className="brush relative overflow-hidden rounded-[12px] p-5 text-white sm:p-7">
            <p className="font-mono text-[11px] tracking-[0.14em] text-white/70">NEXT APPOINTMENT</p>
            <p className="mt-3 text-[22px] leading-tight sm:text-[26px]">{next.documentTitle}</p>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[14px] text-white/85">
              <span className="flex items-center gap-1.5"><CalendarClock className="size-4" /> {relativeDay(next.scheduledAt)}, {fmtTime(next.scheduledAt)}</span>
              <span>{next.act} · {next.mode === "remote" ? "Remote" : "In-person"}</span>
            </div>
            <div className="mt-5 flex items-center gap-3 rounded-[8px] bg-white/10 p-3 backdrop-blur">
              <Avatar name={findNotary(next.notaryId)!.name} size={36} className="bg-white/90!" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14.5px] text-white">{findNotary(next.notaryId)!.name}</p>
                <p className="text-[12.5px] text-white/70">{next.status === "awaiting_review" ? "Waiting for the notary to confirm" : "Electronic Notary Public"}</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2 sm:flex">
              {next.status === "confirmed" || next.status === "in_session" ? (
                <LinkButton href={`/session/${next.id}`} className="bg-white text-primary hover:bg-white/90">
                  <Video className="size-4" /> Join session
                </LinkButton>
              ) : next.status === "pending_payment" ? (
                <LinkButton href={`/app/pay/${next.id}`} className="bg-white text-primary hover:bg-white/90">
                  <Wallet className="size-4" /> Pay {peso(next.fee)}
                </LinkButton>
              ) : null}
              <LinkButton href={`/app/notarizations/${next.id}`} variant="outline-light">
                Details
              </LinkButton>
            </div>
          </div>
        ) : (
          <Card className="flex flex-col justify-center p-6">
            <p className="text-[20px] text-ink">No upcoming appointments</p>
            <p className="mt-1 text-[14.5px] text-muted">Upload a document and book a notary in a few taps.</p>
            <LinkButton href="/app/notarizations/new" className="mt-5 self-start">
              Book a notarization
            </LinkButton>
          </Card>
        )}

        {/* To-dos */}
        <Card className="p-5">
          <p className="mono-label">Needs your attention</p>
          <ul className="mt-3 divide-y divide-line">
            {toPay.map((n) => (
              <Todo key={n.id} href={`/app/pay/${n.id}`} icon={<Wallet className="size-4" />} title={`Pay ${peso(n.fee)}`} sub={n.documentTitle} />
            ))}
            {toSign.map((d) => (
              <Todo key={d.id} href={`/app/documents/${d.id}`} icon={<FileSignature className="size-4" />} title="Sign document" sub={d.title} />
            ))}
            {!verified && <Todo href="/onboarding/verify-id" icon={<ScanFace className="size-4" />} title="Verify your identity" sub="Required before booking" />}
            {!toPay.length && !toSign.length && verified && <li className="py-6 text-center text-[14px] text-muted">You&apos;re all caught up.</li>}
          </ul>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { href: "/app/documents/new", icon: FilePlus2, label: "Upload document" },
          { href: "/app/notarizations/new", icon: CalendarClock, label: "Book a notary" },
          { href: "/notaries", icon: Search, label: "Browse notaries" },
          { href: "/verify", icon: ScanFace, label: "Verify a PDF" },
        ].map((a) => (
          <Link key={a.href} href={a.href} className="flex flex-col gap-6 rounded-[10px] border border-line bg-surface p-4 transition hover:border-line-strong">
            <a.icon className="size-5 text-accent" />
            <span className="text-[14.5px] text-ink">{a.label}</span>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[18px] font-medium">Recent documents</h2>
            <Link href="/app/documents" className="flex items-center gap-1 text-[13.5px] text-primary">View all <ArrowRight className="size-3.5" /></Link>
          </div>
          <Card className="divide-y divide-line">
            {documents.slice(0, 4).map((d) => (
              <Link key={d.id} href={`/app/documents/${d.id}`} className="flex items-center gap-3 p-4 hover:bg-bg">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-[6px] bg-danger-soft font-mono text-[9.5px] text-danger">PDF</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14.5px] text-ink">{d.title}</p>
                  <p className="text-[12.5px] text-muted">{d.signers.filter((s) => s.status === "signed").length} of {d.signers.length} signed · {fmtDate(d.updatedAt)}</p>
                </div>
                <DocStatus status={d.status} />
              </Link>
            ))}
          </Card>
        </section>
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[18px] font-medium">Notarizations</h2>
            <Link href="/app/notarizations" className="flex items-center gap-1 text-[13.5px] text-primary">View all <ArrowRight className="size-3.5" /></Link>
          </div>
          <Card className="divide-y divide-line">
            {nzs.slice(0, 4).map((n) => (
              <Link key={n.id} href={`/app/notarizations/${n.id}`} className="flex items-center gap-3 p-4 hover:bg-bg">
                <Avatar name={findNotary(n.notaryId)!.name} color={findNotary(n.notaryId)!.avatarColor} size={36} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14.5px] text-ink">{n.documentTitle}</p>
                  <p className="text-[12.5px] text-muted">{n.act} · {relativeDay(n.scheduledAt)}</p>
                </div>
                <NzStatus status={n.status} />
              </Link>
            ))}
            {!nzs.length && <p className="p-6 text-center text-[14px] text-muted">No notarizations yet.</p>}
          </Card>
        </section>
      </div>
    </div>
  );
}

function Todo({ href, icon, title, sub }: { href: string; icon: React.ReactNode; title: string; sub: string }) {
  return (
    <li>
      <Link href={href} className="flex items-center gap-3 py-3 hover:opacity-80">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-primary">{icon}</span>
        <div className="min-w-0 flex-1">
          <p className="text-[14.5px] text-ink">{title}</p>
          <p className="truncate text-[12.5px] text-muted">{sub}</p>
        </div>
        <ArrowRight className="size-4 text-muted" />
      </Link>
    </li>
  );
}
