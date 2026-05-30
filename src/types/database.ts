export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];
type SupabaseRecord<T> = T & Record<string, unknown>;

export interface Database {
  public: {
    Tables: {
      profile: {
        Row: SupabaseRecord<Profile>;
        Insert: SupabaseRecord<
          Omit<Profile, "id" | "updated_at"> & { id?: string; updated_at?: string }
        >;
        Update: Partial<SupabaseRecord<Omit<Profile, "id">>>;
        Relationships: [];
      };
      projects: {
        Row: SupabaseRecord<Project>;
        Insert: SupabaseRecord<Omit<Project, "id" | "created_at" | "updated_at"> & { id?: string }>;
        Update: Partial<SupabaseRecord<Omit<Project, "id" | "created_at">>>;
        Relationships: [];
      };
      experience: {
        Row: SupabaseRecord<Experience>;
        Insert: SupabaseRecord<Omit<Experience, "id" | "created_at"> & { id?: string }>;
        Update: Partial<SupabaseRecord<Omit<Experience, "id" | "created_at">>>;
        Relationships: [];
      };
      certifications: {
        Row: SupabaseRecord<Certification>;
        Insert: SupabaseRecord<Omit<Certification, "id" | "created_at"> & { id?: string }>;
        Update: Partial<SupabaseRecord<Omit<Certification, "id" | "created_at">>>;
        Relationships: [];
      };
      awards: {
        Row: SupabaseRecord<Award>;
        Insert: SupabaseRecord<Omit<Award, "id" | "created_at"> & { id?: string }>;
        Update: Partial<SupabaseRecord<Omit<Award, "id" | "created_at">>>;
        Relationships: [];
      };
      tech_marquee: {
        Row: SupabaseRecord<TechMarqueeItem>;
        Insert: SupabaseRecord<Omit<TechMarqueeItem, "id"> & { id?: string }>;
        Update: Partial<SupabaseRecord<Omit<TechMarqueeItem, "id">>>;
        Relationships: [];
      };
      contact_messages: {
        Row: SupabaseRecord<ContactMessage>;
        Insert: SupabaseRecord<
          Omit<ContactMessage, "id" | "created_at" | "is_read"> & { id?: string }
        >;
        Update: Partial<SupabaseRecord<Omit<ContactMessage, "id" | "created_at">>>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export interface Profile {
  id: string;
  full_name_en: string;
  full_name_id: string;
  tagline_en: string;
  tagline_id: string;
  bio_short_en: string;
  bio_short_id: string;
  bio_long_en: string | null;
  bio_long_id: string | null;
  email: string | null;
  phone: string | null;
  location_en: string | null;
  location_id: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  twitter_url: string | null;
  cv_url: string | null;
  avatar_url: string | null;
  is_available: boolean;
  updated_at: string;
}

export interface Project {
  id: string;
  title_en: string;
  title_id: string;
  short_description_en: string;
  short_description_id: string;
  long_description_en: string;
  long_description_id: string;
  key_highlights_en: string[];
  key_highlights_id: string[];
  metrics: Record<string, string>;
  tech_stack: string[];
  thumbnail_url: string | null;
  source_code_url: string | null;
  live_preview_url: string | null;
  category: "web" | "mobile" | "backend" | "ai" | "other";
  is_featured: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Experience {
  id: string;
  company_name: string;
  role_en: string;
  role_id: string;
  description_en: string | null;
  description_id: string | null;
  start_date: string;
  end_date: string | null;
  is_current: boolean;
  company_logo_url: string | null;
  company_url: string | null;
  location_en: string | null;
  location_id: string | null;
  employment_type: "full-time" | "part-time" | "freelance" | "contract" | "internship";
  media_urls: string[];
  display_order: number;
  created_at: string;
}

export interface Certification {
  id: string;
  title_en: string;
  title_id: string;
  issuer: string;
  issue_date: string | null;
  expiry_date: string | null;
  credential_id: string | null;
  credential_url: string | null;
  badge_url: string | null;
  description_en: string | null;
  description_id: string | null;
  display_order: number;
  created_at: string;
}

export interface Award {
  id: string;
  title_en: string;
  title_id: string;
  issuer_en: string | null;
  issuer_id: string | null;
  description_en: string | null;
  description_id: string | null;
  award_date: string | null;
  award_url: string | null;
  image_url: string | null;
  display_order: number;
  created_at: string;
}

export interface TechMarqueeItem {
  id: string;
  name: string;
  logo_url: string | null;
  logo_svg_code: string | null;
  category: string | null;
  display_order: number;
  is_active: boolean;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}

// Utility types
export type Language = "en" | "id";

export interface LocalizedField {
  en: string;
  id: string;
}
