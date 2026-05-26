import { AdminShell } from "@/components/admin/AdminShell";
import { TechMarqueeAdminClient } from "@/components/admin/tech-marquee/TechMarqueeAdminClient";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminTechMarqueePage() {
  const supabase = await createClient();
  const { data: items } = await supabase
    .from("tech_marquee")
    .select("*")
    .order("display_order", { ascending: true });

  return (
    <AdminShell>
      <TechMarqueeAdminClient initialItems={items || []} />
    </AdminShell>
  );
}
