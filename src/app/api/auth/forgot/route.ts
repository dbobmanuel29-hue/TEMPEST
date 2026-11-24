import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { passwordResets, users } from "@/db/schema";
import { appUrl, ok, rateLimit, route } from "@/lib/api";
import { sha256 } from "@/lib/auth";
import { sendEmail } from "@/lib/notify";
import { emailConfigured } from "@/lib/settings";

const schema = z.object({ email: z.email().transform((s) => s.toLowerCase()) });

export const POST = route(async (req) => {
  rateLimit(req, "forgot", 5, 600_000);
  const { email } = schema.parse(await req.json());
  const [u] = await db.select().from(users).where(eq(users.email, email));
  if (u && u.passwordHash) {
    const token = crypto.randomBytes(32).toString("hex");
    await db.insert(passwordResets).values({ tokenHash: sha256(token), userId: u.id, expiresAt: new Date(Date.now() + 3600_000) });
    await sendEmail({
      to: u.email,
      kind: "password_reset",
      subject: "Reset your Tempest password",
      text: `Hi ${u.name},\n\nUse this link to choose a new password (valid for 1 hour):\n${appUrl(req)}/reset-password?token=${token}\n\nIf you didn't ask for this, ignore this email.`,
    });
  }
  // Same response either way so email addresses can't be probed.
  return ok({ ok: true, emailConfigured: emailConfigured() });
});
