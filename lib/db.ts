import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dataDir = process.env.DATA_DIR || path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = process.env.SQLITE_PATH || path.join(dataDir, "app.sqlite");
export const db = new Database(dbPath);

export function nowIso() {
  return new Date().toISOString();
}
