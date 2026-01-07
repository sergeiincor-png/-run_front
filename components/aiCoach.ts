import { supabase } from "../supabaseClient";

export const generateInitialPlan = async (userId: string) => {
  try {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (!profile) throw new Error("Профиль не найден в БД");

    // ВАЖНО: Убедись, что этот ключ АКТИВЕН (зеленый статус в OpenRouter) и на балансе есть деньги ($)
    const key = "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";
    
    // Это поможет нам увидеть, дошел ли ключ до приложения
    if (!key || key === "undefined") {
       alert("ОШИБКА: Ключ API не дошел до сайта. Проверь настройки Timeweb.");
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
        "model": "openai/gpt-4o-mini", // <--- ЗАПЯТАЯ ДОБАВЛЕНА ЗДЕСЬ
        "messages": [
          { "role": "system", "content": "Ты тренер. Отвечай только JSON массивом." },
          { "role": "user", "content": `План на неделю для уровня ${profile.fitness_level}.` }
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
