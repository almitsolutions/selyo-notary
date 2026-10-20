"use client";

import Link from "next/link";
import { BookOpen, Download } from "lucide-react";
import { Button, Card, EmptyState } from "@/components/ui";
import { PageHeader, pageWrap } from "@/components/app-shell";
import { useApp } from "@/lib/store";
import { fmtDate, fmtTime, peso } from "@/lib/utils";

export default function RegisterPage() {
  const entries = useApp((s) => s.notarizations)
    .filter((n) => n.status === "notarized" && n.register)
    .sort((a, b) => b.register!.docNo - a.register!.docNo);

  const exportCsv = () => {
    const rows = [
      ["Doc No", "Page No", "Book No", "Series", "Date", "Principal", "Instrument", "Act", "Mode", "Fee", "SHA-256"],
      ...entries.map((n) => [n.register!.docNo, n.register!.pageNo, n.register!.bookNo, n.register!.series, n.notarizedAt, n.principalName, n.documentTitle, n.act, n.mode, n.fee, n.fileHashes?.at(-1) ?? n.hash]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = "notarial-register.csv";
    a.click();
  };

  return (
    <div className={pageWrap}>
      <PageHeader
        eyebrow="Electronic notarial book"
        title="Notarial register"
        subtitle="Every notarized document is entered automatically, ready for your monthly report to the court."
        actions={<Button variant="secondary" onClick={exportCsv} disabled={!entries.length}><Download className="size-4" /> Export CSV</Button>}
      />
      {!entries.length ? (
        <EmptyState icon={<BookOpen className="size-5" />} title="No entries yet" body="Notarized documents appear here with their register numbers." />
      ) : (
        <>
          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {entries.map((n) => (
              <Link key={n.id} href={`/notary/appointments/${n.id}`}>
                <Card className="p-4">
                  <p className="font-mono text-[12px] text-primary">Doc. {n.register!.docNo} · Page {n.register!.pageNo} · Book {n.register!.bookNo}</p>
                  <p className="mt-1.5 text-[14.5px] text-ink">{n.documentTitle}</p>
                  <p className="text-[12.5px] text-muted">{n.principalName} · {n.act} · {fmtDate(n.notarizedAt!)}</p>
                </Card>
              </Link>
            ))}
          </div>
          {/* Desktop table */}
          <Card className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-[13.5px]">
              <thead className="border-b border-line bg-bg">
                <tr>
                  {["Doc.", "Page", "Book", "Date & time", "Principal", "Instrument", "Act", "Fee"].map((h) => (
                    <th key={h} className="mono-label px-4 py-2.5 font-normal">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {entries.map((n) => (
                  <tr key={n.id} className="hover:bg-bg">
                    <td className="px-4 py-3 font-mono text-ink">{n.register!.docNo}</td>
                    <td className="px-4 py-3 font-mono">{n.register!.pageNo}</td>
                    <td className="px-4 py-3 font-mono">{n.register!.bookNo}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{fmtDate(n.notarizedAt!)} <span className="text-muted">{fmtTime(n.notarizedAt!)}</span></td>
                    <td className="px-4 py-3 text-ink">{n.principalName}</td>
                    <td className="max-w-[260px] truncate px-4 py-3"><Link href={`/notary/appointments/${n.id}`} className="text-primary hover:underline">{n.documentTitle}</Link></td>
                    <td className="px-4 py-3">{n.act}<span className="text-muted"> · {n.mode === "remote" ? "REN" : "IEN"}</span></td>
                    <td className="px-4 py-3 text-ink">{peso(n.fee)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  );
}
