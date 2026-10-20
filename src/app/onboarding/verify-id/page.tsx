import type { Metadata } from "next";
import { Suspense } from "react";
import { VerifyIdWizard } from "@/components/kyc/verify-id-wizard";

export const metadata: Metadata = { title: "Verify your identity" };

export default function VerifyIdPage() {
  return (
    <Suspense>
      <VerifyIdWizard />
    </Suspense>
  );
}
