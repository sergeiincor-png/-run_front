import { db, nowIso } from "./db";
import crypto from "crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE = "runcoach_session";

export type User = { id: string; email: string };

function randomCode(): string {
  // 6 digits
  return String(Math.floor(100000 + Math.random() * 900000));
}

function randomId(prefix: string) {
  return prefix + "_" + crypto.randomBytes(16).toString("hex");
}

export function requestLoginCode(email: string) {
  const code = randomCode();
  const createdAt = nowIso();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min

  db.prepare("DELETE FROM login_codes WHERE email = ?").run(email);
  db.prepare("INSERT INTO login_codes (email, code, expires_at, created_at) VALUES (?,?,?,?)")
    .run(email, code, expiresAt, createdAt);

  return { code, expiresAt };
}

export function verifyLoginCode(email: string, code: string): User | null {
  const row = db.prepare("SELECT code, expires_at FROM login_codes WHERE email = ?").get(email) as any;
  if (!row) return null;
  if (row.code !== code) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) return null;

  // ensure user
  let user = db.prepare("SELECT id, email FROM users WHERE email = ?").get(email) as any;
  if (!user) {
    const id = randomId("usr");
    db.prepare("INSERT INTO users (id, email, created_at) VALUES (?,?,?)").run(id, email, nowIso());
    user = { id, email };
  }

  db.prepare("DELETE FROM login_codes WHERE email = ?").run(email);
  return user as User;
}

export function createSession(userId: string) {
  const token = randomId("sess");
  const createdAt = nowIso();
  const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(); // 14 days
  db.prepare("INSERT INTO sessions (token, user_id, expires_at, created_at) VALUES (?,?,?,?)")
    .run(token, userId, expiresAt, createdAt);
  return { token, expiresAt };
}

export function setSessionCookie(token: string, expiresAtIso: string) {
  const jar = cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(expiresAtIso),
  });
}

export function clearSessionCookie() {
  const jar = cookies();
  jar.set(SESSION_COOKIE, "", { path: "/", expires: new Date(0) });
}

export function getUserFromRequest(): User | null {
  const jar = cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = db.prepare("SELECT user_id, expires_at FROM sessions WHERE token = ?").get(token) as any;
  if (!session) return null;
  if (new Date(session.expires_at).getTime() < Date.now()) return null;

  const user = db.prepare("SELECT id, email FROM users WHERE id = ?").get(session.user_id) as any;
  if (!user) return null;
  return user as User;
}

export function requireUser(): User {
  const user = getUserFromRequest();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}
