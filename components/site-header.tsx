import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="bg-surface-dark text-bg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-3"
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
      </div>
    </header>
  );
}
