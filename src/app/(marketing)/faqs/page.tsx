import type { Metadata } from "next";
import { FaqList } from "@/components/marketing/faq-list";
import { brand } from "@/lib/brand";
import { faqs } from "@/lib/mock/content";

export const metadata: Metadata = { title: "FAQs" };

export default function FaqsPage() {
  return (
    <div className="mx-auto max-w-[1100px] px-4 pt-12 pb-24 sm:px-6 sm:pt-16">
      <p className="eyebrow mb-4">Help</p>
      <h1 className="text-[40px] leading-[1.03] font-normal sm:text-[56px]">
        Frequently asked <span className="text-soft">questions</span>
      </h1>
      <p className="mt-3 mb-12 text-[16px]">
        Can&apos;t find your answer? Email{" "}
        <a href={`mailto:${brand.supportEmail}`} className="text-primary underline underline-offset-4">
          {brand.supportEmail}
        </a>
        .
      </p>
      <FaqList items={faqs} />
    </div>
  );
}
