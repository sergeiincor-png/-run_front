import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "../supabaseClient";

// Инициализация Gemini
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

export const generateInitialPlan = async (userId: string) => {
  try {
    console.log("Запуск ИИ-генератора для пользователя:", userId);

    // 1. Получаем данные профиля пользователя
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) throw new Error("Профиль не найден в базе");

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 2. Промпт для генерации плана
    const prompt = `Ты — профессиональный тренер. Составь план на 7 дней для атлета:
      Уровень: ${profile.fitness_level}, Цель: ${profile.goal_distance_km} км.
      Верни СТРОГО JSON массив без текста:
      [
        {
          "scheduled_date": "2026-01-08",
          "workout_type": "easy run",
          "target_distance_km": 5,
          "target_pace": "6:30",
          "description": "Легкий бег для вкатки"
        }
      ]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json|```/g, "").trim();
    const plan = JSON.parse(text);

    // 3. Сохраняем тренировки в таблицу
    const { error: insertError } = await supabase
      .from('training_plans')
      .insert(plan.map((w: any) => ({ ...w, user_id: userId })));

    if (insertError) throw insertError;

    return { success: true };
  } catch (err) {
    console.error("Ошибка в aiCoach:", err);
    return { success: false, error: err };
  }
};
