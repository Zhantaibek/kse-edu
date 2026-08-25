import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { AuthShell } from '../../components/auth/AuthShell';
import { Button } from '../../components/ui/Button';
import { Input, PasswordInput } from '../../components/ui/Input';
import { getErrorMessage } from '../../utils';

const schema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
});

const codeSchema = z.object({
  code: z.string().regex(/^\d{4}$/, 'Введите 4 цифры из Telegram'),
});

type FormValues = z.infer<typeof schema>;
type CodeValues = z.infer<typeof codeSchema>;

export function RegisterPage() {
  const registerUser = useAuthStore((s) => s.register);
  const continueTelegramLink = useAuthStore((s) => s.continueTelegramLink);
  const verifyTelegram = useAuthStore((s) => s.verifyTelegram);
  const navigate = useNavigate();
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [linkUrl, setLinkUrl] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [step, setStep] = useState<'link' | 'code'>('link');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });
  const codeForm = useForm<CodeValues>({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: '' },
  });

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

  const onSubmit = async (values: FormValues) => {
    try {
      const result = await registerUser({ ...values, role: 'STUDENT' });
      if (result.requiresTelegramLink && result.linkToken && result.linkUrl) {
        setLinkToken(result.linkToken);
        setLinkUrl(result.linkUrl);
        setChallengeId(null);
        setStep('link');
        setModalOpen(true);
        window.open(result.linkUrl, '_blank', 'noopener,noreferrer');
        toast.success('Откройте Telegram-бота и нажмите Start');
        return;
      }
      if (result.requiresTelegram && result.challengeId) {
        setChallengeId(result.challengeId);
        setLinkToken(null);
        setLinkUrl(null);
        setStep('code');
        setModalOpen(true);
        return;
      }
      toast.success('Аккаунт создан');
      navigate('/dashboard');
    } catch (error) {
      toast.error(getErrorMessage(error));
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
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const onCodeSubmit = async (values: CodeValues) => {
    if (!challengeId) return;
    try {
      await verifyTelegram(challengeId, values.code);
      setModalOpen(false);
      toast.success('Регистрация завершена');
      navigate('/dashboard');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <AuthShell wide>
      <div className="mb-7 text-center sm:text-left">
        <img
          src={`${import.meta.env.BASE_URL}kse-logo.png`}
          alt="Кыргызская фондовая биржа"
          className="mx-auto mb-4 h-11 w-auto max-w-[260px] object-contain sm:mx-0"
        />
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink dark:text-white">
          Создайте аккаунт
        </h1>
        <p className="mt-1.5 text-sm text-kse-muted dark:text-kse-gray">
          Учебный центр КФБ
        </p>
      </div>
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
        <Input label="Имя" error={errors.firstName?.message} {...register('firstName')} />
        <Input label="Фамилия" error={errors.lastName?.message} {...register('lastName')} />
        <div className="sm:col-span-2">
          <Input label="Email" type="email" error={errors.email?.message} {...register('email')} />
        </div>
        <div className="sm:col-span-2">
          <PasswordInput label="Пароль" error={errors.password?.message} {...register('password')} />
        </div>
        <div className="sm:col-span-2">
          <Button className="w-full" size="lg" disabled={isSubmitting}>
            Зарегистрироваться
          </Button>
        </div>
      </form>
      <p className="mt-6 text-center text-sm text-kse-muted">
        Уже есть аккаунт?{' '}
        <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
          Войти
        </Link>
      </p>

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
                  Подтвердите Telegram
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
                    onClick={() => setModalOpen(false)}
                  >
                    Закрыть
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="font-display text-xl font-extrabold text-ink dark:text-white">
                  Подтверждение регистрации
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
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </AuthShell>
  );
}
