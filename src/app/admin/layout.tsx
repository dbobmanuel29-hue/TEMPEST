import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AdminNav } from "@/components/admin/AdminNav";
import { getAdmin, getUser } from "@/lib/auth";
import { ensureSeeded } from "@/lib/seed";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await ensureSeeded();
  const admin = await getAdmin();
  if (!admin) {
    const u = await getUser();
    redirect(u ? "/account" : "/login?next=/admin");
  }
  return (
    <div className="min-h-screen bg-cream lg:grid lg:grid-cols-[16rem_1fr]">
      <AdminNav name={admin.name} />
      <main id="main" className="min-w-0 p-4 sm:p-6 lg:p-10">{children}</main>
    </div>
  );
}
