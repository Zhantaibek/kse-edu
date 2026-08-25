import bcrypt from 'bcryptjs';
import type { Role } from '@prisma/client';
import { ConflictError, UnauthorizedError, ValidationError } from '../utils/errors.js';
import { signToken } from '../utils/jwt.js';
import { userRepository } from '../repositories/user.repository.js';
import { telegramOtpService } from './telegram-otp.service.js';
import { prisma } from '../config/prisma.js';

function sanitizeUser(user: {
  id: string;
  email: string;
  role: string;
  status: string;
  createdAt: Date;
  updatedAt?: Date;
  profile?: unknown;
  telegramChatId?: string | null;
  telegramUsername?: string | null;
  telegram2faEnabled?: boolean;
  passwordHash?: string;
  [key: string]: unknown;
}) {
  const { passwordHash: _, ...rest } = user;
  return rest;
}

function issueToken(user: {
  id: string;
  email: string;
  role: Role;
  status: string;
  createdAt: Date;
  profile?: unknown;
  telegramChatId?: string | null;
  telegramUsername?: string | null;
  telegram2faEnabled?: boolean;
  passwordHash?: string;
}) {
  const token = signToken({ id: user.id, email: user.email, role: user.role });
  return { user: sanitizeUser(user), token };
}

async function sendLoginCode(user: {
  id: string;
  email: string;
  telegramChatId: string | null;
}) {
  if (!user.telegramChatId) {
    throw new ValidationError(
      'Включена 2FA, но Telegram не привязан. Откройте «Настройки → Telegram».',
    );
  }

  const challenge = await telegramOtpService.issueChallenge(user.id, user.telegramChatId, user.email);
  return {
    requiresTelegram: true as const,
    challengeId: challenge.challengeId,
    expiresAt: challenge.expiresAt,
    message: 'Введите 4-значный код, отправленный вам в Telegram',
  };
}

export const authService = {
  async register(input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: 'STUDENT';
  }) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) throw new ConflictError('Email already registered');

    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await userRepository.create({
      email: input.email.toLowerCase(),
      passwordHash,
      role: 'STUDENT',
      firstName: input.firstName,
      lastName: input.lastName,
    });

    if (telegramOtpService.isEnabled()) {
      const link = await telegramOtpService.createLinkToken(user.id);
      return {
        requiresTelegramLink: true as const,
        linkUrl: link.url,
        linkToken: link.token,
        message: 'Откройте Telegram-бота, нажмите Start. Код придёт в ваш чат с ботом.',
      };
    }

    return issueToken(user);
  },

  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email.toLowerCase());
    if (!user) throw new UnauthorizedError('Invalid credentials');
    if (user.status === 'BLOCKED') throw new UnauthorizedError('Account is blocked');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedError('Invalid credentials');

    const needs2fa = telegramOtpService.isEnabled() && user.telegram2faEnabled;

    if (needs2fa) {
      return sendLoginCode(user);
    }

    return issueToken(user);
  },

  async continueAfterTelegramLink(linkToken: string) {
    const raw = linkToken.replace(/^link_/, '');
    const link = await prisma.telegramLinkToken.findUnique({ where: { token: raw } });
    if (!link || link.expiresAt < new Date()) {
      throw new UnauthorizedError('Ссылка привязки истекла. Создайте новую в настройках.');
    }

    const user = await prisma.user.findUnique({ where: { id: link.userId } });
    if (!user) throw new UnauthorizedError('User not found');

    if (!user.telegramChatId) {
      return {
        linked: false as const,
        message: 'Telegram ещё не привязан. Нажмите Start в боте.',
      };
    }

    const existing = await telegramOtpService.getOpenChallenge(user.id);
    const challenge =
      existing ??
      (await telegramOtpService.issueChallenge(user.id, user.telegramChatId, user.email));
    return {
      requiresTelegram: true as const,
      linked: true as const,
      challengeId: challenge.challengeId,
      expiresAt: challenge.expiresAt,
      message: 'Введите 4-значный код, отправленный вам в Telegram',
    };
  },

  async verifyTelegram(challengeId: string, code: string) {
    const user = await telegramOtpService.verifyChallenge(challengeId, code);
    return issueToken(user);
  },

  async me(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new UnauthorizedError();
    return sanitizeUser(user);
  },

  createTelegramLink(userId: string) {
    return telegramOtpService.createLinkToken(userId);
  },

  telegramStatus(userId: string) {
    return telegramOtpService.getStatus(userId);
  },

  setTelegram2fa(userId: string, enabled: boolean) {
    return telegramOtpService.set2fa(userId, enabled);
  },

  unlinkTelegram(userId: string) {
    return telegramOtpService.unlink(userId);
  },
};
