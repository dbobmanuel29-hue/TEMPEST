import { DAY_NAMES, fmtMin, toMin } from "@/lib/time";
import type { BusinessSettings } from "@/lib/types";

/** e.g. "Mon, Tue, Wed, Thu, Fri · 09:00–20:00" style summary of a barber's working week. */
export function workingSummary(wh: Record<string, { open: boolean; start: string; end: string }>) {
  const days = [1, 2, 3, 4, 5, 6, 0].filter((d) => wh[String(d)]?.open);
  if (!days.length) return "No regular working days set";
  return days.map((d) => `${DAY_NAMES[d].slice(0, 3)} ${fmtMin(toMin(wh[String(d)].start))}–${fmtMin(toMin(wh[String(d)].end))}`).join(" · ");
}

/** Monday-first list of opening hours for display. */
export function hoursList(b: BusinessSettings) {
  return [1, 2, 3, 4, 5, 6, 0].map((d) => {
    const h = b.hours[String(d)];
    return { day: DAY_NAMES[d], text: h?.open ? `${fmtMin(toMin(h.start))} – ${fmtMin(toMin(h.end))}` : "Closed" };
  });
}
