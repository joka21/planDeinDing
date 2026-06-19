import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-seitiger Rollen-Gate (zusätzlich zum Login-Gate der Middleware).
  await requireAdmin();

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <nav aria-label="Admin" className="mb-8 border-b border-divider pb-4">
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-body">
          <li>
            <Link href="/admin" className="font-medium text-text hover:underline">
              Übersicht
            </Link>
          </li>
          <li>
            <Link
              href="/admin/projekte"
              className="font-medium text-text hover:underline"
            >
              Projekte
            </Link>
          </li>
          <li>
            <Link
              href="/admin/nutzer"
              className="font-medium text-text hover:underline"
            >
              Nutzer
            </Link>
          </li>
        </ul>
      </nav>
      {children}
    </div>
  );
}
