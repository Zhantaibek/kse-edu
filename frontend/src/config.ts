/** Адреса учебного центра: отдельное приложение со своим API. */
export const EDU_API_URL: string = import.meta.env.VITE_API_URL || 'http://localhost:4100/api';
/** Базовый путь приложения (совпадает с `base` в vite.config.ts). */
export const EDU_BASE_PATH = '/education/app';
/** Статика (логотипы, фоны) — frontend/public, раздаётся с базового пути. */
export const EDU_ASSETS: string = import.meta.env.BASE_URL;
