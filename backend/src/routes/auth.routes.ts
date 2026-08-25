import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { loginSchema, registerSchema, verifyTelegramSchema, continueTelegramLinkSchema, telegram2faSchema } from '../validators/index.js';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/verify-telegram', validate(verifyTelegramSchema), authController.verifyTelegram);
router.post(
  '/telegram/continue',
  validate(continueTelegramLinkSchema),
  authController.continueTelegramLink,
);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.me);

router.get('/telegram/status', authenticate, authController.telegramStatus);
router.post('/telegram/link', authenticate, authController.createTelegramLink);
router.patch('/telegram/2fa', authenticate, validate(telegram2faSchema), authController.setTelegram2fa);
router.delete('/telegram/link', authenticate, authController.unlinkTelegram);

export default router;
