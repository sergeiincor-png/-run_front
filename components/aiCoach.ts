import { supabase } from "../supabaseClient";

export const generateInitialPlan = async (userId: string) => {
  try {
    // 1. Получаем профиль
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (!profile) throw new Error("Профиль не найден в БД");

    // 2. Ключ из .env
    const key = import.meta.env.VITE_OPENROUTER_API_KEY;
    
    if (!key || key === "undefined") {
       console.error("API Key is missing in .env");
       alert("ОШИБКА: Не найден API ключ.");
       return { success: false };
    }

    // 3. Запрос к ИИ
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
            "content": "Ты тренер. Отвечай только JSON массивом. Не пиши вступлений." 
          },
          { 
            "role": "user", 
            "content": `Создай план бега на неделю для уровня ${profile.fitness_level}. 
            Ответ должен быть СТРОГО JSON массивом.
            Используй ключи: "day", "activity", "distance", "duration", "description".` 
          }
        ]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("OpenRouter Error:", errText);
      throw new Error(`Ошибка API (${response.status})`);
    }

    // 4. Парсинг
    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;
    if (!content) throw new Error("Пустой ответ от ИИ");

    const cleanJson = content.replace(/```json|```/g, "").trim();
    let plan;
    
    try {
        plan = JSON.parse(cleanJson);
    } catch (e) {
        console.error("Bad JSON:", cleanJson);
        throw new Error("Ошибка формата JSON от ИИ.");
    }

    // 5. БЕЗОПАСНАЯ ЗАПИСЬ
    // Теперь мы явно прописываем и duration тоже
    const formattedPlan = plan.map((w: any) => ({
      user_id: userId,
      day: w.day || w.date || "День ?",
      activity: w.activity || w.workout || w.activities || "Бег", 
      distance: w.distance || "",
      duration: w.duration || "", // <--- Добавили обработку duration
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
