"use client";

import { BookOpen, CalendarDays, Coins, LayoutDashboard, UserRound } from "lucide-react";
import { AppShell, DemoResetCard, type NavItem } from "@/components/app-shell";
import { useApp } from "@/lib/store";

export default function NotaryLayout({ children }: { children: React.ReactNode }) {
  const user = useApp((s) => s.notaryUser);
  const pending = useApp((s) => s.notarizations.filter((n) => n.status === "awaiting_review").length);

  const nav: NavItem[] = [
    { href: "/notary", label: "Dashboard", icon: LayoutDashboard },
    { href: "/notary/appointments", label: "Appointments", icon: CalendarDays, badge: pending },
    { href: "/notary/register", label: "Register", icon: BookOpen },
    { href: "/notary/credits", label: "Credits", icon: Coins },
    { href: "/notary/profile", label: "Profile", icon: UserRound },
  ];

  return (
    <AppShell user={user} role="notary" nav={nav} sidebarFooter={<DemoResetCard other={{ href: "/app", label: "Open client app →" }} />}>
      {children}
    </AppShell>
  );
}
