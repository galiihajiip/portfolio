import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Run with --env-file=.env.local",
  );
  process.exit(1);
}

const email = process.argv[2] || "admin@portfolio.local";
const password = process.argv[3] || "admin123";

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const existing = await admin.auth.admin.listUsers();
const found = existing.data?.users.find((u) => u.email === email);

if (found) {
  const { error } = await admin.auth.admin.updateUserById(found.id, {
    password,
    email_confirm: true,
  });
  if (error) {
    console.error("Failed to update existing user:", error.message);
    process.exit(1);
  }
  console.log(`Updated existing user ${email} (password reset, email confirmed)`);
} else {
  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) {
    console.error("Failed to create user:", error.message);
    process.exit(1);
  }
  console.log(`Created user ${email}`);
}

console.log("");
console.log("You can now sign in at /admin/login with:");
console.log(`  Email:    ${email}`);
console.log(`  Password: ${password}`);
