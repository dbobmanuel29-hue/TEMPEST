import { sql } from "drizzle-orm";
import {
  boolean,
  customType,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import type { RescheduleRequest, WeekHours } from "@/lib/types";

const bytea = customType<{ data: Buffer }>({
  dataType() {
    return "bytea";
  },
});

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  passwordHash: text("password_hash"),
  googleId: text("google_id").unique(),
  avatarUrl: text("avatar_url"),
  role: text("role").notNull().default("customer"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  tokenHash: text("token_hash").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

export const passwordResets = pgTable("password_resets", {
  tokenHash: text("token_hash").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
});

export const services = pgTable("services", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  shortDescription: text("short_description").notNull().default(""),
  description: text("description").notNull().default(""),
  includes: jsonb("includes").$type<string[]>().notNull().default([]),
  priceNgn: integer("price_ngn").notNull().default(0),
  durationMin: integer("duration_min").notNull().default(30),
  imageUrl: text("image_url").notNull().default(""),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const barbers = pgTable("barbers", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  bio: text("bio").notNull().default(""),
  specialties: jsonb("specialties").$type<string[]>().notNull().default([]),
  photoUrl: text("photo_url").notNull().default(""),
  workingHours: jsonb("working_hours").$type<WeekHours>().notNull(),
  unavailableDates: jsonb("unavailable_dates").$type<string[]>().notNull().default([]),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").$type<unknown>().notNull(),
});

export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reference: text("reference").notNull().unique(),
    serviceId: uuid("service_id").references(() => services.id, { onDelete: "set null" }),
    serviceName: text("service_name").notNull(),
    durationMin: integer("duration_min").notNull(),
    priceNgn: integer("price_ngn").notNull(),
    barberId: uuid("barber_id").references(() => barbers.id, { onDelete: "set null" }),
    barberName: text("barber_name").notNull(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    customerName: text("customer_name").notNull(),
    customerPhone: text("customer_phone").notNull(),
    customerEmail: text("customer_email").notNull(),
    notes: text("notes").notNull().default(""),
    date: text("date").notNull(),
    startMin: integer("start_min").notNull(),
    endMin: integer("end_min").notNull(),
    status: text("status").notNull().default("pending"),
    paymentMethod: text("payment_method").notNull().default("pay_at_shop"),
    paymentStatus: text("payment_status").notNull().default("unpaid"),
    amountDueNgn: integer("amount_due_ngn").notNull().default(0),
    rescheduleRequest: jsonb("reschedule_request").$type<RescheduleRequest | null>(),
    reminderSentAt: timestamp("reminder_sent_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    cancelledBy: text("cancelled_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    // Last line of defence against double-booking: one live booking per barber/date/start.
    uniqueIndex("bookings_live_slot_unique")
      .on(t.barberId, t.date, t.startMin)
      .where(sql`${t.status} not in ('cancelled','no_show')`),
  ],
);

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  bookingId: uuid("booking_id").references(() => bookings.id, { onDelete: "set null" }),
  provider: text("provider").notNull(), // paystack | cash | bank_transfer | pos
  reference: text("reference").unique(),
  amountNgn: integer("amount_ngn").notNull(),
  status: text("status").notNull().default("success"),
  note: text("note").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
  rating: integer("rating").notNull(),
  body: text("body").notNull(),
  status: text("status").notNull().default("pending"), // pending | approved | rejected
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const contactMessages = pgTable("contact_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  kind: text("kind").notNull(),
  recipient: text("recipient").notNull(),
  subject: text("subject").notNull(),
  status: text("status").notNull(), // sent | failed | not_configured
  error: text("error"),
  bookingId: uuid("booking_id").references(() => bookings.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const media = pgTable("media", {
  id: uuid("id").defaultRandom().primaryKey(),
  mime: text("mime").notNull(),
  data: bytea("data").notNull(),
  uploadedBy: uuid("uploaded_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
