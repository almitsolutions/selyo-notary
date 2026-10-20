import Link from "next/link";
import { Logo } from "@/components/ui";
import { IdCheckMock, SigningMock } from "@/components/marketing/mocks";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh">
      <div className="flex w-full flex-col px-5 py-6 sm:px-10 lg:w-[46%] lg:px-10">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Logo />
          </Link>
          <span className="hidden h-5 w-px bg-line-strong sm:block" />
          <span className="hidden text-[13px] text-muted sm:block">Notarize online, anywhere</span>
        </div>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[400px]">{children}</div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 text-[13px] text-muted">
          <span>© {new Date().getFullYear()} Selyo</span>
          <div className="flex gap-5">
            <Link href="/verify" className="text-primary underline underline-offset-4">Verify a document</Link>
            <Link href="/notaries" className="text-primary underline underline-offset-4">Find a notary</Link>
          </div>
        </div>
      </div>
      <div className="hidden flex-1 p-3 lg:block">
        <div className="brush relative flex h-full flex-col justify-between overflow-hidden rounded-[14px] p-10">
          <p className="max-w-md text-[32px] leading-[1.1] tracking-tight text-white">
            “Signed my SPA from Riyadh and had it notarized before lunch in Manila.”
            <span className="mt-3 block text-[14px] tracking-normal text-white/70">— OFW, Saudi Arabia (sample testimonial)</span>
          </p>
          <div className="relative h-[420px]">
            <IdCheckMock step={4} className="absolute bottom-0 left-0" />
            <SigningMock className="absolute right-0 bottom-16" />
          </div>
        </div>
      </div>
    </div>
  );
}
