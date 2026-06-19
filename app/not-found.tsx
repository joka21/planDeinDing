import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto max-w-md px-6 py-20 text-center">
      <h1 className="font-display text-h1 font-extrabold text-text">404</h1>
      <p className="mt-3 text-body text-text/80">
        Diese Seite gibt es nicht (mehr) oder das Projekt ist nicht
        veröffentlicht.
      </p>
      <p className="mt-6">
        <Link href="/projekte" className="font-medium text-text underline">
          Zu den Projekten
        </Link>
      </p>
    </section>
  );
}
