import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";
import { AuthShell } from "@/components/AuthShell";

export const metadata: Metadata = { title: "Forgot password", robots: { index: false } };

export default function ForgotPage() {
  return (
    <AuthShell title="Forgot password" subtitle="Enter your email and we'll send you a link to choose a new password.">
      <AuthForm mode="forgot" />
    </AuthShell>
  );
}
