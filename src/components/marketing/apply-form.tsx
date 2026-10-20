"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button, Field, Input, LinkButton, Select } from "@/components/ui";

export function ApplyForm() {
  const [sent, setSent] = useState(false);
  if (sent) {
    return (
      <div className="flex flex-col items-start justify-center rounded-[10px] border border-line bg-bg p-8">
        <CheckCircle2 className="size-8 text-success" />
        <p className="mt-4 text-[22px] text-ink">Application received</p>
        <p className="mt-2 text-[15px] text-muted">We&apos;ll verify your commission and email you within 3 working days. Meanwhile, explore the notary portal with demo data.</p>
        <LinkButton href="/login?as=notary" className="mt-6">
          Open the notary portal demo
        </LinkButton>
      </div>
    );
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
      className="grid gap-4 rounded-[10px] border border-line bg-bg p-5 sm:grid-cols-2 sm:p-7"
    >
      <Field label="Full name" className="sm:col-span-2">
        <Input required placeholder="Atty. Juan Dela Cruz" />
      </Field>
      <Field label="Email">
        <Input required type="email" placeholder="you@lawfirm.ph" />
      </Field>
      <Field label="Mobile number">
        <Input required type="tel" placeholder="+63 9XX XXX XXXX" />
      </Field>
      <Field label="Roll of Attorneys no.">
        <Input required inputMode="numeric" placeholder="71204" />
      </Field>
      <Field label="Notarial commission no.">
        <Input required placeholder="2026-001" />
      </Field>
      <Field label="Commissioning court (RTC)" className="sm:col-span-2">
        <Select required defaultValue="">
          <option value="" disabled>
            Select region
          </option>
          {["NCR", "Region I", "Region III", "Region IV-A", "Region VII", "Region XI", "CAR", "Other"].map((r) => (
            <option key={r}>{r}</option>
          ))}
        </Select>
      </Field>
      <Button type="submit" size="lg" className="sm:col-span-2">
        Submit application
      </Button>
    </form>
  );
}
