"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AlertTriangle, Pencil, Plus, Trash2 } from "lucide-react";

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => ReactNode;
}

interface DataTableProps<T extends { id: string }> {
  data: T[];
  columns: Column<T>[];
  actions?: (row: T) => ReactNode;
  onAdd?: () => void;
  onEdit?: (row: T) => void;
  onDelete?: (id: string) => Promise<void>;
  title: string;
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  actions,
  onAdd,
  onEdit,
  onDelete,
  title,
}: DataTableProps<T>) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId || !onDelete) {
      return;
    }

    setIsDeleting(true);
    await onDelete(deleteId);
    setIsDeleting(false);
    setDeleteId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl text-text-primary">{title}</h2>
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
          >
            <Plus size={15} />
            Add New
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface-elevated">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {columns.map((col) => (
                  <th
                    key={String(col.key)}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted"
                  >
                    {col.header}
                  </th>
                ))}
                {(actions || onEdit || onDelete) && <th className="w-24 px-4 py-3" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (actions || onEdit || onDelete ? 1 : 0)}
                    className="px-4 py-12 text-center text-sm text-text-muted"
                  >
                    No entries yet{onAdd ? '. Click "Add New" to get started.' : "."}
                  </td>
                </tr>
              ) : (
                data.map((row) => (
                  <tr key={row.id} className="transition-colors hover:bg-surface-subtle">
                    {columns.map((col) => (
                      <td key={String(col.key)} className="px-4 py-3 text-sm text-text-secondary">
                        {col.render
                          ? col.render(row)
                          : String((row as Record<string, unknown>)[String(col.key)] ?? "")}
                      </td>
                    ))}
                    {(actions || onEdit || onDelete) && (
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {actions?.(row)}
                          {onEdit && (
                            <button
                              type="button"
                              onClick={() => onEdit(row)}
                              className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-surface-subtle hover:text-text-primary"
                              aria-label="Edit entry"
                            >
                              <Pencil size={14} />
                            </button>
                          )}
                          {onDelete && (
                            <button
                              type="button"
                              onClick={() => setDeleteId(row.id)}
                              className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-red-500/10 hover:text-red-500"
                              aria-label="Delete entry"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog.Root open={Boolean(deleteId && onDelete)} onOpenChange={(open) => !open && setDeleteId(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-surface-elevated p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-500/10">
                <AlertTriangle size={18} className="text-red-500" />
              </div>
              <div>
                <Dialog.Title className="font-semibold text-text-primary">
                  Delete Entry
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
    </div>
  );
}
