import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { BookingError } from "@/lib/availability";
import { getAdmin, getUser } from "@/lib/auth";

export class HttpError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export const ok = (data: unknown = { ok: true }, status = 200) => NextResponse.json(data, { status });

type Handler<P> = (req: Request, ctx: { params: Promise<P> }) => Promise<Response>;

/** Wraps a route handler with consistent error handling. */
export function route<P = Record<string, never>>(fn: Handler<P>) {
  return async (req: Request, ctx: { params: Promise<P> }) => {
    try {
      return await fn(req, ctx);
    } catch (err) {
      if (err instanceof ZodError) {
        const issue = err.issues[0];
        const field = issue?.path.join(".");
        return NextResponse.json({ error: `${field ? field + ": " : ""}${issue?.message ?? "Invalid input"}` }, { status: 400 });
      }
      if (err instanceof HttpError || err instanceof BookingError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      console.error("[api]", err);
      return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
    }
  };
}

export async function requireAdmin() {
  const u = await getAdmin();
  if (!u) throw new HttpError("Forbidden", 403);
  return u;
}

export async function requireUser() {
  const u = await getUser();
  if (!u) throw new HttpError("Please sign in first.", 401);
  return u;
}

const hits = new Map<string, number[]>();
/** Small in-memory rate limiter (per server instance). */
export function rateLimit(req: Request, name: string, max: number, windowMs: number) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const key = `${name}:${ip}`;
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  if (list.length >= max) throw new HttpError("Too many attempts. Please wait a moment and try again.", 429);
  list.push(now);
  hits.set(key, list);
}

export function appUrl(req?: Request) {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  if (req) {
    const u = new URL(req.url);
    const proto = req.headers.get("x-forwarded-proto") ?? u.protocol.replace(":", "");
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? u.host;
    return `${proto}://${host}`;
  }
  return "http://localhost:3000";
}
