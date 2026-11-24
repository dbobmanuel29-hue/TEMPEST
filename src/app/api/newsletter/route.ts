import { z } from "zod";
import { db } from "@/db";
import { newsletterSubscribers } from "@/db/schema";
import { ok, rateLimit, route } from "@/lib/api";

const schema = z.object({ email: z.email("Enter a valid email address").max(200) });

// Subscribers are stored in our own database (Admin › Inbox). Connect an email provider
// (Resend audiences, Mailchimp…) to actually send campaigns — none are sent automatically.
export const POST = route(async (req) => {
  rateLimit(req, "newsletter", 6, 600_000);
  const { email } = schema.parse(await req.json());
  await db.insert(newsletterSubscribers).values({ email: email.toLowerCase() }).onConflictDoNothing();
  return ok({ ok: true });
});
