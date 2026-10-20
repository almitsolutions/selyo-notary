"use client";

import Link from "next/link";
import { forwardRef, useEffect } from "react";
import { X } from "lucide-react";
import { cn, initials } from "@/lib/utils";
import { brand } from "@/lib/brand";
import type { DocumentStatus, NotarizationStatus } from "@/lib/types";

/* ---------- Button ---------- */

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline-light" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-[4px] font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-fg hover:bg-primary-hover",
  secondary: "bg-surface text-ink border border-line-strong hover:bg-surface-2",
  ghost: "text-ink hover:bg-surface-2",
  "outline-light": "border border-white/40 text-white hover:bg-white/10",
  danger: "bg-danger text-white hover:bg-danger/90",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-10 px-4 text-[14px]",
  lg: "h-12 px-5 text-[15px]",
};

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cn(buttonBase, buttonVariants[variant], buttonSizes[size], className);
}

export const Button = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize }
>(function Button({ variant = "primary", size = "md", className, ...props }, ref) {
  return <button ref={ref} className={buttonClass(variant, size, className)} {...props} />;
});

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: React.ComponentProps<typeof Link> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return (
    <Link href={href} className={buttonClass(variant, size, className)} {...rest}>
      {children}
    </Link>
  );
}

/* ---------- Form fields ---------- */

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-[4px] border border-line-strong bg-surface px-3 text-[15px] text-ink placeholder:text-soft focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20",
        className,
      )}
      {...props}
    />
  );
});

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-[4px] border border-line-strong bg-surface px-3 py-2.5 text-[15px] text-ink placeholder:text-soft focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20",
        className,
      )}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-11 w-full appearance-none rounded-[4px] border border-line-strong bg-surface bg-[length:16px] bg-[right_10px_center] bg-no-repeat px-3 pr-9 text-[15px] text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20",
        "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236e6c7a' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")]",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-[13px] font-medium text-ink">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[12px] text-muted">{hint}</span>}
    </label>
  );
}

export function Checkbox({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-[14px]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-4 shrink-0 accent-[var(--color-primary)]"
      />
      <span>{children}</span>
    </label>
  );
}

/* ---------- Segmented control ---------- */

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: React.ReactNode }[];
  className?: string;
}) {
  return (
    <div className={cn("inline-flex rounded-[6px] border border-line bg-surface-2 p-1", className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-[4px] px-3.5 text-[13.5px] transition",
            value === o.value ? "bg-surface text-primary shadow-sm" : "text-muted hover:text-ink",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- Display ---------- */

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-[10px] border border-line bg-surface", className)} {...props} />;
}

export function Avatar({ name, color, size = 40, className }: { name: string; color?: string; size?: number; className?: string }) {
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full font-medium", className)}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: color ? `${color}1a` : "var(--color-accent-soft)",
        color: color ?? "var(--color-primary)",
      }}
    >
      {initials(name)}
    </span>
  );
}

const pillTones = {
  neutral: "bg-surface-2 text-body",
  purple: "bg-accent-soft text-primary",
  green: "bg-success-soft text-success",
  amber: "bg-warning-soft text-warning",
  red: "bg-danger-soft text-danger",
};

export function Pill({ tone = "neutral", dot, children, className }: { tone?: keyof typeof pillTones; dot?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12px] font-medium", pillTones[tone], className)}>
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

export const nzStatusMeta: Record<NotarizationStatus, { label: string; tone: keyof typeof pillTones }> = {
  awaiting_review: { label: "Awaiting review", tone: "amber" },
  confirmed: { label: "Confirmed", tone: "purple" },
  in_session: { label: "In session", tone: "green" },
  pending_payment: { label: "Pending payment", tone: "amber" },
  sealing: { label: "Sealing", tone: "purple" },
  notarized: { label: "Notarized", tone: "green" },
  declined: { label: "Declined", tone: "red" },
  cancelled: { label: "Cancelled", tone: "neutral" },
};

export function NzStatus({ status }: { status: NotarizationStatus }) {
  const m = nzStatusMeta[status];
  return (
    <Pill tone={m.tone} dot>
      {m.label}
    </Pill>
  );
}

const docStatusMeta: Record<DocumentStatus, { label: string; tone: keyof typeof pillTones }> = {
  draft: { label: "Draft", tone: "neutral" },
  pending: { label: "Pending", tone: "amber" },
  in_progress: { label: "In progress", tone: "purple" },
  completed: { label: "Signed", tone: "green" },
};

export function DocStatus({ status }: { status: DocumentStatus }) {
  const m = docStatusMeta[status];
  return (
    <Pill tone={m.tone} dot>
      {m.label}
    </Pill>
  );
}

export function Logo({ className, light }: { className?: string; light?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-[22px] font-semibold tracking-[-0.04em]", light ? "text-white" : "text-ink", className)}>
      <svg viewBox="0 0 28 28" className="size-7" aria-hidden>
        <circle cx="14" cy="14" r="13" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="14" cy="14" r="8.5" fill="var(--color-gold)" />
        <path d="m10.2 14.2 2.6 2.6 5-5.2" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {brand.name.toLowerCase()}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  muted,
  className,
  as: Tag = "h2",
}: {
  eyebrow?: string;
  title: string;
  muted?: string;
  className?: string;
  as?: "h1" | "h2";
}) {
  return (
    <div className={className}>
      {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
      <Tag className="text-[34px] leading-[1.05] font-normal sm:text-[48px] lg:text-[56px]">
        {title} {muted && <span className="text-soft">{muted}</span>}
      </Tag>
    </div>
  );
}

export function EmptyState({ icon, title, body, action }: { icon: React.ReactNode; title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[10px] border border-dashed border-line-strong bg-surface px-6 py-14 text-center">
      <div className="mb-4 flex size-11 items-center justify-center rounded-full bg-accent-soft text-primary">{icon}</div>
      <p className="font-medium text-ink">{title}</p>
      <p className="mt-1 max-w-sm text-[14px] text-muted">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/* ---------- Modal / bottom sheet ---------- */

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal>
      <div className="absolute inset-0 bg-night/50" onClick={onClose} />
      <div
        className={cn(
          "animate-fade-up relative max-h-[92dvh] w-full overflow-y-auto rounded-t-[14px] bg-surface p-5 sm:max-w-lg sm:rounded-[12px] sm:p-6",
          className,
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          {title && <h3 className="text-[19px] font-medium">{title}</h3>}
          <button onClick={onClose} className="-m-1 ml-auto rounded p-1 text-muted hover:bg-surface-2" aria-label="Close">
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <span className={cn("inline-block size-4 animate-spin rounded-full border-2 border-current border-r-transparent", className)} />;
}
