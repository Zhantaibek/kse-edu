import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import multer from 'multer';
import { randomBytes } from 'node:crypto';
import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ValidationError } from '../../utils/errors.js';
import { sendSuccess } from '../../utils/response.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const uploadsDir = path.resolve(__dirname, '../../../uploads');

mkdirSync(uploadsDir, { recursive: true });

const ALLOWED = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
  'video/quicktime',
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '';
    cb(null, `${Date.now()}-${randomBytes(6).toString('hex')}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 80 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED.has(file.mimetype)) {
      cb(new Error('Разрешены только изображения (jpg/png/webp/gif) и видео (mp4/webm/mov)'));
      return;
    }
    cb(null, true);
  },
});

export const mediaController = {
  upload: asyncHandler(async (req: Request, res: Response) => {
    const file = req.file;
    if (!file) throw new ValidationError('Файл не выбран');

    const kind = file.mimetype.startsWith('video/') ? 'video' : 'image';
    const url = `/api/uploads/${file.filename}`;

    return sendSuccess(res, {
      url,
      kind,
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    });
  }),
};
