import type { Metadata } from "next";
import { BookOpen, CalendarCheck, CreditCard, ScanFace, Stamp, Video } from "lucide-react";
import { LinkButton, SectionHeading } from "@/components/ui";
import { SessionMock } from "@/components/marketing/mocks";
import { ApplyForm } from "@/components/marketing/apply-form";

export const metadata: Metadata = { title: "For notaries" };

const container = "mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-10";

export default function ForNotariesPage() {
  return (
    <>
      <section className={`${container} pt-12 pb-14 sm:pt-20`}>
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-end lg:gap-16">
          <div>
            <p className="eyebrow mb-5">For Electronic Notaries Public</p>
            <h1 className="text-[40px] leading-[1.03] font-normal sm:text-[60px] lg:text-[68px]">
              Notarize remotely, <span className="text-soft">on the record</span>
            </h1>
          </div>
          <div>
            <p className="text-[17px] leading-relaxed sm:text-[19px]">
              Take bookings from clients nationwide and abroad. We handle identity checks, video, payments, sealing, and
              your electronic notarial register.
            </p>
            <div className="mt-7 grid grid-cols-2 gap-3 sm:flex">
              <LinkButton href="#apply" size="lg">
                Apply now
              </LinkButton>
              <LinkButton href="/login?as=notary" size="lg" variant="secondary">
                Try the notary portal
              </LinkButton>
            </div>
          </div>
        </div>
        <div className="brush mt-12 flex justify-center rounded-[14px] px-4 py-10 sm:py-16">
          <SessionMock />
        </div>
      </section>

      <section className={`${container} py-20`}>
        <SectionHeading title="Everything a session needs." muted="Nothing it doesn't." />
        <div className="mt-12 grid gap-px overflow-hidden rounded-[12px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {[
            [CalendarCheck, "Bookings", "Set your hours, fees per notarial act, and minimum notice. Accept or decline each request."],
            [ScanFace, "Verified clients", "Every principal and witness has passed PhilSys or government-ID checks plus a face match."],
            [Video, "Built-in video", "Browser-based sessions with location checks that block VPN, proxy, and Tor connections."],
            [CreditCard, "Get paid", "Send a payment link during the session. Clients pay by GCash, Maya, or card."],
            [Stamp, "One-click sealing", "Your electronic seal, signature, certificate page, and QR code are applied automatically."],
            [BookOpen, "Electronic register", "Doc., page, and book numbers are assigned and kept for your Supreme Court filing."],
          ].map(([Icon, t, b], i) => {
            const I = Icon as typeof Stamp;
            return (
              <div key={i} className="bg-surface p-6">
                <I className="size-5 text-accent" />
                <p className="mt-6 text-[17px] font-medium text-ink">{t as string}</p>
                <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{b as string}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section id="apply" className="bg-surface py-20">
        <div className={`${container} grid gap-12 lg:grid-cols-[1fr_1.2fr]`}>
          <div>
            <SectionHeading eyebrow="Apply" title="Join the network" />
            <p className="mt-5 text-[16px] leading-relaxed">You&apos;ll need:</p>
            <ul className="mt-3 space-y-2 text-[15px]">
              {[
                "A current notarial commission and Electronic Notary Public authority",
                "Roll of Attorneys number and IBP membership in good standing",
                "A valid government ID for your own identity verification",
                "A computer with camera and microphone, in the Philippines",
              ].map((x) => (
                <li key={x} className="flex gap-2.5">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                  {x}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[14px] text-muted">No subscription. Buy credits as you go — one credit per notarized document, from ₱65.</p>
          </div>
          <ApplyForm />
        </div>
      </section>
    </>
  );
}
