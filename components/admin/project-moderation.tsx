"use client";

import { useState, useTransition } from "react";
import {
  publishProjectAction,
  rejectProjectAction,
  withdrawProjectAction,
} from "@/app/admin/actions";

export function ApproveButton({ id, slug }: { id: string; slug: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => publishProjectAction(id, slug))}
      className="rounded-lg bg-primary px-3 py-1.5 text-small font-semibold text-bg hover:bg-text disabled:opacity-60"
    >
      {pending ? "…" : "Freigeben"}
    </button>
  );
}

export function RejectForm({ id, slug }: { id: string; slug: string }) {
  const [pending, startTransition] = useTransition();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  function onReject() {
    setError(null);
    startTransition(async () => {
      const res = await rejectProjectAction(id, slug, reason);
      if (res?.error) setError(res.error);
    });
  }

  return (
    <details className="text-small">
      <summary className="cursor-pointer font-medium text-text">
        Ablehnen…
      </summary>
      <div className="mt-2 flex flex-col gap-2">
        <label htmlFor={`reason-${id}`} className="font-medium text-text">
          Ablehnungsgrund
        </label>
        <textarea
          id={`reason-${id}`}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={2}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `reason-err-${id}` : undefined}
          className="rounded-lg border border-border bg-bg px-3 py-2 text-body text-text"
        />
        {error && (
          <p
            id={`reason-err-${id}`}
            role="alert"
            className="font-medium text-text-accent"
          >
            {error}
          </p>
        )}
        <button
          type="button"
          disabled={pending}
          onClick={onReject}
          className="self-start rounded-lg border border-border px-3 py-1.5 font-semibold text-text hover:bg-surface disabled:opacity-60"
        >
          {pending ? "…" : "Projekt ablehnen"}
        </button>
      </div>
    </details>
  );
}

export function WithdrawButton({ id, slug }: { id: string; slug: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (
          window.confirm(
            "Projekt wirklich aus der Veröffentlichung zurückziehen? Es geht zurück in die Prüfung.",
          )
        ) {
          startTransition(() => withdrawProjectAction(id, slug));
        }
      }}
      className="rounded-lg border border-border px-3 py-1.5 text-small font-semibold text-text hover:bg-surface disabled:opacity-60"
    >
      {pending ? "…" : "Zurückziehen"}
    </button>
  );
}
