import { Router } from 'express';
import { telegramWebhookController } from '../controllers/auth.controller.js';

const router = Router();

router.post('/webhook', telegramWebhookController.webhook);

export default router;
