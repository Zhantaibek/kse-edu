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

const credentialsSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(1, 'Введите пароль'),
});

const codeSchema = z.object({
  code: z.string().regex(/^\d{4}$/, 'Введите 4 цифры из Telegram'),
});

type Credentials = z.infer<typeof credentialsSchema>;
type CodeForm = z.infer<typeof codeSchema>;

export function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const verifyTelegram = useAuthStore((s) => s.verifyTelegram);
  const navigate = useNavigate();

  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [codeOpen, setCodeOpen] = useState(false);

  const credentialsForm = useForm<Credentials>({
    resolver: zodResolver(credentialsSchema),
  });
  const codeForm = useForm<CodeForm>({
    resolver: zodResolver(codeSchema),
  });

  useEffect(() => {
    if (codeOpen) codeForm.reset({ code: '' });
  }, [codeOpen, codeForm]);

  const onCredentials = async (values: Credentials) => {
    try {
      const result = await login(values.email, values.password);
      if (result.requiresTelegram && result.challengeId) {
        setChallengeId(result.challengeId);
        setCodeOpen(true);
        return;
      }
      toast.success('Добро пожаловать');
      navigate('/dashboard');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const onCode = async (values: CodeForm) => {
    if (!challengeId) return;
    try {
      await verifyTelegram(challengeId, values.code);
      setCodeOpen(false);
      toast.success('Добро пожаловать');
      navigate('/dashboard');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <AuthShell>
      <div className="mb-8 text-center">
        <img
          src={`${import.meta.env.BASE_URL}kse-logo.png`}
          alt="Кыргызская фондовая биржа"
          className="mx-auto mb-5 h-12 w-auto max-w-[280px] object-contain"
        />
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink dark:text-white">
          Учебный центр <span className="text-brand-500">КФБ</span>
        </h1>
        <p className="mt-2 text-sm text-kse-muted dark:text-kse-gray">
          Войдите в образовательную платформу
        </p>
      </div>

      <form className="space-y-4" onSubmit={credentialsForm.handleSubmit(onCredentials)}>
        <Input
          label="Email"
          type="email"
          error={credentialsForm.formState.errors.email?.message}
          {...credentialsForm.register('email')}
        />
        <PasswordInput
          label="Пароль"
          error={credentialsForm.formState.errors.password?.message}
          {...credentialsForm.register('password')}
        />
        <Button className="w-full" size="lg" disabled={credentialsForm.formState.isSubmitting}>
          {credentialsForm.formState.isSubmitting ? 'Вход…' : 'Войти'}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-kse-muted">
        Нет аккаунта?{' '}
        <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
          Регистрация
        </Link>
      </p>

      {codeOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/45 p-4">
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-panel-dark"
          >
            <h2 className="font-display text-xl font-extrabold text-ink dark:text-white">
              Подтверждение входа
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-kse-muted dark:text-kse-gray">
              Введите <b>4-значный код</b>, отправленный вам в Telegram.
            </p>
            <form className="mt-5 space-y-4" onSubmit={codeForm.handleSubmit(onCode)}>
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
                onClick={() => {
                  setCodeOpen(false);
                  setChallengeId(null);
                }}
              >
                Отмена
              </button>
            </form>
          </div>
        </div>
      )}
    </AuthShell>
  );
}
