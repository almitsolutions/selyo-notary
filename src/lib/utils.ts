import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const peso = (n: number) =>
  "₱" + n.toLocaleString("en-PH", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });

export const pesoExact = (n: number) =>
  "₱" + n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function fmtDate(iso: string, opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" }) {
  return new Date(iso).toLocaleDateString("en-PH", opts);
}

export function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" });
}

export function fmtDateTime(iso: string) {
  return `${fmtDate(iso)} · ${fmtTime(iso)}`;
}

export function initials(name: string) {
  return name
    .replace(/^Atty\.\s*/, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function uid(prefix = "") {
  return prefix + Math.random().toString(36).slice(2, 9);
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function relativeDay(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const start = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((start(d) - start(today)) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  return fmtDate(iso, { weekday: "short", month: "short", day: "numeric" });
}
