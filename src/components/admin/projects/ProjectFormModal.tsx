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
import type { Database, Project } from "@/types";

const projectSchema = z.object({
  title_en: z.string().min(2, "Required"),
  title_id: z.string().min(2, "Required"),
  short_description_en: z.string().min(10, "Required"),
  short_description_id: z.string().min(10, "Required"),
  long_description_en: z.string().min(50, "Provide a detailed description"),
  long_description_id: z.string().min(50, "Provide a detailed description"),
  key_highlights_en: z.string(),
  key_highlights_id: z.string(),
  tech_stack: z.string(),
  source_code_url: z.string().url().optional().or(z.literal("")),
  live_preview_url: z.string().url().optional().or(z.literal("")),
  category: z.enum(["web", "mobile", "backend", "ai", "other"]),
  is_featured: z.boolean(),
  display_order: z.number(),
});

type ProjectFormData = z.infer<typeof projectSchema>;
type ProjectInsert = Database["public"]["Tables"]["projects"]["Insert"];
type ProjectUpdate = Database["public"]["Tables"]["projects"]["Update"];

const inputClasses =
  "w-full px-3 py-2.5 bg-surface-subtle border border-border rounded-lg text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-border-strong transition-all duration-200";
const labelClasses = "block text-xs font-medium text-text-secondary mb-1.5";
const errorClasses = "text-xs text-red-500 mt-1";
const emptyFormValues: ProjectFormData = {
  title_en: "",
  title_id: "",
  short_description_en: "",
  short_description_id: "",
  long_description_en: "",
  long_description_id: "",
  key_highlights_en: "",
  key_highlights_id: "",
  tech_stack: "",
  source_code_url: "",
  live_preview_url: "",
  category: "web",
  is_featured: false,
  display_order: 0,
};

interface ProjectFormModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

