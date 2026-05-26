import { AdminShell } from "@/components/admin/AdminShell";
import { ExperienceAdminClient } from "@/components/admin/experience/ExperienceAdminClient";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminExperiencePage() {
  const supabase = await createClient();
  const { data: experience } = await supabase
    .from("experience")
    .select("*")
    .order("display_order", { ascending: true });

  return (
    <AdminShell>
      <ExperienceAdminClient initialExperience={experience || []} />
    </AdminShell>
  );
}
