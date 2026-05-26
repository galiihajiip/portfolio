export * from "./database";

// UI-specific types
export interface NavLink {
  label_en: string;
  label_id: string;
  href: string;
}

export interface ProjectModalData {
  project: import("./database").Project;
  lang: import("./database").Language;
}
