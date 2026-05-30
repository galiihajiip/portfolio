"use client";

import { motion } from "framer-motion";
import { CalendarDays, ExternalLink, MapPin, FileImage } from "lucide-react";
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
            {/* Timeline line */}
            <div className="absolute bottom-0 left-6 top-0 w-px bg-gradient-to-b from-accent/60 via-border to-transparent md:left-8" />

            <div className="space-y-6">
              {experiences.map((item, index) => {
                const role = lang === "id" ? item.role_id : item.role_en;
                const description = lang === "id" ? item.description_id : item.description_en;
                const location = lang === "id" ? item.location_id : item.location_en;
                const startDate = formatMonthYear(item.start_date, locale);
                const endDate = item.is_current
                  ? lang === "id"
                    ? "Sekarang"
                    : "Present"
                  : formatMonthYear(item.end_date, locale);
                const period = [startDate, endDate].filter(Boolean).join(" — ");

                return (
                  <motion.article
                    key={item.id}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ duration: 0.45, delay: index * 0.06, ease: smoothEase }}
                    className="relative pl-16 md:pl-20"
                  >
                    {/* Timeline dot / logo */}
                    <div className="absolute left-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-surface shadow-sm md:left-5 md:h-7 md:w-7">
                      {item.company_logo_url ? (
                        <img
                          src={item.company_logo_url}
                          alt={item.company_name}
                          className="h-5 w-5 rounded-full object-contain"
                        />
                      ) : (
                        <div className="h-2.5 w-2.5 rounded-full bg-accent" />
                      )}
                    </div>

                    <div className="rounded-2xl border border-border bg-surface-elevated p-5 transition-all duration-300 hover:border-border-strong hover:shadow-card-hover">
                      {/* Header row: role + badge */}
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-display text-lg text-text-primary leading-tight">
                            {role}
                          </h3>
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-text-secondary">
                            {item.company_url ? (
                              <a
                                href={item.company_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 font-medium text-text-primary transition-colors hover:text-accent"
                              >
                                {item.company_name}
                                <ExternalLink size={12} />
                              </a>
                            ) : (
                              <span className="font-medium text-text-primary">
                                {item.company_name}
                              </span>
                            )}
                            <span className="text-text-muted">·</span>
                            <span className="text-text-muted">
                              {employmentTypeLabels[item.employment_type][lang]}
                            </span>
                          </div>
                        </div>

                        {item.is_current && (
                          <span className="shrink-0 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-600 dark:text-green-400">
                            {lang === "id" ? "Aktif" : "Active"}
                          </span>
                        )}
                      </div>

                      {/* Meta row */}
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
                        {period && (
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays size={12} />
                            {period}
                          </span>
                        )}
                        {location && (
                          <span className="inline-flex items-center gap-1">
                            <MapPin size={12} />
                            {location}
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      {description && (
                        <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                          {description}
                        </p>
                      )}

                      {/* Media gallery */}
                      {item.media_urls && item.media_urls.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {item.media_urls.map((url, i) => (
                            <a
                              key={i}
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="group relative h-16 w-16 overflow-hidden rounded-lg border border-border bg-surface-subtle transition-all hover:border-accent hover:shadow-sm"
                            >
                              <img
                                src={url}
                                alt={`${item.company_name} media ${i + 1}`}
                                className="h-full w-full object-cover"
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all group-hover:bg-black/30">
                                <FileImage size={14} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </a>
                          ))}
                        </div>
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
