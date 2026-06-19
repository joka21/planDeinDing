import { Suspense } from "react";
import Link from "next/link";
import { getProfile } from "@/lib/auth";
import { signOutAction } from "@/app/auth/actions";
import { SearchBar } from "@/components/search-bar";

export async function SiteHeader() {
  const profile = await getProfile();

  return (
    <header className="sticky top-0 z-40 bg-surface-dark text-bg">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-6 py-4">
        {/* Links: Logo + Wortmarke */}
        <Link
          href="/"
          className="order-1 flex shrink-0 items-center gap-3"
          aria-label="Plan dein Ding — zur Startseite"
        >
          {/*
            Logo symbol (decorative — the wordmark provides the link name).
            The color logo shares #1B5879 with the dark header, so it sits in a
            white "coin" to stay fully visible.
          */}
          <span className="inline-flex shrink-0 rounded-lg bg-bg p-1.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-symbol-color.svg"
              alt=""
              width={36}
              height={36}
              className="h-9 w-9"
            />
          </span>
          <span className="font-display text-h4 font-bold">Plan dein Ding</span>
        </Link>

        {/* Mitte (Desktop) / eigene Zeile (Mobil): Such-/Filterleiste */}
        <div className="order-3 w-full md:order-2 md:ml-2 md:w-auto md:max-w-md md:flex-1">
          <Suspense fallback={null}>
            <SearchBar />
          </Suspense>
        </div>

        {/* Rechts: Konto */}
        <nav
          aria-label="Konto"
          className="order-2 ml-auto flex shrink-0 items-center gap-2 md:order-3"
        >
          {profile ? (
            <>
              {profile.role === "admin" && (
                <Link
                  href="/admin"
                  className="rounded-lg px-3 py-2 font-medium hover:underline"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/profil"
                className="rounded-lg px-3 py-2 font-medium hover:underline"
              >
                Profil
              </Link>
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="rounded-lg bg-bg px-3 py-2 font-semibold text-primary hover:bg-surface"
                >
                  Abmelden
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 font-medium hover:underline"
              >
                Anmelden
              </Link>
              <Link
                href="/registrieren"
                className="rounded-lg bg-bg px-3 py-2 font-semibold text-primary hover:bg-surface"
              >
                Registrieren
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
