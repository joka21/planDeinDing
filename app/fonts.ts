import { Bricolage_Grotesque, Inter } from "next/font/google";

/**
 * Fonts are self-hosted: next/font downloads them at build time and serves
 * them from our own origin (no runtime requests to Google).
 *
 * Variable names must match tailwind.config.ts fontFamily tokens.
 */
export const display = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bricolage",
  weight: ["400", "500", "600", "700", "800"],
});

export const sans = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});
