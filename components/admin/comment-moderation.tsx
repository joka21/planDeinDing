"use client";

import { useTransition } from "react";
import {
  setCommentHiddenAction,
  deleteRatingAction,
} from "@/app/admin/actions";

export function CommentHiddenToggle({
  ratingId,
  hidden,
  slug,
}: {
  ratingId: string;
  hidden: boolean;
  slug: string;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      aria-pressed={hidden}
      onClick={() =>
        startTransition(() =>
          setCommentHiddenAction(ratingId, !hidden, slug),
        )
      }
      className="rounded-lg border border-border px-3 py-1.5 text-small font-semibold text-text hover:bg-bg disabled:opacity-60"
    >
      {pending
        ? "…"
        : hidden
          ? "Kommentar einblenden"
          : "Kommentar ausblenden"}
    </button>
  );
}

export function RatingDeleteButton({
  ratingId,
  slug,
}: {
  ratingId: string;
  slug: string;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (window.confirm("Diese Bewertung wirklich endgültig löschen?")) {
          startTransition(() => deleteRatingAction(ratingId, slug));
        }
      }}
      className="rounded-lg border border-border px-3 py-1.5 text-small font-semibold text-text hover:bg-bg disabled:opacity-60"
    >
      {pending ? "…" : "Löschen"}
    </button>
  );
}
