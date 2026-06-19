import type { Metadata } from "next";
import "@/styles/globals.css";
import { display, sans } from "@/app/fonts";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: {
    default: "Plan dein Ding",
    template: "%s · Plan dein Ding",
  },
  description: "Sei ein Spinner. Plan dein Ding.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={`${display.variable} ${sans.variable}`}>
      <body>
        {/* Skip link — first focusable element on the page. */}
        <a href="#main" className="skip-link">
          Zum Inhalt springen
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
