import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Anmelden" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  if (await getUser()) redirect("/profil");
  const { redirect: redirectTo } = await searchParams;

  return (
    <section className="mx-auto max-w-md px-6 py-16">
      <h1 className="font-display text-h2 font-bold text-text">Anmelden</h1>
      <p className="mt-3 text-body text-text/80">
        Melde dich an, um Projekte einzureichen und zu bewerten.
      </p>

      <LoginForm redirectTo={redirectTo} />

      <p className="mt-6 text-body text-text/80">
        Noch kein Konto?{" "}
        <Link href="/registrieren" className="font-medium text-text underline">
          Registrieren
        </Link>
      </p>
    </section>
  );
}
