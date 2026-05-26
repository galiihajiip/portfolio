"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  subject: z.string().optional(),
  message: z.string().min(20, "Message must be at least 20 characters"),
});

interface ContactMessageInput {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

type ContactMessageInsert = Database["public"]["Tables"]["contact_messages"]["Insert"];

export async function submitContactMessage(formData: ContactMessageInput) {
  const parsed = contactSchema.safeParse(formData);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid contact form data.",
    };
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return {
      success: false,
      error: "Contact form is not configured yet. Please try again later.",
    };
  }

  const supabase = await createClient();
  const message: ContactMessageInsert = {
    name: parsed.data.name,
    email: parsed.data.email,
    subject: parsed.data.subject?.trim() || null,
    message: parsed.data.message,
  };

  const { error } = await supabase.from("contact_messages").insert(message);

  if (error) {
    return { success: false, error: "Failed to send message. Please try again." };
  }

  return { success: true };
}
