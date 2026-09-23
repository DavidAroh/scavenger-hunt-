"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Re-runs the server component every few seconds (leaderboard screen). Pauses in background tabs. */
export function LiveRefresh({ every = 8000 }: { every?: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, every);
    return () => clearInterval(id);
  }, [router, every]);
  return null;
}
