import { createClient } from "@supabase/supabase-js";

const supabaseUrl = 'https://hiaqscvvxrkfmxufqyur.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpYXFzY3Z2eHJrZm14dWZxeXVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MzM3NTgsImV4cCI6MjA4MzIwOTc1OH0.D_Y_RI2HgOXFPS-nIH5lAv79R2mEwiM3VoT1eaAxKYY';
const supabase = createClient(supabaseUrl, supabaseKey);

export const generateInitialPlan = async (userId: string) => {
  try {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (!profile) throw new Error("Профиль не найден");

    const key = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (!key) throw new Error("API ключ не найден в .env");

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key.trim()}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "openai/gpt-4o-mini",
        "messages": [
          { 
            "role": "system", 
            "content": "Ты профессиональный тренер по бегу. Генерируй СТРОГО JSON массив объектов." 
          },
          { 
            "role": "user", 
            "content": `Создай план на 7 дней. Атлет: уровень ${profile.fitness_level}, цель ${profile.goal_distance_km} км.
            
            Требования к каждому объекту JSON:
            {
              "day_name": "Понедельник",
              "activity": "Краткое название тренировки",
              "dist_val": число (км),
              "dur_str": "время (например, 45 мин)",
              "desc": "ПОДРОБНОЕ описание (200-250 знаков). ВКЛЮЧИ: рекомендации по СБУ (высокое колени, захлест), ОФП (планка, выпады) и целевой пульс."
            }` 
          }
        ]
      })
    });

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;
    const plan = JSON.parse(content.replace(/```json|```/g, "").trim());

    const startDate = new Date();
    const formattedPlan = plan.map((w: any, index: number) => {
      const workoutDate = new Date();
      workoutDate.setDate(startDate.getDate() + index);

      return {
        user_id: userId,
        scheduled_date: workoutDate.toISOString().split('T')[0], // Колонка в БД: scheduled_date
        activity: w.activity, // Колонка в БД: activity
        distance: `${w.dist_val} км`, // Колонка в БД: distance (text)
        target_distance_km: w.dist_val, // Колонка в БД: target_distance_km (numeric)
        duration: w.dur_str, // Колонка в БД: duration (text)
        description: w.desc, // Колонка в БД: description (text)
        day: w.day_name, // Колонка в БД: day (text)
        is_completed: false
      };
    });

    // Удаляем старый план и записываем новый
    await supabase.from('training_plans').delete().eq('user_id', userId);
    const { error } = await supabase.from('training_plans').insert(formattedPlan);

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error("Plan Generation Error:", err);
    return { success: false };
  }
};
