import { NextResponse } from "next/server";
import { z } from "zod";
import { requestLoginCode } from "@/lib/auth";
import { sendLoginCodeEmail } from "@/lib/mailer";

export async function POST(req: Request) {
  const form = await req.formData();
  const email = String(form.get("email") || "").trim().toLowerCase();

  const schema = z.string().email();
  const parsed = schema.safeParse(email);
  if (!parsed.success) {
    return NextResponse.redirect(new URL("/app?err=bad_email", req.url));
  }

  const { code } = requestLoginCode(email);
  await sendLoginCodeEmail(email, code);

  return NextResponse.redirect(new URL("/app?ok=code_sent", req.url));
}
