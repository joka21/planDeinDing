export default function Home() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-6 py-20">
        <p className="font-display text-body font-medium text-text-accent">
          Plan dein Ding
        </p>
        <h1 className="mt-4 font-display text-h1 font-extrabold tracking-tight text-text">
          Sei ein Spinner
        </h1>
        <p className="mt-6 max-w-2xl text-body text-text/80">
          Große Ideen brauchen einen Anfang. Hier planst du dein Ding – vom
          ersten verrückten Gedanken bis zum fertigen Projekt. Spinn ruhig
          ein bisschen: die besten Vorhaben fangen genau so an.
        </p>
      </section>

      <section
        aria-labelledby="latest-projects"
        className="mx-auto max-w-6xl px-6 pb-20"
      >
        <h2
          id="latest-projects"
          className="font-display text-h2 font-bold text-text"
        >
          Neueste Projekte
        </h2>
        <p className="mt-3 text-body text-text/80">
          Bald findest du hier die zuletzt gestarteten Projekte.
        </p>

        <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            "/cover-1-hellblau.svg",
            "/cover-2-dunkelblau.svg",
            "/cover-5-gruen.svg",
          ].map((cover) => (
            <li
              key={cover}
              className="overflow-hidden rounded-lg border border-divider bg-surface"
            >
              {/* Cover-Vorlage (dekorativ — Platzhalter für ein künftiges Projekt). */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cover}
                alt=""
                width={200}
                height={112}
                className="aspect-video w-full object-cover"
              />
              <div className="p-6">
                <div className="h-4 w-2/3 rounded bg-text/10" aria-hidden="true" />
                <div className="mt-3 h-3 w-full rounded bg-text/10" aria-hidden="true" />
                <span className="sr-only">Platzhalter für ein Projekt</span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
