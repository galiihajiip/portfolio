"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { createClient } from "@/lib/supabase/client";
import type { Certification } from "@/types";
import { CertificationFormModal } from "./CertificationFormModal";

interface CertificationsAdminClientProps {
  initialCertifications: Certification[];
}

const columns: Column<Certification>[] = [
  { key: "title_en", header: "Title (EN)", render: (item) => <span className="font-medium text-text-primary">{item.title_en}</span> },
  { key: "issuer", header: "Issuer" },
  { key: "issue_date", header: "Issue Date", render: (item) => item.issue_date || "-" },
];

export function CertificationsAdminClient({ initialCertifications }: CertificationsAdminClientProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [editingCertification, setEditingCertification] = useState<Certification | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const refresh = () => startTransition(() => router.refresh());

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("certifications").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete certification");
      return;
    }

    toast.success("Certification deleted");
    refresh();
  };

  return (
    <>
      <DataTable
        data={initialCertifications}
        columns={columns}
        onAdd={() => {
          setEditingCertification(null);
          setIsFormOpen(true);
        }}
        onEdit={(item) => {
          setEditingCertification(item);
          setIsFormOpen(true);
        }}
        onDelete={handleDelete}
        title="Certifications"
      />
      <CertificationFormModal
        certification={editingCertification}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingCertification(null);
          refresh();
        }}
      />
    </>
  );
}
