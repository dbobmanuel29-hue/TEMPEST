import { db } from "@/db";
import { media } from "@/db/schema";
import { HttpError, ok, rateLimit, requireUser, route } from "@/lib/api";

const TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX = 2 * 1024 * 1024;

export const POST = route(async (req) => {
  rateLimit(req, "upload", 30, 600_000);
  const me = await requireUser();
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) throw new HttpError("No file uploaded.");
  if (!TYPES.includes(file.type)) throw new HttpError("Only JPG, PNG or WebP images are allowed.");
  if (file.size > MAX) throw new HttpError("Image must be 2 MB or smaller.");
  const [row] = await db
    .insert(media)
    .values({ mime: file.type, data: Buffer.from(await file.arrayBuffer()), uploadedBy: me.id })
    .returning({ id: media.id });
  return ok({ url: `/api/media/${row.id}` }, 201);
});
