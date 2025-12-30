import nodemailer from "nodemailer";

export async function sendLoginCodeEmail(toEmail: string, code: string) {
  const from = process.env.SMTP_FROM || "no-reply@runcoach.local";

  // If SMTP isn't configured, we run in "dev mail" mode (prints to server logs).
  if (!process.env.SMTP_HOST) {
    console.log("[DEV MAIL] Login code for", toEmail, "=>", code);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || "false") === "true",
    auth: process.env.SMTP_USER ? {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    } : undefined,
  });

  await transporter.sendMail({
    from,
    to: toEmail,
    subject: "Код входа в RUN coach",
    text: `Ваш код входа: ${code}

Он действует 10 минут.`,
  });
}
