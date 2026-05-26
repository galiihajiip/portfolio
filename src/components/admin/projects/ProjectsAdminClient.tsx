"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { createClient } from "@/lib/supabase/client";
import type { Project } from "@/types";
import { ProjectFormModal } from "./ProjectFormModal";

interface ProjectsAdminClientProps {
  initialProjects: Project[];
}

const columns: Column<Project>[] = [
  {
    key: "title_en",
    header: "Title (EN)",
    render: (project) => (
      <div className="flex items-center gap-2">
        {project.thumbnail_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={project.thumbnail_url}
            alt=""
            className="h-8 w-8 flex-shrink-0 rounded object-cover"
          />
        )}
        <span className="max-w-[200px] truncate font-medium text-text-primary">
          {project.title_en}
        </span>
      </div>
    ),
  },
  {
    key: "category",
    header: "Category",
    render: (project) => <span className="capitalize">{project.category}</span>,
  },
  {
    key: "is_featured",
    header: "Featured",
    render: (project) => (project.is_featured ? "Yes" : "-"),
  },
  { key: "display_order", header: "Order" },
];

export function ProjectsAdminClient({ initialProjects }: ProjectsAdminClientProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("projects").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete project");
      return;
    }

    toast.success("Project deleted");
    startTransition(() => router.refresh());
  };

  const handleAdd = () => {
    setEditingProject(null);
    setIsFormOpen(true);
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingProject(null);
    startTransition(() => router.refresh());
  };

  return (
    <>
      <DataTable
        data={initialProjects}
        columns={columns}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        title="Projects"
      />
      <ProjectFormModal project={editingProject} isOpen={isFormOpen} onClose={handleFormClose} />
    </>
  );
}
