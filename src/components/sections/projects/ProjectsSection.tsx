"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ProjectCard } from "./ProjectCard";
import { ProjectDetailModal } from "./ProjectDetailModal";
import type { Project } from "@/types";

type CategoryFilter = "all" | "web" | "mobile" | "backend" | "ai" | "other";

interface ProjectsSectionProps {
  projects: Project[];
}

const smoothEase = [0.22, 1, 0.36, 1] as const;

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  const { lang, t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<CategoryFilter>("all");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const categories: { key: CategoryFilter; label: string }[] = [
    { key: "all", label: t.projects.categories.all },
    { key: "web", label: t.projects.categories.web },
    { key: "mobile", label: t.projects.categories.mobile },
    { key: "backend", label: t.projects.categories.backend },
    { key: "ai", label: t.projects.categories.ai },
    { key: "other", label: t.projects.categories.other },
  ];

  const filteredProjects = useMemo(() => {
    if (activeFilter === "all") return projects;

    return projects.filter((project) => project.category === activeFilter);
  }, [activeFilter, projects]);

  const availableCategories = categories.filter(
    (category) =>
      category.key === "all" || projects.some((project) => project.category === category.key),
  );

  return (
    <section id="projects" className="py-section">
      <SectionHeader label={t.projects.sectionLabel} title={t.projects.sectionTitle} />

      <div className="flex flex-wrap gap-2 mt-8 mb-10">
        {availableCategories.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveFilter(key)}
            className={
              activeFilter === key
                ? "relative px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 text-text-primary"
                : "relative px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 text-text-secondary hover:text-text-primary"
            }
          >
            {activeFilter === key && (
              <motion.span
                layoutId="project-filter"
                className="absolute inset-0 bg-surface-subtle border border-border rounded-lg"
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              />
            )}
            <span className="relative">{label}</span>
          </button>
        ))}
      </div>

      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: smoothEase }}
            >
              <ProjectCard
                project={project}
                lang={lang}
                t={t}
                onViewDetails={setSelectedProject}
                index={index}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredProjects.length === 0 && (
        <p className="text-center text-text-muted py-16">
          No projects in this category yet.
        </p>
      )}

      <ProjectDetailModal
        project={selectedProject}
        lang={lang}
        t={t}
        onClose={() => setSelectedProject(null)}
      />
    </section>
  );
}
