require('dotenv').config();
const { Telegraf } = require('telegraf');
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fetch = require('node-fetch'); // Убедись, что установлен: npm install node-fetch

// 1. Настройки (берем из .env)
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 2. Обработка фото
bot.on('photo', async (ctx) => {
  // Отправляем сообщение "Анализирую", чтобы юзер видел реакцию
  const loadingMsg = await ctx.reply('⚡️ Анализирую скриншот...');

  try {
    // --- ШАГ 1: Получаем ссылку на файл от Telegram ---
    const fileId = ctx.message.photo[ctx.message.photo.length - 1].file_id;
    const fileLink = await ctx.telegram.getFileLink(fileId);

    // --- ШАГ 2: Скачиваем картинку в буфер ---
    const response = await fetch(fileLink.href);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // --- ШАГ 3: Отправляем в Gemini ---
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `
      Ты AI-тренер. Посмотри на скриншот беговой тренировки.
      Вытащи следующие данные:
      1. Дистанция (в км, только число, например 5.2)
      2. Время (в минутах, целое число. Если есть часы, переведи в минуты)
      3. Темп (строка вида "5:30")
      4. Дата (в формате YYYY-MM-DD. Если на фото нет года, используй текущий 2025).
      5. Тип (строка: "Бег", "Восстановление", "Интервалы" - угадай по контексту).
      
      ВЕРНИ ТОЛЬКО ЧИСТЫЙ JSON БЕЗ MARKDOWN И ЛИШНИХ СЛОВ.
      Пример ответа:
      {"distance": 10.5, "duration": 62, "pace": "5:55", "date": "2025-05-20", "type": "Бег"}
    `;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: buffer.toString("base64"), mimeType: "image/jpeg" } }
    ]);

    const text = result.response.text();
    
    // --- ШАГ 4: Чистим ответ от Gemini (это частая причина зависания) ---
    // Иногда он добавляет \`\`\`json в начале, убираем это
    const cleanJson = text.replace(/```json|```/g, '').trim();
    const data = JSON.parse(cleanJson);

    // --- ШАГ 5: Ищем пользователя в Supabase по Telegram ID ---
    // (Предполагаем, что у тебя в таблице profiles есть колонка telegram_id или ты мапишь их иначе)
    // Если ты пока тестируешь на себе, можно хардкодом вставить свой UUID, чтобы проверить
    // const userId = 'ТВОЙ_UUID_ИЗ_SUPABASE'; 
    
    // Если у тебя настроена связь через telegram_id:
    /*
    const { data: userData } = await supabase
      .from('profiles')
      .select('id')
      .eq('telegram_id', ctx.from.id)
      .single();
    const userId = userData?.id;
    */
   
    // ВРЕМЕННЫЙ ВАРИАНТ (чтобы работало прямо сейчас - вставляет просто данные):
    // Тебе нужно убедиться, что ты знаешь user_id, иначе Supabase не даст вставить.
    // Если у тебя RLS отключен или ты тестируешь - ок.
    
    const { error } = await supabase.from('workouts').insert({
       // user_id: userId, // Раскомментируй, когда настроишь связь ID
       activity_date: data.date,
       distance_km: data.distance,
       duration_minutes: data.duration,
       pace: data.pace,
       activity_type: data.type,
       title: `Тренировка из Telegram`,
       source: 'TELEGRAM' // Добавил поле source, чтобы отличать в календаре
    });

    if (error) throw new Error(`Supabase error: ${error.message}`);

    // --- ШАГ 6: Успех ---
    await ctx.telegram.editMessageText(
        ctx.chat.id, 
        loadingMsg.message_id, 
        null, 
        `✅ **Сохранено!**\n\n🏃 **Дистанция:** ${data.distance} км\n⏱ **Время:** ${data.duration} мин\n⚡️ **Темп:** ${data.pace}\n📅 **Дата:** ${data.date}`,
        { parse_mode: 'Markdown' }
    );

  } catch (e) {
    console.error("ОШИБКА БОТА:", e);
    // Вот этот блок не даст боту "зависнуть" молча
    await ctx.telegram.editMessageText(
        ctx.chat.id, 
        loadingMsg.message_id, 
        null, 
        `❌ **Ошибка:** Не удалось обработать фото.\n\nПопробуйте сделать скриншот четче или введите данные вручную.\n\nТех. детали: ${e.message}`
    );
  }
});

bot.launch().then(() => console.log('🤖 Бот запущен!'));

// Обработка корректного завершения
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
