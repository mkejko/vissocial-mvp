import pg from "pg";
import { config } from "./config";

const { Pool } = pg;

const connectionString = config.dbUrl;
console.log("🔍 DATABASE_URL:", connectionString);

const url = new URL(connectionString);

console.log("🔍 Parsed connection:");
console.log("  host:", url.hostname);
console.log("  port:", url.port || "5432");
console.log("  database:", url.pathname.slice(1));
console.log("  user:", url.username);
console.log("  password:", url.password ? "***" : "(empty)");

const isProd = process.env.NODE_ENV === "production";

export const pool = new Pool({
  host: url.hostname,
  port: parseInt(url.port || "5432"),
  database: url.pathname.slice(1),
  user: url.username,
  password: url.password,

  // 🔑 OVO JE KLJUČ
  ssl: isProd
    ? { rejectUnauthorized: false }
    : false,
});

export async function q<T>(text: string, params: any[] = []): Promise<T[]> {
  const res = await pool.query(text, params);
  return res.rows as T[];
}
