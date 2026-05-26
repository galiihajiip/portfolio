"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { Moon, Sun, Menu, X, Download, ArrowUpRight } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

const NAV_SECTIONS = ["about", "projects", "experience", "certifications", "contact"] as const;

interface NavbarProps {
  cvUrl: string | null;
}

export function Navbar({ cvUrl }: NavbarProps) {
  const { lang, setLang, t } = useLanguage();
  const { resolvedTheme, setTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setMounted(true), 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    NAV_SECTIONS.forEach((section) => {
      const el = document.getElementById(section);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(section);
        },
        { threshold: 0.4 },
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((observer) => observer.disconnect());
  }, []);

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setIsMobileOpen(false);
  }, []);

  const handleDownloadCV = useCallback(() => {
    if (!cvUrl) return;

    const link = document.createElement("a");
    link.href = cvUrl;
    link.download = `CV_${lang === "en" ? "English" : "Indonesian"}.pdf`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [cvUrl, lang]);

  const toggleLang = useCallback(() => {
    setLang(lang === "en" ? "id" : "en");
  }, [lang, setLang]);

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  const navLinks = [
    { key: "about", label: t.nav.about },
    { key: "projects", label: t.nav.projects },
    { key: "experience", label: t.nav.experience },
    { key: "certifications", label: t.nav.certifications },
    { key: "contact", label: t.nav.contact },
  ];

  const isDark = resolvedTheme === "dark";

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled ? "glass border-b border-border" : "bg-transparent",
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="font-display text-lg font-medium text-text-primary hover:text-accent transition-colors duration-200"
            >
              Portfolio<span className="text-accent">.</span>
            </button>

            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => scrollTo(key)}
                  className={cn(
                    "relative px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200",
                    activeSection === key
                      ? "text-text-primary"
                      : "text-text-secondary hover:text-text-primary",
                  )}
                >
                  {activeSection === key && (
                    <motion.span
                      layoutId="nav-indicator"
                      className="absolute inset-0 bg-surface-subtle rounded-lg"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <span className="relative">{label}</span>
                </button>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-3">
              <button
                onClick={toggleLang}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium font-mono border border-border rounded-md text-text-secondary hover:text-text-primary hover:border-border-strong transition-all duration-200"
              >
                <motion.span
                  key={lang}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15 }}
                >
                  {lang.toUpperCase()}
                </motion.span>
                <span className="text-border-strong">/</span>
                <span className="text-text-muted">{lang === "en" ? "ID" : "EN"}</span>
              </button>

              {mounted && (
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:border-border-strong transition-all duration-200"
                  aria-label="Toggle theme"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {isDark ? (
                      <motion.span
                        key="sun"
                        initial={{ opacity: 0, rotate: -90 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: 90 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Sun size={15} />
                      </motion.span>
                    ) : (
                      <motion.span
                        key="moon"
                        initial={{ opacity: 0, rotate: 90 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: -90 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Moon size={15} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              )}

              {cvUrl && (
                <button
                  onClick={handleDownloadCV}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border rounded-lg text-text-secondary hover:text-text-primary hover:border-border-strong transition-all duration-200 group"
                >
                  <Download
                    size={14}
                    className="group-hover:-translate-y-0.5 group-hover:translate-x-0 transition-transform duration-200"
                  />
                  {t.nav.downloadCV}
                </button>
              )}

              <button
                onClick={() => scrollTo("contact")}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-all duration-200 group"
              >
                {t.nav.letsTalk}
                <ArrowUpRight
                  size={14}
                  className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200"
                />
              </button>
            </div>

            <div className="flex lg:hidden items-center gap-2">
              {mounted && (
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg text-text-secondary"
                  aria-label="Toggle theme"
                >
                  {isDark ? <Sun size={16} /> : <Moon size={16} />}
                </button>
              )}
              <button
                onClick={() => setIsMobileOpen((open) => !open)}
                className="p-2 rounded-lg text-text-secondary"
                aria-label="Toggle menu"
              >
                {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-72 glass border-l border-border p-6 lg:hidden flex flex-col"
            >
              <div className="flex justify-end mb-8">
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-2 text-text-secondary"
                  aria-label="Close menu"
                >
                  <X size={20} />
                </button>
              </div>
              <nav className="flex flex-col gap-1 flex-1">
                {navLinks.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => scrollTo(key)}
                    className={cn(
                      "text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200",
                      activeSection === key
                        ? "bg-surface-subtle text-text-primary"
                        : "text-text-secondary hover:text-text-primary hover:bg-surface-subtle",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </nav>
              <div className="flex flex-col gap-3 mt-6 pt-6 border-t border-border">
                <button
                  onClick={toggleLang}
                  className="flex items-center justify-between px-4 py-3 rounded-lg border border-border text-sm font-medium text-text-secondary"
                >
                  <span>Language</span>
                  <span className="font-mono text-xs">
                    {lang.toUpperCase()} / {lang === "en" ? "ID" : "EN"}
                  </span>
                </button>
                {cvUrl && (
                  <button
                    onClick={handleDownloadCV}
                    className="flex items-center gap-2 justify-center px-4 py-3 rounded-lg border border-border text-sm font-medium text-text-secondary"
                  >
                    <Download size={14} /> {t.nav.downloadCV}
                  </button>
                )}
                <button
                  onClick={() => scrollTo("contact")}
                  className="flex items-center gap-2 justify-center px-4 py-3 rounded-lg bg-accent text-accent-foreground text-sm font-medium"
                >
                  {t.nav.letsTalk} <ArrowUpRight size={14} />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
