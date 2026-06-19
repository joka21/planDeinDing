import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Registrieren" };

export default async function RegisterPage() {
  if (await getUser()) redirect("/profil");

  return (
    <section className="mx-auto max-w-md px-6 py-16">
      <h1 className="font-display text-h2 font-bold text-text">Registrieren</h1>
      <p className="mt-3 text-body text-text/80">
        Erstelle dein Konto, um eigene Projekte einzureichen.
      </p>

      <RegisterForm />

      <p className="mt-6 text-body text-text/80">
        Schon ein Konto?{" "}
        <Link href="/login" className="font-medium text-text underline">
          Anmelden
        </Link>
      </p>
    </section>
  );
}
