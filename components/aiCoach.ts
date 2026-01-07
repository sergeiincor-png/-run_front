import { supabase } from "../supabaseClient";

export const generateInitialPlan = async (userId: string) => {
  try {
    // 1. Получаем данные профиля
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!profile) throw new Error("Профиль не найден");

    // 2. Запрос к OpenRouter
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "google/gemini-flash-1.5", // Выбираем модель через OpenRouter
        "messages": [
          {
            "role": "user",
            "content": `Ты — беговой тренер. Составь план на 7 дней. Уровень: ${profile.fitness_level}, Цель: ${profile.goal_distance_km}км. Верни СТРОГО JSON массив объектов: [{"scheduled_date": "2026-01-08", "workout_type": "легкий бег", "target_distance_km": 5, "target_pace": "6:30", "description": "Пробежка"}]`
          }
        ]
      })
    });

    const result = await response.json();
    const text = result.choices[0].message.content.replace(/```json|```/g, "").trim();
    const plan = JSON.parse(text);

    // 3. Сохраняем в базу
    await supabase.from('training_plans').insert(
      plan.map((w: any) => ({ ...w, user_id: userId }))
    );

    return { success: true };
  } catch (err) {
    console.error("Ошибка ИИ:", err);
    return { success: false };
  }
};
