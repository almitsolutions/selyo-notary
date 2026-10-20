"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { LinkButton, Logo } from "@/components/ui";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/get-notarized", label: "How it works" },
  { href: "/notaries", label: "Find a notary" },
  { href: "/pricing", label: "Pricing" },
  { href: "/verify", label: "Verify a document" },
  { href: "/for-notaries", label: "For notaries" },
  { href: "/faqs", label: "FAQs" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const path = usePathname();

  return (
    <>
      <div className="bg-night px-4 py-2.5 text-center text-[12.5px] text-white/85 sm:text-[13px]">
        <span className="mr-2 hidden rounded-full border border-white/25 px-2 py-0.5 font-mono text-[10px] tracking-widest sm:inline">NEW</span>
        Remote notarization under the Supreme Court&apos;s Rules on Electronic Notarization.{" "}
        <Link href="/get-notarized" className="inline-flex items-center gap-1 font-medium text-white underline underline-offset-4">
          See how <ArrowRight className="size-3.5" />
        </Link>
      </div>
      <header className="sticky top-0 z-40 border-b border-transparent bg-bg/90 backdrop-blur supports-[backdrop-filter]:bg-bg/75">
        <div className="mx-auto flex h-16 max-w-[1360px] items-center gap-8 px-4 sm:px-6 lg:px-10">
          <Link href="/" aria-label="Home">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "rounded-[4px] px-3 py-1.5 text-[14.5px] text-body hover:text-ink",
                  path === n.href && "bg-surface text-primary shadow-sm",
                )}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto hidden items-center gap-2 sm:flex">
            <LinkButton href="/login" variant="secondary" size="sm">
              Sign in
            </LinkButton>
            <LinkButton href="/signup" size="sm">
              Get notarized
            </LinkButton>
          </div>
          <button className="ml-auto -mr-2 p-2 sm:ml-2 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu className="size-5 text-ink" />
          </button>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-bg lg:hidden">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">
            <Logo />
            <button className="-mr-2 p-2" onClick={() => setOpen(false)} aria-label="Close menu">
              <X className="size-5 text-ink" />
            </button>
          </div>
          <nav className="flex flex-1 flex-col overflow-y-auto px-4 sm:px-6">
            {nav.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between border-b border-line py-4 text-[20px] tracking-tight text-ink"
              >
                {n.label}
                <ArrowRight className="size-4 text-soft" />
              </Link>
            ))}
          </nav>
          <div className="grid grid-cols-2 gap-3 p-4 sm:p-6">
            <LinkButton href="/login" variant="secondary" size="lg" onClick={() => setOpen(false)}>
              Sign in
            </LinkButton>
            <LinkButton href="/signup" size="lg" onClick={() => setOpen(false)}>
              Get notarized
            </LinkButton>
          </div>
        </div>
      )}
    </>
  );
}
