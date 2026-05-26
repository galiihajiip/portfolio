"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { createClient } from "@/lib/supabase/client";
import type { Experience } from "@/types";
import { ExperienceFormModal } from "./ExperienceFormModal";

interface ExperienceAdminClientProps {
  initialExperience: Experience[];
}

const columns: Column<Experience>[] = [
  { key: "role_en", header: "Role (EN)", render: (item) => <span className="font-medium text-text-primary">{item.role_en}</span> },
  { key: "company_name", header: "Company" },
  { key: "start_date", header: "Start Date" },
  { key: "is_current", header: "Current", render: (item) => (item.is_current ? "Yes" : "-") },
];

export function ExperienceAdminClient({ initialExperience }: ExperienceAdminClientProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const refresh = () => startTransition(() => router.refresh());

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("experience").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete experience");
      return;
    }

    toast.success("Experience deleted");
    refresh();
  };

  return (
    <>
      <DataTable
        data={initialExperience}
        columns={columns}
        onAdd={() => {
          setEditingExperience(null);
          setIsFormOpen(true);
        }}
        onEdit={(item) => {
          setEditingExperience(item);
          setIsFormOpen(true);
        }}
        onDelete={handleDelete}
        title="Experience"
      />
      <ExperienceFormModal
        experience={editingExperience}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingExperience(null);
          refresh();
        }}
      />
    </>
  );
}
