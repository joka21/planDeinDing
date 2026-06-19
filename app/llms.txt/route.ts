import { siteName, siteUrl, siteDescription } from "@/lib/site";

// llms.txt für KI/GEO: knappe, faktische Orientierung über die Seite.
export async function GET() {
  const body = `# ${siteName}

> ${siteDescription}

## Wichtige Seiten
- [Startseite](${siteUrl}/): Claim „Sei ein Spinner" und neueste Projekte
- [Projekte](${siteUrl}/projekte): Übersicht aller veröffentlichten Projekte mit Suche und Sortierung
- [Registrieren](${siteUrl}/registrieren): Konto erstellen, um Projekte einzureichen
- [Anmelden](${siteUrl}/login)

## So funktioniert es
Nutzer reichen Projekte ein. Ein Admin gibt eingereichte Projekte frei, bevor sie öffentlich erscheinen.
Vom Admin freigeschaltete Nutzer können veröffentlichte Projekte mit 1–5 Sternen und einem optionalen
Kommentar bewerten. Selbstbewertungen sind nicht möglich.
`;

  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
