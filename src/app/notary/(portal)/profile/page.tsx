"use client";

import { useState } from "react";
import { BadgeCheck, CheckCircle2 } from "lucide-react";
import { Avatar, Button, Card, Checkbox, Field, Input, LinkButton, Pill, Textarea } from "@/components/ui";
import { PageHeader, pageWrap } from "@/components/app-shell";
import { useApp } from "@/lib/store";
import { findNotary } from "@/lib/mock/notaries";
import { cn, fmtDate } from "@/lib/utils";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function NotaryProfilePage() {
  const user = useApp((s) => s.notaryUser)!;
  const n = findNotary(user.notaryId!)!;
  const [fees, setFees] = useState(Object.fromEntries(n.services.map((s) => [s.act, s.fee])));
  const [days, setDays] = useState(new Set(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]));
  const [remote, setRemote] = useState(n.modes.includes("remote"));
  const [inPerson, setInPerson] = useState(n.modes.includes("in_person"));
  const [saved, setSaved] = useState(false);

  return (
    <div className={cn(pageWrap, "max-w-[900px]")}>
      <PageHeader
        eyebrow="Profile"
        title="Your public profile"
        subtitle="What clients see in the notary network."
        actions={<LinkButton href={`/notaries/${n.id}`} variant="secondary">View public page</LinkButton>}
      />

      <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <Avatar name={n.name} color={n.avatarColor} size={60} />
        <div className="flex-1">
          <p className="text-[18px] text-ink">{n.name}</p>
          <p className="text-[14px] text-muted">{n.city}, {n.province}</p>
        </div>
        <Pill tone="green"><BadgeCheck className="size-3.5" /> Commission verified</Pill>
      </Card>

      <h2 className="mt-8 mb-3 text-[17px] font-medium">Commission</h2>
      <Card className="grid grid-cols-2 gap-px overflow-hidden bg-line sm:grid-cols-4">
        {[["Roll number", n.rollNumber], ["ENP commission", n.commissionNo], ["Valid until", fmtDate(n.commissionValidUntil)], ["Roll signed", fmtDate(n.rollSignedDate)]].map(([k, v]) => (
          <div key={k} className="bg-surface p-4">
            <p className="text-[12.5px] text-muted">{k}</p>
            <p className="mt-1 font-mono text-[13.5px] text-ink">{v}</p>
          </div>
        ))}
      </Card>

      <h2 className="mt-8 mb-3 text-[17px] font-medium">Services & fees</h2>
      <Card className="divide-y divide-line">
        {n.services.map((s) => (
          <div key={s.act} className="flex items-center justify-between gap-4 px-5 py-3">
            <span className="text-[14.5px] text-ink">{s.act}</span>
            <div className="relative w-32">
              <span className="absolute top-1/2 left-3 -translate-y-1/2 text-muted">₱</span>
              <Input type="number" min={0} step={50} value={fees[s.act]} onChange={(e) => setFees({ ...fees, [s.act]: Number(e.target.value) })} className="h-10 pl-7 text-right" />
            </div>
          </div>
        ))}
      </Card>

      <h2 className="mt-8 mb-3 text-[17px] font-medium">Availability</h2>
      <Card className="space-y-5 p-5">
        <div>
          <p className="mb-2 text-[13px] font-medium text-ink">Working days</p>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((d) => (
              <button
                key={d}
                onClick={() => { const c = new Set(days); if (c.has(d)) c.delete(d); else c.add(d); setDays(c); }}
                className={cn("h-10 w-14 rounded-[6px] border text-[13.5px]", days.has(d) ? "border-primary bg-primary text-primary-fg" : "border-line bg-surface text-muted")}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="From"><Input type="time" defaultValue="09:00" /></Field>
          <Field label="To"><Input type="time" defaultValue="18:00" /></Field>
          <Field label="Minimum notice (hours)"><Input type="number" defaultValue={n.minNoticeHours} min={0} /></Field>
        </div>
        <div className="space-y-2">
          <Checkbox checked={remote} onChange={setRemote}>Accept remote (REN) appointments</Checkbox>
          <Checkbox checked={inPerson} onChange={setInPerson}>Accept in-person (IEN) appointments at my office</Checkbox>
        </div>
      </Card>

      <h2 className="mt-8 mb-3 text-[17px] font-medium">About</h2>
      <Card className="p-5">
        <Field label="Bio"><Textarea rows={3} defaultValue={n.bio} /></Field>
        <Field label="Languages" className="mt-4"><Input defaultValue={n.languages.join(", ")} /></Field>
      </Card>

      <div className="mt-8 flex items-center justify-end gap-3">
        {saved && <span className="flex items-center gap-1.5 text-[14px] text-success"><CheckCircle2 className="size-4" /> Saved</span>}
        <Button size="lg" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}>Save changes</Button>
      </div>
    </div>
  );
}
