-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- PROFILE TABLE
create table public.profile (
  id uuid primary key default uuid_generate_v4(),
  full_name_en text not null,
  full_name_id text not null,
  tagline_en text not null,
  tagline_id text not null,
  bio_short_en text not null,
  bio_short_id text not null,
  bio_long_en text,
  bio_long_id text,
  email text,
  phone text,
  location_en text,
  location_id text,
  linkedin_url text,
  github_url text,
  twitter_url text,
  cv_url text,        -- Supabase Storage public URL
  avatar_url text,    -- Supabase Storage public URL
  is_available boolean default true,
  updated_at timestamptz default now()
);

-- PROJECTS TABLE
create table public.projects (
  id uuid primary key default uuid_generate_v4(),
  title_en text not null,
  title_id text not null,
  short_description_en text not null,
  short_description_id text not null,
  long_description_en text not null,   -- Full narrative / system architecture
  long_description_id text not null,
  key_highlights_en text[] default '{}',  -- Array of bullet points (English)
  key_highlights_id text[] default '{}',  -- Array of bullet points (Indonesian)
  metrics jsonb default '{}',             -- e.g. {"users": "10k+", "uptime": "99.9%"}
  tech_stack text[] default '{}',         -- Used for marquee only, NOT shown on cards
  thumbnail_url text,                     -- Supabase Storage public URL
  source_code_url text,                   -- Conditionally rendered
  live_preview_url text,                  -- Conditionally rendered
  category text check (category in ('web', 'mobile', 'backend', 'ai', 'other')),
  is_featured boolean default false,
  display_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- EXPERIENCE TABLE
create table public.experience (
  id uuid primary key default uuid_generate_v4(),
  company_name text not null,
  role_en text not null,
  role_id text not null,
  description_en text,
  description_id text,
  start_date date not null,
  end_date date,                  -- NULL = current/present
  is_current boolean default false,
  company_logo_url text,
  company_url text,
  location_en text,
  location_id text,
  employment_type text check (employment_type in ('full-time', 'part-time', 'freelance', 'contract', 'internship')),
  display_order integer default 0,
  created_at timestamptz default now()
);

-- CERTIFICATIONS TABLE
create table public.certifications (
  id uuid primary key default uuid_generate_v4(),
  title_en text not null,
  title_id text not null,
  issuer text not null,
  issue_date date,
  expiry_date date,               -- NULL = no expiry
  credential_id text,
  credential_url text,
  badge_url text,                 -- Supabase Storage public URL
  description_en text,
  description_id text,
  display_order integer default 0,
  created_at timestamptz default now()
);

-- AWARDS TABLE
create table public.awards (
  id uuid primary key default uuid_generate_v4(),
  title_en text not null,
  title_id text not null,
  issuer_en text,
  issuer_id text,
  description_en text,
  description_id text,
  award_date date,
  award_url text,
  image_url text,
  display_order integer default 0,
  created_at timestamptz default now()
);

-- TECH STACK MARQUEE TABLE
create table public.tech_marquee (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  logo_url text,                  -- SVG or PNG from Supabase Storage
  logo_svg_code text,             -- Alternative: inline SVG string
  category text,                  -- e.g. 'frontend', 'backend', 'devops'
  display_order integer default 0,
  is_active boolean default true
);

-- CONTACT MESSAGES TABLE
create table public.contact_messages (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- ROW LEVEL SECURITY
alter table public.profile enable row level security;
alter table public.projects enable row level security;
alter table public.experience enable row level security;
alter table public.certifications enable row level security;
alter table public.awards enable row level security;
alter table public.tech_marquee enable row level security;
alter table public.contact_messages enable row level security;

-- Public read access (no auth required for portfolio viewing)
create policy "Public can read profile" on public.profile for select using (true);
create policy "Public can read projects" on public.projects for select using (true);
create policy "Public can read experience" on public.experience for select using (true);
create policy "Public can read certifications" on public.certifications for select using (true);
create policy "Public can read awards" on public.awards for select using (true);
create policy "Public can read tech_marquee" on public.tech_marquee for select using (is_active = true);

-- Contact messages: insert public, read admin only
create policy "Anyone can insert contact messages" on public.contact_messages for insert with check (true);
create policy "Authenticated can read contact messages" on public.contact_messages for select using (auth.role() = 'authenticated');

-- Admin write access (authenticated users only)
create policy "Admin full access profile" on public.profile for all using (auth.role() = 'authenticated');
create policy "Admin full access projects" on public.projects for all using (auth.role() = 'authenticated');
create policy "Admin full access experience" on public.experience for all using (auth.role() = 'authenticated');
create policy "Admin full access certifications" on public.certifications for all using (auth.role() = 'authenticated');
create policy "Admin full access awards" on public.awards for all using (auth.role() = 'authenticated');
create policy "Admin full access tech_marquee" on public.tech_marquee for all using (auth.role() = 'authenticated');

-- STORAGE BUCKETS
insert into storage.buckets (id, name, public) values ('portfolio-assets', 'portfolio-assets', true);

create policy "Public read portfolio assets" on storage.objects for select using (bucket_id = 'portfolio-assets');
create policy "Admin upload portfolio assets" on storage.objects for insert with check (bucket_id = 'portfolio-assets' and auth.role() = 'authenticated');
create policy "Admin update portfolio assets" on storage.objects for update using (bucket_id = 'portfolio-assets' and auth.role() = 'authenticated');
create policy "Admin delete portfolio assets" on storage.objects for delete using (bucket_id = 'portfolio-assets' and auth.role() = 'authenticated');

-- UPDATED_AT TRIGGER
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at before update on public.profile
  for each row execute function update_updated_at();
create trigger set_updated_at before update on public.projects
  for each row execute function update_updated_at();
