import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/sections/HeroSection";
import { TechMarquee } from "@/components/sections/TechMarquee";
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

          <section id="projects" className="py-24">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent">
              Work
            </p>
            <h2 className="font-display text-display-md text-text-primary">Selected Projects</h2>
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {projects.length > 0 ? (
                projects.map((project) => (
                  <article
                    key={project.id}
                    className="rounded-2xl border border-border bg-surface-elevated p-5"
                  >
                    <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
                      {project.category}
                    </span>
                    <h3 className="mt-3 font-display text-xl text-text-primary">
                      {project.title_en}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-text-secondary">
                      {project.short_description_en}
                    </p>
                  </article>
                ))
              ) : (
                <p className="text-text-secondary">
                  Project entries will appear here after the CMS is populated.
                </p>
              )}
            </div>
          </section>

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

          <section id="contact" className="py-24">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent">
              Get in Touch
            </p>
            <h2 className="font-display text-display-md text-text-primary">
              Let&apos;s build something great
            </h2>
            {profile?.email && (
              <a
                href={`mailto:${profile.email}`}
                className="mt-6 inline-flex rounded-lg bg-accent px-5 py-3 text-sm font-medium text-accent-foreground hover:bg-accent/90"
              >
                {profile.email}
              </a>
            )}
          </section>
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
