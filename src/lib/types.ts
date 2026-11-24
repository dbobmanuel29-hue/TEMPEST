export type DayHours = { open: boolean; start: string; end: string };
export type WeekHours = Record<string, DayHours>; // "0" (Sunday) .. "6" (Saturday)

export type Closure = {
  id: string;
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD
  label: string;
  type: "holiday" | "special";
};

export type BreakPeriod = { start: string; end: string; label: string };

export type BusinessSettings = {
  hours: WeekHours;
  breaks: BreakPeriod[];
  closures: Closure[];
  slotInterval: number; // minutes
  leadTimeMinutes: number;
  maxAdvanceDays: number;
  cancelHoursBefore: number;
  autoConfirm: boolean;
};

export type PaymentSettings = {
  payAtShop: boolean;
  bankTransfer: { enabled: boolean; details: string };
  card: { enabled: boolean };
  mode: "none" | "deposit" | "full";
  depositPercent: number;
};

export type ContactSettings = {
  address: string;
  phone: string;
  whatsapp: string; // digits only, international format e.g. 2348000000000
  email: string;
  instagram: string;
  tiktok: string;
  mapQuery: string;
  adminNotifyEmail: string;
};

export type RescheduleRequest = {
  date: string;
  startMin: number | null;
  note: string;
  requestedAt: string;
  status: "open" | "resolved";
};

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled" | "no_show";

export const ACTIVE_STATUSES: BookingStatus[] = ["pending", "confirmed", "completed"];
export const FREE_STATUSES: BookingStatus[] = ["cancelled", "no_show"];
