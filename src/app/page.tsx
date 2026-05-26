import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/sections/HeroSection";
import { TechMarquee } from "@/components/sections/TechMarquee";
import { ContactSection } from "@/components/sections/ContactSection";
import { ProjectsSection } from "@/components/sections/projects/ProjectsSection";
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

          <section id="experience" className="py-24">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent">
              Career
            </p>
            <h2 className="font-display text-display-md text-text-primary">Work Experience</h2>
            <div className="mt-8 space-y-4">
              {experience.length > 0 ? (
                experience.map((item) => (
                  <article key={item.id} className="rounded-2xl border border-border p-5">
                    <h3 className="font-display text-xl text-text-primary">{item.role_en}</h3>
                    <p className="text-text-secondary">{item.company_name}</p>
                  </article>
                ))
              ) : (
                <p className="text-text-secondary">
                  Experience entries will appear here after the CMS is populated.
                </p>
              )}
            </div>
          </section>

          <section id="certifications" className="py-24">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent">
              Credentials
            </p>
            <h2 className="font-display text-display-md text-text-primary">
              Certifications & Awards
            </h2>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {[...certifications, ...awards].length > 0 ? (
                <>
                  {certifications.map((certification) => (
                    <article
                      key={certification.id}
                      className="rounded-2xl border border-border p-5"
                    >
                      <h3 className="font-display text-lg text-text-primary">
                        {certification.title_en}
                      </h3>
                      <p className="text-sm text-text-secondary">{certification.issuer}</p>
                    </article>
                  ))}
                  {awards.map((award) => (
                    <article key={award.id} className="rounded-2xl border border-border p-5">
                      <h3 className="font-display text-lg text-text-primary">
                        {award.title_en}
                      </h3>
                      <p className="text-sm text-text-secondary">{award.issuer_en}</p>
                    </article>
                  ))}
                </>
              ) : (
                <p className="text-text-secondary">
                  Certifications and awards will appear here after the CMS is populated.
                </p>
              )}
            </div>
          </section>

          <ContactSection />
        </div>
      </main>
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-7xl px-4 text-sm text-text-muted sm:px-6 lg:px-8">
          Copyright {new Date().getFullYear()} {profile?.full_name_en || "Portfolio"}. All
          rights reserved.
        </div>
      </footer>
    </div>
  );
}
