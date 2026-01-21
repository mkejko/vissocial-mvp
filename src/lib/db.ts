import pg from "pg";
import { config } from "./config";

const { Pool } = pg;

// DATABASE_URL mora doći iz env-a (Vercel / Railway / local)
const connectionString = config.dbUrl;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

console.log("🔍 DATABASE_URL:", connectionString);

// Parse URL
const url = new URL(connectionString);

console.log("🔍 Parsed connection:");
console.log("  host:", url.hostname);
console.log("  port:", url.port || "5432");
console.log("  database:", url.pathname.slice(1));
console.log("  user:", url.username);
console.log("  password:", url.password ? "***" : "(empty)");

// ⬇⬇⬇ KLJUČNO: SSL ZA NEON ⬇⬇⬇
export const pool = new Pool({
  host: url.hostname,
  port: parseInt(url.port || "5432", 10),
  database: url.pathname.slice(1),
  user: url.username,
  password: url.password,
  ssl: {
    rejectUnauthorized: false,
  },
});

export async function q<T = any>(
  text: string,
  params: any[] = []
): Promise<T[]> {
  const res = await pool.query(text, params);
  return res.rows as T[];
}
