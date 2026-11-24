import crypto from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { appUrl } from "@/lib/api";
import { googleConfigured } from "@/lib/settings";

export async function GET(req: Request) {
  if (!googleConfigured()) return NextResponse.redirect(new URL("/login?error=google_not_configured", appUrl(req)));
  const state = crypto.randomBytes(16).toString("hex");
  (await cookies()).set("tb_oauth_state", state, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 600 });
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: `${appUrl(req)}/api/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });
  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
}
