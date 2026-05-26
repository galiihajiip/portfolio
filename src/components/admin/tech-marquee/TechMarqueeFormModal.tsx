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
import type { Database, TechMarqueeItem } from "@/types";

const schema = z.object({
  name: z.string().min(1, "Required"),
  logo_url: z.string().url("Invalid URL").or(z.literal("")),
  logo_svg_code: z.string(),
  category: z.string(),
  display_order: z.number(),
  is_active: z.boolean(),
});

type FormData = z.infer<typeof schema>;
type TechInsert = Database["public"]["Tables"]["tech_marquee"]["Insert"];
type TechUpdate = Database["public"]["Tables"]["tech_marquee"]["Update"];

const inputClasses =
  "w-full px-3 py-2.5 bg-surface-subtle border border-border rounded-lg text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-border-strong transition-all duration-200";
const labelClasses = "block text-xs font-medium text-text-secondary mb-1.5";
const errorClasses = "text-xs text-red-500 mt-1";
const emptyValues: FormData = {
  name: "",
  logo_url: "",
  logo_svg_code: "",
  category: "",
  display_order: 0,
  is_active: true,
};

interface TechMarqueeFormModalProps {
  item: TechMarqueeItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const nullable = (value: string) => value.trim() || null;

async function uploadLogo(file: File) {
  const supabase = createClient();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "-");
  const path = `tech-logos/${file.lastModified}-${safeName}`;
  const { error } = await supabase.storage.from("portfolio-assets").upload(path, file, {
    upsert: true,
  });
  if (error) return null;
  const { data } = supabase.storage.from("portfolio-assets").getPublicUrl(path);
  return data.publicUrl;
}

export function TechMarqueeFormModal({ item, isOpen, onClose }: TechMarqueeFormModalProps) {
  const isEditing = Boolean(item);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    if (item) {
      reset({
        name: item.name,
        logo_url: item.logo_url ?? "",
        logo_svg_code: item.logo_svg_code ?? "",
        category: item.category ?? "",
        display_order: item.display_order,
        is_active: item.is_active,
      });
      timeoutId = setTimeout(() => {
        setLogoPreview(item.logo_url);
        setLogoFile(null);
      }, 0);
    } else {
      reset(emptyValues);
      timeoutId = setTimeout(() => {
        setLogoPreview(null);
        setLogoFile(null);
      }, 0);
    }
    return () => clearTimeout(timeoutId);
  }, [item, reset]);

  const handleLogoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setLogoFile(file);
    setLogoPreview(previewUrl);
    setValue("logo_url", "");
  };

  const onSubmit = async (data: FormData) => {
    const supabase = createClient();
    setIsUploading(true);
    let logoUrl = data.logo_url || item?.logo_url || null;
    if (logoFile) {
      logoUrl = await uploadLogo(logoFile);
      if (!logoUrl) {
        setIsUploading(false);
        toast.error("Logo upload failed");
        return;
      }
    }
    setIsUploading(false);

    const payload: TechInsert = {
      name: data.name,
      logo_url: logoUrl,
      logo_svg_code: nullable(data.logo_svg_code),
      category: nullable(data.category),
      display_order: data.display_order,
      is_active: data.is_active,
    };

    const { error } =
      isEditing && item
        ? await supabase.from("tech_marquee").update(payload as TechUpdate).eq("id", item.id)
        : await supabase.from("tech_marquee").insert(payload);

    if (error) {
      toast.error(isEditing ? "Failed to update tech item" : "Failed to create tech item");
      return;
    }

    toast.success(isEditing ? "Tech item updated" : "Tech item created");
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
                  <Dialog.Title className="font-semibold text-text-primary">{isEditing ? "Edit Tech Item" : "Add Tech Item"}</Dialog.Title>
                  <Dialog.Close className="rounded-lg p-1.5 text-text-muted hover:text-text-primary"><X size={18} /></Dialog.Close>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  <form id="tech-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                    <div>
                      <label className={labelClasses}>Logo</label>
                      <div className="flex items-center gap-4">
                        {logoPreview && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={logoPreview} alt="" className="h-12 w-12 rounded-lg border border-border object-contain p-2" />
                        )}
                        <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-4 py-2.5 text-sm text-text-muted hover:text-text-secondary">
                          <Upload size={14} /> Upload Logo
                          <input type="file" accept="image/*,.svg" onChange={handleLogoChange} className="hidden" />
                        </label>
                      </div>
                    </div>
                    <Field label="Name" error={errors.name?.message}><input {...register("name")} className={cn(inputClasses, errors.name && "border-red-400")} /></Field>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <Field label="Logo URL" error={errors.logo_url?.message}><input {...register("logo_url")} className={cn(inputClasses, errors.logo_url && "border-red-400")} /></Field>
                      <Field label="Category"><input {...register("category")} className={inputClasses} /></Field>
                      <Field label="Display Order"><input {...register("display_order", { valueAsNumber: true })} type="number" className={inputClasses} /></Field>
                      <div className="flex items-end pb-2.5">
                        <label className="flex items-center gap-2 text-sm text-text-secondary"><input {...register("is_active")} type="checkbox" className="h-4 w-4 accent-orange-500" /> Active</label>
                      </div>
                    </div>
                    <Field label="SVG Code"><textarea {...register("logo_svg_code")} rows={6} className={cn(inputClasses, "resize-none font-mono text-xs")} /></Field>
                  </form>
                </div>
                <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
                  <Dialog.Close className="rounded-lg border border-border px-4 py-2 text-sm text-text-secondary hover:text-text-primary">Cancel</Dialog.Close>
                  <button type="submit" form="tech-form" disabled={isSubmitting || isUploading} className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm text-accent-foreground hover:bg-accent/90 disabled:opacity-60">
                    {(isSubmitting || isUploading) && <Loader2 size={14} className="animate-spin" />}
                    {isEditing ? "Save Changes" : "Create Tech Item"}
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
