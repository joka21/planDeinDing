import { forwardRef } from "react";

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  id: string;
  error?: string;
  hint?: string;
};

/**
 * Zugängliches Eingabefeld: verknüpft Label, optionalen Hinweis und Fehler per
 * aria-describedby, setzt aria-invalid und gibt Fehler als role="alert" aus.
 * Wird mit react-hook-form genutzt: <Field ... {...register("name")} />.
 */
export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, id, error, hint, ...props },
  ref,
) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy =
    [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-medium text-text">
        {label}
      </label>
      {hint && (
        <p id={hintId} className="text-small text-text/70">
          {hint}
        </p>
      )}
      <input
        id={id}
        ref={ref}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className="rounded-lg border border-border bg-bg px-3 py-2 text-body text-text"
        {...props}
      />
      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-small font-medium text-text-accent"
        >
          {error}
        </p>
      )}
    </div>
  );
});
