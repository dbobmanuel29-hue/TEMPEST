import type { WeekHours } from "@/lib/types";

/** Client-safe default weekly schedule (Mon–Sat open, Sunday closed). */
export const defaultWeek = (): WeekHours => ({
  "0": { open: false, start: "10:00", end: "17:00" },
  "1": { open: true, start: "09:00", end: "20:00" },
  "2": { open: true, start: "09:00", end: "20:00" },
  "3": { open: true, start: "09:00", end: "20:00" },
  "4": { open: true, start: "09:00", end: "20:00" },
  "5": { open: true, start: "09:00", end: "20:00" },
  "6": { open: true, start: "09:00", end: "18:00" },
});
