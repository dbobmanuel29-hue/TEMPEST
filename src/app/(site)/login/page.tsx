import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { AuthShell } from "@/components/AuthShell";
import { getUser } from "@/lib/auth";
import { googleConfigured } from "@/lib/settings";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

const ERRORS: Record<string, string> = {
  google_not_configured: "Google sign-in isn't configured on this site yet.",
  google_failed: "Google sign-in failed. Please try again or use your email.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  const user = await getUser();
  if (user) redirect(user.role === "admin" ? "/admin" : next?.startsWith("/") && !next.startsWith("//") ? next : "/account");
  return (
    <AuthShell title="Welcome back" subtitle="Sign in to manage your appointments. You can also book as a guest — no account needed.">
      {error && ERRORS[error] && <p role="alert" className="mb-4 border-l-4 border-cobalt bg-white p-3 text-sm">{ERRORS[error]}</p>}
      <AuthForm mode="login" google={googleConfigured()} next={next} />
    </AuthShell>
  );
}
