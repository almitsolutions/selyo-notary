import type { Metadata } from "next";
import { LinkButton, SectionHeading } from "@/components/ui";
import { PricingPlans } from "@/components/marketing/pricing-plans";
import { FaqList } from "@/components/marketing/faq-list";
import { creditPackages, KYC_FEE, notarialActs } from "@/lib/mock/content";
import { peso } from "@/lib/utils";

export const metadata: Metadata = { title: "Pricing" };

const container = "mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-10";

const typicalFees: Record<string, string> = {
  Acknowledgment: "₱500 – ₱750",
  Jurat: "₱400 – ₱650",
  "Oath or Affirmation": "₱350 – ₱600",
  "Copy Certification": "₱300 – ₱550",
  "Signature Witnessing": "₱350 – ₱600",
};

export default function PricingPage() {
  return (
    <>
      <section className={`${container} pt-12 pb-14 sm:pt-20`}>
        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-end lg:gap-16">
          <div>
            <p className="eyebrow mb-5">Pricing</p>
            <h1 className="text-[42px] leading-[1.02] font-normal sm:text-[60px] lg:text-[72px]">
              Signing is free. <span className="text-soft">Pay only to notarize.</span>
            </h1>
          </div>
          <p className="text-[17px] leading-relaxed sm:text-[19px]">
            Most people never need a plan — create a free account, verify your ID once, and pay the notary&apos;s fee per
            document. Plans are for teams sending documents to others.
          </p>
        </div>
      </section>

      <section className={`${container} pb-20`}>
        <div className="grid gap-px overflow-hidden rounded-[12px] border border-line bg-line lg:grid-cols-[1fr_1.4fr]">
          <div className="bg-surface p-6 sm:p-8">
            <p className="mono-label !text-primary">Per notarization</p>
            <p className="mt-3 text-[26px] tracking-tight text-ink">What you pay to get one document notarized</p>
            <dl className="mt-8 space-y-4 text-[15px]">
              <div className="flex justify-between gap-4 border-b border-line pb-4">
                <dt>Account & e-signing</dt>
                <dd className="text-ink">Free</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-line pb-4">
                <dt>
                  Identity verification
                  <span className="block text-[13px] text-muted">One time, valid up to 3 years</span>
                </dt>
                <dd className="text-ink">₱{KYC_FEE}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>
                  Notary&apos;s fee
                  <span className="block text-[13px] text-muted">Shown before you book</span>
                </dt>
                <dd className="text-ink">Set by notary</dd>
              </div>
            </dl>
            <LinkButton href="/signup" className="mt-8 w-full sm:w-auto">
              Get notarized
            </LinkButton>
          </div>
          <div className="bg-surface p-6 sm:p-8">
            <p className="mono-label">Typical notary fees on {"the network"}</p>
            <table className="mt-4 w-full text-[15px]">
              <tbody>
                {notarialActs.map((a) => (
                  <tr key={a.act} className="border-b border-line last:border-0">
                    <td className="py-4 pr-4">
                      <p className="text-ink">{a.act}</p>
                      <p className="mt-0.5 hidden text-[13px] text-muted sm:block">{a.description}</p>
                    </td>
                    <td className="py-4 text-right whitespace-nowrap text-ink">{typicalFees[a.act]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className={`${container} pb-24`}>
        <SectionHeading eyebrow="Plans" title="For teams" muted="that send documents" className="mb-10" />
        <PricingPlans />
      </section>

      <section className="bg-surface py-24">
        <div className={container}>
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-end">
            <SectionHeading eyebrow="For notaries" title="No subscription." muted="One credit per document." />
            <p className="text-[17px] leading-relaxed">
              Electronic Notaries Public buy credits in advance. One credit covers one notarized document — the seal,
              fingerprint, storage, and register entry. Prices exclude 12% VAT.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {creditPackages.map((c) => (
              <div key={c.id} className={`rounded-[10px] border bg-bg p-6 ${c.popular ? "border-primary" : "border-line"}`}>
                <p className="mono-label">{c.credits} credits</p>
                <p className="mt-4 text-[36px] leading-none tracking-tight text-ink">{peso(c.price)}</p>
                <p className="mt-2 text-[14px] text-muted">{peso(Math.round(c.price / c.credits))} per document</p>
                {c.popular && <p className="mt-3 text-[12.5px] text-primary">Most popular</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`${container} py-24`}>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
          <h2 className="text-[34px] leading-[1.05] font-normal sm:text-[44px]">Pricing questions</h2>
          <FaqList
            items={[
              { q: "Do the people who sign need to pay?", a: "No. Signers and witnesses never pay for signing. Only the person requesting the notarization pays the notary's fee." },
              { q: "Why is there an identity verification fee?", a: `Each check queries the national ID registry or a government ID database, plus a biometric face match. The ₱${KYC_FEE} covers that, and your verification is reused for every notarization until your ID expires (up to 3 years).` },
              { q: "Can my company pay for employees' notarizations?", a: "Yes, on the Business plan notarial fees can be billed to the company instead of the individual." },
              { q: "What payment methods do you accept?", a: "GCash, Maya, and Visa/Mastercard credit or debit cards. Enterprise plans can be invoiced." },
            ]}
          />
        </div>
      </section>
    </>
  );
}
