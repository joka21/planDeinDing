export function RatingSummary({
  avg,
  count,
  className,
}: {
  avg: number | null;
  count: number;
  className?: string;
}) {
  if (!count || avg === null) {
    return (
      <p className={`text-small text-text/70 ${className ?? ""}`}>
        Noch keine Bewertungen
      </p>
    );
  }

  const formatted = avg.toFixed(1).replace(".", ",");
  return (
    <p className={`text-small text-text ${className ?? ""}`}>
      <span aria-hidden="true">★</span>{" "}
      <span
        aria-label={`Durchschnittlich ${formatted} von 5 Sternen bei ${count} ${
          count === 1 ? "Bewertung" : "Bewertungen"
        }`}
      >
        {formatted} · {count} {count === 1 ? "Bewertung" : "Bewertungen"}
      </span>
    </p>
  );
}
