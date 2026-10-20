import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Logo } from "@/components/ui";
import { brand } from "@/lib/brand";

const cols = [
  {
    title: "Get notarized",
    links: [
      ["How it works", "/get-notarized"],
      ["Find a notary", "/notaries"],
      ["Pricing", "/pricing"],
      ["Verify a document", "/verify"],
    ],
  },
  {
    title: "Notaries",
    links: [
      ["For notaries", "/for-notaries"],
      ["Notary portal", "/notary"],
      ["Buy credits", "/notary/credits"],
    ],
  },
  {
    title: "Help",
    links: [
      ["FAQs", "/faqs"],
      ["Contact us", `mailto:${brand.supportEmail}`],
      ["Data privacy officer", `mailto:${brand.dpoEmail}`],
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-night text-white/70">
      <div className="mx-auto max-w-[1360px] px-4 pt-14 pb-8 sm:px-6 lg:px-10">
        <div className="grid gap-10 md:grid-cols-[1.3fr_repeat(3,1fr)]">
          <div className="max-w-xs">
            <Logo light />
            <p className="mt-4 text-[14px] leading-relaxed">{brand.description}</p>
            <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-[12px]">
              <ShieldCheck className="size-3.5" /> Every document sealed & verifiable
            </span>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <p className="mono-label !text-white/45 mb-4">{c.title}</p>
              <ul className="space-y-2.5 text-[14.5px]">
                {c.links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="text-white/80 hover:text-white">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-[13px] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {brand.name}. Registered with the National Privacy Commission (demo).</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="#" className="hover:text-white">Privacy policy</Link>
            <Link href="#" className="hover:text-white">Terms of use</Link>
            <Link href="#" className="hover:text-white">Notary terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
