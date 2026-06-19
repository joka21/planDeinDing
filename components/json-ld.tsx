export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify-Ausgabe ist sicher (keine HTML-Injektion über Werte).
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
