import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { openRouterChat } from "@/lib/openrouter";
import { planSystemPrompt } from "@/lib/prompts";
import { db, nowIso } from "@/lib/db";

const schema = z.object({
  distance_km: z.enum(["5","10"]),
  days_per_week: z.enum(["2","3","4"]),
  start_date: z.string().min(8),
  race_date: z.string().min(8),
  hr_max: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  let user;
  try {
    user = requireUser();
  } catch {
    return NextResponse.redirect(new URL("/app?err=unauthorized", req.url));
  }

  const form = await req.formData();
  const payload = {
    distance_km: String(form.get("distance_km") || "5"),
    days_per_week: String(form.get("days_per_week") || "3"),
    start_date: String(form.get("start_date") || ""),
    race_date: String(form.get("race_date") || ""),
    hr_max: form.get("hr_max") ? String(form.get("hr_max")) : undefined,
    notes: form.get("notes") ? String(form.get("notes")) : undefined,
  };

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.redirect(new URL("/app?err=bad_form", req.url));
  }

  const hrMaxNum = parsed.data.hr_max ? Number(parsed.data.hr_max) : null;

  const userMsg = `
Собери план.
Дистанция: ${parsed.data.distance_km} км
Старт подготовки: ${parsed.data.start_date}
Дата забега: ${parsed.data.race_date}
Тренировок в неделю: ${parsed.data.days_per_week}
Макс пульс (если есть): ${hrMaxNum ?? "не знаю"}
Доп. заметки: ${parsed.data.notes ?? "нет"}

Очень важно: новичок. Делай безопасно. Пиши дружелюбно, как тренер в телеге.
`.trim();

  let result: string;
  try {
    result = await openRouterChat([
      { role: "system", content: planSystemPrompt() },
      { role: "user", content: userMsg },
    ]);
  } catch (e: any) {
    const msg = String(e?.message || e);
    const fallback = `Ошибка генерации плана: ${msg}

Проверь OPENROUTER_API_KEY и модель в .env`;
    // store anyway
    db.prepare("INSERT INTO kv (key, value, updated_at) VALUES (?,?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at")
      .run(`plan:${user.id}:latest`, fallback, nowIso());
    return NextResponse.redirect(new URL("/app/plan", req.url));
  }

  db.prepare("INSERT INTO kv (key, value, updated_at) VALUES (?,?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at")
    .run(`plan:${user.id}:latest`, result, nowIso());

  return NextResponse.redirect(new URL("/app/plan", req.url));
}
