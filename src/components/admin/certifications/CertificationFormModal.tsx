"use client";

import type { ChangeEvent } from "react";
import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Upload, X } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Certification, Database } from "@/types";

const schema = z.object({
  title_en: z.string().min(2, "Required"),
  title_id: z.string().min(2, "Required"),
  issuer: z.string().min(2, "Required"),
  issue_date: z.string(),
  expiry_date: z.string(),
  credential_id: z.string(),
  credential_url: z.string().url("Invalid URL").or(z.literal("")),
  description_en: z.string(),
  description_id: z.string(),
  display_order: z.number(),
});

type FormData = z.infer<typeof schema>;
type CertificationInsert = Database["public"]["Tables"]["certifications"]["Insert"];
type CertificationUpdate = Database["public"]["Tables"]["certifications"]["Update"];

const inputClasses =
  "w-full px-3 py-2.5 bg-surface-subtle border border-border rounded-lg text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-border-strong transition-all duration-200";
const labelClasses = "block text-xs font-medium text-text-secondary mb-1.5";
const errorClasses = "text-xs text-red-500 mt-1";
const emptyValues: FormData = {
  title_en: "",
  title_id: "",
  issuer: "",
  issue_date: "",
  expiry_date: "",
  credential_id: "",
  credential_url: "",
  description_en: "",
  description_id: "",
  display_order: 0,
};

interface CertificationFormModalProps {
  certification: Certification | null;
  isOpen: boolean;
  onClose: () => void;
}

const nullable = (value: string) => value.trim() || null;

async function uploadBadge(file: File) {
  const supabase = createClient();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "-");
  const path = `badges/${file.lastModified}-${safeName}`;
  const { error } = await supabase.storage.from("portfolio-assets").upload(path, file, {
    upsert: true,
  });
  if (error) return null;
  const { data } = supabase.storage.from("portfolio-assets").getPublicUrl(path);
  return data.publicUrl;
}

export function CertificationFormModal({ certification, isOpen, onClose }: CertificationFormModalProps) {
  const isEditing = Boolean(certification);
  const [badgeFile, setBadgeFile] = useState<File | null>(null);
  const [badgePreview, setBadgePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    if (certification) {
      reset({
        title_en: certification.title_en,
        title_id: certification.title_id,
        issuer: certification.issuer,
        issue_date: certification.issue_date ?? "",
        expiry_date: certification.expiry_date ?? "",
        credential_id: certification.credential_id ?? "",
        credential_url: certification.credential_url ?? "",
        description_en: certification.description_en ?? "",
        description_id: certification.description_id ?? "",
        display_order: certification.display_order,
      });
      timeoutId = setTimeout(() => {
        setBadgePreview(certification.badge_url);
        setBadgeFile(null);
      }, 0);
    } else {
      reset(emptyValues);
      timeoutId = setTimeout(() => {
        setBadgePreview(null);
        setBadgeFile(null);
      }, 0);
    }
    return () => clearTimeout(timeoutId);
  }, [certification, reset]);

  const handleBadgeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setBadgeFile(file);
    setBadgePreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data: FormData) => {
    const supabase = createClient();
    setIsUploading(true);
    let badgeUrl = certification?.badge_url ?? null;
    if (badgeFile) {
      badgeUrl = await uploadBadge(badgeFile);
      if (!badgeUrl) {
        setIsUploading(false);
        toast.error("Badge upload failed");
        return;
      }
    }
    setIsUploading(false);

    const payload: CertificationInsert = {
      title_en: data.title_en,
      title_id: data.title_id,
      issuer: data.issuer,
      issue_date: nullable(data.issue_date),
      expiry_date: nullable(data.expiry_date),
      credential_id: nullable(data.credential_id),
      credential_url: nullable(data.credential_url),
      badge_url: badgeUrl,
      description_en: nullable(data.description_en),
      description_id: nullable(data.description_id),
      display_order: data.display_order,
    };

    const { error } =
      isEditing && certification
        ? await supabase.from("certifications").update(payload as CertificationUpdate).eq("id", certification.id)
        : await supabase.from("certifications").insert(payload);

    if (error) {
      toast.error(isEditing ? "Failed to update certification" : "Failed to create certification");
      return;
    }
    toast.success(isEditing ? "Certification updated" : "Certification created");
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild><motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" /></Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div initial={{ opacity: 0, scale: 0.97, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="fixed inset-4 z-50 flex flex-col overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-2xl md:inset-8 xl:bottom-8 xl:left-1/2 xl:top-8 xl:w-full xl:max-w-2xl xl:-translate-x-1/2">
                <div className="flex items-center justify-between border-b border-border px-6 py-4">
                  <Dialog.Title className="font-semibold text-text-primary">{isEditing ? "Edit Certification" : "Add Certification"}</Dialog.Title>
                  <Dialog.Close className="rounded-lg p-1.5 text-text-muted hover:text-text-primary"><X size={18} /></Dialog.Close>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  <form id="certification-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                    <div>
                      <label className={labelClasses}>Badge</label>
                      <div className="flex items-center gap-4">
                        {badgePreview && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={badgePreview} alt="" className="h-14 w-14 rounded-lg border border-border object-cover" />
                        )}
                        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-4 py-2.5 text-sm text-text-muted hover:text-text-secondary">
                          <Upload size={14} /> Upload Badge
                          <input type="file" accept="image/*" onChange={handleBadgeChange} className="hidden" />
                        </label>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field label="Title (EN)" error={errors.title_en?.message}><input {...register("title_en")} className={cn(inputClasses, errors.title_en && "border-red-400")} /></Field>
                      <Field label="Title (ID)" error={errors.title_id?.message}><input {...register("title_id")} className={cn(inputClasses, errors.title_id && "border-red-400")} /></Field>
                      <Field label="Issuer" error={errors.issuer?.message}><input {...register("issuer")} className={cn(inputClasses, errors.issuer && "border-red-400")} /></Field>
                      <Field label="Credential ID"><input {...register("credential_id")} className={inputClasses} /></Field>
                      <Field label="Issue Date"><input {...register("issue_date")} type="date" className={inputClasses} /></Field>
                      <Field label="Expiry Date"><input {...register("expiry_date")} type="date" className={inputClasses} /></Field>
                      <Field label="Credential URL" error={errors.credential_url?.message}><input {...register("credential_url")} className={cn(inputClasses, errors.credential_url && "border-red-400")} /></Field>
                      <Field label="Display Order"><input {...register("display_order", { valueAsNumber: true })} type="number" className={inputClasses} /></Field>
                      <Field label="Description (EN)"><textarea {...register("description_en")} rows={4} className={cn(inputClasses, "resize-none")} /></Field>
                      <Field label="Description (ID)"><textarea {...register("description_id")} rows={4} className={cn(inputClasses, "resize-none")} /></Field>
                    </div>
                  </form>
                </div>
                <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
                  <Dialog.Close className="rounded-lg border border-border px-4 py-2 text-sm text-text-secondary hover:text-text-primary">Cancel</Dialog.Close>
                  <button type="submit" form="certification-form" disabled={isSubmitting || isUploading} className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm text-accent-foreground hover:bg-accent/90 disabled:opacity-60">
                    {(isSubmitting || isUploading) && <Loader2 size={14} className="animate-spin" />}
                    {isEditing ? "Save Changes" : "Create Certification"}
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
