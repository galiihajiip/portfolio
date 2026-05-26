import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing env. Run via: npm run seed");
  process.exit(1);
}

const reset = process.argv.includes("--reset");
const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const profile = {
  full_name_en: "Galih Aji P",
  full_name_id: "Galih Aji Pangestu",
  tagline_en: "Full-stack web developer crafting delightful products",
  tagline_id: "Full-stack web developer untuk produk web yang berkesan",
  bio_short_en:
    "Indonesian full-stack developer focused on Next.js, TypeScript, and Supabase. I design and ship production-ready web apps that pair clean code with smooth UX.",
  bio_short_id:
    "Full-stack developer asal Indonesia yang fokus pada Next.js, TypeScript, dan Supabase. Saya merancang dan merilis aplikasi web siap produksi dengan kode rapi dan UX yang mulus.",
  bio_long_en:
    "I'm a developer who enjoys turning ideas into polished products. I work across the stack — design, frontend, backend, and a bit of infra — and care about the details that make software feel effortless to use. Lately I'm exploring serverless platforms, design systems, and the line between engineering and craft. When I'm offline, you'll find me gaming or hunting for new tools to add to my workflow.",
  bio_long_id:
    "Saya developer yang suka mengubah ide menjadi produk yang matang — dari sketsa awal sampai deploy ke production. Saya nyaman bekerja di seluruh stack: desain, frontend, backend, hingga sedikit infrastruktur, dan memperhatikan detail yang membuat software terasa nyaman dipakai. Saat ini saya sedang mengulik platform serverless, design system, dan persinggungan antara rekayasa dan kerajinan. Kalau tidak coding, biasanya saya main game atau hunting tools baru untuk workflow.",
  email: "gajipgaming@gmail.com",
  phone: "082265588823",
  location_en: "Indonesia",
  location_id: "Indonesia",
  linkedin_url: null,
  github_url: "https://github.com/galiihajiip",
  twitter_url: null,
  cv_url: null,
  avatar_url: null,
  is_available: true,
};

const techMarquee = [
  ["TypeScript", "language"],
  ["JavaScript", "language"],
  ["React", "framework"],
  ["Next.js", "framework"],
  ["Node.js", "runtime"],
  ["Tailwind CSS", "styling"],
  ["Supabase", "backend"],
  ["PostgreSQL", "database"],
  ["Git", "tooling"],
  ["GitHub", "tooling"],
  ["Docker", "tooling"],
  ["Figma", "design"],
  ["Vercel", "platform"],
  ["Linux", "platform"],
].map(([name, category], i) => ({
  name,
  logo_url: `https://cdn.simpleicons.org/${name
    .toLowerCase()
    .replace(/\.| /g, "")}`,
  logo_svg_code: null,
  category,
  display_order: i,
  is_active: true,
}));

