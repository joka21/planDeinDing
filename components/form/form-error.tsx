import { forwardRef } from "react";

/**
 * Formular-Fehlermeldung auf Formularebene (z. B. Serverfehler).
 * role="alert" kündigt sie an; tabIndex=-1 erlaubt das programmatische
 * Fokussieren, damit Tastatur-/Screenreader-Nutzer den Fehler direkt erreichen.
 */
export const FormError = forwardRef<HTMLDivElement, { message: string | null }>(
  function FormError({ message }, ref) {
    if (!message) return null;
    return (
      <div
        ref={ref}
        role="alert"
        tabIndex={-1}
        className="rounded-lg border border-border bg-surface px-4 py-3 text-body text-text"
      >
        {message}
      </div>
    );
  },
);
