// cover_template (DB-Wert) -> reale SVG-Datei in /public.
// Hinweis: Die Assets haben ein Nummernpräfix (cover-1-hellblau.svg),
// während cover_template nur den Namensteil speichert (hellblau).
export const COVERS = [
  { value: "hellblau", label: "Hellblau", file: "/cover-1-hellblau.svg" },
  { value: "dunkelblau", label: "Dunkelblau", file: "/cover-2-dunkelblau.svg" },
  { value: "hell-klar", label: "Hell & klar", file: "/cover-3-hell-klar.svg" },
  { value: "split", label: "Split", file: "/cover-4-split.svg" },
  { value: "gruen", label: "Grün", file: "/cover-5-gruen.svg" },
  { value: "muster", label: "Muster", file: "/cover-6-muster.svg" },
] as const;

export type CoverValue = (typeof COVERS)[number]["value"];

export const COVER_VALUES = COVERS.map((c) => c.value) as [
  CoverValue,
  ...CoverValue[],
];

export function coverFile(value: string): string {
  return COVERS.find((c) => c.value === value)?.file ?? COVERS[0].file;
}
