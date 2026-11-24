"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/Toast";
import { api } from "@/lib/client";

type Mode = "login" | "register" | "forgot" | "reset";

const safeNext = (n?: string) => (n && n.startsWith("/") && !n.startsWith("//") ? n : "");

export function AuthForm({ mode, google = false, next, token }: { mode: Mode; google?: boolean; next?: string; token?: string }) {
  const router = useRouter();
  const toast = useToast();
  const [f, setF] = useState({ name: "", email: "", phone: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<null | { emailConfigured: boolean }>(null);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  const nx = safeNext(next);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "login") {
        const r = await api<{ role: string }>("/api/auth/login", "POST", { email: f.email, password: f.password });
        router.push(r.role === "admin" && !nx ? "/admin" : nx || "/account");
        router.refresh();
      } else if (mode === "register") {
        await api("/api/auth/register", "POST", f);
        toast("Welcome to Tempest!");
        router.push(nx || "/account");
        router.refresh();
      } else if (mode === "forgot") {
        const r = await api<{ emailConfigured: boolean }>("/api/auth/forgot", "POST", { email: f.email });
        setSent(r);
      } else {
        await api("/api/auth/reset", "POST", { token, password: f.password });
        toast("Password updated. Please sign in.");
        router.push("/login");
      }
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="border-l-4 border-cobalt bg-white p-5 text-sm leading-relaxed">
        If an account exists for <strong>{f.email}</strong>, a reset link has been requested.
        {!sent.emailConfigured && <span className="mt-2 block text-espresso/70">Email delivery is not configured on this site yet, so no message could be sent. Please contact the shop for help.</span>}
      </div>
    );
  }

  const q = nx ? `?next=${encodeURIComponent(nx)}` : "";
  return (
    <form onSubmit={submit} className="space-y-4">
      {mode === "register" && (
        <>
          <div><label htmlFor="a-name" className="label">Full name</label><input id="a-name" required className="field" value={f.name} onChange={set("name")} autoComplete="name" /></div>
          <div><label htmlFor="a-phone" className="label">Phone (optional)</label><input id="a-phone" type="tel" className="field" value={f.phone} onChange={set("phone")} autoComplete="tel" /></div>
        </>
      )}
      {mode !== "reset" && (
        <div><label htmlFor="a-email" className="label">Email</label><input id="a-email" type="email" required className="field" value={f.email} onChange={set("email")} autoComplete="email" /></div>
      )}
      {mode !== "forgot" && (
        <div>
          <label htmlFor="a-pass" className="label">{mode === "reset" ? "New password" : "Password"}</label>
          <input id="a-pass" type="password" required minLength={mode === "login" ? 1 : 8} className="field" value={f.password} onChange={set("password")} autoComplete={mode === "login" ? "current-password" : "new-password"} />
          {mode !== "login" && <p className="mt-1 text-xs text-espresso/60">At least 8 characters.</p>}
        </div>
      )}
      <button disabled={busy} className="btn btn-primary w-full !py-4">
        {busy ? "Please wait…" : { login: "Sign in", register: "Create account", forgot: "Send reset link", reset: "Update password" }[mode]}
      </button>

      {(mode === "login" || mode === "register") && (
        <>
          <div className="flex items-center gap-3 text-xs text-espresso/60"><span className="h-px flex-1 bg-espresso/20" />or<span className="h-px flex-1 bg-espresso/20" /></div>
          {google ? (
            <a href="/api/auth/google" className="btn btn-outline w-full">Continue with Google</a>
          ) : (
            <p className="text-center text-xs text-espresso/60">Google sign-in will appear here once it is configured.</p>
          )}
        </>
      )}

      <div className="flex flex-wrap justify-between gap-2 pt-2 text-sm">
        {mode === "login" && (
          <>
            <Link href="/forgot-password" className="underline hover:text-cobalt">Forgot password?</Link>
            <Link href={`/register${q}`} className="underline hover:text-cobalt">Create an account</Link>
          </>
        )}
        {mode === "register" && <Link href={`/login${q}`} className="underline hover:text-cobalt">Already have an account? Sign in</Link>}
        {(mode === "forgot" || mode === "reset") && <Link href="/login" className="underline hover:text-cobalt">Back to sign in</Link>}
      </div>
    </form>
  );
}
