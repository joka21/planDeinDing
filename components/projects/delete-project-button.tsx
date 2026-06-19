"use client";

import { useTransition } from "react";
import { deleteProjectAction } from "@/app/einreichen/actions";

export function DeleteProjectButton({
  projectId,
  title,
}: {
  projectId: string;
  title: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (
          window.confirm(`Möchtest du „${title}“ wirklich endgültig löschen?`)
        ) {
          startTransition(() => deleteProjectAction(projectId));
        }
      }}
      className="rounded-lg border border-border px-3 py-1.5 text-small font-semibold text-text hover:bg-surface disabled:opacity-60"
    >
      {pending ? "Wird gelöscht…" : "Löschen"}
    </button>
  );
}
