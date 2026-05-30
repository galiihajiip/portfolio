"use client";

import { useEffect, useState, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, X, Upload, ImageIcon, Trash2, Plus, FileImage } from "lucide-react";
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
  company_logo_url: z.string().optional(),
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

const nullable = (value: string | undefined) => (value?.trim() ? value.trim() : null);

async function uploadFile(file: File, folder: string): Promise<string | null> {
  const supabase = createClient();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "-");
  const filePath = `${folder}/${file.lastModified}-${safeName}`;

  const { error } = await supabase.storage
    .from("portfolio-assets")
    .upload(filePath, file, { cacheControl: "3600", upsert: true });

  if (error) {
    console.error("Upload error:", error);
    return null;
  }

  const { data } = supabase.storage.from("portfolio-assets").getPublicUrl(filePath);
  return data.publicUrl;
}

export function ExperienceFormModal({ experience, isOpen, onClose }: ExperienceFormModalProps) {
  const isEditing = Boolean(experience);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);

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
      setLogoPreview(experience.company_logo_url ?? null);
      setMediaUrls(experience.media_urls ?? []);
      setMediaPreviews(experience.media_urls ?? []);
    } else {
      reset(emptyValues);
      setLogoPreview(null);
      setMediaUrls([]);
      setMediaPreviews([]);
    }
    setLogoFile(null);
    setMediaFiles([]);
  }, [experience, reset]);

  // Logo handlers
  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error("Image must be less than 2MB"); return; }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setValue("company_logo_url", "");
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

  // Media handlers
  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((f) => {
      if (!f.type.startsWith("image/")) { toast.error(`${f.name} is not an image`); return false; }
      if (f.size > 5 * 1024 * 1024) { toast.error(`${f.name} exceeds 5MB`); return false; }
      return true;
    });

    setMediaFiles((prev) => [...prev, ...validFiles]);
    const newPreviews = validFiles.map((f) => URL.createObjectURL(f));
    setMediaPreviews((prev) => [...prev, ...newPreviews]);

    if (mediaInputRef.current) mediaInputRef.current.value = "";
  };

  const removeMedia = (index: number) => {
    // Determine if it's an existing URL or a new file
    if (index < mediaUrls.length) {
      // Removing an existing uploaded media
      setMediaUrls((prev) => prev.filter((_, i) => i !== index));
      setMediaPreviews((prev) => prev.filter((_, i) => i !== index));
    } else {
      // Removing a newly added file
      const fileIndex = index - mediaUrls.length;
      setMediaFiles((prev) => prev.filter((_, i) => i !== fileIndex));
      setMediaPreviews((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const onSubmit = async (data: FormData) => {
    const supabase = createClient();
    setIsUploading(true);

    // Upload logo
    let logoUrl = data.company_logo_url || null;
    if (logoFile) {
      const uploaded = await uploadFile(logoFile, "company-logos");
      if (!uploaded) { toast.error("Failed to upload logo"); setIsUploading(false); return; }
      logoUrl = uploaded;
    }
    if (!logoFile && !logoPreview) logoUrl = null;

    // Upload new media files
    let finalMediaUrls = [...mediaUrls];
    if (mediaFiles.length > 0) {
      const uploadResults = await Promise.all(
        mediaFiles.map((f) => uploadFile(f, "experience-media"))
      );
      const failed = uploadResults.filter((r) => r === null).length;
      if (failed > 0) toast.error(`${failed} media file(s) failed to upload`);
      const successUrls = uploadResults.filter((r): r is string => r !== null);
      finalMediaUrls = [...finalMediaUrls, ...successUrls];
    }

    setIsUploading(false);

    const payload: ExperienceInsert = {
      company_name: data.company_name,
      role_en: data.role_en,
      role_id: data.role_id,
      description_en: nullable(data.description_en),
      description_id: nullable(data.description_id),
      start_date: data.start_date,
      end_date: data.is_current ? null : nullable(data.end_date),
      is_current: data.is_current,
      company_logo_url: logoUrl,
      company_url: nullable(data.company_url),
      location_en: nullable(data.location_en),
      location_id: nullable(data.location_id),
      employment_type: data.employment_type,
      display_order: data.display_order,
      media_urls: finalMediaUrls,
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
                    {/* Company + Logo row */}
                    <div className="flex items-start gap-4">
                      <div className="shrink-0">
                        <label className={labelClasses}>Logo</label>
                        <div className="relative group">
                          {logoPreview ? (
                            <div className="h-14 w-14 rounded-lg border border-border bg-surface-subtle flex items-center justify-center overflow-hidden cursor-pointer" onClick={() => logoInputRef.current?.click()}>
                              <img src={logoPreview} alt="Logo" className="h-full w-full object-contain p-1" />
                            </div>
                          ) : (
                            <div className="h-14 w-14 rounded-lg border border-dashed border-border bg-surface-subtle flex items-center justify-center cursor-pointer hover:border-border-strong transition-colors" onClick={() => logoInputRef.current?.click()}>
                              <ImageIcon size={18} className="text-text-muted" />
                            </div>
                          )}
                          {logoPreview && (
                            <button type="button" onClick={removeLogo} className="absolute -top-1.5 -right-1.5 rounded-full bg-red-500 p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-sm" aria-label="Remove logo">
                              <X size={10} />
                            </button>
                          )}
                        </div>
                        <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoSelect} className="hidden" />
                      </div>
                      <div className="flex-1 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Field label="Company" error={errors.company_name?.message}><input {...register("company_name")} className={cn(inputClasses, errors.company_name && "border-red-400")} /></Field>
                        <Field label="Company URL" error={errors.company_url?.message}><input {...register("company_url")} placeholder="https://..." className={cn(inputClasses, errors.company_url && "border-red-400")} /></Field>
                      </div>
                    </div>

                    {/* Role */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Field label="Role (EN)" error={errors.role_en?.message}><input {...register("role_en")} className={cn(inputClasses, errors.role_en && "border-red-400")} /></Field>
                      <Field label="Role (ID)" error={errors.role_id?.message}><input {...register("role_id")} className={cn(inputClasses, errors.role_id && "border-red-400")} /></Field>
                    </div>

                    {/* Dates + Employment */}
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <Field label="Start Date" error={errors.start_date?.message}><input {...register("start_date")} type="date" className={cn(inputClasses, errors.start_date && "border-red-400")} /></Field>
                      <Field label="End Date"><input {...register("end_date")} type="date" disabled={isCurrent} className={cn(inputClasses, isCurrent && "opacity-50")} /></Field>
                      <Field label="Type">
                        <select {...register("employment_type")} className={inputClasses}>
                          {["full-time", "part-time", "freelance", "contract", "internship"].map((type) => <option key={type} value={type}>{type}</option>)}
                        </select>
                      </Field>
                      <div className="flex items-end pb-1">
                        <label className="flex items-center gap-2 text-sm text-text-secondary">
                          <input {...register("is_current", { onChange: (event) => event.target.checked && setValue("end_date", "") })} type="checkbox" className="h-4 w-4 accent-orange-500" />
                          Current
                        </label>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Field label="Location (EN)"><input {...register("location_en")} className={inputClasses} /></Field>
                      <Field label="Location (ID)"><input {...register("location_id")} className={inputClasses} /></Field>
                    </div>

                    {/* Description */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Field label="Description (EN)"><textarea {...register("description_en")} rows={3} className={cn(inputClasses, "resize-none")} /></Field>
                      <Field label="Description (ID)"><textarea {...register("description_id")} rows={3} className={cn(inputClasses, "resize-none")} /></Field>
                    </div>

                    {/* Media Upload */}
                    <div>
                      <label className={labelClasses}>Media / Documentation</label>
                      <p className="text-xs text-text-muted mb-2">Upload certificates, screenshots, or documentation related to this role.</p>
                      <div className="flex flex-wrap gap-2">
                        {mediaPreviews.map((url, i) => (
                          <div key={i} className="relative group h-20 w-20 rounded-lg border border-border bg-surface-subtle overflow-hidden">
                            <img src={url} alt={`Media ${i + 1}`} className="h-full w-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeMedia(i)}
                              className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                              aria-label="Remove media"
                            >
                              <Trash2 size={14} className="text-white" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => mediaInputRef.current?.click()}
                          className="h-20 w-20 rounded-lg border border-dashed border-border bg-surface-subtle flex flex-col items-center justify-center gap-1 text-text-muted hover:text-text-primary hover:border-border-strong transition-colors"
                        >
                          <Plus size={16} />
                          <span className="text-[10px]">Add</span>
                        </button>
                      </div>
                      <input ref={mediaInputRef} type="file" accept="image/*" multiple onChange={handleMediaSelect} className="hidden" />
                      <p className="mt-1.5 text-xs text-text-muted">PNG, JPG, WebP. Max 5MB each.</p>
                    </div>

                    {/* Hidden display_order */}
                    <input type="hidden" {...register("display_order", { valueAsNumber: true })} />
                  </form>
                </div>
                <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
                  <Dialog.Close className="rounded-lg border border-border px-4 py-2 text-sm text-text-secondary hover:text-text-primary">Cancel</Dialog.Close>
                  <button type="submit" form="experience-form" disabled={isSubmitting || isUploading} className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm text-accent-foreground hover:bg-accent/90 disabled:opacity-60">
                    {(isSubmitting || isUploading) && <Loader2 size={14} className="animate-spin" />}
                    {isUploading ? "Uploading..." : isEditing ? "Save Changes" : "Create Experience"}
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
