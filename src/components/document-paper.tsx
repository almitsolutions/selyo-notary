"use client";

import { useEffect, useState } from "react";
import type { DocumentItem } from "@/lib/types";
import { fileStore } from "@/lib/files";
import { cn, fmtDate } from "@/lib/utils";

/** Shows the uploaded PDF when we still have it in memory; otherwise a rendered stand-in page. */
export function DocumentPaper({ doc, className, highlightSignerId }: { doc: DocumentItem; className?: string; highlightSignerId?: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const u = fileStore.url(doc.id);
    setUrl(u);
    return () => {
      if (u) URL.revokeObjectURL(u);
    };
  }, [doc.id]);

  if (url) {
    return <iframe src={url} title={doc.title} className={cn("h-[70dvh] min-h-[480px] w-full rounded-[8px] border border-line bg-surface", className)} />;
  }

  const owner = doc.signers[0]?.name ?? "Juan Dela Cruz";
  return (
    <div className={cn("mx-auto w-full max-w-[640px] rounded-[4px] bg-white px-6 py-8 font-serif text-[13px] leading-relaxed text-ink shadow-[0_2px_20px_rgb(11_26_46/0.08)] ring-1 ring-line sm:px-12 sm:py-12 sm:text-[14px]", className)}>
      <p>REPUBLIC OF THE PHILIPPINES )</p>
      <p>CITY OF MAKATI&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;) S.S.</p>
      <p className="mt-8 mb-6 text-center text-[16px] font-bold tracking-wide uppercase">{doc.type}</p>
      <p className="indent-10">
        I, <b>{owner.toUpperCase()}</b>, of legal age, Filipino, and a resident of Makati City, after having been duly sworn in
        accordance with law, hereby depose and state that:
      </p>
      <ol className="mt-4 list-decimal space-y-3 pl-10">
        <li>I am the person who executed this {doc.type.toLowerCase()}, freely and voluntarily, with full knowledge of its contents;</li>
        <li>The statements contained herein are true and correct of my own personal knowledge and/or based on authentic records;</li>
        <li>I am executing this instrument to attest to the truth of the foregoing and for whatever legal purpose it may serve.</li>
      </ol>
      <p className="mt-6 indent-10">
        IN WITNESS WHEREOF, I have hereunto set my hand this {fmtDate(doc.createdAt, { day: "numeric", month: "long", year: "numeric" })} in Makati City,
        Philippines.
      </p>
      <div className="mt-12 grid gap-10 sm:grid-cols-2">
        {doc.signers.map((s) => (
          <div key={s.id} className={cn("rounded-[4px] p-1.5", highlightSignerId === s.id && s.status !== "signed" && "bg-accent-soft ring-2 ring-accent")}>
            <div className="flex h-14 items-end">
              {s.status === "signed" ? (
                s.signature?.kind === "drawn" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.signature.value} alt={`Signature of ${s.name}`} className="h-14 object-contain" />
                ) : (
                  <span className="font-script text-[28px] leading-none text-primary">{s.signature?.value ?? s.name}</span>
                )
              ) : (
                <span className="font-sans text-[11px] text-soft">{highlightSignerId === s.id ? "Sign here" : "Awaiting signature"}</span>
              )}
            </div>
            <div className="border-t border-ink pt-1 text-[12px] font-bold uppercase">{s.name}</div>
            <div className="text-[11px] text-muted">{s.role === "approver" ? "Approver" : "Signer"}</div>
          </div>
        ))}
      </div>
      {doc.pages > 1 && <p className="mt-10 text-center font-sans text-[11px] text-soft">Page 1 of {doc.pages} · preview</p>}
    </div>
  );
}
