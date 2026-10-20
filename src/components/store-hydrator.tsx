"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useApp } from "@/lib/store";

export function StoreHydrator() {
  useEffect(() => {
    useApp.persist.rehydrate();
    // Keep tabs in sync: when another tab writes, re-read.
    const onStorage = (e: StorageEvent) => {
      if (e.key === useApp.persist.getOptions().name) useApp.persist.rehydrate();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return null;
}

const subscribe = (cb: () => void) => useApp.persist.onFinishHydration(cb);

/** True once localStorage has been read on the client. */
export function useStoreReady() {
  return useSyncExternalStore(
    subscribe,
    () => useApp.persist.hasHydrated(),
    () => false,
  );
}
