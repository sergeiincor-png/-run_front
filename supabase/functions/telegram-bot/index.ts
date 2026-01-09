import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"

const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY')!
const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const AI_MODEL = "openai/gpt-4o-mini"

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const sendTelegramMessage = async (chatId: number, text: string) => {
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: text, parse_mode: 'Markdown' }),
    })
  } catch (err) { console.error("Failed to send Telegram message:", err) }
}

Deno.serve(async (req) => {
  try {
    const update = await req.json()
    const message = update.message
    if (!message || message.from?.is_bot) return new Response('OK', { status: 200 })

    const chatId = message.chat.id

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('telegram_chat_id', chatId)
      .single()

    if (profileError || !profile) {
      await sendTelegramMessage(chatId, "⛔️ Вы не зарегистрированы. Пожалуйста, создайте аккаунт на сайте.")
      return new Response('User not found', { status: 200 })
    }

    if (message.photo) {
      await sendTelegramMessage(chatId, "👀 Анализирую скриншот...")

      const fileId = message.photo[message.photo.length - 1].file_id
      const getFileRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile?file_id=${fileId}`)
      const fileData = await getFileRes.json()
      const fileUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${fileData.result.file_path}`

      const imageRes = await fetch(fileUrl)
      const imageBlob = await imageRes.blob()
      const arrayBuffer = await imageBlob.arrayBuffer()
      const base64Image = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))

      const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": AI_MODEL,
          "messages": [{
            "role": "user",
            "content": [
              { "type": "text", "text": "Извлеки данные в JSON: activity_date (YYYY-MM-DD), activity_type, distance_km (number), duration_minutes (number), pace (string), title. Верни ТОЛЬКО чистый JSON." },
              { "type": "image_url", "image_url": { "url": `data:image/jpeg;base64,${base64Image}` } }
            ]
          }]
        })
      })

      const aiData = await aiResponse.json()
      const content = aiData.choices[0].message.content
      const cleanJson = content.replace(/```json/g, "").replace(/```/g, "").trim()
      const workout = JSON.parse(cleanJson)

      // СОХРАНЕНИЕ С ПОЛЕМ SOURCE: 'FACT'
      const { error: insertError } = await supabase
        .from('workouts')
        .insert({
          user_id: profile.id,
          activity_date: workout.activity_date || new Date().toISOString().split('T')[0],
          activity_type: workout.activity_type || 'Бег',
          distance_km: workout.distance_km || 0,
          duration_minutes: workout.duration_minutes || 0,
          pace: workout.pace || "",
          title: workout.title || "Тренировка из ТГ",
          source: 'FACT' // Обязательно для календаря
        })

      if (insertError) {
          await sendTelegramMessage(chatId, "❌ Ошибка при сохранении.")
      } else {
          await sendTelegramMessage(chatId, `✅ *Сохранено!* \n🏃 ${workout.distance_km} км за ${workout.duration_minutes} мин`)
      }
    }
    return new Response('OK', { status: 200 })
  } catch (error) { return new Response('Error', { status: 200 }) }
})
