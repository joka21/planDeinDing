import { z } from "zod";

// Geteilte Schemata für Client (react-hook-form) und Server Actions.

export const displayNameSchema = z
  .string()
  .trim()
  .min(2, "Bitte gib einen Anzeigenamen mit mindestens 2 Zeichen an.")
  .max(60, "Der Anzeigename darf höchstens 60 Zeichen haben.");

export const registerSchema = z.object({
  display_name: displayNameSchema,
  email: z.email("Bitte gib eine gültige E-Mail-Adresse ein."),
  password: z
    .string()
    .min(8, "Das Passwort muss mindestens 8 Zeichen haben.")
    .max(72, "Das Passwort darf höchstens 72 Zeichen haben."),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.email("Bitte gib eine gültige E-Mail-Adresse ein."),
  password: z.string().min(1, "Bitte gib dein Passwort ein."),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const profileSchema = z.object({
  display_name: displayNameSchema,
});
export type ProfileInput = z.infer<typeof profileSchema>;
