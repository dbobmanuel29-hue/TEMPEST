import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { AuthShell } from "@/components/AuthShell";
import { getUser } from "@/lib/auth";
import { googleConfigured } from "@/lib/settings";

export const metadata: Metadata = { title: "Create account", robots: { index: false } };

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  if (await getUser()) redirect("/account");
  return (
    <AuthShell title="Create account" subtitle="Save your details, view booking history and manage appointments in one place.">
      <AuthForm mode="register" google={googleConfigured()} next={next} />
    </AuthShell>
  );
}
