import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { PageHeader, Card, Avatar } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import { fullName, getErrorMessage } from '../../utils';

type TelegramStatus = {
  linked: boolean;
  username: string | null;
  botUsername: string | null;
  featureAvailable: boolean;
  twoFactorEnabled: boolean;
};

const codeSchema = z.object({
  code: z.string().regex(/^\d{4}$/, 'Введите 4 цифры из Telegram'),
});

type CodeValues = z.infer<typeof codeSchema>;

export function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const continueTelegramLink = useAuthStore((s) => s.continueTelegramLink);
  const verifyTelegram = useAuthStore((s) => s.verifyTelegram);

  const [tg, setTg] = useState<TelegramStatus | null>(null);
  const [linkUrl, setLinkUrl] = useState<string | null>(null);
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [step, setStep] = useState<'link' | 'code'>('link');
  const [tgBusy, setTgBusy] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm({
    defaultValues: {
      firstName: user?.profile?.firstName ?? '',
      lastName: user?.profile?.lastName ?? '',
      phone: user?.profile?.phone ?? '',
      bio: user?.profile?.bio ?? '',
      avatarUrl: user?.profile?.avatarUrl ?? '',
    },
  });

  const avatarUrl = form.watch('avatarUrl');

  const codeForm = useForm<CodeValues>({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: '' },
  });

  const loadTelegram = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/telegram/status');
      setTg(data.data);
    } catch {
      setTg(null);
    }
  }, []);

  useEffect(() => {
    void loadTelegram();
  }, [loadTelegram]);

  useEffect(() => {
    if (modalOpen && step === 'code') {
      codeForm.reset({ code: '' });
    }
  }, [codeForm, modalOpen, step]);

  useEffect(() => {
    if (!modalOpen || step !== 'link' || !linkToken) return;
    const timer = window.setInterval(() => {
      void (async () => {
        try {
          const result = await continueTelegramLink(linkToken);
          if (result.requiresTelegram && result.challengeId) {
            setChallengeId(result.challengeId);
            setStep('code');
            toast.success('Код отправлен в ваш Telegram');
          }
        } catch {
          // ссылка ещё не использована — ждём Start
        }
      })();
    }, 2000);
    return () => window.clearInterval(timer);
  }, [continueTelegramLink, linkToken, modalOpen, step]);

  const onSubmit = async (values: {
    firstName: string;
    lastName: string;
    phone: string;
    bio: string;
    avatarUrl: string;
  }) => {
    if (!user) return;
    try {
      await api.patch(`/students/${user.id}`, {
        ...values,
        avatarUrl: values.avatarUrl || null,
      });
      await fetchMe();
      toast.success('Профиль обновлён');
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const onAvatarFile = async (file: File | undefined) => {
    if (!file || !user) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Выберите изображение (jpg, png, webp, gif)');
      return;
    }
    setUploadingAvatar(true);
    try {
      const body = new FormData();
      body.append('file', file);
      const { data } = await api.post('/media/upload', body);
      const url = String(data.data.url);
      form.setValue('avatarUrl', url, { shouldDirty: true });
      await api.patch(`/students/${user.id}`, { avatarUrl: url });
      await fetchMe();
      toast.success('Фото загружено');
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const clearAvatar = async () => {
    if (!user) return;
    form.setValue('avatarUrl', '', { shouldDirty: true });
    try {
      await api.patch(`/students/${user.id}`, { avatarUrl: null });
      await fetchMe();
      toast.success('Фото удалено');
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const closeLinkModal = () => {
    setModalOpen(false);
    setStep('link');
    setChallengeId(null);
  };

  const createLink = async () => {
    setTgBusy(true);
    try {
      const { data } = await api.post('/auth/telegram/link');
      const url = String(data.data.url);
      const token = String(data.data.token);
      setLinkUrl(url);
      setLinkToken(token);
      setChallengeId(null);
      setStep('link');
      setModalOpen(true);
      window.open(url, '_blank', 'noopener,noreferrer');
      toast.success('Откройте бота и нажмите Start');
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setTgBusy(false);
    }
  };

  const onContinueLink = async () => {
    if (!linkToken) return;
    try {
      const result = await continueTelegramLink(linkToken);
      if (result.requiresTelegram && result.challengeId) {
        setChallengeId(result.challengeId);
        setStep('code');
        toast.success('Код отправлен в Telegram');
        return;
      }
      toast.error(result.message ?? 'Telegram ещё не привязан. Нажмите Start в боте.');
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const onCodeSubmit = async (values: CodeValues) => {
    if (!challengeId) return;
    try {
      await verifyTelegram(challengeId, values.code);
      closeLinkModal();
      setLinkUrl(null);
      setLinkToken(null);
      await loadTelegram();
      await fetchMe();
      toast.success('Telegram привязан');
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const unlink = async () => {
    setTgBusy(true);
    try {
      await api.delete('/auth/telegram/link');
      setLinkUrl(null);
      setLinkToken(null);
      closeLinkModal();
      await loadTelegram();
      toast.success('Telegram отвязан');
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setTgBusy(false);
    }
  };

  const toggle2fa = async (enabled: boolean) => {
    setTgBusy(true);
    try {
      const { data } = await api.patch('/auth/telegram/2fa', { enabled });
      setTg((prev) =>
        prev
          ? { ...prev, twoFactorEnabled: data.data.twoFactorEnabled }
          : prev,
      );
      toast.success(enabled ? '2FA включена' : '2FA отключена');
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setTgBusy(false);
    }
  };

  return (
    <div>
      <PageHeader title="Настройки" description="Профиль и предпочтения" />
      <div className="grid max-w-2xl gap-4">
        <Card className="p-6">
          <form className="grid gap-4 sm:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="sm:col-span-2 flex flex-wrap items-center gap-4">
              <Avatar
                name={fullName(user) || 'Профиль'}
                src={avatarUrl || user?.profile?.avatarUrl}
                size="lg"
              />
              <div className="min-w-0 flex-1 space-y-2">
                <p className="text-sm font-medium text-ink dark:text-white">Фото профиля</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={uploadingAvatar}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploadingAvatar ? 'Загрузка…' : 'Загрузить фото'}
                  </Button>
                  {(avatarUrl || user?.profile?.avatarUrl) && (
                    <Button type="button" variant="ghost" disabled={uploadingAvatar} onClick={() => void clearAvatar()}>
                      Удалить
                    </Button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => void onAvatarFile(e.target.files?.[0])}
                />
              </div>
            </div>
            <Input label="Имя" {...form.register('firstName')} />
            <Input label="Фамилия" {...form.register('lastName')} />
            <Input label="Телефон" {...form.register('phone')} />
            <div className="sm:col-span-2">
              <Textarea label="О себе" {...form.register('bio')} />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit">Сохранить</Button>
            </div>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="font-display text-lg font-bold text-ink dark:text-white">Telegram</h2>
          <p className="mt-1 text-sm text-kse-muted dark:text-kse-gray">
            При включённой 2FA код подтверждения входа приходит в Telegram-бота.
          </p>

          {tg && (
            <p className="mt-4 text-sm">
              Статус:{' '}
              {tg.linked ? (
                <span className="font-semibold text-emerald-600">
                  привязан{tg.username ? ` (@${tg.username})` : ''}
                </span>
              ) : (
                <span className="font-semibold text-amber-600">не привязан</span>
              )}
            </p>
          )}

          {tg?.linked && tg.featureAvailable && (
            <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-lg border border-kse-border p-4 dark:border-white/10">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-kse-border text-brand-600 focus:ring-brand-500"
                checked={tg.twoFactorEnabled}
                disabled={tgBusy}
                onChange={(e) => void toggle2fa(e.target.checked)}
              />
              <span>
                <span className="block text-sm font-semibold text-ink dark:text-white">
                  Двухфакторная аутентификация через Telegram
                </span>
                <span className="mt-1 block text-sm text-kse-muted dark:text-kse-gray">
                  При входе потребуется 4-значный код из бота
                  {tg.botUsername ? ` @${tg.botUsername}` : ''}.
                </span>
              </span>
            </label>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {!tg?.linked ? (
              <Button type="button" disabled={tgBusy} onClick={() => void createLink()}>
                Привязать Telegram
              </Button>
            ) : (
              <Button type="button" variant="ghost" disabled={tgBusy} onClick={() => void unlink()}>
                Отвязать
              </Button>
            )}
          </div>
        </Card>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/45 p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-panel-dark"
          >
            {step === 'link' ? (
              <>
                <h2 className="font-display text-xl font-extrabold text-ink dark:text-white">
                  Привязка Telegram
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-kse-muted dark:text-kse-gray">
                  Откройте <b>вашего</b> Telegram, нажмите <b>Start</b> по ссылке ниже. Бот узнает ваш чат и пришлёт код туда.
                </p>
                {linkUrl && (
                  <a
                    className="mt-4 block break-all text-sm font-semibold text-brand-600 underline"
                    href={linkUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Открыть Telegram-бота
                  </a>
                )}
                <div className="mt-5 space-y-3">
                  <Button className="w-full" size="lg" onClick={() => void onContinueLink()}>
                    Я нажал Start
                  </Button>
                  <button
                    type="button"
                    className="w-full text-sm text-kse-muted hover:text-brand-600"
                    onClick={closeLinkModal}
                  >
                    Закрыть
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="font-display text-xl font-extrabold text-ink dark:text-white">
                  Подтверждение привязки
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-kse-muted dark:text-kse-gray">
                  Введите <b>4-значный код</b>, отправленный вам в Telegram.
                </p>
                <form className="mt-5 space-y-4" onSubmit={codeForm.handleSubmit(onCodeSubmit)}>
                  <Input
                    label="Код"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={4}
                    placeholder="0000"
                    className="text-center text-2xl tracking-[0.5em]"
                    error={codeForm.formState.errors.code?.message}
                    {...codeForm.register('code')}
                  />
                  <Button className="w-full" size="lg" disabled={codeForm.formState.isSubmitting}>
                    {codeForm.formState.isSubmitting ? 'Проверка…' : 'Подтвердить'}
                  </Button>
                  <button
                    type="button"
                    className="w-full text-sm text-kse-muted hover:text-brand-600"
                    onClick={closeLinkModal}
                  >
                    Отмена
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
