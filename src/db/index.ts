import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

/**
 * Frontend showcase mode: the public website can build without a live database.
 * Database-backed API actions remain unavailable until DATABASE_URL is configured.
 */
const databaseUrl = process.env.DATABASE_URL;
const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool(
    databaseUrl
      ? { connectionString: databaseUrl }
      : {
          connectionString: "postgresql://preview:preview@127.0.0.1:5432/preview",
          connectionTimeoutMillis: 1000,
        },
  );

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);
