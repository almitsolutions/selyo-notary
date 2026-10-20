"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { LinkButton, Pill, Segmented } from "@/components/ui";
import { cn, peso } from "@/lib/utils";

const plans = [
  {
    name: "Personal",
    blurb: "For individuals notarizing a few documents a year",
    monthly: 0,
    unit: "free forever",
    cta: "Get started",
    features: ["Unlimited e-signing", "5 documents a month", "Book any notary", "1 GB storage", "Verify any document"],
  },
  {
    name: "Pro",
    blurb: "Freelancers, brokers, and agents with regular paperwork",
    monthly: 790,
    unit: "per month",
    cta: "Start Pro",
    features: ["Everything in Personal", "Unlimited documents", "Reusable templates", "Priority notary booking", "15 GB storage"],
  },
  {
    name: "Business",
    blurb: "Teams that send documents to clients for signing and notarization",
    monthly: 1490,
    unit: "per seat / month",
    cta: "Start Business",
    featured: true,
    minimum: "Minimum 3 seats",
    features: ["Everything in Pro", "Shared workspace", "Bulk sending", "Company billing for notarial fees", "Audit trail export", "90 GB storage"],
  },
  {
    name: "Enterprise",
    blurb: "Banks, lenders, and HR teams with high volume",
    monthly: null,
    unit: "custom pricing",
    cta: "Contact sales",
    features: ["Everything in Business", "SSO (SAML / OIDC)", "API & webhooks", "Dedicated notary pool", "SLA & premium support"],
  },
];

export function PricingPlans() {
  const [cycle, setCycle] = useState<"monthly" | "annual">("monthly");
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Segmented
          value={cycle}
          onChange={setCycle}
          options={[
            { value: "monthly", label: "Monthly" },
            { value: "annual", label: "Annual" },
          ]}
        />
        <Pill tone="purple">Annual saves 2 months</Pill>
        <span className="ml-auto hidden text-[13.5px] text-muted sm:block">VAT inclusive</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {plans.map((p) => {
          const price = p.monthly === null ? null : cycle === "annual" ? Math.round((p.monthly * 10) / 12) : p.monthly;
          return (
            <div key={p.name} className={cn("flex flex-col rounded-[10px] border bg-surface p-6", p.featured ? "border-primary ring-1 ring-primary" : "border-line")}>
              <div className="flex items-center justify-between">
                <p className="text-[18px] font-medium text-ink">{p.name}</p>
                {p.featured && <span className="rounded-full bg-primary px-2.5 py-0.5 text-[11.5px] text-primary-fg">For teams</span>}
              </div>
              <p className="mt-2 min-h-[42px] text-[14px] text-muted">{p.blurb}</p>
              <p className="mt-6 text-[44px] leading-none tracking-tight text-ink">{price === null ? "Custom" : peso(price)}</p>
              <p className="mt-2 text-[13.5px] text-muted">
                {p.unit}
                {cycle === "annual" && price ? ", billed yearly" : ""}
              </p>
              {p.minimum && <p className="mono-label mt-3 !text-primary">{p.minimum}</p>}
              <LinkButton href={p.monthly === null ? "mailto:sales@selyo.ph" : "/signup"} variant={p.featured ? "primary" : "secondary"} className="mt-6">
                {p.cta}
              </LinkButton>
              <ul className="mt-6 space-y-3 border-t border-line pt-6 text-[14px]">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2.5">
                    <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
