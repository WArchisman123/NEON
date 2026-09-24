import { Pool } from "pg";
import type { QueryResult, QueryResultRow } from "pg";

declare global {
  var _neonPgPool: Pool | undefined;
  var _neonPgPoolConnString: string | undefined;
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    "[db] DATABASE_URL environment variable is not set. " +
    "Add it to your .env.local (local) or Vercel Environment Variables (production)."
  );
}

const connectionString = process.env.DATABASE_URL;

function getPool(): Pool {
  if (
    global._neonPgPool &&
    global._neonPgPoolConnString === connectionString
  ) {
    return global._neonPgPool;
  }

  // If a pool already exists but connection string changed, end it
  if (global._neonPgPool) {
    global._neonPgPool.end().catch(() => {});
  }

  // In serverless (Vercel), each function instance is isolated.
  // Use max:1 to avoid connection exhaustion across concurrent invocations.
  const newPool = new Pool({
    connectionString,
    max: process.env.NODE_ENV === "production" ? 1 : 10,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
    ssl: { rejectUnauthorized: false },
  });

  newPool.on("error", (err) => {
    console.error("[db] Unexpected pool client error:", err.message);
  });

  // Always cache the pool globally (dev AND prod) so it survives
  // within the same serverless function instance lifetime
  global._neonPgPool = newPool;
  global._neonPgPoolConnString = connectionString;

  if (process.env.NODE_ENV !== "production") {
    const sanitized = connectionString.replace(/:[^:@]+@/, ":****@");
    console.log(`[db] PostgreSQL pool initialized targeting: ${sanitized}`);
  }

  return newPool;
}

export const pool: Pool = getPool();

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  const activePool = getPool();
  const start = Date.now();
  const res = await activePool.query<T>(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV !== "production" && duration > 500) {
    console.warn(`[db:slow-query] ${duration}ms: ${text.slice(0, 100)}...`);
  }
  return res;
}
