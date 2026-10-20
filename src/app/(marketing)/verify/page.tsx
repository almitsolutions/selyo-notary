import type { Metadata } from "next";
import { Suspense } from "react";
import { VerifyTool } from "@/components/verify-tool";

export const metadata: Metadata = { title: "Verify a document" };

export default function VerifyPage() {
  return (
    <div className="mx-auto max-w-[1360px] px-4 pt-12 pb-24 sm:px-6 sm:pt-16 lg:px-10">
      <p className="eyebrow mb-4">Document verification</p>
      <h1 className="text-[40px] leading-[1.03] font-normal sm:text-[56px]">Verify a document</h1>
      <p className="mt-3 mb-10 max-w-xl text-[16px]">Upload a notarized PDF to check that it&apos;s authentic and hasn&apos;t been changed since it was sealed.</p>
      <Suspense>
        <VerifyTool />
      </Suspense>
    </div>
  );
}
