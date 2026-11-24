import { z } from "zod";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { ok, rateLimit, route } from "@/lib/api";
import { getContact } from "@/lib/settings";
import { sendEmail } from "@/lib/notify";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80),
  email: z.email("Enter a valid email"),
  phone: z.string().trim().max(30).optional().default(""),
  message: z.string().trim().min(5, "Please write a short message").max(1500),
});

export const POST = route(async (req) => {
  rateLimit(req, "contact", 5, 600_000);
  const d = schema.parse(await req.json());
  await db.insert(contactMessages).values({ ...d, phone: d.phone || null });
  const c = await getContact();
  await sendEmail({
    to: c.adminNotifyEmail || process.env.ADMIN_NOTIFY_EMAIL || "",
    kind: "admin_contact_message",
    subject: `New message from ${d.name}`,
    text: `${d.message}\n\n${d.name} · ${d.email} · ${d.phone}`,
  });
  return ok();
});
