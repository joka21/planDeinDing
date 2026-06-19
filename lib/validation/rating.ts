import { z } from "zod";

export const ratingSchema = z.object({
  stars: z.coerce
    .number({ message: "Bitte wähle 1 bis 5 Sterne." })
    .int()
    .min(1, "Bitte wähle 1 bis 5 Sterne.")
    .max(5, "Bitte wähle 1 bis 5 Sterne."),
  comment: z
    .string()
    .trim()
    .max(1000, "Der Kommentar darf höchstens 1000 Zeichen haben.")
    .optional(),
});

// Eingabewerte des Formulars (vor coerce) bzw. validierte Ausgabe (nach coerce).
export type RatingFormValues = z.input<typeof ratingSchema>;
export type RatingInput = z.output<typeof ratingSchema>;
