"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextareaField } from "@/components/form/textarea-field";
import { FormError } from "@/components/form/form-error";
import {
  ratingSchema,
  type RatingFormValues,
  type RatingInput,
} from "@/lib/validation/rating";
import { rateAction } from "@/app/projekte/[slug]/actions";

export function RatingForm({
  projectId,
  slug,
  initial,
}: {
  projectId: string;
  slug: string;
  initial?: { stars: number; comment: string | null } | null;
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RatingFormValues, unknown, RatingInput>({
    resolver: zodResolver(ratingSchema),
    defaultValues: {
      stars: initial?.stars,
      comment: initial?.comment ?? "",
    },
  });

  const [serverError, setServerError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const alertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (serverError) alertRef.current?.focus();
  }, [serverError]);

  const current = Number(watch("stars")) || 0;

  async function onSubmit(values: RatingInput) {
    setServerError(null);
    setSaved(false);
    const result = await rateAction(projectId, slug, values);
    if ("error" in result) setServerError(result.error);
    else setSaved(true);
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="mt-6 flex flex-col gap-5 rounded-lg border border-divider bg-surface p-5"
    >
      <FormError ref={alertRef} message={serverError} />

      <fieldset>
        <legend className="font-medium text-text">Deine Bewertung</legend>
        <div className="mt-2 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="cursor-pointer p-1 text-h3 leading-none">
              <input
                type="radio"
                value={n}
                className="peer sr-only"
                aria-describedby={errors.stars ? "stars-error" : undefined}
                {...register("stars")}
              />
              <span
                aria-hidden="true"
                className={`rounded peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-border ${
                  n <= current ? "text-primary" : "text-text/25"
                }`}
              >
                ★
              </span>
              <span className="sr-only">{n} von 5 Sternen</span>
            </label>
          ))}
        </div>
        {errors.stars && (
          <p
            id="stars-error"
            role="alert"
            className="mt-1 text-small font-medium text-text-accent"
          >
            {errors.stars.message}
          </p>
        )}
      </fieldset>

      <TextareaField
        label="Kommentar (optional)"
        id="comment"
        rows={4}
        error={errors.comment?.message}
        {...register("comment")}
      />

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-primary px-4 py-2.5 font-semibold text-bg hover:bg-text disabled:opacity-60"
        >
          {isSubmitting
            ? "Wird gespeichert…"
            : initial
              ? "Bewertung aktualisieren"
              : "Bewertung abgeben"}
        </button>
        <p role="status" aria-live="polite" className="text-small text-text-accent">
          {saved ? "Danke! Deine Bewertung wurde gespeichert." : ""}
        </p>
      </div>
    </form>
  );
}
