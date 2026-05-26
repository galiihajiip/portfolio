"use client";

import type { ChangeEvent } from "react";
import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Database, Profile } from "@/types";

const profileSchema = z.object({
  full_name_en: z.string().min(2, "Required"),
  full_name_id: z.string().min(2, "Required"),
  tagline_en: z.string().min(2, "Required"),
  tagline_id: z.string().min(2, "Required"),
  bio_short_en: z.string().min(10, "Required"),
  bio_short_id: z.string().min(10, "Required"),
  bio_long_en: z.string(),
  bio_long_id: z.string(),
  email: z.string().email("Invalid email").or(z.literal("")),
  phone: z.string(),
  location_en: z.string(),
  location_id: z.string(),
  linkedin_url: z.string().url("Invalid URL").or(z.literal("")),
  github_url: z.string().url("Invalid URL").or(z.literal("")),
  twitter_url: z.string().url("Invalid URL").or(z.literal("")),
  is_available: z.boolean(),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type ProfileInsert = Database["public"]["Tables"]["profile"]["Insert"];

const inputClasses =
  "w-full px-3 py-2.5 bg-surface-subtle border border-border rounded-lg text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-border-strong transition-all duration-200";
const labelClasses = "block text-xs font-medium text-text-secondary mb-1.5";
const errorClasses = "text-xs text-red-500 mt-1";

interface ProfileFormProps {
  initialProfile: Profile | null;
}

function emptyToNull(value: string) {
  return value.trim() || null;
}

async function uploadAsset(file: File, folder: "avatars" | "cv") {
  const supabase = createClient();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "-");
  const path = `${folder}/${file.lastModified}-${safeName}`;
  const { error } = await supabase.storage.from("portfolio-assets").upload(path, file, {
    upsert: true,
  });

  if (error) {
    return null;
  }

  const { data } = supabase.storage.from("portfolio-assets").getPublicUrl(path);
  return data.publicUrl;
}

export function ProfileForm({ initialProfile }: ProfileFormProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialProfile?.avatar_url ?? null);
  const [cvUrl, setCvUrl] = useState<string | null>(initialProfile?.cv_url ?? null);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name_en: initialProfile?.full_name_en ?? "",
      full_name_id: initialProfile?.full_name_id ?? "",
      tagline_en: initialProfile?.tagline_en ?? "",
      tagline_id: initialProfile?.tagline_id ?? "",
      bio_short_en: initialProfile?.bio_short_en ?? "",
      bio_short_id: initialProfile?.bio_short_id ?? "",
      bio_long_en: initialProfile?.bio_long_en ?? "",
      bio_long_id: initialProfile?.bio_long_id ?? "",
      email: initialProfile?.email ?? "",
      phone: initialProfile?.phone ?? "",
      location_en: initialProfile?.location_en ?? "",
      location_id: initialProfile?.location_id ?? "",
      linkedin_url: initialProfile?.linkedin_url ?? "",
      github_url: initialProfile?.github_url ?? "",
      twitter_url: initialProfile?.twitter_url ?? "",
      is_available: initialProfile?.is_available ?? false,
    },
  });

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleCvChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setCvFile(file);
    setCvUrl(file.name);
  };

  const onSubmit = async (data: ProfileFormData) => {
    const supabase = createClient();
    setIsUploading(true);

    let nextAvatarUrl = initialProfile?.avatar_url ?? null;
    let nextCvUrl = initialProfile?.cv_url ?? null;

    if (avatarFile) {
      nextAvatarUrl = await uploadAsset(avatarFile, "avatars");
      if (!nextAvatarUrl) {
        setIsUploading(false);
        toast.error("Avatar upload failed");
        return;
      }
    }

    if (cvFile) {
      nextCvUrl = await uploadAsset(cvFile, "cv");
      if (!nextCvUrl) {
        setIsUploading(false);
        toast.error("CV upload failed");
        return;
      }
    }

    setIsUploading(false);

    const payload: ProfileInsert = {
      ...(initialProfile?.id ? { id: initialProfile.id } : {}),
      full_name_en: data.full_name_en,
      full_name_id: data.full_name_id,
      tagline_en: data.tagline_en,
      tagline_id: data.tagline_id,
      bio_short_en: data.bio_short_en,
      bio_short_id: data.bio_short_id,
      bio_long_en: emptyToNull(data.bio_long_en),
      bio_long_id: emptyToNull(data.bio_long_id),
      email: emptyToNull(data.email),
      phone: emptyToNull(data.phone),
      location_en: emptyToNull(data.location_en),
      location_id: emptyToNull(data.location_id),
      linkedin_url: emptyToNull(data.linkedin_url),
      github_url: emptyToNull(data.github_url),
      twitter_url: emptyToNull(data.twitter_url),
      avatar_url: nextAvatarUrl,
      cv_url: nextCvUrl,
      is_available: data.is_available,
    };

    const { error } = await supabase.from("profile").upsert(payload);

    if (error) {
      toast.error("Failed to save profile");
      return;
    }

    toast.success("Profile saved");
    startTransition(() => router.refresh());
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl text-text-primary">Profile</h1>
        <p className="mt-1 text-sm text-text-muted">Manage the single public profile record.</p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="space-y-6 rounded-xl border border-border bg-surface-elevated p-5"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClasses}>Avatar</label>
            <div className="flex items-center gap-4">
              {avatarPreview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarPreview} alt="" className="h-16 w-16 rounded-full object-cover" />
              )}
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-4 py-2.5 text-sm text-text-muted hover:text-text-secondary">
                <Upload size={14} />
                Upload Avatar
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
            </div>
          </div>

          <div>
            <label className={labelClasses}>CV</label>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-border px-4 py-2.5 text-sm text-text-muted hover:text-text-secondary">
              <Upload size={14} />
              {cvUrl ? "Change CV" : "Upload CV"}
              <input type="file" accept=".pdf,.doc,.docx" onChange={handleCvChange} className="hidden" />
            </label>
            {cvUrl && <p className="mt-2 text-xs text-text-muted truncate">{cvUrl}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Full Name (EN)" error={errors.full_name_en?.message}>
            <input {...register("full_name_en")} className={cn(inputClasses, errors.full_name_en && "border-red-400")} />
          </Field>
          <Field label="Full Name (ID)" error={errors.full_name_id?.message}>
            <input {...register("full_name_id")} className={cn(inputClasses, errors.full_name_id && "border-red-400")} />
          </Field>
          <Field label="Tagline (EN)" error={errors.tagline_en?.message}>
            <input {...register("tagline_en")} className={cn(inputClasses, errors.tagline_en && "border-red-400")} />
          </Field>
          <Field label="Tagline (ID)" error={errors.tagline_id?.message}>
            <input {...register("tagline_id")} className={cn(inputClasses, errors.tagline_id && "border-red-400")} />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Short Bio (EN)" error={errors.bio_short_en?.message}>
            <textarea {...register("bio_short_en")} rows={3} className={cn(inputClasses, "resize-none", errors.bio_short_en && "border-red-400")} />
          </Field>
          <Field label="Short Bio (ID)" error={errors.bio_short_id?.message}>
            <textarea {...register("bio_short_id")} rows={3} className={cn(inputClasses, "resize-none", errors.bio_short_id && "border-red-400")} />
          </Field>
          <Field label="Long Bio (EN)">
            <textarea {...register("bio_long_en")} rows={5} className={cn(inputClasses, "resize-none")} />
          </Field>
          <Field label="Long Bio (ID)">
            <textarea {...register("bio_long_id")} rows={5} className={cn(inputClasses, "resize-none")} />
          </Field>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Email" error={errors.email?.message}>
            <input {...register("email")} type="email" className={cn(inputClasses, errors.email && "border-red-400")} />
          </Field>
          <Field label="Phone">
            <input {...register("phone")} className={inputClasses} />
          </Field>
          <Field label="Location (EN)">
            <input {...register("location_en")} className={inputClasses} />
          </Field>
          <Field label="Location (ID)">
            <input {...register("location_id")} className={inputClasses} />
          </Field>
          <Field label="LinkedIn URL" error={errors.linkedin_url?.message}>
            <input {...register("linkedin_url")} className={cn(inputClasses, errors.linkedin_url && "border-red-400")} />
          </Field>
          <Field label="GitHub URL" error={errors.github_url?.message}>
            <input {...register("github_url")} className={cn(inputClasses, errors.github_url && "border-red-400")} />
          </Field>
          <Field label="Twitter URL" error={errors.twitter_url?.message}>
            <input {...register("twitter_url")} className={cn(inputClasses, errors.twitter_url && "border-red-400")} />
          </Field>
          <div className="flex items-end pb-2.5">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-text-secondary">
              <input {...register("is_available")} type="checkbox" className="h-4 w-4 accent-orange-500" />
              Available for work
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground hover:bg-accent/90 disabled:opacity-60"
          >
            {(isSubmitting || isUploading) && <Loader2 size={14} className="animate-spin" />}
            Save Profile
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={labelClasses}>{label}</label>
      {children}
      {error && <p className={errorClasses}>{error}</p>}
    </div>
  );
}
