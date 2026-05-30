"use client";

import { useState, useTransition, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Plus, Trash2, AlertTriangle } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Experience } from "@/types";
import { ExperienceFormModal } from "./ExperienceFormModal";

interface ExperienceAdminClientProps {
  initialExperience: Experience[];
}

function SortableRow({
  item,
  onEdit,
  onDelete,
}: {
  item: Experience;
  onEdit: (item: Experience) => void;
  onDelete: (id: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={cn(
        "transition-colors hover:bg-surface-subtle",
        isDragging && "relative z-10 bg-surface-elevated shadow-lg opacity-90"
      )}
    >
      <td className="px-2 py-3 w-10">
        <button
          type="button"
          className="cursor-grab rounded p-1 text-text-muted hover:text-text-primary hover:bg-surface-subtle active:cursor-grabbing"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
        >
          <GripVertical size={16} />
        </button>
      </td>
      <td className="px-4 py-3 text-sm">
        <div className="flex items-center gap-3">
          {item.company_logo_url && (
            <img
              src={item.company_logo_url}
              alt={item.company_name}
              className="h-8 w-8 rounded-md object-contain bg-surface-subtle border border-border"
            />
          )}
          <span className="font-medium text-text-primary">{item.company_name}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-text-secondary">{item.role_en}</td>
      <td className="px-4 py-3 text-sm text-text-secondary">{item.start_date}</td>
      <td className="px-4 py-3 text-sm text-text-secondary">
        {item.is_current ? (
          <span className="inline-flex items-center rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600">
            Current
          </span>
        ) : (
          "-"
        )}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-surface-subtle hover:text-text-primary"
            aria-label="Edit entry"
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-red-500/10 hover:text-red-500"
            aria-label="Delete entry"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}

export function ExperienceAdminClient({ initialExperience }: ExperienceAdminClientProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [items, setItems] = useState<Experience[]>(initialExperience);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const refresh = () => startTransition(() => router.refresh());

  // Sync with server data when it changes
  useEffect(() => {
    setItems(initialExperience);
  }, [initialExperience]);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);

      // Persist new order to database
      setIsSavingOrder(true);
      const supabase = createClient();

      const updates = newItems.map((item, index) => ({
        id: item.id,
        display_order: index,
      }));

      const results = await Promise.all(
        updates.map(({ id, display_order }) =>
          supabase.from("experience").update({ display_order }).eq("id", id)
        )
      );

      const hasError = results.some((r) => r.error);
      if (hasError) {
        toast.error("Failed to save order");
        setItems(initialExperience);
      } else {
        toast.success("Order updated");
      }

      setIsSavingOrder(false);
    },
    [items, initialExperience]
  );

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    const supabase = createClient();
    const { error } = await supabase.from("experience").delete().eq("id", deleteId);

    if (error) {
      toast.error("Failed to delete experience");
    } else {
      toast.success("Experience deleted");
      setItems((prev) => prev.filter((i) => i.id !== deleteId));
      refresh();
    }

    setIsDeleting(false);
    setDeleteId(null);
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-xl text-text-primary">Experience</h2>
            {isSavingOrder && (
              <span className="text-xs text-text-muted animate-pulse">Saving order...</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingExperience(null);
              setIsFormOpen(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
          >
            <Plus size={15} />
            Add New
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-surface-elevated">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="w-10 px-2 py-3" />
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Company
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Start Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Status
                  </th>
                  <th className="w-24 px-4 py-3" />
                </tr>
              </thead>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={items.map((i) => i.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <tbody className="divide-y divide-border">
                    {items.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-12 text-center text-sm text-text-muted"
                        >
                          No entries yet. Click &quot;Add New&quot; to get started.
                        </td>
                      </tr>
                    ) : (
                      items.map((item) => (
                        <SortableRow
                          key={item.id}
                          item={item}
                          onEdit={(exp) => {
                            setEditingExperience(exp);
                            setIsFormOpen(true);
                          }}
                          onDelete={(id) => setDeleteId(id)}
                        />
                      ))
                    )}
                  </tbody>
                </SortableContext>
              </DndContext>
            </table>
          </div>
        </div>

        <p className="text-xs text-text-muted">
          Drag rows using the grip handle to reorder. Changes are saved automatically.
        </p>
      </div>

      {/* Delete confirmation dialog */}
      <Dialog.Root
        open={Boolean(deleteId)}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-surface-elevated p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-500/10">
                <AlertTriangle size={18} className="text-red-500" />
              </div>
              <div>
                <Dialog.Title className="font-semibold text-text-primary">
                  Delete Experience
                </Dialog.Title>
                <Dialog.Description className="text-sm text-text-muted">
                  This action cannot be undone.
                </Dialog.Description>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Dialog.Close className="rounded-lg border border-border px-4 py-2 text-sm text-text-secondary transition-colors hover:text-text-primary">
                Cancel
              </Dialog.Close>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm text-white transition-colors hover:bg-red-600 disabled:opacity-60"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

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
