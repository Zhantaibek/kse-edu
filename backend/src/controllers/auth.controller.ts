import type { Request, Response } from 'express';
import { authService } from '../services/auth.service.js';
import { telegramService } from '../services/telegram.service.js';
import { handleTelegramUpdate } from '../services/telegram-bot.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ForbiddenError } from '../utils/errors.js';
import { sendSuccess } from '../utils/response.js';

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.register(req.body);
    return sendSuccess(res, result, 201);
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(req.body.email, req.body.password);
    return sendSuccess(res, result);
  }),

  verifyTelegram: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.verifyTelegram(req.body.challengeId, req.body.code);
    return sendSuccess(res, result);
  }),

  continueTelegramLink: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.continueAfterTelegramLink(req.body.linkToken);
    return sendSuccess(res, result);
  }),

  logout: asyncHandler(async (_req: Request, res: Response) => {
    return sendSuccess(res, { message: 'Logged out' });
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.me(req.user!.id);
    return sendSuccess(res, user);
  }),

  telegramStatus: asyncHandler(async (req: Request, res: Response) => {
    const status = await authService.telegramStatus(req.user!.id);
    return sendSuccess(res, status);
  }),

  createTelegramLink: asyncHandler(async (req: Request, res: Response) => {
    const link = await authService.createTelegramLink(req.user!.id);
    return sendSuccess(res, link);
  }),

  unlinkTelegram: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.unlinkTelegram(req.user!.id);
    return sendSuccess(res, result);
  }),

  setTelegram2fa: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.setTelegram2fa(req.user!.id, req.body.enabled);
    return sendSuccess(res, result);
  }),
};

export const telegramWebhookController = {
  webhook: asyncHandler(async (req: Request, res: Response) => {
    const secret = req.header('x-telegram-bot-api-secret-token') ?? undefined;
    if (!telegramService.verifyWebhookSecret(secret)) {
      throw new ForbiddenError('Invalid webhook secret');
    }

    const update = req.body as import('../services/telegram.service.js').TelegramUpdate;
    await handleTelegramUpdate(update);
    return res.json({ ok: true });
  }),
};
