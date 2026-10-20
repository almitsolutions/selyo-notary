"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input, Select } from "@/components/ui";
import { NotaryCard } from "@/components/notary-card";
import { cities, languages, notaries } from "@/lib/mock/notaries";
import { notarialActs } from "@/lib/mock/content";

export function NotaryDirectory() {
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [lang, setLang] = useState("");
  const [mode, setMode] = useState("");
  const [act, setAct] = useState("");

  const list = useMemo(
    () =>
      notaries.filter(
        (n) =>
          (!q || `${n.name} ${n.city} ${n.province}`.toLowerCase().includes(q.toLowerCase())) &&
          (!city || n.city === city) &&
          (!lang || n.languages.includes(lang)) &&
          (!mode || n.modes.includes(mode as "remote")) &&
          (!act || n.services.some((s) => s.act === act)),
      ),
    [q, city, lang, mode, act],
  );

  return (
    <div>
      <div className="relative max-w-xl">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
        <Input placeholder="Search by name or city…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
      </div>

      <div className="mt-8 flex gap-10 border-y border-line py-5">
        {[
          ["Notaries", notaries.length],
          ["Cities", cities.length],
          ["Languages", languages.length],
        ].map(([l, v]) => (
          <div key={l}>
            <p className="text-[13px] text-muted">{l}</p>
            <p className="text-[28px] leading-tight text-ink">{v}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        <Select value={city} onChange={(e) => setCity(e.target.value)} className="sm:w-44">
          <option value="">All cities</option>
          {cities.map((c) => <option key={c}>{c}</option>)}
        </Select>
        <Select value={lang} onChange={(e) => setLang(e.target.value)} className="sm:w-44">
          <option value="">All languages</option>
          {languages.map((c) => <option key={c}>{c}</option>)}
        </Select>
        <Select value={act} onChange={(e) => setAct(e.target.value)} className="sm:w-48">
          <option value="">All services</option>
          {notarialActs.map((a) => <option key={a.act}>{a.act}</option>)}
        </Select>
        <Select value={mode} onChange={(e) => setMode(e.target.value)} className="sm:w-40">
          <option value="">Any mode</option>
          <option value="remote">Remote</option>
          <option value="in_person">In-person</option>
        </Select>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((n) => (
          <NotaryCard key={n.id} notary={n} href={`/notaries/${n.id}`} />
        ))}
      </div>
      {list.length === 0 && <p className="py-16 text-center text-muted">No notaries match those filters.</p>}
      <p className="mt-6 text-[13px] text-muted">
        Showing {list.length} of {notaries.length} notaries
      </p>
    </div>
  );
}
