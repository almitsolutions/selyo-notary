import Link from "next/link";
import { Languages, MapPin, Star } from "lucide-react";
import { Avatar, Pill } from "@/components/ui";
import type { Notary } from "@/lib/types";
import { cn, fmtDate, peso } from "@/lib/utils";

export function NotaryCard({
  notary,
  href,
  selected,
  onSelect,
  feeFor,
}: {
  notary: Notary;
  href?: string;
  selected?: boolean;
  onSelect?: () => void;
  feeFor?: string;
}) {
  const minFee = Math.min(...notary.services.map((s) => s.fee));
  const fee = feeFor ? notary.services.find((s) => s.act === feeFor)?.fee : undefined;
  const body = (
    <>
      <div className="flex items-start gap-3">
        <Avatar name={notary.name} color={notary.avatarColor} size={44} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[16px] font-medium text-ink">{notary.name}</p>
          <p className="mt-0.5 flex items-center gap-1 text-[13px] text-muted">
            <MapPin className="size-3.5" /> {notary.city}, {notary.province}
          </p>
        </div>
        <span className="flex items-center gap-1 text-[13px] text-ink">
          <Star className="size-3.5 fill-warning text-warning" /> {notary.rating.toFixed(1)}
        </span>
      </div>
      <p className="mt-4 flex items-center gap-1.5 text-[13.5px]">
        <Languages className="size-3.5 text-muted" /> {notary.languages.join(", ")}
      </p>
      <dl className="mt-4 grid grid-cols-3 gap-2 text-[12px]">
        <div>
          <dt className="text-muted">Roll no.</dt>
          <dd className="mt-0.5 font-mono text-[12.5px] text-ink">{notary.rollNumber}</dd>
        </div>
        <div>
          <dt className="text-muted">Roll signed</dt>
          <dd className="mt-0.5 text-[13px] text-ink">{fmtDate(notary.rollSignedDate)}</dd>
        </div>
        <div>
          <dt className="text-muted">{fee ? "Fee" : "Services"}</dt>
          <dd className="mt-0.5 text-[13px] text-ink">{fee ? peso(fee) : `from ${peso(minFee)}`}</dd>
        </div>
      </dl>
      <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-line pt-3">
        {notary.modes.map((m) => (
          <Pill key={m} tone="neutral">{m === "remote" ? "Remote" : "In-person"}</Pill>
        ))}
        {notary.badges.map((b) => (
          <Pill key={b} tone="purple">{b}</Pill>
        ))}
        {href && <span className="ml-auto text-[13px] text-primary">View profile</span>}
      </div>
    </>
  );
  const cls = cn(
    "block rounded-[10px] border bg-surface p-5 text-left transition hover:border-line-strong hover:shadow-sm",
    selected ? "border-primary ring-1 ring-primary" : "border-line",
  );
  if (href) return <Link href={href} className={cls}>{body}</Link>;
  return (
    <button type="button" onClick={onSelect} className={cn(cls, "w-full")}>
      {body}
    </button>
  );
}
