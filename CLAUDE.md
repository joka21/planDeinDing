# Plan dein Ding — Projektkontext für Claude Code

## Worum es geht

Eine Webseite für Ideen. Claim: „Sei ein Spinner". Projekte werden vorgestellt und
können bewertet werden. Nutzer reichen Projekte ein (Admin gibt frei); vom Admin
freigegebene Nutzer dürfen bewerten; der Admin erstellt Projekte direkt.

## Tech-Stack (verbindlich)

- Next.js (App Router), TypeScript, React Server Components
- Tailwind CSS; UI-Komponenten selbst gebaut (semantisches HTML + ARIA). Nur für
  Modal/Dropdown o. Ä. ein zugängliches Headless-Primitive, wenn Hand-Rollen die
  Barrierefreiheit gefährdet.
- Supabase via `@supabase/ssr` (Auth über Cookies)
- Formulare: react-hook-form + zod (zugängliche Fehlerausgabe)
- Paketmanager: pnpm
- Region EU (Frankfurt). Nur Light-Mode. Routen auf Deutsch.

## Nicht verhandelbar (Barrierefreiheit & Qualität)

- WCAG 2.2: AA durchgängig, AAA wo erreichbar (v. a. Kontraste).
- Semantisches HTML, korrekte Überschriften-Hierarchie, Landmarks (header/nav/main/footer).
- Volle Tastaturbedienung; sichtbarer Fokus (Dunkelblau-Ring); logische Fokus-Reihenfolge.
- `prefers-reduced-motion` respektieren. Alle Größen in rem. Text bis 200 % zoombar.
- `html lang="de"`. Skip-to-content-Link als erstes fokussierbares Element.
- Keine Secrets im Client. Mutationen über Server Actions / Server-Code. RLS ist die
  Sicherheitsgrenze.

## Design-Tokens (Tailwind-Theme)

Farben (Rolle):

- `bg` `#FFFFFF` — Haupt-Hintergrund
- `surface` `#C3EDF2` — Cards/Sektionen
- `surface-dark` / `primary` / `text` / `border` `#1B5879` — Header/Footer, Haupttext,
  Primär-Button, funktionale Rahmen + Fokus
- `accent` / `text-accent` `#4C5E42` — Akzent-Button & -Text
- `decor` `#6B855D` — NUR dekorativ/Grafik, niemals Text
- `divider` `#CAC8CC` — nur dekorative Trennlinien, NICHT für funktionale Rahmen

Erlaubt (Text/Button): Dunkelblau auf Weiß (AAA) · Dunkelblau auf Hellblau (AA) ·
Weiß auf Dunkelblau (AAA) · Weiß auf Grün-dunkel (AAA) · Grün-dunkel auf Weiß (AAA).
Verboten: Grün `#6B855D` als Text · Hellgrau als funktionaler Rahmen/Fokus ·
Grün-dunkel-Text auf Hellgrau.

Schrift: `display` = Bricolage Grotesque, `sans` = Inter (beide self-hosted via next/font).
Skala: H1 3rem · H2 2.25 · H3 1.875 · H4 1.5 · Body 1.125rem (18px)/1.6 · Klein 0.875rem.
Untergrenzen nie unterschreiten. Spacing: 4-px-Basis.

## Datenmodell (Supabase)

- **profiles** (1:1 `auth.users`): `id`, `display_name` (öffentlich), `role`
  (`user|admin`, Default `user`, Admin manuell), `can_rate` (bool, Default `false` →
  schaltet Bewerten frei), `created_at`.
- **projects**: `id`, `author_id`, `title`, `teaser` (=SEO-Description), `description`,
  `cover_template` (eine der 6 Vorlagen), `slug` (unique), `status`
  (`draft|pending|published|rejected`, Default `pending`; Admin direkt `published`),
  `rejection_reason`, `created_at`/`updated_at`/`published_at`.
- **ratings**: `id`, `project_id` (cascade), `user_id`, `stars` (1–5, Pflicht),
  `comment` (optional), `comment_hidden` (bool), `created_at`/`updated_at`,
  `UNIQUE(project_id, user_id)`.

Regeln: zwei Freigaben — Nutzer-Freigabe (`can_rate`) fürs Bewerten, Projekt-Freigabe
(`status`) für die Veröffentlichung. Keine Selbstbewertung. Bearbeiten eines
veröffentlichten Projekts bleibt `published`. Autor darf eigenes Projekt löschen.
Kommentar-Moderation nachträglich (`comment_hidden`).

RLS: öffentlich nur `published`; Bewerten nur wenn `can_rate` & nicht Autor & Projekt
`published`; Admin moderiert. Helfer `is_admin()` / `can_current_user_rate()` als
SECURITY DEFINER (gegen RLS-Rekursion). Views: `public_profiles`, `project_rating_stats`.

## Routen (DE)

`/` · `/projekte` · `/projekte/[slug]` · `/einreichen` · `/login` · `/registrieren` ·
`/profil` · `/admin` · `/admin/projekte` · `/admin/nutzer`

## Assets (in /public)

`logo-symbol-color.svg`, `logo-symbol-mono.svg` (currentColor) und 6 Cover-SVGs
`cover-{hellblau,dunkelblau,hell-klar,split,gruen,muster}.svg` (16:9). Dateiname mappt
1:1 auf `cover_template`. Wortmarke „Plan dein Ding" als Live-Text in Bricolage. Claim
„Sei ein Spinner" nur außerhalb des Logos (z. B. Hero).

## Layout & UX (Airbnb-inspiriert)

Layout- und Interaktionsmuster von Airbnb übernehmen — nicht das visuelle Design. Marke
(Palette, Bricolage/Inter, Spiralmotiv) bleibt unsere. Flach & klar (keine
Verläufe/Schatten-Spielereien), viel Weißraum, abgerundete Karten (`rounded-lg`).

- Sticky Header: Logo links, Such-/Filterleiste mittig bzw. darunter, Login/Profil
  rechts; bleibt beim Scrollen sichtbar; Skip-Link bleibt erstes fokussierbares Element;
  ausreichender Kontrast.
- Projektübersicht als responsives Karten-Raster (1/2/3+ Spalten je Breakpoint) in einer
  semantischen Liste (ul/li). Karte: Cover (16:9, dekorativ `alt=""`), Titel (Live-Text),
  Autor, Ø-Bewertung. Ganze Karte klickbar über echten Link mit zugänglichem Namen
  (= Titel).
- Suche (Titel/Teaser) + Sortierung (neueste / beste Bewertung). Ergebnisanzahl per
  `aria-live` ansagen. Controls mit klaren Labels, tastaturbedienbar (native select
  bevorzugt).
- Detailseite großzügig & ruhig: großes Cover-Hero (Titel im soliden Markenband,
  Dunkelblau/weiß AAA), klare Hierarchie, Beschreibung gut lesbar (~70 Zeichen
  Zeilenlänge), Bewertungsbereich darunter.

## Konventionen

- Server Components als Default; `"use client"` nur wo nötig.
- Mutationen via Server Actions; Eingaben mit zod validieren (Client + Server).
- Cover sind dekorativ → `alt=""`. Inhaltliche Bilder brauchen Alt-Text.
- Kleine, getypte, lint-saubere Schritte.
