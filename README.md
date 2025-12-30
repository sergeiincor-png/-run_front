# RUN coach MVP (Next.js + SQLite + OpenRouter)

Мини‑MVP: русскоязычный лендинг + вход по email (код) + генерация плана 5–10 км через OpenRouter.

## Быстрый старт локально

```bash
cp .env.example .env
npm i
npm run db:init
npm run dev
```

Открой: http://localhost:3000

### Вход по почте (без SMTP)
Если `SMTP_HOST` не задан, код входа будет выводиться в логах сервера:
`[DEV MAIL] Login code for you@domain.com => 123456`

## Деплой на VPS (Docker)

1) Установи Docker + docker compose
2) В папке проекта:

```bash
cp .env.example .env
# заполни OPENROUTER_API_KEY
docker compose up -d --build
```

Открой: http://SERVER_IP:3000

## Важно
- Это MVP. Тексты "Политика/Условия" — черновики.
- Нет оплаты/подписок: подразумевается будущая интеграция.
- Интеграции Strava/Garmin/Polar — обозначены как направление, не реализованы.