const projects = [
  {
    title_en: "Headless Portfolio CMS",
    title_id: "Headless Portfolio CMS",
    short_description_en:
      "A bilingual portfolio platform with a built-in admin panel powered by Next.js 16, TypeScript, and Supabase.",
    short_description_id:
      "Platform portfolio bilingual dengan panel admin terintegrasi, dibangun pakai Next.js 16, TypeScript, dan Supabase.",
    long_description_en:
      "An end-to-end portfolio platform I built to manage my own work. The public site uses ISR with server components for SEO, while the /admin section provides full CRUD for projects, experience, and content with image uploads. Auth is handled by Supabase, and the design system uses HSL tokens for instant light/dark theming.",
    long_description_id:
      "Platform portfolio yang saya bangun untuk mengelola pekerjaan sendiri. Halaman publik memakai ISR dengan server component agar SEO-friendly, sementara bagian /admin menyediakan CRUD penuh untuk project, experience, dan konten lain lengkap dengan upload gambar. Autentikasi memakai Supabase, dan design system memakai HSL token untuk mode terang/gelap.",
    key_highlights_en: [
      "Next.js 16 App Router with ISR and Server Actions",
      "Supabase Auth + RLS protected admin panel",
      "Bilingual (EN/ID) content with runtime switching",
      "Animated UI with Framer Motion and Tailwind",
    ],
    key_highlights_id: [
      "Next.js 16 App Router dengan ISR dan Server Actions",
      "Panel admin terproteksi Supabase Auth + RLS",
      "Konten bilingual (EN/ID) dengan pemilih bahasa runtime",
      "UI beranimasi dengan Framer Motion dan Tailwind",
    ],
    metrics: { lighthouse: "98", build: "<10s" },
    tech_stack: ["Next.js", "TypeScript", "Supabase", "Tailwind", "Framer Motion"],
    thumbnail_url: null,
    source_code_url: "https://github.com/galiihajiip/portfolio",
    live_preview_url: null,
    category: "web",
    is_featured: true,
    display_order: 0,
  },
  {
    title_en: "TaskFlow",
    title_id: "TaskFlow",
    short_description_en:
      "A lightweight kanban-style task manager with realtime sync and keyboard-first navigation.",
    short_description_id:
      "Task manager bergaya kanban yang ringan dengan sinkronisasi realtime dan navigasi keyboard-first.",
    long_description_en:
      "TaskFlow lets small teams organize work in boards, lists, and cards with realtime collaboration. Built to be fast on slow networks, the app keeps a local-first cache and resolves conflicts on the backend. The keyboard shortcuts cover every common action, making the app feel like a native tool.",
    long_description_id:
      "TaskFlow memungkinkan tim kecil mengelola pekerjaan dalam board, list, dan card secara realtime. Dirancang cepat di jaringan lambat, app ini menyimpan cache local-first dan menyelesaikan konflik di backend. Shortcut keyboard mencakup semua aksi umum sehingga terasa seperti aplikasi native.",
    key_highlights_en: [
      "Local-first sync with optimistic updates",
      "Realtime presence and cursors via WebSocket",
      "Keyboard shortcuts for every action",
      "Drag-and-drop board reordering",
    ],
    key_highlights_id: [
      "Sinkronisasi local-first dengan optimistic update",
      "Presence dan cursor realtime via WebSocket",
      "Shortcut keyboard untuk setiap aksi",
      "Reorder board dengan drag-and-drop",
    ],
    metrics: { users: "120+", uptime: "99.9%" },
    tech_stack: ["React", "Node.js", "PostgreSQL", "WebSocket", "Tailwind"],
    thumbnail_url: null,
    source_code_url: null,
    live_preview_url: null,
    category: "web",
    is_featured: true,
    display_order: 1,
  },
  {
    title_en: "ShopEase",
    title_id: "ShopEase",
    short_description_en:
      "A headless e-commerce storefront with Stripe checkout and an AI-powered product search.",
    short_description_id:
      "Storefront e-commerce headless dengan checkout Stripe dan pencarian produk berbasis AI.",
    long_description_en:
      "ShopEase is a demo storefront that combines a headless commerce backend with an embedded semantic search using OpenAI embeddings. Customers can describe what they want in plain language and the search finds the right products. Checkout is handled end-to-end by Stripe with webhooks updating inventory in Supabase.",
    long_description_id:
      "ShopEase adalah storefront demo yang memadukan backend commerce headless dengan pencarian semantik via OpenAI embedding. Pengguna bisa mendeskripsikan kebutuhan dengan bahasa alami dan pencarian menemukan produk yang relevan. Checkout ditangani Stripe end-to-end dengan webhook yang sinkron ke inventaris Supabase.",
    key_highlights_en: [
      "Semantic search via OpenAI embeddings",
      "Stripe checkout with webhook reconciliation",
      "Image-optimized product gallery",
      "Cart persisted across sessions",
    ],
    key_highlights_id: [
      "Pencarian semantik via OpenAI embedding",
      "Checkout Stripe dengan rekonsiliasi webhook",
      "Galeri produk dengan optimasi gambar",
      "Cart tersimpan antar sesi",
    ],
    metrics: { products: "300+", checkout: "<30s" },
    tech_stack: ["Next.js", "Stripe", "OpenAI", "Supabase", "Tailwind"],
    thumbnail_url: null,
    source_code_url: null,
    live_preview_url: null,
    category: "ai",
    is_featured: false,
    display_order: 2,
  },
];

