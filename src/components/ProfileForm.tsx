"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/Toast";
import { api, uploadImage } from "@/lib/client";

export function ProfileForm({ user }: { user: { name: string; email: string; phone: string | null; avatarUrl: string | null; hasPassword: boolean } }) {
  const router = useRouter();
  const toast = useToast();
  const [f, setF] = useState({ name: user.name, phone: user.phone ?? "" });
  const [avatar, setAvatar] = useState(user.avatarUrl);
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "" });
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api("/api/me", "PATCH", { ...f, avatarUrl: avatar });
      toast("Profile updated.");
      router.refresh();
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setBusy(false);
    }
  }

  async function changePw(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api("/api/me", "PATCH", pw);
      setPw({ currentPassword: "", newPassword: "" });
      toast("Password changed.");
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    await api("/api/auth/logout", "POST");
    router.push("/");
    router.refresh();
  }

  return (
    <div className="grid gap-10 md:grid-cols-2">
      <form onSubmit={save} className="space-y-4">
        <div className="flex items-center gap-4">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt="Your profile" className="h-20 w-20 rounded-full object-cover" />
          ) : (
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-espresso text-2xl font-bold text-cream">{user.name.charAt(0).toUpperCase()}</span>
          )}
          <label className="btn btn-outline btn-sm cursor-pointer">
            Upload photo
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  setAvatar(await uploadImage(file));
                  toast("Photo uploaded — press Save to keep it.");
                } catch (err) {
                  toast((err as Error).message, "error");
                }
              }}
            />
          </label>
        </div>
        <div><label htmlFor="p-name" className="label">Full name</label><input id="p-name" required className="field" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
        <div><label htmlFor="p-phone" className="label">Phone</label><input id="p-phone" type="tel" className="field" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div>
        <div><label className="label">Email</label><input disabled className="field opacity-60" value={user.email} /></div>
        <button disabled={busy} className="btn btn-primary">Save changes</button>
      </form>

      <div className="space-y-8">
        <form onSubmit={changePw} className="space-y-4">
          <h3 className="display text-xl">{user.hasPassword ? "Change password" : "Set a password"}</h3>
          {user.hasPassword && <div><label htmlFor="p-cur" className="label">Current password</label><input id="p-cur" type="password" required className="field" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} autoComplete="current-password" /></div>}
          <div><label htmlFor="p-new" className="label">New password</label><input id="p-new" type="password" required minLength={8} className="field" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} autoComplete="new-password" /></div>
          <button disabled={busy} className="btn btn-dark">Update password</button>
        </form>
        <div className="border-t border-espresso/20 pt-6">
          <button onClick={logout} className="btn btn-outline">Sign out</button>
        </div>
      </div>
    </div>
  );
}
