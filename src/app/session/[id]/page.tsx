"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui";
import { SessionRoom } from "@/components/session-room";
import { useStoreReady } from "@/components/store-hydrator";
import { useApp } from "@/lib/store";

// Client side of the video session. Lives outside /app so it can be full-screen.
export default function ClientSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const ready = useStoreReady();
  const principal = useApp((s) => s.principal);
  const router = useRouter();
  useEffect(() => {
    if (ready && !principal) router.replace(`/login?next=/session/${id}`);
  }, [ready, principal, router, id]);
  if (!ready || !principal) return <div className="flex min-h-dvh items-center justify-center bg-night text-white"><Spinner /></div>;
  return <SessionRoom id={id} as="principal" />;
}
