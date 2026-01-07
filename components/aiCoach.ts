import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "../supabaseClient";

// Подключаем Gemini через твой ключ из .env.local
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

export const generateInitialPlan = async (userId: string) => {
  try {
    console.log("1. ИИ получил команду на создание плана...");

    // Берем данные профиля из базы
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!profile) throw new Error("Профиль не найден");

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Формируем задание для ИИ
    const prompt = `Ты профессиональный тренер. Составь план на 7 дней.
      Уровень: ${profile.fitness_level}, Цель: ${profile.goal_distance_km}км.
      Верни ТОЛЬКО JSON массив:
      [{"scheduled_date": "2026-01-08", "workout_type": "easy", "target_distance_km": 5, "target_pace": "6:30", "description": "Пробежка"}]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json|```/g, "").trim();
    const plan = JSON.parse(text);

    // Сохраняем результат в таблицу тренировок
    const { error } = await supabase
      .from('training_plans')
      .insert(plan.map((workout: any) => ({ ...workout, user_id: userId })));

    if (error) throw error;
    console.log("2. План успешно сохранен в базу!");
    return { success: true };
  } catch (error) {
    console.error("Ошибка ИИ:", error);
    return { success: false, error };
  }
};
