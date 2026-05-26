import { AdminShell } from "@/components/admin/AdminShell";
import { ProfileForm } from "@/components/admin/profile/ProfileForm";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminProfilePage() {
  const supabase = await createClient();
  const { data: profile } = await supabase.from("profile").select("*").limit(1).maybeSingle();

  return (
    <AdminShell>
      <ProfileForm initialProfile={profile} />
    </AdminShell>
  );
}
