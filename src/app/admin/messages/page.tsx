import { AdminShell } from "@/components/admin/AdminShell";
import { MessagesClient } from "@/components/admin/messages/MessagesClient";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  const supabase = await createClient();
  const { data: messages } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <AdminShell>
      <MessagesClient initialMessages={messages || []} />
    </AdminShell>
  );
}
