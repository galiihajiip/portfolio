"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { CheckCircle, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { submitContactMessage } from "@/app/actions/contact";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";
import { SectionHeader } from "@/components/ui/SectionHeader";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  subject: z.string().optional(),
  message: z.string().min(20, "Message must be at least 20 characters"),
});

type FormData = z.infer<typeof schema>;

const inputClasses =
  "w-full px-4 py-3 bg-surface-subtle border border-border rounded-xl text-text-primary placeholder:text-text-muted text-sm focus:outline-none focus:border-border-strong focus:ring-1 focus:ring-accent/30 transition-all duration-200";
const errorClasses = "text-xs text-red-500 mt-1";

export function ContactSection() {
  const { t } = useLanguage();
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    const result = await submitContactMessage(data);

    if (result.success) {
      setIsSuccess(true);
      reset();
      toast.success(t.contact.successTitle);
      return;
    }

    toast.error(result.error || t.contact.errorMessage);
  };

  return (
    <section id="contact" className="py-section">
      <div className="max-w-2xl mx-auto">
        <SectionHeader
          label={t.contact.sectionLabel}
          title={t.contact.sectionTitle}
          align="center"
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10"
        >
          {isSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 space-y-4"
            >
              <CheckCircle size={48} className="text-accent mx-auto" />
              <h3 className="font-display text-xl text-text-primary">
                {t.contact.successTitle}
              </h3>
              <p className="text-text-secondary">{t.contact.successMessage}</p>
              <button
                type="button"
                onClick={() => setIsSuccess(false)}
                className="mt-4 text-sm text-accent hover:underline"
              >
                Send another message
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <input
                    {...register("name")}
                    placeholder={t.contact.namePlaceholder}
                    className={cn(inputClasses, errors.name && "border-red-400")}
                  />
                  {errors.name && <p className={errorClasses}>{errors.name.message}</p>}
                </div>
                <div>
                  <input
                    {...register("email")}
                    type="email"
                    placeholder={t.contact.emailPlaceholder}
                    className={cn(inputClasses, errors.email && "border-red-400")}
                  />
                  {errors.email && <p className={errorClasses}>{errors.email.message}</p>}
                </div>
              </div>
              <div>
                <input
                  {...register("subject")}
                  placeholder={t.contact.subjectPlaceholder}
                  className={inputClasses}
                />
              </div>
              <div>
                <textarea
                  {...register("message")}
                  placeholder={t.contact.messagePlaceholder}
                  rows={5}
                  className={cn(
                    inputClasses,
                    "resize-none",
                    errors.message && "border-red-400",
                  )}
                />
                {errors.message && <p className={errorClasses}>{errors.message.message}</p>}
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-xl font-medium text-sm hover:bg-accent/90 disabled:opacity-60 transition-all duration-200"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                    {t.contact.sending}
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    {t.contact.send}
                  </>
                )}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
