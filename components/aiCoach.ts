import { createClient } from "@supabase/supabase-js";

const supabaseUrl = 'https://hiaqscvvxrkfmxufqyur.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpYXFzY3Z2eHJrZm14dWZxeXVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2MzM3NTgsImV4cCI6MjA4MzIwOTc1OH0.D_Y_RI2HgOXFPS-nIH5lAv79R2mEwiM3VoT1eaAxKYY';
const supabase = createClient(supabaseUrl, supabaseKey);

export const generateInitialPlan = async (userId: string) => {
  try {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (!profile) throw new Error("Профиль не найден");

    const key = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (!key) throw new Error("API Key missing");

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
            "content": "Ты экспертный тренер по бегу. Твоя задача — создавать научно обоснованные планы в формате JSON." 
          },
          { 
            "role": "user", 
            "content": `Создай план на 7 дней. Атлет: уровень ${profile.fitness_level}, цель ${profile.goal_distance_km}км.
            
            Требования к JSON:
            {
              "activity": "название",
              "distance": "число км",
              "duration": "число минут",
              "description": "ПОДРОБНОЕ описание на 200-250 знаков. ОБЯЗАТЕЛЬНО включи рекомендации по СБУ (захлест, высокое колени и т.д.) или ОФП (планка, выпады), а также акценты по технике бега и пульсу."
            }
            Верни СТРОГО массив JSON из 7 объектов.` 
          }
        ]
      })
    });

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;
    const cleanJson = content.replace(/```json|```/g, "").trim();
    const plan = JSON.parse(cleanJson);

    const startDate = new Date();
    const formattedPlan = plan.map((w: any, index: number) => {
      const workoutDate = new Date();
      workoutDate.setDate(startDate.getDate() + index);

      return {
        user_id: userId,
        scheduled_date: workoutDate.toISOString().split('T')[0],
        title: w.activity,
        activity_type: "Бег",
        distance_km: parseFloat(w.distance) || 0,
        duration_minutes: parseInt(w.duration) || 0,
        description: w.description, // Теперь здесь будет богатый текст с СБУ/ОФП
        source: 'PLAN'
      };
    });

    await supabase.from('training_plans').delete().eq('user_id', userId);
    await supabase.from('training_plans').insert(formattedPlan);

    return { success: true };
  } catch (err: any) {
    console.error(err);
    return { success: false };
  }
};
