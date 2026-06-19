import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "E-Mail bestätigen" };

export default async function ConfirmStatusPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <section className="mx-auto max-w-md px-6 py-16">
      {error ? (
        <>
          <h1 className="font-display text-h2 font-bold text-text">
            Bestätigung fehlgeschlagen
          </h1>
          <p className="mt-3 text-body text-text/80">
            Der Bestätigungslink ist ungültig oder abgelaufen. Bitte
            registriere dich erneut oder fordere eine neue Bestätigung an.
          </p>
          <p className="mt-6">
            <Link href="/registrieren" className="font-medium text-text underline">
              Zur Registrierung
            </Link>
          </p>
        </>
      ) : (
        <>
          <h1 className="font-display text-h2 font-bold text-text">
            Fast geschafft!
          </h1>
          <p className="mt-3 text-body text-text/80">
            Wir haben dir eine Bestätigungs-E-Mail geschickt. Öffne den Link
            darin, um dein Konto zu aktivieren. Danach kannst du dich anmelden.
          </p>
          <p className="mt-6">
            <Link href="/login" className="font-medium text-text underline">
              Zur Anmeldung
            </Link>
          </p>
        </>
      )}
    </section>
  );
}
