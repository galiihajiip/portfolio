import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const [
    { count: projectCount },
    { count: expCount },
    { count: certCount },
    { count: messageCount },
  ] = await Promise.all([
    supabase.from("projects").select("*", { count: "exact", head: true }),
    supabase.from("experience").select("*", { count: "exact", head: true }),
    supabase.from("certifications").select("*", { count: "exact", head: true }),
    supabase
      .from("contact_messages")
      .select("*", { count: "exact", head: true })
      .eq("is_read", false),
  ]);

  return (
    <AdminShell>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl text-text-primary">Dashboard</h1>
          <p className="text-text-muted text-sm mt-1">Overview of your portfolio CMS</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Projects", value: projectCount ?? 0 },
            { label: "Experience", value: expCount ?? 0 },
            { label: "Certifications", value: certCount ?? 0 },
            { label: "Unread Messages", value: messageCount ?? 0, accent: true },
          ].map(({ label, value, accent }) => (
            <div
              key={label}
              className={`p-5 rounded-xl border ${
                accent ? "bg-accent-subtle border-accent/20" : "bg-surface-elevated border-border"
              }`}
            >
              <div
                className={`text-3xl font-bold font-mono ${
                  accent ? "text-accent" : "text-text-primary"
                }`}
              >
                {value}
              </div>
              <div className="text-sm text-text-muted mt-1">{label}</div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-surface-subtle border border-border rounded-xl text-sm text-text-secondary">
          Signed in as <strong className="text-text-primary">{user.email}</strong>
        </div>
      </div>
    </AdminShell>
  );
}
