import { supabase } from "../supabaseClient";

export const generateInitialPlan = async (userId: string) => {
  try {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (!profile) throw new Error("Профиль не найден в БД");

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin
      },
      body: JSON.stringify({
        "model": "google/gemini-flash-1.5",
        "messages": [
          { "role": "system", "content": "Ты тренер. Отвечай ТОЛЬКО чистым JSON массивом." },
          { "role": "user", "content": `План на 7 дней, уровень ${profile.fitness_level}, цель ${profile.goal_distance_km}км. Формат: [{"scheduled_date": "2026-01-10", "workout_type": "бег", "target_distance_km": 5, "target_pace": "6:00", "description": "тест"}]` }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter HTTP error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;
    if (!content) throw new Error("ИИ вернул пустой ответ");

    const text = content.replace(/```json|```/g, "").trim();
    const plan = JSON.parse(text);

    const { error: insertError } = await supabase.from('training_plans').insert(
      plan.map((w: any) => ({ ...w, user_id: userId }))
    );

    if (insertError) throw new Error(`Ошибка записи в БД: ${insertError.message}`);

    return { success: true };
  } catch (err: any) {
    // ВАЖНО: это покажет ошибку прямо на экране
    alert("КРИТИЧЕСКАЯ ОШИБКА: " + err.message);
    console.error(err);
    return { success: false };
  }
};
