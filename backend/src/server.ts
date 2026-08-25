import { createApp } from './app.js';
import { env } from './config/env.js';
import { shouldUseTelegramPolling, startTelegramPolling } from './services/telegram-bot.js';

const app = createApp();

app.listen(env.PORT, () => {
  console.log(`Educational CRM API running on http://localhost:${env.PORT}`);
  console.log(`Swagger docs: http://localhost:${env.PORT}/api/docs`);
  if (shouldUseTelegramPolling()) {
    void startTelegramPolling();
  }
});
