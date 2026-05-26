import { LoginForm } from "@/components/admin/LoginForm";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="mb-2 font-display text-2xl text-text-primary">
            Admin <span className="text-accent">CMS</span>
          </h1>
          <p className="text-sm text-text-muted">Sign in to manage your portfolio</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
