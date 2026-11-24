import type { barbers, reviews, services } from "@/db/schema";
import { BARBER_SEED_IMAGES, SERVICE_SEED_IMAGES } from "@/lib/media";
import { defaultWeek } from "@/lib/week";

type Service = typeof services.$inferSelect;
type Barber = typeof barbers.$inferSelect;
type Review = typeof reviews.$inferSelect;

const serviceRows = [
  ["haircuts","Haircuts","A precision cut tailored to your head shape, lifestyle and style.","Consultation, a custom cut with scissors and clippers, a clean neckline and a styled finish.",["Style consultation","Clipper & scissor cut","Neckline clean-up","Styled finish"],5000,45],
  ["skin-fades","Skin Fades","Seamless low, mid, high or burst fades blended to the skin.","A detailed fade blended from skin to length, finished with a razor line-up.",["Low, mid, high or burst fade","Razor line-up","Hot towel finish","Styled finish"],6000,50],
  ["beard-grooming","Beard Grooming","Shape, trim and condition for a beard that looks intentional.","Beard shaping with clippers and razor, cheek and neck lines, and beard oil to finish.",["Beard shaping","Razor detailing","Conditioning oil"],3500,30],
  ["hot-towel-shave","Hot Towel Shave","A slow, traditional straight-razor shave with hot towels.","Hot towel prep, shaving cream, a straight-razor shave and a soothing aftershave finish.",["Hot towel prep","Straight-razor shave","Aftershave balm"],4500,30],
  ["hair-treatment","Hair Treatment","Wash, scalp care and conditioning treatments for healthy hair.","A deep cleanse and scalp massage followed by a conditioning treatment suited to your hair type.",["Shampoo & scalp massage","Conditioning treatment","Towel dry & style"],8000,45],
  ["hair-styling","Hair Styling","Quick restyle for events, shoots and big days.","Wash-free styling with professional products, finished to hold all day.",["Product consultation","Blow-dry or texture styling","Hold finish"],3000,30],
  ["kids-haircuts","Kids Haircuts","Patient, friendly cuts for young gentlemen.","A comfortable haircut experience for children, with a neat, easy-to-manage finish.",["Clipper & scissor cut","Neckline clean-up","Styled finish"],3500,30],
].map(([slug,name,shortDescription,description,includes,priceNgn,durationMin], index) => ({
  id: String(slug),
  slug: String(slug),
  name: String(name),
  shortDescription: String(shortDescription),
  description: String(description),
  includes: includes as string[],
  priceNgn: Number(priceNgn),
  durationMin: Number(durationMin),
  imageUrl: SERVICE_SEED_IMAGES[String(slug)],
  active: true,
  sortOrder: index + 1,
})) as Service[];

const week = defaultWeek();
const barberRows = [
  { id:"barber-one", name:"Barber One", bio:"Showcase profile — replace with a real barber when this becomes a business site.", specialties:["Skin fades","Tapers"], photoUrl:BARBER_SEED_IMAGES[0], workingHours:week, unavailableDates:[], active:true, sortOrder:1 },
  { id:"barber-two", name:"Barber Two", bio:"Showcase profile — replace with a real barber when this becomes a business site.", specialties:["Beard grooming","Hot towel shaves"], photoUrl:BARBER_SEED_IMAGES[1], workingHours:week, unavailableDates:[], active:true, sortOrder:2 },
  { id:"barber-three", name:"Barber Three", bio:"Showcase profile — replace with a real barber when this becomes a business site.", specialties:["Afro & textured hair","Kids cuts"], photoUrl:BARBER_SEED_IMAGES[2], workingHours:week, unavailableDates:[], active:true, sortOrder:3 },
] as unknown as Barber[];

export async function getServices(opts: { includeInactive?: boolean } = {}) {
  return opts.includeInactive ? serviceRows : serviceRows.filter((service) => service.active);
}
export async function getServiceBySlug(slug: string) {
  return serviceRows.find((service) => service.slug === slug && service.active) ?? null;
}
export async function getBarbers(opts: { includeInactive?: boolean } = {}) {
  return opts.includeInactive ? barberRows : barberRows.filter((barber) => barber.active);
}
/** No customer reviews are fabricated for this frontend showcase. */
export async function getApprovedReviews(_limit?: number): Promise<Review[]> {
  return [];
}
export const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
