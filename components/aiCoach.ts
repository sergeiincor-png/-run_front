import { supabase } from "../supabaseClient";

export const generateInitialPlan = async (userId: string) => {
  try {
    // 1. Получаем профиль
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (!profile) throw new Error("Профиль не найден в БД");

    // 2. Достаем ключ из .env
    const key = import.meta.env.VITE_OPENROUTER_API_KEY;
    
    if (!key || key === "undefined") {
       console.error("API Key is missing. Check .env file.");
       alert("ОШИБКА: Не найден API ключ в настройках.");
       return { success: false };
    }

    // 3. Запрос к ИИ с жесткой инструкцией по JSON
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key.trim()}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin
      },
      body: JSON.stringify({
        "model": "openai/gpt-4o-mini",
        "messages": [
          { 
            "role": "system", 
            "content": "Ты тренер. Твоя задача — генерировать JSON. Не пиши вступлений." 
          },
          { 
            "role": "user", 
            "content": `Создай план бега на неделю для уровня ${profile.fitness_level}. 
            Ответ должен быть СТРОГО JSON массивом.
            Используй ключи: "day" (день недели), "activity" (тип тренировки), "distance" (дистанция), "description" (описание).` 
          }
        ]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenRouter Error:", errText);
      throw new Error(`Ошибка ИИ (${response.status})`);
    }

    // 4. Обработка ответа
    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;
    if (!content) throw new Error("Пустой ответ от ИИ");

    // Чистим JSON от лишнего мусора
    const cleanJson = content.replace(/```json|```/g, "").trim();
    let plan;
    
    try {
        plan = JSON.parse(cleanJson);
    } catch (e) {
        console.error("Bad JSON:", cleanJson);
        throw new Error("Ошибка чтения ответа от ИИ (неверный формат).");
    }

    // 5. БЕЗОПАСНАЯ ЗАПИСЬ (Маппинг)
    // Мы приводим любые ключи от ИИ к 4 стандартным колонкам базы.
    // Это решит проблему "Could not find column 'workout'".
    const formattedPlan = plan.map((w: any) => ({
      user_id: userId,
      day: w.day || w.date || "День ?",
      // Если ИИ прислал "workout" или "activities", мы все равно запишем это в колонку "activity"
      activity: w.activity || w.workout || w.activities || "Бег", 
      distance: w.distance || "",
      description: w.description || w.details || ""
    }));

    const { error: insertError } = await supabase.from('training_plans').insert(formattedPlan);

    if (insertError) throw new Error(`Ошибка БД: ${insertError.message}`);

    return { success: true };

  } catch (err: any) {
    alert("ОШИБКА: " + err.message);
    console.error(err);
    return { success: false };
  }
};
