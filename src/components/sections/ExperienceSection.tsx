"use client";

import { motion } from "framer-motion";
import { BriefcaseBusiness, CalendarDays, ExternalLink, MapPin } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";
import type { Experience } from "@/types";

interface ExperienceSectionProps {
  experiences: Experience[];
}

const smoothEase = [0.22, 1, 0.36, 1] as const;

const employmentTypeLabels: Record<Experience["employment_type"], { en: string; id: string }> = {
  "full-time": { en: "Full-time", id: "Penuh waktu" },
  "part-time": { en: "Part-time", id: "Paruh waktu" },
  freelance: { en: "Freelance", id: "Freelance" },
  contract: { en: "Contract", id: "Kontrak" },
  internship: { en: "Internship", id: "Magang" },
};

function formatYear(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.getFullYear().toString();
}

function formatMonthYear(value: string | null, locale: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(locale, {
    month: "short",
    year: "numeric",
  }).format(date);
}

export function ExperienceSection({ experiences }: ExperienceSectionProps) {
  const { lang } = useLanguage();
  const locale = lang === "id" ? "id-ID" : "en-US";

  return (
    <section id="experience" className="py-24">
      <SectionHeader
        label="Career"
        title="Work Experience"
        description={
          lang === "id"
            ? "Perjalanan profesional yang tersusun dari pengalaman nyata, kontribusi produk, dan pembelajaran di tiap peran."
            : "A timeline of practical roles, product work, and the lessons behind each professional step."
        }
      />

      <div className="mt-12">
        {experiences.length > 0 ? (
          <div className="relative">
            <div className="absolute bottom-8 left-4 top-8 w-px bg-gradient-to-b from-accent via-border-strong to-transparent md:left-1/2" />

            <div className="space-y-10">
              {experiences.map((item, index) => {
                const role = lang === "id" ? item.role_id : item.role_en;
                const description = lang === "id" ? item.description_id : item.description_en;
                const location = lang === "id" ? item.location_id : item.location_en;
                const startYear = formatYear(item.start_date);
                const endYear = item.is_current ? "Present" : formatYear(item.end_date);
                const startDate = formatMonthYear(item.start_date, locale);
                const endDate = item.is_current
                  ? lang === "id"
                    ? "Sekarang"
                    : "Present"
                  : formatMonthYear(item.end_date, locale);
                const period = [startDate, endDate].filter(Boolean).join(" - ");
                const yearRange = [startYear, endYear].filter(Boolean).join(" - ");

                return (
                  <motion.article
                    key={item.id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.5, delay: index * 0.08, ease: smoothEase }}
                    className={cn(
                      "relative grid gap-5 pl-12 md:grid-cols-[1fr_auto_1fr] md:gap-8 md:pl-0",
                      index % 2 === 1 && "md:[&>div:first-child]:order-3",
                    )}
                  >
                    <div
                      className={cn(
                        "hidden md:flex",
                        index % 2 === 0 ? "justify-end text-right" : "justify-start text-left",
                      )}
                    >
                      <div>
                        <p className="font-display text-3xl text-accent">{yearRange}</p>
                        <p className="mt-2 text-sm uppercase tracking-[0.2em] text-text-muted">
                          {item.is_current
                            ? lang === "id"
                              ? "Saat ini"
                              : "Current"
                            : lang === "id"
                              ? "Selesai"
                              : "Completed"}
                        </p>
                      </div>
                    </div>

                    <div className="absolute left-0 top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-accent/40 bg-surface text-accent shadow-glass md:static">
                      <BriefcaseBusiness size={17} />
                    </div>

                    <div className="rounded-3xl border border-border bg-surface-elevated p-6 shadow-glass transition-all duration-300 hover:-translate-y-1 hover:border-border-strong hover:shadow-card-hover">
                      <div className="mb-5 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-accent-subtle px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                          {employmentTypeLabels[item.employment_type][lang]}
                        </span>
                        <span
                          className={cn(
                            "rounded-full px-3 py-1 text-xs font-semibold",
                            item.is_current
                              ? "bg-green-500/10 text-green-600 dark:text-green-400"
                              : "bg-surface-subtle text-text-muted",
                          )}
                        >
                          {item.is_current
                            ? lang === "id"
                              ? "Aktif"
                              : "Active"
                            : lang === "id"
                              ? "Selesai"
                              : "Completed"}
                        </span>
                      </div>

                      <div className="mb-5 md:hidden">
                        <p className="font-display text-2xl text-accent">{yearRange}</p>
                      </div>

                      <h3 className="font-display text-2xl text-text-primary">{role}</h3>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-text-secondary">
                        {item.company_url ? (
                          <a
                            href={item.company_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 font-medium text-text-primary transition-colors hover:text-accent"
                          >
                            {item.company_name}
                            <ExternalLink size={13} />
                          </a>
                        ) : (
                          <span className="font-medium text-text-primary">{item.company_name}</span>
                        )}
                        {period && (
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays size={14} />
                            {period}
                          </span>
                        )}
                        {location && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin size={14} />
                            {location}
                          </span>
                        )}
                      </div>

                      {description && (
                        <p className="mt-5 leading-relaxed text-text-secondary">{description}</p>
                      )}
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-border p-8 text-text-secondary">
            Experience entries will appear here after the CMS is populated.
          </div>
        )}
      </div>
    </section>
  );
}
