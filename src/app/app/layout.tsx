"use client";

import { FileText, Home, Plus, Stamp, UserRound } from "lucide-react";
import { AppShell, DemoResetCard, type NavItem } from "@/components/app-shell";
import { useApp } from "@/lib/store";

export default function ClientAppLayout({ children }: { children: React.ReactNode }) {
  const principal = useApp((s) => s.principal);
  const pending = useApp((s) => s.notarizations.filter((n) => n.principalId === principal?.id && n.status === "pending_payment").length);

  const book: NavItem = { href: "/app/notarizations/new", label: "Book a notarization", icon: Plus, primary: true };
  const home: NavItem = { href: "/app", label: "Home", icon: Home };
  const docs: NavItem = { href: "/app/documents", label: "Documents", icon: FileText };
  const nz: NavItem = { href: "/app/notarizations", label: "Notarizations", icon: Stamp, badge: pending };
  const account: NavItem = { href: "/app/account", label: "Account", icon: UserRound };

  return (
    <AppShell
      user={principal}
      role="principal"
      nav={[book, home, docs, nz, account]}
      mobileNav={[home, docs, book, nz, account]}
      sidebarFooter={<DemoResetCard other={{ href: "/notary", label: "Open notary portal →" }} />}
    >
      {children}
    </AppShell>
  );
}
