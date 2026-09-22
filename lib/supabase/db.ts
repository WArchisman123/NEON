import { Pool } from "pg";
import type { QueryResult, QueryResultRow } from "pg";

declare global {
  var _neonPgPool: Pool | undefined;
  var _neonPgPoolConnString: string | undefined;
}

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres.mzumlzmfjgzvycebqask:VncVw2WsMG3RL70u@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres";

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

  const newPool = new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    ssl: { rejectUnauthorized: false },
  });

  if (process.env.NODE_ENV !== "production") {
    global._neonPgPool = newPool;
    global._neonPgPoolConnString = connectionString;
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
