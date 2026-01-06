import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"

// КОНФИГУРАЦИЯ
const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY')!
const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// БЕСПЛАТНАЯ МОДЕЛЬ (суффикс :free обязателен)
const AI_MODEL = "google/gemini-2.0-flash-exp:free"

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

Deno.serve(async (req) => {
  try {
    const update = await req.json()
    const message = update.message

    // Игнорируем всё, кроме сообщений
    if (!message || !message.chat) {
      return new Response('No message found', { status: 200 })
    }

    const chatId = message.chat.id

    // 1. АВТОРИЗАЦИЯ
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('telegram_chat_id', chatId)
      .single()

    if (profileError || !profile) {
      await sendTelegramMessage(chatId, "⛔️ Вы не зарегистрированы. Пожалуйста, создайте аккаунт на сайте.")
      return new Response('User not found', { status: 200 })
    }

    // 2. ОБРАБОТКА ФОТО
    if (message.photo) {
      await sendTelegramMessage(chatId, "👀 Смотрю бесплатно через Gemini 2.0...")

      // Берем последнее фото (лучшее качество)
      const fileId = message.photo[message.photo.length - 1].file_id
      
      // Получаем ссылку
      const getFileRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile?file_id=${fileId}`)
      const fileData = await getFileRes.json()
      const fileUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${fileData.result.file_path}`

      // Скачиваем и конвертируем в base64
      const imageRes = await fetch(fileUrl)
      const imageBlob = await imageRes.blob()
      const arrayBuffer = await imageBlob.arrayBuffer()
      const base64Image = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))

      // 3. ЗАПРОС К OPENROUTER (Бесплатно)
      const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://run-coach.app",
          "X-Title": "Run Coach Bot",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": AI_MODEL,
          "messages": [
            {
              "role": "user",
              "content": [
                {
                  "type": "text",
                  "text": "Извлеки данные с фитнес-скриншота в JSON. Поля: activity_date (YYYY-MM-DD), activity_type (тип активности на русском), distance_km (число), duration_minutes (число), calories (число), title (краткое название). Если данных нет, ставь null. Ответь ТОЛЬКО чистым JSON."
                },
                {
                  "type": "image_url",
                  "image_url": {
                    "url": `data:image/jpeg;base64,${base64Image}`
                  }
                }
              ]
            }
          ]
        })
      })

      const aiData = await aiResponse.json()
      
      // Проверка на ошибки (например, модель перегружена)
      if (aiData.error) {
          console.error("OpenRouter Error:", aiData.error)
          await sendTelegramMessage(chatId, `⚠️ ИИ сейчас занят (бесплатный тариф). Попробуйте через минуту.\nОшибка: ${aiData.error.message}`)
          return new Response('AI Error', { status: 200 })
      }

      if (!aiData.choices || !aiData.choices[0]) {
          console.error("AI Empty Response:", aiData)
          await sendTelegramMessage(chatId, "❌ ИИ вернул пустой ответ.")
          return new Response('AI Error', { status: 200 })
      }

      const content = aiData.choices[0].message.content
      
      // Чистим JSON
      const cleanJson = content.replace(/```json/g, "").replace(/```/g, "").trim()
      
      let workout
      try {
          workout = JSON.parse(cleanJson)
      } catch (e) {
          console.error("JSON Parse Error:", content)
          await sendTelegramMessage(chatId, "❌ Не удалось прочитать данные с картинки.")
          return new Response('JSON Error', { status: 200 })
      }

      // 4. СОХРАНЕНИЕ В БАЗУ
      const { error: insertError } = await supabase
        .from('workouts')
        .insert({
          user_id: profile.id,
          activity_date: workout.activity_date || new Date().toISOString().split('T')[0],
          activity_type: workout.activity_type || 'Тренировка',
          distance_km: workout.distance_km || 0,
          duration_minutes: workout.duration_minutes || 0,
          calories: workout.calories || 0,
          title: workout.title
        })

      if (insertError) {
          console.error("DB Error:", insertError)
          await sendTelegramMessage(chatId, "❌ Ошибка базы данных.")
      } else {
          // 5. ОТВЕТ
          const successMessage = `✅ *Тренировка сохранена!*

📋 *${workout.title || 'Без названия'}*
📅 ${workout.activity_date}
🏃 ${workout.activity_type}
📏 ${workout.distance_km} км
⏱ ${workout.duration_minutes} мин
🔥 ${workout.calories} ккал`
          
          await sendTelegramMessage(chatId, successMessage)
      }

    } else {
      await sendTelegramMessage(chatId, "📸 Пришлите мне скриншот вашей тренировки!")
    }

    
    return new Response('OK', { status: 200 })

  } catch (error) {
    console.error("Global Error:", error)
    return new Response(JSON.stringify({ error: error.message }), { status: 200 })
  }
})
