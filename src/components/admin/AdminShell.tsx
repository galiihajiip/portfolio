"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  Briefcase,
  ChevronRight,
  Cpu,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  User,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/profile", label: "Profile", icon: User },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/experience", label: "Experience", icon: Briefcase },
  { href: "/admin/certifications", label: "Certifications", icon: Award },
  { href: "/admin/tech-marquee", label: "Tech Marquee", icon: Cpu },
  { href: "/admin/messages", label: "Messages", icon: MessageSquare },
];

interface AdminShellProps {
  children: ReactNode;
}

interface SidebarContentProps {
  pathname: string;
  onNavigate: (href: string) => void;
  onSignOut: () => void;
}

function SidebarContent({ pathname, onNavigate, onSignOut }: SidebarContentProps) {
  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-4 py-6">
        <span className="font-display text-lg text-text-primary">
          CMS <span className="text-accent">Admin</span>
        </span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact);

          return (
            <button
              key={href}
              type="button"
              onClick={() => onNavigate(href)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active
                  ? "bg-accent/10 text-accent"
                  : "text-text-secondary hover:bg-surface-subtle hover:text-text-primary",
              )}
            >
              <Icon size={16} />
              {label}
              {active && <ChevronRight size={14} className="ml-auto" />}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-border px-3 py-4">
        <button
          type="button"
          onClick={onSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-secondary transition-all duration-200 hover:bg-red-500/10 hover:text-red-500"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );
}

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    const supabase = createClient();

    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  const handleNavigate = (href: string) => {
    router.push(href);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <aside className="hidden w-60 flex-shrink-0 flex-col border-r border-border bg-surface-elevated lg:flex">
        <SidebarContent
          pathname={pathname}
          onNavigate={handleNavigate}
          onSignOut={handleSignOut}
        />
      </aside>

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 top-0 z-50 w-64 border-r border-border bg-surface-elevated lg:hidden"
            >
              <SidebarContent
                pathname={pathname}
                onNavigate={handleNavigate}
                onSignOut={handleSignOut}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 flex-shrink-0 items-center gap-4 border-b border-border bg-surface-elevated px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-text-secondary hover:text-text-primary lg:hidden"
            aria-label="Open admin navigation"
          >
            <Menu size={20} />
          </button>

          <div className="flex-1" />

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-text-muted transition-colors hover:text-text-secondary"
          >
            View Portfolio -&gt;
          </a>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
