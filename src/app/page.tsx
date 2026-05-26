import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/sections/HeroSection";
import { TechMarquee } from "@/components/sections/TechMarquee";
import { ContactSection } from "@/components/sections/ContactSection";
import { ProjectsSection } from "@/components/sections/projects/ProjectsSection";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { CertificationsSection } from "@/components/sections/CertificationsSection";
import type { Metadata } from "next";
import type {
  Award,
  Certification,
  Experience,
  Profile,
  Project,
  TechMarqueeItem,
} from "@/types";

export const revalidate = 60;

interface PortfolioData {
  profile: Profile | null;
  projects: Project[];
  experience: Experience[];
  certifications: Certification[];
  awards: Award[];
  techMarquee: TechMarqueeItem[];
}

const emptyPortfolioData: PortfolioData = {
  profile: null,
  projects: [],
  experience: [],
  certifications: [],
  awards: [],
  techMarquee: [],
};

export async function generateMetadata(): Promise<Metadata> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return {
      title: "Portfolio",
      description: "Full-stack developer portfolio",
    };
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profile")
    .select("full_name_en, tagline_en, avatar_url")
    .maybeSingle();

  const title = profile?.full_name_en ? `${profile.full_name_en} | Portfolio` : "Portfolio";
  const description = profile?.tagline_en || "Full-stack developer portfolio";

  return {
    title,
    description,
    openGraph: {
      title: profile?.full_name_en || "Portfolio",
      description,
      images: profile?.avatar_url ? [{ url: profile.avatar_url }] : [],
    },
  };
}

async function getPortfolioData(): Promise<PortfolioData> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return emptyPortfolioData;
  }

  const supabase = await createClient();

  const [
    { data: profile },
    { data: projects },
    { data: experience },
    { data: certifications },
    { data: awards },
    { data: techMarquee },
  ] = await Promise.all([
    supabase.from("profile").select("*").single(),
    supabase.from("projects").select("*").order("display_order", { ascending: true }),
    supabase.from("experience").select("*").order("display_order", { ascending: true }),
    supabase.from("certifications").select("*").order("display_order", { ascending: true }),
    supabase.from("awards").select("*").order("display_order", { ascending: true }),
    supabase
      .from("tech_marquee")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true }),
  ]);

  return {
    profile,
    projects: projects || [],
    experience: experience || [],
    certifications: certifications || [],
    awards: awards || [],
    techMarquee: techMarquee || [],
  };
}

export default async function HomePage() {
  const { profile, projects, experience, certifications, awards, techMarquee } =
    await getPortfolioData();

  return (
    <div className="min-h-screen bg-surface">
      <Navbar cvUrl={profile?.cv_url ?? null} />
      <main>
        <HeroSection profile={profile} />

        <TechMarquee items={techMarquee} />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <section id="about" className="py-24">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent">
              About Me
            </p>
            <h2 className="font-display text-display-md text-text-primary">
              Crafting digital experiences with purpose
            </h2>
            <p className="mt-5 max-w-3xl text-text-secondary">
              {profile?.bio_short_en ||
                "Profile content will appear here once the Supabase CMS has been populated."}
            </p>
          </section>

          <ProjectsSection projects={projects} />

          <ExperienceSection experiences={experience} />

          <CertificationsSection certifications={certifications} awards={awards} />

          <ContactSection />
        </div>
      </main>
      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 text-sm text-text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <span>
            Copyright {new Date().getFullYear()} {profile?.full_name_en || "Portfolio"}. All
            rights reserved.
          </span>
          <a
            href="/admin/login"
            rel="nofollow noindex"
            className="text-xs text-text-muted/50 transition-colors hover:text-text-primary"
            aria-label="Admin login"
          >
            ·
          </a>
        </div>
      </footer>
    </div>
  );
}
