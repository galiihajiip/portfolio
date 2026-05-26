"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  label: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}

const smoothEase = [0.22, 1, 0.36, 1] as const;

export function SectionHeader({
  label,
  title,
  description,
  align = "left",
}: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, ease: smoothEase }}
      className={cn(align === "center" && "text-center")}
    >
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-3 block">
        {label}
      </span>
      <h2 className="font-display text-display-lg text-text-primary text-balance">{title}</h2>
      {description && (
        <p
          className={cn(
            "mt-4 text-text-secondary text-lg leading-relaxed max-w-2xl",
            align === "center" && "mx-auto",
          )}
        >
          {description}
        </p>
      )}
    </motion.div>
  );
}
