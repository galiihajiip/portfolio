"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, X } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Database, Experience } from "@/types";

const schema = z.object({
  company_name: z.string().min(2, "Required"),
  role_en: z.string().min(2, "Required"),
  role_id: z.string().min(2, "Required"),
  description_en: z.string(),
  description_id: z.string(),
  start_date: z.string().min(1, "Required"),
  end_date: z.string(),
  is_current: z.boolean(),
  company_logo_url: z.string().url("Invalid URL").or(z.literal("")),
  company_url: z.string().url("Invalid URL").or(z.literal("")),
  location_en: z.string(),
  location_id: z.string(),
  employment_type: z.enum(["full-time", "part-time", "freelance", "contract", "internship"]),
  display_order: z.number(),
});

type FormData = z.infer<typeof schema>;
type ExperienceInsert = Database["public"]["Tables"]["experience"]["Insert"];
type ExperienceUpdate = Database["public"]["Tables"]["experience"]["Update"];

const inputClasses =
  "w-full px-3 py-2.5 bg-surface-subtle border border-border rounded-lg text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-border-strong transition-all duration-200";
const labelClasses = "block text-xs font-medium text-text-secondary mb-1.5";
const errorClasses = "text-xs text-red-500 mt-1";
const emptyValues: FormData = {
  company_name: "",
  role_en: "",
  role_id: "",
  description_en: "",
  description_id: "",
  start_date: "",
  end_date: "",
  is_current: false,
  company_logo_url: "",
  company_url: "",
  location_en: "",
  location_id: "",
  employment_type: "full-time",
  display_order: 0,
};

interface ExperienceFormModalProps {
  experience: Experience | null;
  isOpen: boolean;
  onClose: () => void;
}

const nullable = (value: string) => value.trim() || null;

export function ExperienceFormModal({ experience, isOpen, onClose }: ExperienceFormModalProps) {
  const isEditing = Boolean(experience);
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues,
  });

  const isCurrent = useWatch({ control, name: "is_current" });

  useEffect(() => {
    if (experience) {
      reset({
        company_name: experience.company_name,
        role_en: experience.role_en,
        role_id: experience.role_id,
        description_en: experience.description_en ?? "",
        description_id: experience.description_id ?? "",
        start_date: experience.start_date,
        end_date: experience.end_date ?? "",
        is_current: experience.is_current,
        company_logo_url: experience.company_logo_url ?? "",
        company_url: experience.company_url ?? "",
        location_en: experience.location_en ?? "",
        location_id: experience.location_id ?? "",
        employment_type: experience.employment_type,
        display_order: experience.display_order,
      });
    } else {
      reset(emptyValues);
    }
  }, [experience, reset]);

  const onSubmit = async (data: FormData) => {
    const supabase = createClient();
    const payload: ExperienceInsert = {
      company_name: data.company_name,
      role_en: data.role_en,
      role_id: data.role_id,
      description_en: nullable(data.description_en),
      description_id: nullable(data.description_id),
      start_date: data.start_date,
      end_date: data.is_current ? null : nullable(data.end_date),
      is_current: data.is_current,
      company_logo_url: nullable(data.company_logo_url),
      company_url: nullable(data.company_url),
      location_en: nullable(data.location_en),
      location_id: nullable(data.location_id),
      employment_type: data.employment_type,
      display_order: data.display_order,
    };

    const { error } =
      isEditing && experience
        ? await supabase.from("experience").update(payload as ExperienceUpdate).eq("id", experience.id)
        : await supabase.from("experience").insert(payload);

    if (error) {
      toast.error(isEditing ? "Failed to update experience" : "Failed to create experience");
      return;
    }

    toast.success(isEditing ? "Experience updated" : "Experience created");
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.97, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="fixed inset-4 z-50 flex flex-col overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-2xl md:inset-8 xl:bottom-8 xl:left-1/2 xl:top-8 xl:w-full xl:max-w-2xl xl:-translate-x-1/2"
              >
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                  <Dialog.Title className="font-semibold text-text-primary">{isEditing ? "Edit Experience" : "Add Experience"}</Dialog.Title>
                  <Dialog.Close className="rounded-lg p-1.5 text-text-muted hover:text-text-primary"><X size={18} /></Dialog.Close>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  <form id="experience-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                    <Field label="Company" error={errors.company_name?.message}><input {...register("company_name")} className={cn(inputClasses, errors.company_name && "border-red-400")} /></Field>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field label="Role (EN)" error={errors.role_en?.message}><input {...register("role_en")} className={cn(inputClasses, errors.role_en && "border-red-400")} /></Field>
                      <Field label="Role (ID)" error={errors.role_id?.message}><input {...register("role_id")} className={cn(inputClasses, errors.role_id && "border-red-400")} /></Field>
                      <Field label="Description (EN)"><textarea {...register("description_en")} rows={4} className={cn(inputClasses, "resize-none")} /></Field>
                      <Field label="Description (ID)"><textarea {...register("description_id")} rows={4} className={cn(inputClasses, "resize-none")} /></Field>
                      <Field label="Start Date" error={errors.start_date?.message}><input {...register("start_date")} type="date" className={cn(inputClasses, errors.start_date && "border-red-400")} /></Field>
                      <Field label="End Date"><input {...register("end_date")} type="date" disabled={isCurrent} className={cn(inputClasses, isCurrent && "opacity-60")} /></Field>
                      <Field label="Company Logo URL" error={errors.company_logo_url?.message}><input {...register("company_logo_url")} className={cn(inputClasses, errors.company_logo_url && "border-red-400")} /></Field>
                      <Field label="Company URL" error={errors.company_url?.message}><input {...register("company_url")} className={cn(inputClasses, errors.company_url && "border-red-400")} /></Field>
                      <Field label="Location (EN)"><input {...register("location_en")} className={inputClasses} /></Field>
                      <Field label="Location (ID)"><input {...register("location_id")} className={inputClasses} /></Field>
                      <Field label="Employment Type">
                        <select {...register("employment_type")} className={inputClasses}>
                          {["full-time", "part-time", "freelance", "contract", "internship"].map((type) => <option key={type} value={type}>{type}</option>)}
                        </select>
                      </Field>
                      <Field label="Display Order"><input {...register("display_order", { valueAsNumber: true })} type="number" className={inputClasses} /></Field>
                    </div>
                    <label className="flex items-center gap-2 text-sm text-text-secondary">
                      <input {...register("is_current", { onChange: (event) => event.target.checked && setValue("end_date", "") })} type="checkbox" className="h-4 w-4 accent-orange-500" />
                      Current role
                    </label>
                  </form>
                </div>
                <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
                  <Dialog.Close className="rounded-lg border border-border px-4 py-2 text-sm text-text-secondary hover:text-text-primary">Cancel</Dialog.Close>
                  <button type="submit" form="experience-form" disabled={isSubmitting} className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm text-accent-foreground hover:bg-accent/90 disabled:opacity-60">
                    {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                    {isEditing ? "Save Changes" : "Create Experience"}
                  </button>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <div><label className={labelClasses}>{label}</label>{children}{error && <p className={errorClasses}>{error}</p>}</div>;
}
