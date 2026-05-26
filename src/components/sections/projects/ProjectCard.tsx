"use client";

import { motion } from "framer-motion";
import { ExternalLink, Code, ArrowUpRight, Star } from "lucide-react";
import type { Project, Language } from "@/types";

interface ProjectCardTranslations {
  projects?: {
    featured?: string;
    viewDetails?: string;
    sourceCode?: string;
    livePreview?: string;
  };
}

interface ProjectCardProps {
  project: Project;
  lang: Language;
  t: ProjectCardTranslations;
  onViewDetails: (project: Project) => void;
  index: number;
}

export function ProjectCard({ project, lang, t, onViewDetails, index }: ProjectCardProps) {
  const title = lang === "en" ? project.title_en : project.title_id;
  const description =
    lang === "en" ? project.short_description_en : project.short_description_id;

  const hasSourceCode = Boolean(project.source_code_url?.trim());
  const hasLivePreview = Boolean(project.live_preview_url?.trim());

  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group relative flex flex-col bg-surface-elevated border border-border rounded-2xl overflow-hidden hover:border-border-strong hover:shadow-card-hover transition-all duration-300"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-subtle">
        {project.thumbnail_url ? (
          // Project thumbnails can come from Supabase Storage or external URLs.
          <motion.img
            src={project.thumbnail_url}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-display text-4xl text-text-muted opacity-30">
              {title.charAt(0)}
            </span>
          </div>
        )}

        {project.is_featured && (
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 bg-accent text-accent-foreground text-xs font-medium rounded-full">
            <Star size={10} fill="currentColor" />
            {t.projects?.featured || "Featured"}
          </div>
        )}

        <div className="absolute top-3 right-3 px-2.5 py-1 glass text-xs font-medium text-text-secondary rounded-full capitalize">
          {project.category}
        </div>
      </div>

      <div className="flex flex-col flex-1 p-5 gap-4">
        <div className="flex-1">
          <h3 className="font-display text-lg text-text-primary mb-2 leading-snug">
            {title}
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed line-clamp-3">
            {description}
          </p>
        </div>

        {Object.keys(project.metrics || {}).length > 0 && (
          <div className="flex flex-wrap gap-3 py-3 border-t border-border">
            {Object.entries(project.metrics)
              .slice(0, 3)
              .map(([key, value]) => (
                <div key={key} className="text-center">
                  <div className="text-sm font-semibold text-text-primary font-mono">
                    {value}
                  </div>
                  <div className="text-xs text-text-muted capitalize">{key}</div>
                </div>
              ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-auto pt-3 border-t border-border">
          <button
            onClick={() => onViewDetails(project)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors duration-200 group/btn"
          >
            {t.projects?.viewDetails || "View Details"}
            <ArrowUpRight
              size={12}
              className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform duration-150"
            />
          </button>

          {hasSourceCode && (
            <a
              href={project.source_code_url!}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-border rounded-lg text-text-secondary hover:text-text-primary hover:border-border-strong transition-all duration-200"
            >
              <Code size={12} />
              {t.projects?.sourceCode || "Source Code"}
            </a>
          )}

          {hasLivePreview && (
            <a
              href={project.live_preview_url!}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-border rounded-lg text-text-secondary hover:text-text-primary hover:border-border-strong transition-all duration-200"
            >
              <ExternalLink size={12} />
              {t.projects?.livePreview || "Live Preview"}
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}
