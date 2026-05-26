"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion } from "framer-motion";
import { Award as AwardIcon, CalendarDays, ExternalLink, ShieldCheck, X } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useLanguage } from "@/hooks/useLanguage";
import type { Award, Certification } from "@/types";

interface CertificationsSectionProps {
  certifications: Certification[];
  awards: Award[];
}

type CredentialItem =
  | {
      type: "certification";
      id: string;
      title_en: string;
      title_id: string;
      issuer: string | null;
      date: string | null;
      expiryDate: string | null;
      credentialId: string | null;
      url: string | null;
      imageUrl: string | null;
      description_en: string | null;
      description_id: string | null;
    }
  | {
      type: "award";
      id: string;
      title_en: string;
      title_id: string;
      issuer: string | null;
      date: string | null;
      expiryDate: null;
      credentialId: null;
      url: string | null;
      imageUrl: string | null;
      description_en: string | null;
      description_id: string | null;
    };

const smoothEase = [0.22, 1, 0.36, 1] as const;

function formatDate(value: string | null, locale: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
  }).format(date);
}

function CredentialPreview({ item, title }: { item: CredentialItem; title: string }) {
  if (item.imageUrl) {
    return (
      <div className="relative h-48 overflow-hidden rounded-2xl border border-border bg-surface-subtle">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.imageUrl} alt={title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-48 items-center justify-center rounded-2xl border border-border bg-gradient-to-br from-accent-subtle via-surface-subtle to-surface-elevated">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-accent/25 bg-surface/80 text-accent shadow-glass">
        {item.type === "certification" ? <ShieldCheck size={34} /> : <AwardIcon size={34} />}
      </div>
    </div>
  );
}

function CredentialDialog({ item }: { item: CredentialItem }) {
  const { lang } = useLanguage();
  const locale = lang === "id" ? "id-ID" : "en-US";
  const title = lang === "id" ? item.title_id : item.title_en;
  const description = lang === "id" ? item.description_id : item.description_en;
  const date = formatDate(item.date, locale);
  const expiryDate = formatDate(item.expiryDate, locale);

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="group h-full rounded-3xl border border-border bg-surface-elevated p-4 text-left shadow-glass transition-all duration-300 hover:-translate-y-1 hover:border-border-strong hover:shadow-card-hover"
        >
          <CredentialPreview item={item} title={title} />
          <div className="p-2 pt-5">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-accent-subtle px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                {item.type === "certification" ? "Certificate" : "Award"}
              </span>
              {date && (
                <span className="inline-flex items-center gap-1 text-xs text-text-muted">
                  <CalendarDays size={13} />
                  {date}
                </span>
              )}
            </div>
            <h3 className="font-display text-xl text-text-primary">{title}</h3>
            {item.issuer && <p className="mt-2 text-sm text-text-secondary">{item.issuer}</p>}
            <p className="mt-4 text-sm font-medium text-accent">
              {lang === "id" ? "Klik untuk lihat detail" : "Click to view details"}
            </p>
          </div>
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay asChild>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
        </Dialog.Overlay>
        <Dialog.Content asChild>
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 28, scale: 0.96 }}
            transition={{ duration: 0.25, ease: smoothEase }}
            className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border border-border bg-surface p-4 shadow-card-hover sm:p-6"
          >
            <div className="grid gap-6 md:grid-cols-[0.9fr_1.1fr]">
              <CredentialPreview item={item} title={title} />

              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Dialog.Title className="font-display text-2xl text-text-primary">
                      {title}
                    </Dialog.Title>
                    {item.issuer && (
                      <Dialog.Description className="mt-2 text-sm text-text-secondary">
                        {item.issuer}
                      </Dialog.Description>
                    )}
                  </div>
                  <Dialog.Close className="rounded-full border border-border p-2 text-text-muted transition-colors hover:border-border-strong hover:text-text-primary">
                    <X size={18} />
                    <span className="sr-only">Close</span>
                  </Dialog.Close>
                </div>

                <div className="mt-6 grid gap-3 text-sm text-text-secondary">
                  {date && (
                    <div className="rounded-2xl bg-surface-subtle p-4">
                      <span className="block text-xs uppercase tracking-[0.18em] text-text-muted">
                        {item.type === "certification" ? "Issued" : "Awarded"}
                      </span>
                      <span className="mt-1 block text-text-primary">{date}</span>
                    </div>
                  )}
                  {expiryDate && (
                    <div className="rounded-2xl bg-surface-subtle p-4">
                      <span className="block text-xs uppercase tracking-[0.18em] text-text-muted">
                        Expires
                      </span>
                      <span className="mt-1 block text-text-primary">{expiryDate}</span>
                    </div>
                  )}
                  {item.credentialId && (
                    <div className="rounded-2xl bg-surface-subtle p-4">
                      <span className="block text-xs uppercase tracking-[0.18em] text-text-muted">
                        Credential ID
                      </span>
                      <span className="mt-1 block break-all text-text-primary">
                        {item.credentialId}
                      </span>
                    </div>
                  )}
                </div>

                {description && (
                  <p className="mt-6 leading-relaxed text-text-secondary">{description}</p>
                )}

                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5"
                  >
                    {lang === "id" ? "Buka credential" : "Open credential"}
                    <ExternalLink size={15} />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function CertificationsSection({ certifications, awards }: CertificationsSectionProps) {
  const { lang } = useLanguage();
  const items: CredentialItem[] = [
    ...certifications.map((certification) => ({
      type: "certification" as const,
      id: certification.id,
      title_en: certification.title_en,
      title_id: certification.title_id,
      issuer: certification.issuer,
      date: certification.issue_date,
      expiryDate: certification.expiry_date,
      credentialId: certification.credential_id,
      url: certification.credential_url,
      imageUrl: certification.badge_url,
      description_en: certification.description_en,
      description_id: certification.description_id,
    })),
    ...awards.map((award) => ({
      type: "award" as const,
      id: award.id,
      title_en: award.title_en,
      title_id: award.title_id,
      issuer: lang === "id" ? award.issuer_id : award.issuer_en,
      date: award.award_date,
      expiryDate: null,
      credentialId: null,
      url: award.award_url,
      imageUrl: award.image_url,
      description_en: award.description_en,
      description_id: award.description_id,
    })),
  ];

  return (
    <section id="certifications" className="py-24">
      <SectionHeader
        label="Credentials"
        title="Certifications & Awards"
        description={
          lang === "id"
            ? "Preview sertifikat dan penghargaan yang bisa dibuka untuk melihat detail, deskripsi, dan link credential."
            : "Visual previews of certificates and awards with detail views, descriptions, and credential links."
        }
      />

      <div className="mt-12">
        {items.length > 0 ? (
          <AnimatePresence>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {items.map((item, index) => (
                <motion.div
                  key={`${item.type}-${item.id}`}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.45, delay: index * 0.06, ease: smoothEase }}
                >
                  <CredentialDialog item={item} />
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        ) : (
          <div className="rounded-3xl border border-dashed border-border p-8 text-text-secondary">
            Certifications and awards will appear here after the CMS is populated.
          </div>
        )}
      </div>
    </section>
  );
}