const experience = [
  {
    company_name: "Freelance",
    role_en: "Full-stack Web Developer",
    role_id: "Full-stack Web Developer",
    description_en:
      "Built and maintained landing pages, dashboards, and small SaaS products for local clients. Worked across the stack from design handoff to deployment.",
    description_id:
      "Membangun dan memelihara landing page, dashboard, dan produk SaaS kecil untuk klien lokal. Mengerjakan seluruh stack dari design handoff hingga deployment.",
    start_date: "2024-01-01",
    end_date: null,
    is_current: true,
    company_logo_url: null,
    company_url: null,
    location_en: "Remote · Indonesia",
    location_id: "Remote · Indonesia",
    employment_type: "freelance",
    display_order: 0,
  },
  {
    company_name: "Local Web Studio",
    role_en: "Front-end Developer Intern",
    role_id: "Front-end Developer (Magang)",
    description_en:
      "Implemented marketing pages with Next.js and contributed to a shared component library used across client projects.",
    description_id:
      "Mengimplementasikan halaman marketing dengan Next.js dan berkontribusi ke shared component library yang dipakai lintas project klien.",
    start_date: "2023-06-01",
    end_date: "2023-12-31",
    is_current: false,
    company_logo_url: null,
    company_url: null,
    location_en: "Indonesia",
    location_id: "Indonesia",
    employment_type: "internship",
    display_order: 1,
  },
];

const certifications = [
  {
    title_en: "Meta Front-End Developer Professional Certificate",
    title_id: "Meta Front-End Developer Professional Certificate",
    issuer: "Coursera · Meta",
    issue_date: "2024-03-15",
    expiry_date: null,
    credential_id: null,
    credential_url: "https://coursera.org/share/example",
    description_en:
      "Eight-course program covering React, Bootstrap, accessibility, version control, and front-end interview preparation.",
    description_id:
      "Program delapan kursus mencakup React, Bootstrap, aksesibilitas, version control, dan persiapan interview front-end.",
    display_order: 0,
  },
  {
    title_en: "Supabase Database Fundamentals",
    title_id: "Fundamental Database Supabase",
    issuer: "Supabase",
    issue_date: "2024-08-01",
    expiry_date: null,
    credential_id: null,
    credential_url: null,
    description_en:
      "Practical workshop on Postgres, Row Level Security, edge functions, and realtime subscriptions.",
    description_id:
      "Workshop praktis tentang Postgres, Row Level Security, edge function, dan realtime subscription.",
    display_order: 1,
  },
];

async function clear(table) {
  const { error } = await admin.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (error) throw new Error(`Failed to clear ${table}: ${error.message}`);
}

async function seedProfile() {
  const { data: existing } = await admin.from("profile").select("id").limit(1).maybeSingle();
  if (existing?.id) {
    const { error } = await admin.from("profile").update(profile).eq("id", existing.id);
    if (error) throw error;
    console.log("- profile updated");
  } else {
    const { error } = await admin.from("profile").insert(profile);
    if (error) throw error;
    console.log("- profile inserted");
  }
}

async function seedTable(table, rows, label) {
  if (reset) await clear(table);
  const { error } = await admin.from(table).insert(rows);
  if (error) throw new Error(`Failed to seed ${table}: ${error.message}`);
  console.log(`- ${rows.length} ${label} inserted`);
}

try {
  console.log(`Seeding demo data${reset ? " (--reset)" : ""}...`);
  await seedProfile();
  await seedTable("tech_marquee", techMarquee, "tech_marquee");
  await seedTable("projects", projects, "projects");
  await seedTable("experience", experience, "experience");
  await seedTable("certifications", certifications, "certifications");
  console.log("\nDone! Refresh /admin or visit / to see the seeded data.");
} catch (err) {
  console.error("Seed failed:", err.message);
  process.exit(1);
}
