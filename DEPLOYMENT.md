# Deployment Checklist

## 1. Supabase Setup

- [ ] Run the SQL migration in `supabase/migrations/001_initial_schema.sql`
- [ ] Create a user account in Supabase Auth (Authentication > Users > Add user) -- this is your admin login
- [ ] Verify the `portfolio-assets` storage bucket is created and public
- [ ] Copy your Project URL and anon key from Project Settings > API

## 2. Environment Variables

Set these in your hosting platform (Vercel / Netlify):

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  (keep secret!)
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

## 3. Vercel Deployment

```bash
npm install -g vercel
vercel --prod
```

## 4. Initial Data Population

- Navigate to `/admin/login`
- Sign in with your Supabase Auth credentials
- Fill in Profile first (name, bio, social links)
- Upload your avatar and CV PDF
- Add projects, experience, certifications
- Add tech stack items for the marquee
- Set `is_featured = true` on 2-3 projects

## 5. Performance Checklist

- [ ] Run Lighthouse audit -- target 95+ Performance
- [ ] Verify ISR is working (`revalidate = 60` in `page.tsx`)
- [ ] Check images are loading from Supabase Storage CDN
- [ ] Verify dark mode toggle persists on reload
- [ ] Test language switcher (EN/ID) on all sections
- [ ] Test contact form submission and check Supabase table

## 6. Mobile Testing

- [ ] Test marquee smoothness on mobile (Chrome DevTools > Throttle CPU)
- [ ] Verify navbar hamburger menu works correctly
- [ ] Test modal opens/closes properly on mobile
- [ ] Verify contact form is usable on small screens

## Architecture Notes

- Server Components: `page.tsx`, `admin/page.tsx` (all data fetching)
- Client Components: All sections (`useLanguage` hook), Navbar, Modals, Forms
- Server Actions: `src/app/actions/contact.ts`
- Middleware: Route protection for `/admin/*`
- Storage: All files uploaded to `portfolio-assets` bucket in Supabase

## Quick Reference: Component Tree

```text
app/
├── layout.tsx                    -> Root layout + ThemeProvider + LanguageProvider
├── page.tsx                      -> Home (Server Component, ISR)
├── loading.tsx / error.tsx / not-found.tsx
├── sitemap.ts / robots.ts
├── actions/
│   └── contact.ts                -> Server Action (contact form submission)
└── admin/
    ├── layout.tsx                -> Admin layout
    ├── page.tsx                  -> Dashboard overview
    ├── login/page.tsx            -> Auth page
    ├── profile/page.tsx
    ├── projects/page.tsx
    ├── experience/page.tsx
    ├── certifications/page.tsx
    ├── tech-marquee/page.tsx
    └── messages/page.tsx

components/
├── layout/
│   ├── Navbar.tsx                -> [use client] Sticky nav + lang + theme + CV download
│   └── Footer.tsx                -> [use client] i18n footer
├── sections/
│   ├── HeroSection.tsx           -> [use client] Framer Motion stagger
│   ├── TechMarquee.tsx           -> CSS animation marquee (Server-renderable)
│   ├── AboutSection.tsx          -> [use client]
│   ├── ExperienceSection.tsx     -> [use client]
│   ├── CertificationsSection.tsx -> [use client]
│   ├── ContactSection.tsx        -> [use client] + react-hook-form
│   └── projects/
│       ├── ProjectsSection.tsx   -> [use client] Filter + grid
│       ├── ProjectCard.tsx       -> [use client] Conditional buttons
│       └── ProjectDetailModal.tsx -> [use client] Radix Dialog + Framer Motion
├── admin/
│   ├── AdminShell.tsx            -> [use client] Sidebar layout
│   ├── LoginForm.tsx             -> [use client]
│   ├── DataTable.tsx             -> [use client] Reusable CRUD table
│   ├── profile/ProfileForm.tsx
│   ├── projects/ProjectsAdminClient.tsx + ProjectFormModal.tsx
│   ├── experience/ExperienceAdminClient.tsx + ExperienceFormModal.tsx
│   ├── certifications/CertificationsAdminClient.tsx + CertificationFormModal.tsx
│   ├── tech-marquee/TechMarqueeAdminClient.tsx + TechMarqueeFormModal.tsx
│   └── messages/MessagesClient.tsx
├── providers/
│   └── ThemeProvider.tsx
└── ui/
    └── SectionHeader.tsx         -> [use client] Animated section headers

context/
└── LanguageContext.tsx           -> Language state + translations

hooks/
└── useLanguage.ts

i18n/
├── index.ts
└── translations/
    ├── en.json
    └── id.json

lib/
├── utils.ts
└── supabase/
    ├── server.ts
    ├── client.ts
    ├── admin.ts
    └── middleware.ts

types/
├── index.ts
└── database.ts
```
