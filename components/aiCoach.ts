import { supabase } from "../supabaseClient";

export const generateInitialPlan = async (userId: string) => {
  try {
    // 1. Получаем данные профиля пользователя
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (!profile) throw new Error("Профиль не найден в БД");

    // 2. Получаем API ключ из файла .env
    const key = import.meta.env.VITE_OPENROUTER_API_KEY;
    
    if (!key || key === "undefined") {
       console.error("API Key is missing. Make sure VITE_OPENROUTER_API_KEY is set in .env file");
       alert("ОШИБКА КОНФИГУРАЦИИ: Не найден API ключ.");
       return { success: false };
    }

    // 3. Отправляем запрос к ИИ
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
            "content": "Ты тренер по бегу. Твоя задача — генерировать JSON. Не пиши никакого вступительного текста." 
          },
          { 
            "role": "user", 
            "content": `Составь план бега на неделю для уровня ${profile.fitness_level}. 
            Ответ должен быть СТРОГО JSON массивом объектов.
            Каждый объект должен иметь ТОЛЬКО эти ключи:
            - "day" (строка, например "День 1" или "Понедельник")
            - "activity" (строка, например "Легкий бег")
            - "distance" (строка, например "5 км")
            - "description" (строка, детали тренировки)
            ` 
          }
        ]
      })
    });

    // 4. Обрабатываем ошибки сети/ключа
    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter Error:", errorText);
      throw new Error(`Ошибка API (${response.status}): ${errorText}`);
    }

    // 5. Парсим ответ от ИИ
    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;
    if (!content) throw new Error("ИИ вернул пустой ответ");

    // Убираем возможную Markdown разметку (```json ... ```)
    const text = content.replace(/```json|```/g, "").trim();
    
    let plan;
    try {
        plan = JSON.parse(text);
    } catch (e) {
        console.error("Получен некорректный JSON:", text);
        throw new Error("ИИ вернул некорректный формат данных. Попробуйте снова.");
    }

    // 6. Записываем в базу данных
    // Внимание: поля здесь должны совпадать с колонками в Supabase
    const { error: insertError } = await supabase.from('training_plans').insert(
      plan.map((w: any) => ({
        user_id: userId,
        day: w.day,
        activity: w.activity,
        distance: w.distance,
        description: w.description
      }))
    );

    if (insertError) throw new Error(`Ошибка записи в БД: ${insertError.message}`);

    return { success: true };
  } catch (err: any) {
    alert("ОШИБКА: " + err.message);
    console.error(err);
    return { success: false };
  }
};
