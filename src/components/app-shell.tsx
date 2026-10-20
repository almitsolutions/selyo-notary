"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LogOut, RotateCcw, type LucideIcon } from "lucide-react";
import { Avatar, Logo, Spinner } from "@/components/ui";
import { useStoreReady } from "@/components/store-hydrator";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { User } from "@/lib/types";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Shown as the raised center action on the mobile tab bar */
  primary?: boolean;
  mobile?: boolean;
  badge?: number;
}

export function AppShell({
  user,
  role,
  nav,
  mobileNav: mobileNavProp,
  sidebarFooter,
  children,
}: {
  user: User | null;
  role: "principal" | "notary";
  nav: NavItem[];
  /** Tab-bar order on phones; defaults to `nav` */
  mobileNav?: NavItem[];
  sidebarFooter?: React.ReactNode;
  children: React.ReactNode;
}) {
  const ready = useStoreReady();
  const path = usePathname();
  const router = useRouter();
  const signOut = useApp((s) => s.signOut);
  const resetDemo = useApp((s) => s.resetDemo);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    if (ready && !user) router.replace(`/login?${role === "notary" ? "as=notary&" : ""}next=${encodeURIComponent(path)}`);
  }, [ready, user, router, path, role]);

  if (!ready || !user) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-muted">
        <Spinner />
      </div>
    );
  }

  const root = role === "notary" ? "/notary" : "/app";
  const isActive = (href: string) => (href === root ? path === root : path.startsWith(href));
  const mobileNav = (mobileNavProp ?? nav).filter((n) => n.mobile !== false);

  return (
    <div className="min-h-dvh lg:flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-[248px] shrink-0 flex-col border-r border-line bg-bg px-4 py-5 lg:flex">
        <Link href={root} className="px-2">
          <Logo className="text-[20px]" />
        </Link>
        <p className="mono-label mt-1 px-2">{role === "notary" ? "Notary portal" : "Client"}</p>
        <nav className="mt-8 flex flex-col gap-0.5">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "flex items-center gap-3 rounded-[6px] px-3 py-2 text-[14.5px] transition",
                n.primary
                  ? "mb-4 justify-center bg-primary text-primary-fg hover:bg-primary-hover"
                  : isActive(n.href)
                    ? "border border-line bg-surface text-primary shadow-sm"
                    : "border border-transparent text-body hover:bg-surface-2",
              )}
            >
              <n.icon className="size-4" />
              {n.label}
              {!!n.badge && <span className="ml-auto rounded-full bg-accent px-1.5 text-[11px] text-white">{n.badge}</span>}
            </Link>
          ))}
        </nav>
        <div className="mt-auto space-y-3">
          {sidebarFooter}
          <div className="flex items-center gap-3 rounded-[8px] border border-line bg-surface p-2.5">
            <Avatar name={user.name} size={34} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13.5px] text-ink">{user.name}</p>
              <p className="truncate text-[12px] text-muted">{user.email}</p>
            </div>
            <button
              title="Sign out"
              onClick={() => {
                signOut(role);
                router.push("/");
              }}
              className="rounded p-1.5 text-muted hover:bg-surface-2 hover:text-ink"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-bg/90 px-4 backdrop-blur lg:hidden">
        <Link href={root}>
          <Logo className="text-[18px]" />
        </Link>
        <button onClick={() => setMenu(!menu)} aria-label="Account menu">
          <Avatar name={user.name} size={32} />
        </button>
        {menu && (
          <div className="animate-fade-up absolute top-14 right-3 w-64 rounded-[10px] border border-line bg-surface p-2 shadow-lg">
            <div className="border-b border-line px-3 py-2.5">
              <p className="text-[14px] text-ink">{user.name}</p>
              <p className="text-[12.5px] text-muted">{user.email}</p>
            </div>
            <Link href={role === "notary" ? "/app" : "/notary"} onClick={() => setMenu(false)} className="block rounded px-3 py-2.5 text-[14px] hover:bg-surface-2">
              Switch to {role === "notary" ? "client" : "notary"} demo
            </Link>
            <button onClick={() => { resetDemo(); setMenu(false); }} className="block w-full rounded px-3 py-2.5 text-left text-[14px] hover:bg-surface-2">
              Reset demo data
            </button>
            <button onClick={() => { signOut(role); router.push("/"); }} className="block w-full rounded px-3 py-2.5 text-left text-[14px] text-danger hover:bg-surface-2">
              Sign out
            </button>
          </div>
        )}
      </header>

      <main className="min-w-0 flex-1 pb-24 lg:pb-0">{children}</main>

      {/* Mobile tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        <div className="grid" style={{ gridTemplateColumns: `repeat(${mobileNav.length}, minmax(0, 1fr))` }}>
          {mobileNav.map((n) =>
            n.primary ? (
              <Link key={n.href} href={n.href} className="flex flex-col items-center justify-center py-1.5" aria-label={n.label}>
                <span className="-mt-5 flex size-12 items-center justify-center rounded-full bg-primary text-primary-fg shadow-lg ring-4 ring-bg">
                  <n.icon className="size-5" />
                </span>
              </Link>
            ) : (
              <Link
                key={n.href}
                href={n.href}
                className={cn("relative flex flex-col items-center gap-0.5 py-2 text-[11px]", isActive(n.href) ? "text-primary" : "text-muted")}
              >
                <n.icon className="size-5" />
                {n.label}
                {!!n.badge && <span className="absolute top-1 right-[calc(50%-18px)] size-2 rounded-full bg-accent" />}
              </Link>
            ),
          )}
        </div>
      </nav>
    </div>
  );
}

export function DemoResetCard({ other }: { other: { href: string; label: string } }) {
  const resetDemo = useApp((s) => s.resetDemo);
  return (
    <div className="rounded-[8px] border border-dashed border-line-strong p-3 text-[12.5px] text-muted">
      <p className="mono-label mb-1.5 !text-primary">Demo mode</p>
      <p>Data is stored in this browser only.</p>
      <div className="mt-2 flex flex-col gap-1">
        <Link href={other.href} className="text-primary underline underline-offset-2">
          {other.label}
        </Link>
        <button onClick={resetDemo} className="inline-flex items-center gap-1 text-left text-primary underline underline-offset-2">
          <RotateCcw className="size-3" /> Reset demo data
        </button>
      </div>
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  eyebrow,
  actions,
  back,
}: {
  title: string;
  subtitle?: React.ReactNode;
  eyebrow?: string;
  actions?: React.ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {back && (
          <Link href={back.href} className="mb-3 inline-flex items-center gap-1 text-[13.5px] text-muted hover:text-ink">
            ← {back.label}
          </Link>
        )}
        {eyebrow && <p className="mono-label mb-1 !text-primary">{eyebrow}</p>}
        <h1 className="text-[26px] leading-tight font-normal sm:text-[32px]">{title}</h1>
        {subtitle && <div className="mt-1.5 text-[14.5px] text-muted">{subtitle}</div>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export const pageWrap = "mx-auto max-w-[1180px] px-4 py-6 sm:px-6 lg:px-10 lg:py-10";
