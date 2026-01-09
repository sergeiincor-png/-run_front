import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"

// КОНФИГУРАЦИЯ
const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY')!
const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Можно использовать Gemini 2.0 Flash через OpenRouter для лучшего зрения
const AI_MODEL = "google/gemini-2.0-flash-001" 

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const sendTelegramMessage = async (chatId: number, text: string) => {
  try {
    await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: 'Markdown'
        }),
      }
    )
  } catch (err) {
    console.error("Failed to send Telegram message:", err)
  }
}

Deno.serve(async (req) => {
  try {
    const update = await req.json()
    const message = update.message

    if (!message || !message.chat) return new Response('OK', { status: 200 })
    if (message.from?.is_bot) return new Response('OK', { status: 200 })

    const chatId = message.chat.id

    // АВТОРИЗАЦИЯ
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('telegram_chat_id', chatId)
      .single()

    if (profileError || !profile) {
      await sendTelegramMessage(chatId, "⛔️ Вы не зарегистрированы. Привяжите Telegram в профиле на сайте.")
      return new Response('OK', { status: 200 })
    }

    if (message.photo) {
      await sendTelegramMessage(chatId, "⚡️ Анализирую скриншот...")

      const fileId = message.photo[message.photo.length - 1].file_id
      const getFileRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile?file_id=${fileId}`)
      const fileData = await getFileRes.json()
      const fileUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${fileData.result.file_path}`

      const imageRes = await fetch(fileUrl)
      const arrayBuffer = await imageRes.blob().then(b => b.arrayBuffer())
      const base64Image = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))

      // ЗАПРОС К ИИ
      const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
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
                  "text": "Извлеки данные в JSON: activity_date (YYYY-MM-DD), activity_type (тип на русском), distance_km (число), duration_minutes (число), pace (темп как '5:30'), calories (число), title (кратко). Только чистый JSON, без markdown."
                },
                {
                  "type": "image_url",
                  "image_url": { "url": `data:image/jpeg;base64,${base64Image}` }
                }
              ]
            }
          ]
        })
      })

      const aiData = await aiResponse.json()
      const content = aiData.choices?.[0]?.message?.content
      if (!content) throw new Error("AI returned empty content")

      // Парсим JSON (убираем возможные теги ```json)
      const cleanJson = content.replace(/```json/g, "").replace(/```/g, "").trim()
      const workout = JSON.parse(cleanJson)

      // СОХРАНЕНИЕ
      // Важно: в поле activity_date кладем только YYYY-MM-DD
      const dateToSave = workout.activity_date || new Date().toISOString().split('T')[0]

      const { error: insertError } = await supabase
        .from('workouts')
        .insert({
          user_id: profile.id,
          activity_date: dateToSave,
          activity_type: workout.activity_type || 'Бег',
          activity: workout.activity_type || 'Бег', // Дублируем для совместимости с дашбордом
          distance_km: parseFloat(workout.distance_km) || 0,
          duration_minutes: parseInt(workout.duration_minutes) || 0,
          pace: workout.pace, // Добавляем темп для красивой карточки
          calories: workout.calories || 0,
          title: workout.title || 'Забег'
        })

      if (insertError) throw insertError

      await sendTelegramMessage(chatId, `✅ *Готово!* Тренировка на ${dateToSave} добавлена в календарь.\n📏 ${workout.distance_km} км | ⏱ ${workout.pace || '-'} /км`)

    } else {
      await sendTelegramMessage(chatId, "📸 Пришли мне скриншот (Strava, Garmin, Apple Health), и я добавлю его в календарь!")
    }

    return new Response('OK', { status: 200 })
  } catch (error) {
    console.error("Error:", error)
    return new Response('Error', { status: 200 })
  }
})