function linesToArray(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function commaListToArray(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function ProjectFormModal({ project, isOpen, onClose }: ProjectFormModalProps) {
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const isEditing = Boolean(project);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: emptyFormValues,
  });

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    if (project) {
      reset({
        title_en: project.title_en,
        title_id: project.title_id,
        short_description_en: project.short_description_en,
        short_description_id: project.short_description_id,
        long_description_en: project.long_description_en,
        long_description_id: project.long_description_id,
        key_highlights_en: project.key_highlights_en.join("\n"),
        key_highlights_id: project.key_highlights_id.join("\n"),
        tech_stack: project.tech_stack.join(", "),
        source_code_url: project.source_code_url || "",
        live_preview_url: project.live_preview_url || "",
        category: project.category,
        is_featured: project.is_featured,
        display_order: project.display_order,
      });
      timeoutId = setTimeout(() => {
        setThumbnailPreview(project.thumbnail_url);
        setThumbnailFile(null);
      }, 0);
    } else {
      reset(emptyFormValues);
      timeoutId = setTimeout(() => {
        setThumbnailPreview(null);
        setThumbnailFile(null);
      }, 0);
    }

    return () => clearTimeout(timeoutId);
  }, [project, reset]);

  useEffect(() => {
    return () => {
      if (thumbnailPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(thumbnailPreview);
      }
    };
  }, [thumbnailPreview]);

  const handleThumbnailChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const uploadThumbnail = async (file: File): Promise<string | null> => {
    const supabase = createClient();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "-");
    const path = `projects/${file.lastModified}-${safeName}`;
    const { error } = await supabase.storage.from("portfolio-assets").upload(path, file, {
      upsert: true,
    });

    if (error) {
      toast.error("Thumbnail upload failed");
      return null;
    }

    const { data } = supabase.storage.from("portfolio-assets").getPublicUrl(path);
    return data.publicUrl;
  };

  const onSubmit = async (data: ProjectFormData) => {
    const supabase = createClient();
    setIsUploading(true);

    let thumbnailUrl = project?.thumbnail_url ?? null;

    if (thumbnailFile) {
      thumbnailUrl = await uploadThumbnail(thumbnailFile);
      if (!thumbnailUrl) {
        setIsUploading(false);
        return;
      }
    }

    setIsUploading(false);

    const payload: ProjectInsert = {
      title_en: data.title_en,
      title_id: data.title_id,
      short_description_en: data.short_description_en,
      short_description_id: data.short_description_id,
      long_description_en: data.long_description_en,
      long_description_id: data.long_description_id,
      key_highlights_en: linesToArray(data.key_highlights_en),
      key_highlights_id: linesToArray(data.key_highlights_id),
      metrics: {},
      tech_stack: commaListToArray(data.tech_stack),
      source_code_url: data.source_code_url || null,
      live_preview_url: data.live_preview_url || null,
      category: data.category,
      is_featured: data.is_featured,
      display_order: data.display_order,
      thumbnail_url: thumbnailUrl,
    };

    if (isEditing && project) {
      const { error } = await supabase.from("projects").update(payload as ProjectUpdate).eq("id", project.id);

      if (error) {
        toast.error("Failed to update project");
        return;
      }

      toast.success("Project updated!");
    } else {
      const { error } = await supabase.from("projects").insert(payload);

      if (error) {
        toast.error("Failed to create project");
        return;
      }

      toast.success("Project created!");
    }

    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, scale: 0.97, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="fixed inset-4 z-50 flex flex-col overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-2xl md:inset-8 xl:bottom-8 xl:left-1/2 xl:top-8 xl:w-full xl:max-w-2xl xl:-translate-x-1/2"
              >
                <div className="flex flex-shrink-0 items-center justify-between border-b border-border px-6 py-4">
                  <Dialog.Title className="font-semibold text-text-primary">
                    {isEditing ? "Edit Project" : "Add Project"}
                  </Dialog.Title>
                  <Dialog.Close className="rounded-lg p-1.5 text-text-muted transition-colors hover:text-text-primary">
                    <X size={18} />
                  </Dialog.Close>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  <form id="project-form" onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
                    <div>
                      <label className={labelClasses}>Thumbnail</label>
                      <div className="flex items-center gap-4">
                        {thumbnailPreview && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={thumbnailPreview}
                            alt="Preview"
                            className="h-14 w-20 flex-shrink-0 rounded-lg border border-border object-cover"
                          />
                        )}
                        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-4 py-2.5 text-sm text-text-muted transition-all hover:border-border-strong hover:text-text-secondary">
                          <Upload size={14} />
                          {thumbnailPreview ? "Change Image" : "Upload Thumbnail"}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleThumbnailChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelClasses}>Title (EN) *</label>
                        <input
                          {...register("title_en")}
                          placeholder="Project Title"
                          className={cn(inputClasses, errors.title_en && "border-red-400")}
                        />
                        {errors.title_en && <p className={errorClasses}>{errors.title_en.message}</p>}
                      </div>
                      <div>
                        <label className={labelClasses}>Title (ID) *</label>
                        <input
                          {...register("title_id")}
                          placeholder="Judul Proyek"
                          className={cn(inputClasses, errors.title_id && "border-red-400")}
                        />
                        {errors.title_id && <p className={errorClasses}>{errors.title_id.message}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelClasses}>Short Description (EN) *</label>
                        <textarea
                          {...register("short_description_en")}
                          rows={2}
                          className={cn(
                            inputClasses,
                            "resize-none",
                            errors.short_description_en && "border-red-400",
                          )}
                        />
                        {errors.short_description_en && (
                          <p className={errorClasses}>{errors.short_description_en.message}</p>
                        )}
                      </div>
                      <div>
                        <label className={labelClasses}>Short Description (ID) *</label>
                        <textarea
                          {...register("short_description_id")}
                          rows={2}
                          className={cn(
                            inputClasses,
                            "resize-none",
                            errors.short_description_id && "border-red-400",
                          )}
                        />
                        {errors.short_description_id && (
                          <p className={errorClasses}>{errors.short_description_id.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelClasses}>
                          Architecture / Long Description (EN) *
                        </label>
                        <textarea
                          {...register("long_description_en")}
                          rows={5}
                          placeholder="Describe the system architecture, technical decisions..."
                          className={cn(
                            inputClasses,
                            "resize-none",
                            errors.long_description_en && "border-red-400",
                          )}
                        />
                        {errors.long_description_en && (
                          <p className={errorClasses}>{errors.long_description_en.message}</p>
                        )}
                      </div>
                      <div>
                        <label className={labelClasses}>
                          Architecture / Long Description (ID) *
                        </label>
                        <textarea
                          {...register("long_description_id")}
                          rows={5}
                          placeholder="Deskripsikan arsitektur sistem..."
                          className={cn(
                            inputClasses,
                            "resize-none",
                            errors.long_description_id && "border-red-400",
                          )}
                        />
                        {errors.long_description_id && (
                          <p className={errorClasses}>{errors.long_description_id.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelClasses}>Key Highlights (EN) - one per line</label>
                        <textarea
                          {...register("key_highlights_en")}
                          rows={4}
                          placeholder={"Reduced load time by 60%\nImplemented real-time sync"}
                          className={cn(inputClasses, "resize-none")}
                        />
                      </div>
                      <div>
                        <label className={labelClasses}>Key Highlights (ID) - satu per baris</label>
                        <textarea
                          {...register("key_highlights_id")}
                          rows={4}
                          placeholder={"Mengurangi waktu muat 60%\nMengimplementasikan real-time sync"}
                          className={cn(inputClasses, "resize-none")}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelClasses}>
                        Tech Stack (comma-separated - for marquee only, not shown on cards)
                      </label>
                      <input
                        {...register("tech_stack")}
                        placeholder="Next.js, TypeScript, Supabase, Tailwind CSS"
                        className={inputClasses}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className={labelClasses}>Source Code URL (optional)</label>
                        <input
                          {...register("source_code_url")}
                          type="url"
                          placeholder="https://github.com/..."
                          className={cn(inputClasses, errors.source_code_url && "border-red-400")}
                        />
                        {errors.source_code_url && (
                          <p className={errorClasses}>{errors.source_code_url.message}</p>
                        )}
                        <p className="mt-1 text-xs text-text-muted">Leave empty to hide button</p>
                      </div>
                      <div>
                        <label className={labelClasses}>Live Preview URL (optional)</label>
                        <input
                          {...register("live_preview_url")}
                          type="url"
                          placeholder="https://myapp.vercel.app"
                          className={cn(inputClasses, errors.live_preview_url && "border-red-400")}
                        />
                        {errors.live_preview_url && (
                          <p className={errorClasses}>{errors.live_preview_url.message}</p>
                        )}
                        <p className="mt-1 text-xs text-text-muted">Leave empty to hide button</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                      <div>
                        <label className={labelClasses}>Category *</label>
                        <select {...register("category")} className={inputClasses}>
                          {["web", "mobile", "backend", "ai", "other"].map((category) => (
                            <option key={category} value={category} className="capitalize">
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={labelClasses}>Display Order</label>
                        <input
                          {...register("display_order", { valueAsNumber: true })}
                          type="number"
                          className={inputClasses}
                        />
                      </div>
                      <div className="flex items-end pb-2.5">
                        <label className="flex cursor-pointer items-center gap-2">
                          <input
                            {...register("is_featured")}
                            type="checkbox"
                            className="h-4 w-4 rounded accent-orange-500"
                          />
                          <span className="text-sm text-text-secondary">Featured</span>
                        </label>
                      </div>
                    </div>
                  </form>
                </div>

                <div className="flex flex-shrink-0 items-center justify-end gap-3 border-t border-border px-6 py-4">
                  <Dialog.Close className="rounded-lg border border-border px-4 py-2 text-sm text-text-secondary transition-colors hover:text-text-primary">
                    Cancel
                  </Dialog.Close>
                  <button
                    type="submit"
                    form="project-form"
                    disabled={isSubmitting || isUploading}
                    className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm text-accent-foreground transition-colors hover:bg-accent/90 disabled:opacity-60"
                  >
                    {(isSubmitting || isUploading) && <Loader2 size={14} className="animate-spin" />}
                    {isEditing ? "Save Changes" : "Create Project"}
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
