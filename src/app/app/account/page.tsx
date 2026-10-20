"use client";

import { useRouter } from "next/navigation";
import { BadgeCheck, LogOut, RotateCcw, ScanFace, ShieldAlert } from "lucide-react";
import { Avatar, Button, Card, Field, Input, LinkButton, Pill } from "@/components/ui";
import { PageHeader, pageWrap } from "@/components/app-shell";
import { useApp } from "@/lib/store";
import { cn, fmtDate } from "@/lib/utils";

export default function AccountPage() {
  const router = useRouter();
  const principal = useApp((s) => s.principal)!;
  const signOut = useApp((s) => s.signOut);
  const reset = useApp((s) => s.resetDemo);
  const kyc = principal.kyc;

  return (
    <div className={cn(pageWrap, "max-w-[820px]")}>
      <PageHeader eyebrow="Account" title="Your account" />

      <Card className="flex items-center gap-4 p-5">
        <Avatar name={principal.name} size={56} />
        <div className="min-w-0 flex-1">
          <p className="text-[18px] text-ink">{principal.name}</p>
          <p className="text-[14px] text-muted">{principal.email}</p>
        </div>
        {kyc.status === "verified" ? <Pill tone="green"><BadgeCheck className="size-3.5" /> Verified</Pill> : <Pill tone="amber">Unverified</Pill>}
      </Card>

      <h2 className="mt-8 mb-3 text-[17px] font-medium">Identity verification</h2>
      {kyc.status === "verified" ? (
        <Card className="divide-y divide-line">
          {[
            ["Status", <span key="s" className="text-success">Verified</span>],
            ["Method", kyc.method === "philsys" ? "PhilSys registry check + face scan" : "Government ID + face scan"],
            ["ID used", kyc.idType],
            ["Verified on", kyc.verifiedAt && fmtDate(kyc.verifiedAt)],
            ["Valid until", kyc.expiresAt && fmtDate(kyc.expiresAt)],
          ].map(([k, v]) => (
            <div key={k as string} className="flex justify-between gap-4 px-5 py-3 text-[14px]">
              <span className="text-muted">{k}</span>
              <span className="text-right text-ink">{v}</span>
            </div>
          ))}
        </Card>
      ) : (
        <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
          <ShieldAlert className="size-6 text-warning" />
          <p className="flex-1 text-[14.5px]">You need a verified identity before you can book a notary.</p>
          <LinkButton href="/onboarding/verify-id"><ScanFace className="size-4" /> Verify now</LinkButton>
        </Card>
      )}

      <h2 className="mt-8 mb-3 text-[17px] font-medium">Profile</h2>
      <Card className="grid gap-4 p-5 sm:grid-cols-2">
        <Field label="Full name" hint={kyc.status === "verified" ? "Locked to your verified ID" : undefined}>
          <Input defaultValue={principal.name} disabled={kyc.status === "verified"} />
        </Field>
        <Field label="Email"><Input defaultValue={principal.email} /></Field>
        <Field label="Mobile number"><Input defaultValue="+63 917 555 4821" /></Field>
        <Field label="Notifications"><Input defaultValue="Email & SMS" disabled /></Field>
      </Card>

      <h2 className="mt-8 mb-3 text-[17px] font-medium">Demo</h2>
      <Card className="flex flex-col gap-3 p-5 sm:flex-row">
        <Button variant="secondary" onClick={() => { reset(); router.push("/app"); }}><RotateCcw className="size-4" /> Reset demo data</Button>
        <LinkButton href="/notary" variant="secondary">Open notary portal</LinkButton>
        <Button variant="ghost" className="text-danger sm:ml-auto" onClick={() => { signOut("principal"); router.push("/"); }}><LogOut className="size-4" /> Sign out</Button>
      </Card>
    </div>
  );
}
