import { supabase } from "../supabaseClient";

export const generateInitialPlan = async (userId: string) => {
  try {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (!profile) throw new Error("Профиль не найден в БД");

    // ПРАВИЛЬНЫЙ СПОСОБ: Берем ключ из файла .env
    const key = import.meta.env.VITE_OPENROUTER_API_KEY;
    
    // Проверка на случай, если файл .env не создали или забыли
    if (!key || key === "undefined") {
       console.error("API Key is missing. Make sure VITE_OPENROUTER_API_KEY is set in .env file");
       alert("ОШИБКА КОНФИГУРАЦИИ: Не найден API ключ. Сообщите разработчику.");
       return { success: false };
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key.trim()}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin
      },
      body: JSON.stringify({
        "model": "openai/gpt-4o-mini", // Запятая на месте
        "messages": [
          { "role": "system", "content": "Ты тренер. Отвечай только JSON массивом." },
          { "role": "user", "content": `План на неделю для уровня ${profile.fitness_level}.` }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      // Логируем ошибку, но пользователю показываем понятное сообщение
      console.error("OpenRouter Error:", errorText);
      
      if (response.status === 401) {
          throw new Error("Ошибка доступа (401). Возможно, ключ неверный или отключен.");
      } else if (response.status === 402) {
          throw new Error("Недостаточно средств на балансе OpenRouter (402).");
      } else {
          throw new Error(`Ошибка ИИ: ${response.status}`);
      }
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;
    if (!content) throw new Error("ИИ вернул пустой ответ");

    const text = content.replace(/```json|```/g, "").trim();
    
    let plan;
    try {
        plan = JSON.parse(text);
    } catch (e) {
        throw new Error("ИИ вернул некорректный JSON. Попробуйте снова.");
    }

    const { error: insertError } = await supabase.from('training_plans').insert(
      plan.map((w: any) => ({ ...w, user_id: userId }))
    );

    if (insertError) throw new Error(`Ошибка записи в БД: ${insertError.message}`);

    return { success: true };
  } catch (err: any) {
    alert("ОШИБКА: " + err.message);
    console.error(err);
    return { success: false };
  }
};
