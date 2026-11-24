export const TZ = "Africa/Lagos";

/** Current date (YYYY-MM-DD) and minutes-since-midnight in the business timezone. */
export function nowLagos() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const g = (t: string) => parts.find((p) => p.type === t)!.value;
  let h = Number(g("hour"));
  if (h === 24) h = 0;
  return { date: `${g("year")}-${g("month")}-${g("day")}`, minutes: h * 60 + Number(g("minute")) };
}

export const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + (m || 0);
};

export const fmtMin = (m: number) => {
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return `${h % 12 || 12}:${String(mm).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};

export const weekday = (date: string) => new Date(`${date}T00:00:00Z`).getUTCDay();

export const addDays = (date: string, n: number) => {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

export const fmtDate = (date: string, short = false) =>
  new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", {
    weekday: short ? "short" : "long",
    day: "numeric",
    month: short ? "short" : "long",
    year: short ? undefined : "numeric",
    timeZone: "UTC",
  });

export const fmtDuration = (min: number) => {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} hr ${m} min` : `${h} hr`;
};

export const formatNaira = (n: number) => `₦${n.toLocaleString("en-US")}`;

export const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const isDateString = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s));
