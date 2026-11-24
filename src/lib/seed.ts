import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { barbers, services, settings } from "@/db/schema";
import { BARBER_SEED_IMAGES, SERVICE_SEED_IMAGES } from "@/lib/media";
import { DEFAULTS, defaultWeek } from "@/lib/settings";
import { ensureAdminUser } from "@/lib/auth";

let done: Promise<void> | null = null;

/**
 * First-run starter content. Everything seeded here is editable in the admin dashboard.
 * Prices, durations and barber profiles are PLACEHOLDERS until the business supplies real ones.
 */
export function ensureSeeded() {
  if (!done) {
    done = run().catch((e) => {
      done = null;
      throw e;
    });
  }
  return done;
}

async function run() {
  await db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(424242)`);
    const [marker] = await tx.select().from(settings).where(eq(settings.key, "seeded"));
    if (marker) return;

    await tx.insert(services).values([
      {
        slug: "haircuts",
        name: "Haircuts",
        shortDescription: "A precision cut tailored to your head shape, lifestyle and style.",
        description:
          "Consultation, a custom cut with scissors and clippers, a clean neckline and a styled finish. Your barber will talk you through what suits you before the first cut.",
        includes: ["Style consultation", "Clipper & scissor cut", "Neckline clean-up", "Styled finish"],
        priceNgn: 5000,
        durationMin: 45,
        sortOrder: 1,
      },
      {
        slug: "skin-fades",
        name: "Skin Fades",
        shortDescription: "Seamless low, mid, high or burst fades blended to the skin.",
        description:
          "A detailed fade blended from skin to length, finished with a razor line-up. Choose your fade height and we'll handle the rest.",
        includes: ["Low, mid, high or burst fade", "Razor line-up", "Hot towel finish", "Styled finish"],
        priceNgn: 6000,
        durationMin: 50,
        sortOrder: 2,
      },
      {
        slug: "beard-grooming",
        name: "Beard Grooming",
        shortDescription: "Shape, trim and condition for a beard that looks intentional.",
        description: "Beard shaping with clippers and razor, cheek and neck lines, and beard oil to finish.",
        includes: ["Beard shaping", "Razor detailing", "Conditioning oil"],
        priceNgn: 3500,
        durationMin: 30,
        sortOrder: 3,
      },
      {
        slug: "hot-towel-shave",
        name: "Hot Towel Shave",
        shortDescription: "A slow, traditional straight-razor shave with hot towels.",
        description: "Hot towel prep, shaving cream, a straight-razor shave and a soothing aftershave finish.",
        includes: ["Hot towel prep", "Straight-razor shave", "Aftershave balm"],
        priceNgn: 4500,
        durationMin: 30,
        sortOrder: 4,
      },
      {
        slug: "hair-treatment",
        name: "Hair Treatment",
        shortDescription: "Wash, scalp care and conditioning treatments for healthy hair.",
        description: "A deep cleanse and scalp massage followed by a conditioning treatment suited to your hair type.",
        includes: ["Shampoo & scalp massage", "Conditioning treatment", "Towel dry & style"],
        priceNgn: 8000,
        durationMin: 45,
        sortOrder: 5,
      },
      {
        slug: "hair-styling",
        name: "Hair Styling",
        shortDescription: "Quick restyle for events, shoots and big days.",
        description: "Wash-free styling with professional products, finished to hold all day.",
        includes: ["Product consultation", "Blow-dry or texture styling", "Hold finish"],
        priceNgn: 3000,
        durationMin: 30,
        sortOrder: 6,
      },
      {
        slug: "kids-haircuts",
        name: "Kids Haircuts",
        shortDescription: "Patient, friendly cuts for young gentlemen.",
        description: "A comfortable first-class haircut experience for children, with a neat, easy-to-manage finish.",
        includes: ["Clipper & scissor cut", "Neckline clean-up", "Styled finish"],
        priceNgn: 3500,
        durationMin: 30,
        sortOrder: 7,
      },
    ].map((s) => ({ ...s, imageUrl: SERVICE_SEED_IMAGES[s.slug] })));

    const week = defaultWeek();
    await tx.insert(barbers).values([
      {
        name: "Barber One",
        bio: "Placeholder profile — replace with your barber's real biography in Admin › Barbers.",
        specialties: ["Skin fades", "Tapers"],
        photoUrl: BARBER_SEED_IMAGES[0],
        workingHours: week,
        sortOrder: 1,
      },
      {
        name: "Barber Two",
        bio: "Placeholder profile — replace with your barber's real biography in Admin › Barbers.",
        specialties: ["Beard grooming", "Hot towel shaves"],
        photoUrl: BARBER_SEED_IMAGES[1],
        workingHours: week,
        sortOrder: 2,
      },
      {
        name: "Barber Three",
        bio: "Placeholder profile — replace with your barber's real biography in Admin › Barbers.",
        specialties: ["Afro & textured hair", "Kids cuts"],
        photoUrl: BARBER_SEED_IMAGES[2],
        workingHours: week,
        sortOrder: 3,
      },
    ]);

    for (const [key, value] of Object.entries(DEFAULTS)) {
      await tx.insert(settings).values({ key, value }).onConflictDoNothing();
    }
    await tx.insert(settings).values({ key: "seeded", value: true }).onConflictDoNothing();
  });
  await ensureAdminUser();
}
