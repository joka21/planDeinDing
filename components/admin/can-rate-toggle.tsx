"use client";

import { useTransition } from "react";
import { setCanRateAction } from "@/app/admin/actions";

export function CanRateToggle({
  userId,
  canRate,
}: {
  userId: string;
  canRate: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      aria-pressed={canRate}
      onClick={() => startTransition(() => setCanRateAction(userId, !canRate))}
      className="rounded-lg border border-border px-3 py-1.5 text-small font-semibold text-text hover:bg-surface disabled:opacity-60"
    >
      {pending
        ? "…"
        : canRate
          ? "Freigabe entziehen"
          : "Zum Bewerten freischalten"}
    </button>
  );
}
