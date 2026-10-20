import type { Metadata } from "next";
import { LinkButton } from "@/components/ui";
import { NotaryDirectory } from "@/components/notary-directory";

export const metadata: Metadata = { title: "Find a notary" };

export default function NotariesPage() {
  return (
    <div className="mx-auto max-w-[1360px] px-4 pt-12 pb-24 sm:px-6 sm:pt-16 lg:px-10">
      <p className="eyebrow mb-4">Notary network</p>
      <h1 className="text-[40px] leading-[1.03] font-normal sm:text-[56px]">Find a notary</h1>
      <p className="mt-3 mb-8 max-w-xl text-[16px] text-body">
        Every notary here holds a current commission as an Electronic Notary Public. Compare fees, languages, and availability.
      </p>
      <NotaryDirectory />
      <div className="mt-14 flex flex-col gap-4 rounded-[10px] border border-line bg-surface p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[17px] font-medium text-ink">Are you a notary public?</p>
          <p className="mt-1 text-[14.5px] text-muted">Commissioned notaries can apply to perform electronic notarizations on the platform.</p>
        </div>
        <LinkButton href="/for-notaries">Apply as an Electronic Notary Public</LinkButton>
      </div>
    </div>
  );
}
