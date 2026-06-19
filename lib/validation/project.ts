import { z } from "zod";
import { COVER_VALUES } from "@/lib/covers";

export const projectSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Bitte gib einen Titel mit mindestens 3 Zeichen an.")
    .max(120, "Der Titel darf höchstens 120 Zeichen haben."),
  teaser: z
    .string()
    .trim()
    .min(10, "Der Teaser sollte mindestens 10 Zeichen haben.")
    .max(200, "Der Teaser darf höchstens 200 Zeichen haben."),
  description: z
    .string()
    .trim()
    .min(20, "Die Beschreibung sollte mindestens 20 Zeichen haben.")
    .max(5000, "Die Beschreibung darf höchstens 5000 Zeichen haben."),
  cover_template: z.enum(COVER_VALUES, {
    message: "Bitte wähle eine Cover-Vorlage.",
  }),
});

export type ProjectInput = z.infer<typeof projectSchema>;
