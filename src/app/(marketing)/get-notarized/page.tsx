import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { LinkButton, SectionHeading } from "@/components/ui";
import { ModeToggle, StepsWalkthrough } from "@/components/marketing/steps-walkthrough";
import { documentTypes, notAccepted, notarialActs } from "@/lib/mock/content";

export const metadata: Metadata = { title: "How it works" };

const container = "mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-10";

export default function GetNotarizedPage() {
  return (
    <>
      <section className={`${container} pt-12 pb-16 sm:pt-20`}>
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-end lg:gap-16">
          <div>
            <p className="eyebrow mb-5">Get notarized</p>
            <h1 className="text-[40px] leading-[1.03] font-normal sm:text-[60px] lg:text-[68px]">
              Your documents notarized <span className="text-soft">without the trip</span>
            </h1>
          </div>
          <div>
            <p className="text-[17px] leading-relaxed sm:text-[19px]">
              Verify your ID, upload your document, and meet a commissioned Electronic Notary Public on video. It usually
              takes about 15 minutes once you&apos;re booked.
            </p>
            <div className="mt-7 grid grid-cols-2 gap-3 sm:flex">
              <LinkButton href="/signup" size="lg">
                Book a notarization
              </LinkButton>
              <LinkButton href="/notaries" size="lg" variant="secondary">
                Browse notaries
              </LinkButton>
            </div>
          </div>
        </div>
      </section>

      <section className={`${container} pb-24`}>
        <div className="mb-12 text-center">
          <p className="eyebrow mb-4">Five steps</p>
          <h2 className="text-[34px] leading-[1.05] font-normal sm:text-[48px]">
            How it works, <span className="text-soft">from account to notarized PDF</span>
          </h2>
        </div>
        <StepsWalkthrough />
      </section>

      <section className="bg-surface py-24">
        <div className={container}>
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-end">
            <SectionHeading eyebrow="Remote or in person" title="Choose how" muted="you'll appear" />
            <p className="text-[17px] leading-relaxed">Either way the notarization is electronic. Switch to see who is where.</p>
          </div>
          <div className="mt-10">
            <ModeToggle />
          </div>
        </div>
      </section>

      <section className={`${container} py-24`}>
        <SectionHeading eyebrow="Notarial acts" title="Pick the act" muted="your document needs" />
        <div className="mt-10 grid gap-px overflow-hidden rounded-[10px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {notarialActs.map((a) => (
            <div key={a.act} className="bg-surface p-6">
              <p className="text-[17px] font-medium text-ink">{a.act}</p>
              <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{a.description}</p>
            </div>
          ))}
          <div className="flex flex-col justify-between bg-accent-soft p-6">
            <p className="text-[15px] text-primary">Not sure which one? Your notary will confirm before the session.</p>
            <LinkButton href="/notaries" variant="secondary" size="sm" className="mt-4 self-start">
              Ask a notary <ArrowRight className="size-4" />
            </LinkButton>
          </div>
        </div>
        <div className="mt-14 grid gap-10 lg:grid-cols-2">
          <div>
            <p className="mono-label mb-3">Common documents</p>
            <div className="flex flex-wrap gap-2">
              {documentTypes.filter((d) => d !== "Other").map((d) => (
                <span key={d} className="rounded-full border border-line bg-surface px-3 py-1 text-[13.5px] text-ink">
                  {d}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="mono-label mb-3">Not available online</p>
            <ul className="space-y-1.5 text-[15px] text-muted">
              {notAccepted.map((n) => (
                <li key={n}>— {n}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className={`${container} pb-24`}>
        <div className="brush rounded-[14px] px-6 py-14 text-center sm:py-20">
          <h2 className="mx-auto max-w-2xl text-[32px] leading-[1.05] font-normal !text-white sm:text-[46px]">Ready when you are</h2>
          <p className="mx-auto mt-4 max-w-md text-white/80">Create your account in a minute. Verify your ID once and reuse it for every notarization.</p>
          <LinkButton href="/signup" size="lg" className="mt-8 bg-white text-primary hover:bg-white/90">
            Create a free account
          </LinkButton>
        </div>
      </section>
    </>
  );
}
