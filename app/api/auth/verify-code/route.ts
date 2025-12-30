import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyLoginCode, createSession, setSessionCookie } from "@/lib/auth";

export async function POST(req: Request) {
  const form = await req.formData();
  const email = String(form.get("email") || "").trim().toLowerCase();
  const code = String(form.get("code") || "").trim();

  const emailOk = z.string().email().safeParse(email).success;
  const codeOk = z.string().regex(/^\d{6}$/).safeParse(code).success;

  if (!emailOk || !codeOk) {
    return NextResponse.redirect(new URL("/app?err=bad_code", req.url));
  }

  const user = verifyLoginCode(email, code);
  if (!user) {
    return NextResponse.redirect(new URL("/app?err=wrong_or_expired", req.url));
  }

  const session = createSession(user.id);
  setSessionCookie(session.token, session.expiresAt);

  return NextResponse.redirect(new URL("/app", req.url));
}
