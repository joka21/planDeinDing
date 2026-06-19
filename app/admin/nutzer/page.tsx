import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { CanRateToggle } from "@/components/admin/can-rate-toggle";

export const metadata: Metadata = { title: "Nutzer · Admin" };

type ProfileRow = {
  id: string;
  display_name: string;
  role: "user" | "admin";
  can_rate: boolean;
};

export default async function AdminUsersPage() {
  const supabase = await createClient();
  let users: ProfileRow[] = [];
  if (supabase) {
    const { data } = await supabase
      .from("profiles")
      .select("id, display_name, role, can_rate")
      .order("created_at", { ascending: false });
    users = (data ?? []) as ProfileRow[];
  }

  return (
    <>
      <h1 className="font-display text-h1 font-extrabold text-text">Nutzer</h1>
      <p className="mt-2 text-body text-text/80">
        Schalte Nutzer zum Bewerten frei oder entziehe die Freigabe.
      </p>

      {users.length === 0 ? (
        <p className="mt-8 text-body text-text/80">Keine Nutzer vorhanden.</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {users.map((u) => (
            <li
              key={u.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-divider bg-bg p-4"
            >
              <span className="font-medium text-text">{u.display_name}</span>
              {u.role === "admin" && (
                <span className="rounded-full bg-surface px-2.5 py-0.5 text-small text-text">
                  Admin
                </span>
              )}
              <span
                className={`text-small ${
                  u.can_rate ? "text-text-accent" : "text-text/60"
                }`}
              >
                {u.can_rate ? "freigeschaltet" : "nicht freigeschaltet"}
              </span>
              <span className="ml-auto">
                <CanRateToggle userId={u.id} canRate={u.can_rate} />
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
