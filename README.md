# Учебный центр КФБ (Educational CRM)

Отдельный проект: свой фронтенд (React + Vite), API (Express + Prisma), база и вход.
Сайт КФБ ([kfb](https://github.com/Zhantaibek/kfb)) только ссылается сюда через `NEXT_PUBLIC_EDU_URL`.

## Порты

| Сервис | Порт |
|--------|------|
| Vite (dev) | 5173 |
| Backend API | 4100 |
| PostgreSQL | **5433** — локальный сервер, база `kse_edu` (схема `edu`); в Docker — свой контейнер на **5434** |

Открытие: **http://127.0.0.1:5173/education/app/**  
API: **http://127.0.0.1:4100/api**

## Быстрый старт

Нужен PostgreSQL: локальный на `:5433` или свой контейнер (`npm run db:up`, порт `:5434` — поправьте `DATABASE_URL`).

```bash
cd Desktop/kse-edu
npm install --prefix backend
npm install --prefix frontend
npm install
npm run db:setup
npm run dev
```

Подключение к БД: `postgresql://kse:kse@localhost:5433/kse_edu?schema=edu`

`npm run db:setup` применяет миграции и заполняет демо-данные (база создаётся сама, если её нет).

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
