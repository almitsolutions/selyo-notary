import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BadgeCheck, Clock, Languages, MapPin, Star } from "lucide-react";
import { Avatar, Card, LinkButton, Pill } from "@/components/ui";
import { findNotary, notaries } from "@/lib/mock/notaries";
import { notarialActs } from "@/lib/mock/content";
import { fmtDate, peso } from "@/lib/utils";

export function generateStaticParams() {
  return notaries.map((n) => ({ id: n.id }));
}

export default async function NotaryProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const n = findNotary(id);
  if (!n) notFound();

  return (
    <div className="mx-auto max-w-[1100px] px-4 pt-8 pb-24 sm:px-6 sm:pt-12">
      <Link href="/notaries" className="inline-flex items-center gap-1.5 text-[14px] text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> All notaries
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div>
          <div className="flex items-start gap-4">
            <Avatar name={n.name} color={n.avatarColor} size={72} />
            <div>
              <h1 className="text-[28px] leading-tight font-normal sm:text-[36px]">{n.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[14px] text-muted">
                <span className="flex items-center gap-1"><MapPin className="size-4" /> {n.city}, {n.province}</span>
                <span className="flex items-center gap-1"><Star className="size-4 fill-warning text-warning" /> {n.rating.toFixed(1)} · {n.sessions} sessions</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Pill tone="green"><BadgeCheck className="size-3.5" /> Commission verified</Pill>
                {n.badges.map((b) => <Pill key={b} tone="purple">{b}</Pill>)}
              </div>
            </div>
          </div>

          <p className="mt-8 text-[16.5px] leading-relaxed">{n.bio}</p>

          <h2 className="mt-10 mb-4 text-[20px] font-medium">Services & fees</h2>
          <Card className="divide-y divide-line">
            {n.services.map((s) => (
              <div key={s.act} className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="text-ink">{s.act}</p>
                  <p className="mt-0.5 text-[13px] text-muted">{notarialActs.find((a) => a.act === s.act)?.description}</p>
                </div>
                <p className="shrink-0 text-[17px] text-ink">{peso(s.fee)}</p>
              </div>
            ))}
          </Card>

          <h2 className="mt-10 mb-4 text-[20px] font-medium">Commission record</h2>
          <Card className="grid grid-cols-2 gap-px overflow-hidden bg-line sm:grid-cols-4">
            {[
              ["Roll number", n.rollNumber],
              ["Roll signed", fmtDate(n.rollSignedDate)],
              ["ENP commission", n.commissionNo],
              ["Valid until", fmtDate(n.commissionValidUntil)],
            ].map(([l, v]) => (
              <div key={l} className="bg-surface p-4">
                <p className="text-[12.5px] text-muted">{l}</p>
                <p className="mt-1 font-mono text-[13.5px] text-ink">{v}</p>
              </div>
            ))}
          </Card>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card className="p-5">
            <p className="text-[13px] text-muted">Fees from</p>
            <p className="text-[34px] leading-tight tracking-tight text-ink">{peso(Math.min(...n.services.map((s) => s.fee)))}</p>
            <ul className="mt-4 space-y-2.5 text-[14px]">
              <li className="flex items-center gap-2"><Languages className="size-4 text-muted" /> {n.languages.join(", ")}</li>
              <li className="flex items-center gap-2"><Clock className="size-4 text-muted" /> Book at least {n.minNoticeHours}h ahead</li>
              <li className="flex items-center gap-2"><BadgeCheck className="size-4 text-muted" /> {n.modes.map((m) => (m === "remote" ? "Remote" : "In-person")).join(" & ")}</li>
            </ul>
            <LinkButton href={`/app/notarizations/new?notary=${n.id}`} size="lg" className="mt-6 w-full">
              Book this notary
            </LinkButton>
            <p className="mt-3 text-center text-[12.5px] text-muted">You&apos;ll sign in or create a free account first.</p>
          </Card>
        </aside>
      </div>
    </div>
  );
}
