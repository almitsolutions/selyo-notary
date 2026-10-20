"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui";
import { SessionRoom } from "@/components/session-room";
import { useStoreReady } from "@/components/store-hydrator";
import { useApp } from "@/lib/store";

export default function NotarySessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const ready = useStoreReady();
  const user = useApp((s) => s.notaryUser);
  const router = useRouter();
  useEffect(() => {
    if (ready && !user) router.replace(`/login?as=notary&next=/notary/session/${id}`);
  }, [ready, user, router, id]);
  if (!ready || !user) return <div className="flex min-h-dvh items-center justify-center bg-night text-white"><Spinner /></div>;
  return <SessionRoom id={id} as="notary" />;
}
