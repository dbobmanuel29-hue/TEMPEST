import { z } from "zod";
import { db } from "@/db";
import { reviews } from "@/db/schema";
import { ok, rateLimit, requireUser, route } from "@/lib/api";

const schema = z.object({
  rating: z.number().int().min(1).max(5),
  body: z.string().trim().min(10, "Please write at least a sentence").max(800),
});

// Only signed-in customers can submit; every review is held for admin moderation.
export const POST = route(async (req) => {
  rateLimit(req, "review", 5, 3600_000);
  const me = await requireUser();
  const d = schema.parse(await req.json());
  await db.insert(reviews).values({ userId: me.id, name: me.name, avatarUrl: me.avatarUrl, rating: d.rating, body: d.body });
  return ok({ ok: true }, 201);
});
