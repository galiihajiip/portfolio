import type { Metadata } from "next";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { LanguageProvider } from "@/context/LanguageContext";
import { Toaster } from "react-hot-toast";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Portfolio | Full-Stack Developer",
    template: "%s | Portfolio",
  },
  description: "Full-stack developer portfolio showcasing projects, experience, and certifications.",
  keywords: ["portfolio", "developer", "full-stack", "React", "Next.js"],
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "id_ID",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                className: "glass",
                style: {
                  borderRadius: "12px",
                  padding: "12px 16px",
                  fontSize: "14px",
                },
              }}
            />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
