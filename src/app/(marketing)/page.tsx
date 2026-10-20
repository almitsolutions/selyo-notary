import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Clock,
  FileCheck2,
  Fingerprint,
  Globe2,
  Landmark,
  MapPinOff,
  MessagesSquare,
  QrCode,
  ScanFace,
  ShieldCheck,
  Stamp,
  Wallet,
} from "lucide-react";
import { LinkButton } from "@/components/ui";
import { SectionHeading } from "@/components/ui";
import { CertificateMock, IdCheckMock, SessionMock, SigningMock } from "@/components/marketing/mocks";
import { FaqList } from "@/components/marketing/faq-list";
import { documentTypes, faqs, KYC_FEE, notAccepted } from "@/lib/mock/content";

const container = "mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-10";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className={`${container} pt-12 pb-10 sm:pt-20 lg:pt-28`}>
        <div className="grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:items-end lg:gap-16">
          <div>
            <p className="eyebrow mb-5">Online notarization · Philippines</p>
            <h1 className="text-[42px] leading-[1.02] font-normal sm:text-[60px] lg:text-[72px]">
              Get it notarized
              <br />
              <span className="text-soft">without leaving home</span>
            </h1>
          </div>
          <div>
            <p className="text-[17px] leading-relaxed text-body sm:text-[20px]">
              Upload your document, verify your ID once, and appear before a commissioned Electronic Notary Public over
              video. Download your sealed PDF the same day.
            </p>
            <div className="mt-7 grid grid-cols-2 gap-3 sm:flex">
              <LinkButton href="/signup" size="lg">
                Get notarized
              </LinkButton>
              <LinkButton href="/notaries" size="lg" variant="secondary">
                Find a notary
              </LinkButton>
            </div>
          </div>
        </div>

        <div className="brush relative mt-12 overflow-hidden rounded-[14px] px-4 py-8 sm:px-10 sm:py-12 lg:mt-16">
          <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:justify-between">
            <SessionMock className="lg:mt-10" />
            <div className="flex flex-col gap-6 sm:flex-row lg:flex-col">
              <SigningMock />
            </div>
          </div>
        </div>
      </section>

      {/* Legal basis strip */}
      <section className={`${container} pb-20`}>
        <div className="grid border-y border-line sm:grid-cols-2 lg:grid-cols-4">
          {[
            [Landmark, "A.M. No. 24-10-14-SC", "Rules on Electronic Notarization"],
            [FileCheck2, "RA 8792", "Electronic Commerce Act"],
            [ShieldCheck, "RA 10173", "Data Privacy Act of 2012"],
            [BadgeCheck, "A.M. No. 01-7-01-SC", "Rules on Electronic Evidence"],
          ].map(([Icon, code, label], i) => {
            const I = Icon as typeof Landmark;
            return (
              <div key={i} className="flex items-center gap-4 border-line px-2 py-5 sm:px-5 sm:[&:nth-child(odd)]:border-r lg:border-r lg:last:border-r-0">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface">
                  <I className="size-4.5 text-primary" />
                </span>
                <div>
                  <p className="text-[14.5px] text-ink">{label as string}</p>
                  <p className="mono-label mt-0.5">{code as string}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Benefits */}
      <section className={`${container} pb-24`}>
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <SectionHeading title="Same notarization." muted="Less of your day." />
          <p className="text-[17px] leading-relaxed sm:text-[19px]">
            An electronic notarial act done through an accredited facility carries the same validity and effect as one
            done at a law office. Everything around it gets easier.
          </p>
        </div>
        <div className="mt-12 grid border-t border-line sm:grid-cols-2 lg:grid-cols-4">
          {[
            [MapPinOff, "No office runs", "Join from home, work, the province, or abroad. Only the notary needs to be in the Philippines."],
            [Globe2, "Signers anywhere", "Each signer and witness joins from their own phone or laptop — same session, different cities."],
            [Fingerprint, "Proof that lasts", "Your PDF gets a notarial certificate, seal, and QR code, and its fingerprint is recorded."],
            [MessagesSquare, "Chat with your notary", "Every appointment has a message thread for questions, files, and schedule changes."],
          ].map(([Icon, title, body], i) => {
            const I = Icon as typeof MapPinOff;
            return (
              <div key={i} className="border-line py-8 sm:px-6 sm:[&:nth-child(odd)]:pl-0 sm:[&:nth-child(odd)]:border-r lg:border-r lg:last:border-r-0 lg:[&:not(:first-child)]:pl-6">
                <span className="flex size-10 items-center justify-center rounded-full border border-line bg-surface">
                  <I className="size-4.5 text-ink" />
                </span>
                <h3 className="mt-6 text-[17px] font-medium tracking-tight">{title as string}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-muted">{body as string}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-surface py-24">
        <div className={container}>
          <div className="text-center">
            <p className="eyebrow mb-4">Five steps</p>
            <h2 className="text-[34px] leading-[1.05] font-normal sm:text-[48px]">
              From upload <span className="text-soft">to sealed PDF</span>
            </h2>
          </div>
          <ol className="mt-14 grid gap-px overflow-hidden rounded-[12px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-5">
            {[
              [ScanFace, "Verify your identity", `PhilSys QR or a government ID, plus a face scan. ₱${KYC_FEE}, once.`],
              [FileCheck2, "Add your document", "Upload a PDF. Everyone signs first, in order."],
              [Clock, "Book a notary", "Pick a notary, notarial act, and time that suits you."],
              [Stamp, "Appear on video", "A short live session. The notary checks ID, location, and consent."],
              [Wallet, "Pay & download", "GCash, Maya, or card. Download your sealed PDF right away."],
            ].map(([Icon, t, b], i) => {
              const I = Icon as typeof Clock;
              return (
                <li key={i} className="bg-surface p-6">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[12px] text-accent">0{i + 1}</span>
                    <I className="size-5 text-muted" />
                  </div>
                  <p className="mt-8 text-[17px] font-medium text-ink">{t as string}</p>
                  <p className="mt-2 text-[14px] leading-relaxed text-muted">{b as string}</p>
                </li>
              );
            })}
          </ol>
          <div className="mt-8 text-center">
            <LinkButton href="/get-notarized" variant="secondary">
              See the full walkthrough <ArrowRight className="size-4" />
            </LinkButton>
          </div>
        </div>
      </section>

      {/* Audiences */}
      <section className={`${container} py-24`}>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-[34px] leading-[1.05] font-normal sm:text-[48px]">One place for every notarial act</h2>
          <p className="mt-4 text-[17px] text-body">For people who need a document notarized, and the notaries who serve them.</p>
        </div>
        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          <div className="brush flex flex-col overflow-hidden rounded-[14px] p-6 text-white sm:p-9">
            <p className="font-mono text-[11px] tracking-[0.16em] text-white/70">▪ FOR INDIVIDUALS & BUSINESSES</p>
            <h3 className="mt-4 max-w-md text-[30px] leading-[1.05] font-normal !text-white sm:text-[38px]">Notarize on your schedule</h3>
            <p className="mt-4 max-w-md text-[15px] text-white/80">
              Affidavits, SPAs, deeds, contracts, authorization letters — signed, notarized, and stored in one place.
            </p>
            <div className="mt-6">
              <LinkButton href="/signup" variant="outline-light">
                Start for free <ArrowRight className="size-4" />
              </LinkButton>
            </div>
            <div className="mt-8 flex justify-center lg:mt-auto lg:justify-end lg:pt-8">
              <IdCheckMock step={3} />
            </div>
          </div>
          <div className="brush flex flex-col overflow-hidden rounded-[14px] p-6 text-white sm:p-9">
            <p className="font-mono text-[11px] tracking-[0.16em] text-white/70">▪ FOR ELECTRONIC NOTARIES PUBLIC</p>
            <h3 className="mt-4 max-w-md text-[30px] leading-[1.05] font-normal !text-white sm:text-[38px]">Run your practice online</h3>
            <p className="mt-4 max-w-md text-[15px] text-white/80">
              Bookings, identity checks, video sessions, payments, and your electronic notarial register — no subscription,
              pay per notarized document.
            </p>
            <div className="mt-6">
              <LinkButton href="/for-notaries" variant="outline-light">
                Apply as a notary <ArrowRight className="size-4" />
              </LinkButton>
            </div>
            <div className="mt-8 flex justify-center lg:mt-auto lg:justify-end lg:pt-8">
              <CertificateMock />
            </div>
          </div>
        </div>
      </section>

      {/* Documents */}
      <section className={`${container} pb-24`}>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <SectionHeading eyebrow="What we notarize" title="Most everyday documents." muted="A few exceptions." />
          <div>
            <div className="flex flex-wrap gap-2">
              {documentTypes.filter((d) => d !== "Other").map((d) => (
                <span key={d} className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-[14px] text-ink">
                  {d}
                </span>
              ))}
            </div>
            <p className="mono-label mt-8 mb-3">Not available online</p>
            <ul className="space-y-2 text-[15px] text-muted">
              {notAccepted.map((n) => (
                <li key={n}>— {n}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Verification */}
      <section className="bg-night py-24 text-white/80">
        <div className={`${container} grid items-center gap-12 lg:grid-cols-2`}>
          <div>
            <p className="font-mono text-[11px] tracking-[0.16em] text-white/60">▪ TAMPER-EVIDENT</p>
            <h2 className="mt-4 text-[34px] leading-[1.05] font-normal !text-white sm:text-[48px]">
              Every document sealed <span className="text-white/45">and checkable by anyone</span>
            </h2>
            <p className="mt-5 max-w-lg text-[16px] leading-relaxed">
              We record a SHA-256 fingerprint of every notarized PDF. Change a single byte and the fingerprint no longer
              matches. Banks, embassies, and government offices can scan the QR code or upload the file to confirm it.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:flex">
              <LinkButton href="/verify" className="bg-white text-primary hover:bg-white/90">
                Verify a document
              </LinkButton>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              [Stamp, "Seal", "Notary's electronic seal and signature on a certificate page"],
              [Fingerprint, "Fingerprint", "SHA-256 hash of the final PDF is recorded"],
              [QrCode, "QR code", "Links straight to the verification record"],
              [BadgeCheck, "Register", "Entered in the notary's electronic notarial book"],
            ].map(([Icon, t, b], i) => {
              const I = Icon as typeof Stamp;
              return (
                <div key={i} className="rounded-[10px] border border-white/10 bg-white/[0.04] p-5">
                  <I className="size-5 text-gold" />
                  <p className="mt-6 font-medium text-white">{t as string}</p>
                  <p className="mt-1 text-[13.5px] text-white/60">{b as string}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className={`${container} py-24`}>
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-end">
          <SectionHeading eyebrow="Pricing" title="Free to sign." muted="Pay per notarization." />
          <div>
            <p className="text-[17px] leading-relaxed">Notaries set their own fees. You see the total before you book — no subscription needed.</p>
            <LinkButton href="/pricing" variant="secondary" className="mt-5">
              See pricing <ArrowRight className="size-4" />
            </LinkButton>
          </div>
        </div>
        <div className="mt-12 grid border-y border-line sm:grid-cols-3">
          {[
            ["Account & e-signing", "₱0", "Upload, sign, and invite signers"],
            ["Identity verification", `₱${KYC_FEE}`, "Once — valid up to 3 years"],
            ["Notarial act", "from ₱300", "Set by your chosen notary"],
          ].map(([t, p, d]) => (
            <div key={t} className="border-line py-7 sm:border-r sm:px-6 sm:first:pl-0 sm:last:border-r-0">
              <p className="text-[15px] font-medium text-ink">{t}</p>
              <p className="mt-3 text-[40px] leading-none tracking-tight text-ink">{p}</p>
              <p className="mt-3 text-[14px] text-muted">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className={`${container} pb-24`}>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
          <div>
            <h2 className="text-[34px] leading-[1.05] font-normal sm:text-[44px]">Questions</h2>
            <p className="mt-3 text-muted">
              More in the <Link href="/faqs" className="text-primary underline underline-offset-4">full FAQ</Link>.
            </p>
          </div>
          <FaqList items={faqs.slice(0, 5)} />
        </div>
      </section>

      {/* CTA */}
      <section className={`${container} pb-24`}>
        <div className="brush rounded-[14px] px-6 py-14 text-center sm:py-20">
          <h2 className="mx-auto max-w-2xl text-[32px] leading-[1.05] font-normal !text-white sm:text-[48px]">
            Your next notarization can take 15 minutes
          </h2>
          <p className="mx-auto mt-4 max-w-md text-white/80">Create a free account and verify your ID today.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <LinkButton href="/signup" size="lg" className="bg-white text-primary hover:bg-white/90">
              Get notarized
            </LinkButton>
            <LinkButton href="/notaries" size="lg" variant="outline-light">
              Browse notaries
            </LinkButton>
          </div>
        </div>
      </section>
    </>
  );
}
