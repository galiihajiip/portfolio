import { AdminShell } from "@/components/admin/AdminShell";
import { ProjectsAdminClient } from "@/components/admin/projects/ProjectsAdminClient";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("display_order", { ascending: true });

  return (
    <AdminShell>
      <ProjectsAdminClient initialProjects={projects || []} />
    </AdminShell>
  );
}
