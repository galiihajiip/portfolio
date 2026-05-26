import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// Admin client - ONLY use in server-side code (Server Actions, API routes)
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
