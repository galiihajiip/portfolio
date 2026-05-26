"use client";

import { motion } from "framer-motion";
import { ArrowDown, Circle, Download } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types";

interface HeroSectionProps {
  profile: Profile | null;
}

const smoothEase = [0.22, 1, 0.36, 1] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: smoothEase },
  },
};

const taglineVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.025, delayChildren: 0.65 },
  },
};

const characterVariants = {
  hidden: { opacity: 0, y: 12, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.35, ease: smoothEase },
  },
};

export function HeroSection({ profile }: HeroSectionProps) {
  const { lang, t } = useLanguage();

  const name = profile
    ? lang === "en"
      ? profile.full_name_en
      : profile.full_name_id
    : "Your Name";
  const tagline = profile
    ? lang === "en"
      ? profile.tagline_en
      : profile.tagline_id
    : "Building digital experiences";
  const bio = profile ? (lang === "en" ? profile.bio_short_en : profile.bio_short_id) : "";
  const isAvailable = profile?.is_available ?? true;
  const hasCv = Boolean(profile?.cv_url?.trim());

  const scrollToProjects = () => {
    document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDownloadCv = () => {
    if (!profile?.cv_url) return;

    window.open(profile.cv_url, "_blank", "noopener,noreferrer");
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-16 overflow-hidden"
    >
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,hsl(var(--accent-subtle))_0%,transparent_60%)]" />
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.03] dark:opacity-[0.05]"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <pattern id="hero-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto text-center flex flex-col items-center gap-6"
      >
        {profile?.avatar_url && (
          <motion.div
            variants={itemVariants}
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative"
          >
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-border shadow-glass">
              <motion.img
                src={profile.avatar_url}
                alt={name}
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>
            {isAvailable && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.3 }}
                className="absolute -bottom-1 -right-1 flex items-center gap-1 px-2 py-1 bg-surface-elevated border border-border rounded-full shadow-glass"
              >
                <Circle size={6} className="fill-green-500 text-green-500" />
                <span className="text-[10px] font-medium text-text-secondary">
                  {t.hero.availableFor}
                </span>
              </motion.div>
            )}
          </motion.div>
        )}

        {!profile?.avatar_url && isAvailable && (
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-2 px-3 py-1.5 glass rounded-full"
          >
            <motion.span
              animate={{ scale: [1, 1.35, 1], opacity: [1, 0.75, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            >
              <Circle size={8} className="fill-green-500 text-green-500" />
            </motion.span>
            <span className="text-xs font-medium text-text-secondary">
              {t.hero.availableFor}
            </span>
          </motion.div>
        )}

        <motion.h1
          variants={itemVariants}
          className="font-display text-display-2xl text-text-primary text-balance"
        >
          {name}
        </motion.h1>

        <motion.p
          variants={taglineVariants}
          className="text-display-md font-display italic text-text-secondary text-balance max-w-2xl whitespace-pre-wrap"
        >
          {Array.from(tagline).map((character, index) => (
            <motion.span
              key={`${character}-${index}`}
              variants={characterVariants}
              className="inline-block"
            >
              {character === " " ? "\u00A0" : character}
            </motion.span>
          ))}
        </motion.p>

        {bio && (
          <motion.p
            variants={itemVariants}
            className="text-base md:text-lg text-text-secondary max-w-xl leading-relaxed text-balance"
          >
            {bio}
          </motion.p>
        )}

        <motion.div variants={itemVariants} className="flex flex-wrap gap-3 justify-center mt-2">
          <button
            onClick={scrollToProjects}
            className="px-6 py-3 text-sm font-medium bg-accent text-accent-foreground rounded-xl hover:bg-accent/90 transition-all duration-200"
          >
            {t.nav.projects} -&gt;
          </button>
          <button
            onClick={handleDownloadCv}
            disabled={!hasCv}
            className={cn(
              "inline-flex items-center gap-2 px-6 py-3 text-sm font-medium border border-border rounded-xl text-text-secondary transition-all duration-200",
              hasCv
                ? "hover:text-text-primary hover:border-border-strong"
                : "cursor-not-allowed opacity-50",
            )}
          >
            <Download size={15} />
            {t.nav.downloadCV}
          </button>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-text-muted"
      >
        <span className="text-xs font-medium tracking-widest uppercase">
          {t.hero.scrollDown}
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown size={16} />
        </motion.div>
      </motion.div>
    </section>
  );
}
