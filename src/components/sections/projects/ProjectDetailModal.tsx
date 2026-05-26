"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";
import { X, ExternalLink, Code, CheckCircle2, TrendingUp } from "lucide-react";
import type { Project, Language } from "@/types";

interface ProjectDetailModalTranslations {
  projects?: {
    sourceCode?: string;
    livePreview?: string;
  };
  modal?: {
    close?: string;
    keyHighlights?: string;
    metrics?: string;
    architecture?: string;
  };
}

interface ProjectDetailModalProps {
  project: Project | null;
  lang: Language;
  t: ProjectDetailModalTranslations;
  onClose: () => void;
}

export function ProjectDetailModal({
  project,
  lang,
  t,
  onClose,
}: ProjectDetailModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (project && contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [project]);

  const title = project ? (lang === "en" ? project.title_en : project.title_id) : "";
  const longDesc = project
    ? lang === "en"
      ? project.long_description_en
      : project.long_description_id
    : "";
  const highlights = project
    ? lang === "en"
      ? project.key_highlights_en
      : project.key_highlights_id
    : [];
  const hasSourceCode = Boolean(project?.source_code_url?.trim());
  const hasLivePreview = Boolean(project?.live_preview_url?.trim());
  const hasMetrics = Boolean(project && Object.keys(project.metrics || {}).length > 0);

  return (
    <Dialog.Root open={Boolean(project)} onOpenChange={(open) => !open && onClose()}>
      <AnimatePresence>
        {project && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              />
            </Dialog.Overlay>

            <Dialog.Content asChild>
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 20 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="flex max-h-[calc(100vh-2rem)] w-full max-w-3xl flex-col md:max-h-[calc(100vh-4rem)]"
                >
                  <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-2xl">
                  <div className="relative flex-shrink-0">
                    {project.thumbnail_url ? (
                      <div className="relative aspect-[21/9] overflow-hidden">
                        {/* Project thumbnails can be external URLs or Supabase Storage assets. */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={project.thumbnail_url}
                          alt={title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-surface-elevated via-transparent to-transparent" />
                      </div>
                    ) : (
                      <div className="h-24 bg-gradient-to-br from-accent-subtle to-surface-subtle" />
                    )}

                    <Dialog.Close asChild>
                      <button
                        className="absolute top-4 right-4 p-2 glass rounded-full text-text-secondary hover:text-text-primary transition-colors duration-200"
                        aria-label={t.modal?.close || "Close"}
                      >
                        <X size={18} />
                      </button>
                    </Dialog.Close>
                  </div>

                  <div ref={contentRef} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
                    <div className="space-y-4">
                      <div className="flex flex-wrap items-start gap-3 justify-between">
                        <div>
                          <span className="inline-block px-2.5 py-1 text-xs font-medium text-text-muted border border-border rounded-full capitalize mb-2">
                            {project.category}
                          </span>
                          <Dialog.Title asChild>
                            <h2 className="font-display text-display-md text-text-primary">
                              {title}
                            </h2>
                          </Dialog.Title>
                          <Dialog.Description className="sr-only">{longDesc}</Dialog.Description>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          {hasSourceCode && (
                            <a
                              href={project.source_code_url!}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-border rounded-lg text-text-secondary hover:text-text-primary hover:border-border-strong transition-all duration-200"
                            >
                              <Code size={13} />
                              {t.projects?.sourceCode || "Source Code"}
                            </a>
                          )}
                          {hasLivePreview && (
                            <a
                              href={project.live_preview_url!}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors duration-200"
                            >
                              <ExternalLink size={13} />
                              {t.projects?.livePreview || "Live Preview"}
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {hasMetrics && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-text-secondary">
                          <TrendingUp size={15} />
                          <h3 className="text-sm font-semibold uppercase tracking-wider">
                            {t.modal?.metrics || "Impact & Metrics"}
                          </h3>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {Object.entries(project.metrics).map(([key, value]) => (
                            <div
                              key={key}
                              className="p-4 bg-surface-subtle border border-border rounded-xl text-center"
                            >
                              <div className="text-xl font-bold text-text-primary font-mono">
                                {value}
                              </div>
                              <div className="text-xs text-text-muted capitalize mt-1">
                                {key}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">
                        {t.modal?.architecture || "System Architecture"}
                      </h3>
                      <div className="prose prose-sm max-w-none text-text-secondary leading-relaxed">
                        {longDesc.split("\n\n").map((paragraph) => (
                          <p key={paragraph} className="mb-4 last:mb-0">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </div>

                    {highlights.length > 0 && (
                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">
                          {t.modal?.keyHighlights || "Key Highlights"}
                        </h3>
                        <ul className="space-y-2.5">
                          {highlights.map((highlight, i) => (
                            <motion.li
                              key={highlight}
                              initial={{ opacity: 0, x: -12 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.06, duration: 0.3 }}
                              className="flex items-start gap-3 text-sm text-text-secondary"
                            >
                              <CheckCircle2
                                size={16}
                                className="text-accent flex-shrink-0 mt-0.5"
                              />
                              <span>{highlight}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  </div>
                </motion.div>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
