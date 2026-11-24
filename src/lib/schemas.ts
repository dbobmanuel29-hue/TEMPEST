import { z } from "zod";
import { defaultWeek } from "@/lib/settings";

const hhmm = z.string().regex(/^\d{2}:\d{2}$/);

export const serviceSchema = z.object({
  name: z.string().trim().min(2).max(80),
  shortDescription: z.string().trim().max(200).default(""),
  description: z.string().trim().max(1500).default(""),
  includes: z.array(z.string().trim().min(1).max(80)).max(12).default([]),
  priceNgn: z.number().int().min(0).max(10_000_000),
  durationMin: z.number().int().min(5).max(480),
  imageUrl: z.string().max(400).default(""),
  active: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const barberSchema = z.object({
  name: z.string().trim().min(2).max(80),
  bio: z.string().trim().max(600).default(""),
  specialties: z.array(z.string().trim().min(1).max(40)).max(8).default([]),
  photoUrl: z.string().max(400).default(""),
  workingHours: z.record(z.string(), z.object({ open: z.boolean(), start: hhmm, end: hhmm })).default(defaultWeek()),
  unavailableDates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).max(400).default([]),
  active: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});
