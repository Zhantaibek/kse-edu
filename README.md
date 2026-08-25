# Учебный центр КФБ (Educational CRM)

Отдельный проект (`Desktop/kse-edu`). Сайт КФБ (`kse-kg`) ссылается сюда через `NEXT_PUBLIC_EDU_URL`.

## Порты

| Сервис | Порт |
|--------|------|
| Vite (dev) | 5173 |
| Backend API | 4100 |
| PostgreSQL | **5433** (общий контейнер `kse-postgres` из `kse-kg`, БД `education_crm`) |

Открытие: **http://127.0.0.1:5173/education/app/**  
API: **http://127.0.0.1:4100/api**

## Быстрый старт

Нужен **Docker Desktop**. Postgres поднимается из соседнего `kse-kg`.

```bash
cd Desktop/kse-edu
npm install --prefix backend
npm install --prefix frontend
npm install
npm run db:setup
npm run dev
```

Подключение к БД: `postgresql://kse:kse@localhost:5433/education_crm`

В `frontend/.env`:

```env
VITE_API_URL=http://localhost:4100/api
```

## Demo

| Роль | Email | Password |
|------|-------|----------|
| Admin | admin@edu.local | Admin123! |
| Teacher | teacher@edu.local | Teacher123! |
| Student | student@edu.local | Student123! |

## Telegram 2FA

После email/пароля код подтверждения уходит в Telegram-бота.

1. Создайте бота у [@BotFather](https://t.me/BotFather) → получите **token** и **username**.
2. Пропишите в `backend/.env`:

```env
TELEGRAM_BOT_TOKEN=123456:ABC...
TELEGRAM_BOT_USERNAME=YourBotName
TELEGRAM_WEBHOOK_SECRET=random-secret
TELEGRAM_2FA_ENABLED=true
TELEGRAM_2FA_BYPASS=false
```

В development бот может работать через long-polling (см. `backend`).

Для production webhook (нужен публичный HTTPS URL API):

```bash
curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://<PUBLIC>/api/telegram/webhook&secret_token=<TELEGRAM_WEBHOOK_SECRET>"
```

## Production

```bash
docker compose up -d --build
```
