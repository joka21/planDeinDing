import type { Metadata } from "next";
import { requireProfile } from "@/lib/auth";
import { signOutAction } from "@/app/auth/actions";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = { title: "Profil" };

export default async function ProfilePage() {
  const profile = await requireProfile();

  return (
    <section className="mx-auto max-w-md px-6 py-16">
      <h1 className="font-display text-h2 font-bold text-text">Profil</h1>

      <h2 className="mt-8 font-display text-h4 font-bold text-text">
        Anzeigename
      </h2>
      <ProfileForm displayName={profile.display_name} />

      <h2 className="mt-12 font-display text-h4 font-bold text-text">Bewerten</h2>
      <p className="mt-3 text-body text-text/80">
        {profile.can_rate
          ? "Du bist freigeschaltet und kannst veröffentlichte Projekte bewerten."
          : "Du bist noch nicht zum Bewerten freigeschaltet. Ein Admin schaltet dich frei."}
      </p>

      <h2 className="mt-12 font-display text-h4 font-bold text-text">Konto</h2>
      <form action={signOutAction} className="mt-3">
        <button
          type="submit"
          className="rounded-lg border border-border px-4 py-2.5 font-semibold text-text hover:bg-surface"
        >
          Abmelden
        </button>
      </form>
    </section>
  );
}
