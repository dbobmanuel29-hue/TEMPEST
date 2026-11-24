import { and, eq, isNull } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { bookings, users } from "@/db/schema";
import { appUrl } from "@/lib/api";
import { createSession, ensureAdminUser } from "@/lib/auth";
import { googleConfigured } from "@/lib/settings";
import { ensureSeeded } from "@/lib/seed";

export async function GET(req: Request) {
  const base = appUrl(req);
  const fail = (code: string) => NextResponse.redirect(new URL(`/login?error=${code}`, base));
  if (!googleConfigured()) return fail("google_not_configured");
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const jar = await cookies();
  const expected = jar.get("tb_oauth_state")?.value;
  jar.delete("tb_oauth_state");
  if (!code || !state || state !== expected) return fail("google_failed");

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${base}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });
    if (!tokenRes.ok) return fail("google_failed");
    const { access_token } = (await tokenRes.json()) as { access_token: string };
    const infoRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const info = (await infoRes.json()) as { sub: string; email?: string; email_verified?: boolean; name?: string; picture?: string };
    if (!info.email || !info.email_verified) return fail("google_failed");
    const email = info.email.toLowerCase();

    await ensureSeeded();
    await ensureAdminUser();
    let [u] = await db.select().from(users).where(eq(users.email, email));
    if (!u) {
      [u] = await db
        .insert(users)
        .values({ name: info.name || email.split("@")[0], email, googleId: info.sub, avatarUrl: info.picture ?? null })
        .returning();
    } else if (!u.googleId) {
      await db.update(users).set({ googleId: info.sub }).where(eq(users.id, u.id));
    }
    await db.update(bookings).set({ userId: u.id }).where(and(eq(bookings.customerEmail, email), isNull(bookings.userId)));
    await createSession(u.id);
    return NextResponse.redirect(new URL(u.role === "admin" ? "/admin" : "/account", base));
  } catch (e) {
    console.error("google oauth", e);
    return fail("google_failed");
  }
}
