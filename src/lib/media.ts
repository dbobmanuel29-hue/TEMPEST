/** Curated photography (Pexels, free licence). Swap for your own shoots any time. */
export const px = (id: number, w = 900, h?: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=${w}${h ? `&h=${h}` : ""}`;

export const IMG = {
  hero: px(39559325, 1100, 1400),
  cape: px(7697211, 900, 1200),
  interior: px(3992850, 1400, 1000),
  interiorWide: px(7195806, 1600, 900),
  interiorChairs: px(7195805, 1200, 800),
  clipper: px(7697225, 1000, 1200),
  cutting: px(19664892, 1000, 1200),
  detail: px(3037244, 1000, 800),
  newsletter: px(4625626, 1400, 1000),
};

export const SERVICE_SEED_IMAGES: Record<string, string> = {
  haircuts: px(7697216, 800, 1000),
  "skin-fades": px(13450758, 800, 1000),
  "beard-grooming": px(41122205, 800, 1000),
  "hot-towel-shave": px(12302334, 800, 1000),
  "hair-treatment": px(19762215, 800, 1000),
  "hair-styling": px(11169556, 800, 1000),
  "kids-haircuts": px(7697356, 800, 1000),
};

export const BARBER_SEED_IMAGES = [px(20302331, 700, 900), px(7697430, 700, 900), px(20302333, 700, 900)];

export const GALLERY_CATEGORIES = [
  "Low Fade",
  "Mid Fade",
  "High Fade",
  "Burst Fade",
  "Taper Fade",
  "Afro",
  "Waves",
  "Dreadlocks",
  "Beard Styles",
] as const;

export type GalleryItem = { id: number; category: (typeof GALLERY_CATEGORIES)[number]; ratio: "tall" | "square" | "wide"; alt: string };

export const GALLERY: GalleryItem[] = [
  { id: 12074386, category: "Low Fade", ratio: "wide", alt: "Rear view of a sharp low fade" },
  { id: 6487911, category: "Low Fade", ratio: "tall", alt: "Close crop low fade from behind" },
  { id: 4625632, category: "Mid Fade", ratio: "wide", alt: "Mid fade being finished with clippers" },
  { id: 9971240, category: "Mid Fade", ratio: "square", alt: "Mid fade detail with trimmer and comb" },
  { id: 13450758, category: "High Fade", ratio: "tall", alt: "High fade clipper work" },
  { id: 4663135, category: "High Fade", ratio: "square", alt: "High fade close-up" },
  { id: 39559305, category: "Burst Fade", ratio: "wide", alt: "Burst fade styling in the chair" },
  { id: 4625626, category: "Burst Fade", ratio: "tall", alt: "Burst fade finish" },
  { id: 12304510, category: "Taper Fade", ratio: "tall", alt: "Taper fade with razor line-up" },
  { id: 4351727, category: "Taper Fade", ratio: "square", alt: "Taper fade precision trim" },
  { id: 19112533, category: "Afro", ratio: "tall", alt: "Shaped afro with turtleneck" },
  { id: 3966276, category: "Afro", ratio: "wide", alt: "Close-up afro portrait" },
  { id: 35383840, category: "Afro", ratio: "tall", alt: "Afro profile portrait" },
  { id: 39945585, category: "Waves", ratio: "tall", alt: "Wave haircut with sunglasses" },
  { id: 26360302, category: "Waves", ratio: "tall", alt: "Short textured waves at sunset" },
  { id: 9374359, category: "Dreadlocks", ratio: "tall", alt: "Monochrome dreadlocks portrait" },
  { id: 12319556, category: "Dreadlocks", ratio: "wide", alt: "Dreadlocks with a full beard" },
  { id: 4275692, category: "Dreadlocks", ratio: "square", alt: "Blonde dreadlocks close-up" },
  { id: 5853395, category: "Beard Styles", ratio: "wide", alt: "Beard being sculpted" },
  { id: 9153970, category: "Beard Styles", ratio: "square", alt: "Moustache and beard grooming" },
  { id: 2767612, category: "Beard Styles", ratio: "tall", alt: "Full beard with sunglasses" },
];
