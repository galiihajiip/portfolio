import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="space-y-4 text-center">
        <h1 className="font-display text-6xl text-accent">404</h1>
        <h2 className="font-display text-2xl text-text-primary">Page Not Found</h2>
        <p className="text-text-muted">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-accent px-4 py-2 text-sm text-accent-foreground"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
