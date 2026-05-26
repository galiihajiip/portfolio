import { AdminShell } from "@/components/admin/AdminShell";
import { CertificationsAdminClient } from "@/components/admin/certifications/CertificationsAdminClient";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminCertificationsPage() {
  const supabase = await createClient();
  const { data: certifications } = await supabase
    .from("certifications")
    .select("*")
    .order("display_order", { ascending: true });

  return (
    <AdminShell>
      <CertificationsAdminClient initialCertifications={certifications || []} />
    </AdminShell>
  );
}
