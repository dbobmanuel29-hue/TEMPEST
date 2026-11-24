import { db } from "@/db";
import { barbers } from "@/db/schema";
import { ok, requireAdmin, route } from "@/lib/api";
import { barberSchema } from "@/lib/schemas";

export const POST = route(async (req) => {
  await requireAdmin();
  const d = barberSchema.parse(await req.json());
  const [row] = await db.insert(barbers).values(d).returning();
  return ok({ barber: row }, 201);
});
