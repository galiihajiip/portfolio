"use client";

import { useState, useTransition } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Check, Eye, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { createClient } from "@/lib/supabase/client";
import type { ContactMessage } from "@/types";

interface MessagesClientProps {
  initialMessages: ContactMessage[];
}

const columns: Column<ContactMessage>[] = [
  { key: "name", header: "Name", render: (message) => <span className="font-medium text-text-primary">{message.name}</span> },
  { key: "email", header: "Email" },
  { key: "subject", header: "Subject", render: (message) => message.subject || "-" },
  { key: "created_at", header: "Date", render: (message) => new Date(message.created_at).toLocaleDateString() },
  { key: "is_read", header: "Read", render: (message) => (message.is_read ? "Read" : "Unread") },
];

export function MessagesClient({ initialMessages }: MessagesClientProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const refresh = () => startTransition(() => router.refresh());

  const markAsRead = async (message: ContactMessage) => {
    if (message.is_read) return;

    setMarkingId(message.id);
    const supabase = createClient();
    const { error } = await supabase
      .from("contact_messages")
      .update({ is_read: true })
      .eq("id", message.id);
    setMarkingId(null);

    if (error) {
      toast.error("Failed to mark message as read");
      return;
    }

    toast.success("Message marked as read");
    refresh();
  };

  return (
    <>
      <DataTable
        data={initialMessages}
        columns={columns}
        title="Messages"
        actions={(message) => (
          <>
            <button
              type="button"
              onClick={() => setSelectedMessage(message)}
              className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-surface-subtle hover:text-text-primary"
              aria-label="View message"
            >
              <Eye size={14} />
            </button>
            {!message.is_read && (
              <button
                type="button"
                onClick={() => markAsRead(message)}
                className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-emerald-500/10 hover:text-emerald-500"
                aria-label="Mark as read"
              >
                {markingId === message.id ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              </button>
            )}
          </>
        )}
      />

      <Dialog.Root open={Boolean(selectedMessage)} onOpenChange={(open) => !open && setSelectedMessage(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-surface-elevated p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <Dialog.Title className="font-display text-xl text-text-primary">
                  {selectedMessage?.subject || "Contact Message"}
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-sm text-text-muted">
                  From {selectedMessage?.name} ({selectedMessage?.email})
                </Dialog.Description>
              </div>
              <Dialog.Close className="rounded-lg p-1.5 text-text-muted hover:text-text-primary">
                <X size={18} />
              </Dialog.Close>
            </div>

            <div className="rounded-xl border border-border bg-surface-subtle p-4 text-sm leading-7 text-text-secondary whitespace-pre-wrap">
              {selectedMessage?.message}
            </div>

            <div className="mt-5 flex justify-end gap-3">
              {selectedMessage && !selectedMessage.is_read && (
                <button
                  type="button"
                  onClick={() => markAsRead(selectedMessage)}
                  disabled={markingId === selectedMessage.id}
                  className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm text-accent-foreground hover:bg-accent/90 disabled:opacity-60"
                >
                  {markingId === selectedMessage.id && <Loader2 size={14} className="animate-spin" />}
                  Mark as Read
                </button>
              )}
              <Dialog.Close className="rounded-lg border border-border px-4 py-2 text-sm text-text-secondary hover:text-text-primary">
                Close
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
