"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, FileText, Plus, Trash2, Upload, X } from "lucide-react";
import { Button, Card, Field, Input, Select } from "@/components/ui";
import { PageHeader, pageWrap } from "@/components/app-shell";
import { useApp } from "@/lib/store";
import { fileStore } from "@/lib/files";
import { documentTypes } from "@/lib/mock/content";
import { cn } from "@/lib/utils";

interface DraftSigner {
  key: number;
  name: string;
  email: string;
  role: "signer" | "approver";
  order: number;
}

export default function NewDocumentPage() {
  const router = useRouter();
  const principal = useApp((s) => s.principal)!;
  const addDocument = useApp((s) => s.addDocument);
  const [file, setFile] = useState<File | null>(null);
  const [useSample, setUseSample] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState(documentTypes[0]);
  const [drag, setDrag] = useState(false);
  const [signers, setSigners] = useState<DraftSigner[]>([
    { key: 1, name: principal.name, email: principal.email, role: "signer", order: 1 },
  ]);
  const [ordered, setOrdered] = useState(true);

  const pick = (f: File) => {
    if (f.type !== "application/pdf") return alert("Please choose a PDF file.");
    setFile(f);
    setUseSample(false);
    if (!title) setTitle(f.name.replace(/\.pdf$/i, ""));
  };

  const update = (key: number, patch: Partial<DraftSigner>) => setSigners((s) => s.map((x) => (x.key === key ? { ...x, ...patch } : x)));
  const move = (i: number, dir: -1 | 1) =>
    setSigners((s) => {
      const c = [...s];
      [c[i], c[i + dir]] = [c[i + dir], c[i]];
      return c;
    });

  const hasDoc = file || useSample;
  const valid = hasDoc && title.trim() && signers.every((s) => s.name.trim() && /\S+@\S+/.test(s.email));

  const submit = () => {
    const id = addDocument({
      title: title.trim(),
      type,
      pages: useSample ? 1 : Math.max(1, Math.round((file?.size ?? 60000) / 60000)),
      sizeKb: Math.round((file?.size ?? 48000) / 1024),
      hasFile: !!file,
      signers: signers.map((s, i) => ({ name: s.name.trim(), email: s.email.trim(), role: s.role, order: ordered ? i + 1 : 1 })),
    });
    if (file) fileStore.set(id, file);
    router.push(`/app/documents/${id}`);
  };

  return (
    <div className={cn(pageWrap, "max-w-[860px]")}>
      <PageHeader back={{ href: "/app/documents", label: "Documents" }} title="New document" subtitle="Upload an unsigned PDF and add everyone who needs to sign it." />

      <section>
        <p className="mb-2 text-[14px] font-medium text-ink">1. Document</p>
        {hasDoc ? (
          <Card className="flex items-center gap-3 p-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-[6px] bg-danger-soft font-mono text-[10px] text-danger">PDF</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14.5px] text-ink">{file ? file.name : "Sample affidavit.pdf"}</p>
              <p className="text-[12.5px] text-muted">{file ? `${Math.round(file.size / 1024)} KB` : "Demo document"}</p>
            </div>
            <button onClick={() => { setFile(null); setUseSample(false); }} className="rounded p-1.5 text-muted hover:bg-surface-2" aria-label="Remove file">
              <X className="size-4" />
            </button>
          </Card>
        ) : (
          <label
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) pick(f); }}
            className={cn("flex cursor-pointer flex-col items-center justify-center rounded-[10px] border-2 border-dashed px-6 py-12 text-center transition", drag ? "border-accent bg-accent-soft/40" : "border-line-strong bg-surface")}
          >
            <input type="file" accept="application/pdf" className="sr-only" onChange={(e) => e.target.files?.[0] && pick(e.target.files[0])} />
            <span className="flex size-12 items-center justify-center rounded-[10px] bg-accent-soft text-primary"><Upload className="size-5" /></span>
            <p className="mt-3 font-medium text-ink">Drop a PDF here or tap to browse</p>
            <p className="mt-1 text-[13px] text-muted">Up to 25 MB ·{" "}
              <button type="button" className="text-primary underline" onClick={(e) => { e.preventDefault(); setUseSample(true); if (!title) { setTitle("Affidavit of Undertaking"); setType("Affidavit"); } }}>
                use a sample document
              </button>
            </p>
          </label>
        )}

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Title">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., SPA — Sale of Lot in Tagaytay" />
          </Field>
          <Field label="Document type">
            <Select value={type} onChange={(e) => setType(e.target.value)}>
              {documentTypes.map((t) => <option key={t}>{t}</option>)}
            </Select>
          </Field>
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[14px] font-medium text-ink">2. Signers</p>
          <label className="flex items-center gap-2 text-[13.5px]">
            <input type="checkbox" checked={ordered} onChange={(e) => setOrdered(e.target.checked)} className="accent-[var(--color-primary)]" />
            Sign in order
          </label>
        </div>
        <div className="space-y-3">
          {signers.map((s, i) => (
            <Card key={s.key} className="p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-full border border-accent text-[11px] text-accent">{ordered ? i + 1 : "•"}</span>
                <span className="text-[13.5px] text-muted">{i === 0 ? "You" : `Signer ${i + 1}`}</span>
                <div className="ml-auto flex gap-1">
                  {ordered && i > 0 && <button onClick={() => move(i, -1)} className="rounded p-1 text-muted hover:bg-surface-2" aria-label="Move up"><ArrowUp className="size-4" /></button>}
                  {ordered && i < signers.length - 1 && <button onClick={() => move(i, 1)} className="rounded p-1 text-muted hover:bg-surface-2" aria-label="Move down"><ArrowDown className="size-4" /></button>}
                  {signers.length > 1 && <button onClick={() => setSigners(signers.filter((x) => x.key !== s.key))} className="rounded p-1 text-muted hover:bg-surface-2" aria-label="Remove"><Trash2 className="size-4" /></button>}
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-[1fr_1fr_140px]">
                <Input value={s.name} onChange={(e) => update(s.key, { name: e.target.value })} placeholder="Full name" />
                <Input type="email" value={s.email} onChange={(e) => update(s.key, { email: e.target.value })} placeholder="Email" />
                <Select value={s.role} onChange={(e) => update(s.key, { role: e.target.value as DraftSigner["role"] })}>
                  <option value="signer">Signer</option>
                  <option value="approver">Approver</option>
                </Select>
              </div>
            </Card>
          ))}
        </div>
        <Button variant="secondary" className="mt-3" onClick={() => setSigners([...signers, { key: Date.now(), name: "", email: "", role: "signer", order: signers.length + 1 }])}>
          <Plus className="size-4" /> Add signer
        </Button>
      </section>

      <div className="sticky bottom-20 mt-10 flex flex-col-reverse gap-3 rounded-[10px] border border-line bg-surface/95 p-3 backdrop-blur sm:flex-row sm:items-center sm:justify-between lg:bottom-4">
        <p className="flex items-center gap-2 px-1 text-[13px] text-muted">
          <FileText className="size-4" /> Signers get an email link. You sign first.
        </p>
        <Button size="lg" disabled={!valid} onClick={submit}>
          Create & continue to signing
        </Button>
      </div>
    </div>
  );
}
