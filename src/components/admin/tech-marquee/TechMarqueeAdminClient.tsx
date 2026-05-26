"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { createClient } from "@/lib/supabase/client";
import type { TechMarqueeItem } from "@/types";
import { TechMarqueeFormModal } from "./TechMarqueeFormModal";

interface TechMarqueeAdminClientProps {
  initialItems: TechMarqueeItem[];
}

const columns: Column<TechMarqueeItem>[] = [
  { key: "name", header: "Name", render: (item) => <span className="font-medium text-text-primary">{item.name}</span> },
  { key: "category", header: "Category", render: (item) => item.category || "-" },
  { key: "is_active", header: "Active", render: (item) => (item.is_active ? "Active" : "Inactive") },
];

export function TechMarqueeAdminClient({ initialItems }: TechMarqueeAdminClientProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [editingItem, setEditingItem] = useState<TechMarqueeItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const refresh = () => startTransition(() => router.refresh());

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("tech_marquee").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete tech item");
      return;
    }

    toast.success("Tech item deleted");
    refresh();
  };

  return (
    <>
      <DataTable
        data={initialItems}
        columns={columns}
        onAdd={() => {
          setEditingItem(null);
          setIsFormOpen(true);
        }}
        onEdit={(item) => {
          setEditingItem(item);
          setIsFormOpen(true);
        }}
        onDelete={handleDelete}
        title="Tech Marquee"
      />
      <TechMarqueeFormModal
        item={editingItem}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingItem(null);
          refresh();
        }}
      />
    </>
  );
}
