import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { AuthShell } from '../../components/auth/AuthShell';
import { CheckEmailSent } from '../../components/auth/CheckEmailSent';
import { Button } from '../../components/ui/Button';
import { Input, PasswordInput } from '../../components/ui/Input';
import { getErrorMessage } from '../../utils';

const passwordSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(1, 'Введите пароль'),
});

const magicSchema = z.object({
  email: z.string().email('Некорректный email'),
});

type PasswordForm = z.infer<typeof passwordSchema>;
type MagicForm = z.infer<typeof magicSchema>;

export function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const requestMagicLink = useAuthStore((s) => s.requestMagicLink);
  const verifyEmailOtp = useAuthStore((s) => s.verifyEmailOtp);
  const navigate = useNavigate();
  const [mode, setMode] = useState<'password' | 'magic'>('password');
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');
  const [resending, setResending] = useState(false);

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });
  const magicForm = useForm<MagicForm>({
    resolver: zodResolver(magicSchema),
  });

  const onPasswordLogin = async (values: PasswordForm) => {
    try {
      await login(values.email.trim().toLowerCase(), values.password);
      toast.success('Добро пожаловать');
      navigate('/dashboard');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const onMagicSubmit = async (values: MagicForm) => {
    try {
      const email = values.email.trim().toLowerCase();
      const result = await requestMagicLink(email);
      if (!result.delivered) {
        toast.error('Письмо не ушло на почту. Войдите с паролем.');
        return;
      }
      setSentEmail(email);
      setSent(true);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const onResend = async () => {
    setResending(true);
    try {
      const result = await requestMagicLink(sentEmail);
      if (!result.delivered) {
        toast.error('Письмо не ушло на почту. Войдите с паролем.');
        return;
      }
      toast.success('Код отправлен на почту');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthShell>
      {!(mode === 'magic' && sent) && (
        <div className="mb-8 text-center">
          <img
            src={`${import.meta.env.BASE_URL}kse-logo.png`}
            alt="Кыргызская фондовая биржа"
            className="mx-auto mb-5 h-12 w-auto max-w-[280px] object-contain"
          />
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-ink dark:text-white">
            Вход в учебный центр
          </h1>
          <p className="mt-2 text-sm text-kse-muted dark:text-kse-gray">
            {mode === 'password' ? 'Войдите с email и паролем' : 'Пришлём код для входа на email'}
          </p>
        </div>
      )}

      {mode === 'magic' && sent ? (
        <CheckEmailSent
          email={sentEmail}
          resending={resending}
          onVerifyCode={async (code) => {
            try {
              await verifyEmailOtp(sentEmail, code);
              toast.success('Добро пожаловать');
              navigate('/dashboard');
            } catch (error) {
              toast.error(getErrorMessage(error));
            }
          }}
          onResend={onResend}
          onChangeEmail={() => {
            setSent(false);
            magicForm.setValue('email', sentEmail);
          }}
        />
      ) : mode === 'password' ? (
        <form className="space-y-4" onSubmit={passwordForm.handleSubmit(onPasswordLogin)}>
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            autoFocus
            error={passwordForm.formState.errors.email?.message}
            {...passwordForm.register('email')}
          />
          <PasswordInput
            label="Пароль"
            autoComplete="current-password"
            error={passwordForm.formState.errors.password?.message}
            {...passwordForm.register('password')}
          />
          <Button className="w-full" size="lg" disabled={passwordForm.formState.isSubmitting}>
            {passwordForm.formState.isSubmitting ? 'Вход…' : 'Войти'}
          </Button>
          <button
            type="button"
            className="w-full text-sm font-semibold text-brand-600 hover:text-brand-700"
            onClick={() => {
              const email = passwordForm.getValues('email');
              if (email) magicForm.setValue('email', email);
              setMode('magic');
              setSent(false);
            }}
          >
            Войти по коду из email
          </button>
        </form>
      ) : (
        <form className="space-y-4" onSubmit={magicForm.handleSubmit(onMagicSubmit)}>
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            autoFocus
            error={magicForm.formState.errors.email?.message}
            {...magicForm.register('email')}
          />
          <Button className="w-full" size="lg" disabled={magicForm.formState.isSubmitting}>
            {magicForm.formState.isSubmitting ? 'Отправляем…' : 'Получить код'}
          </Button>
          <button
            type="button"
            className="w-full text-sm font-semibold text-brand-600 hover:text-brand-700"
            onClick={() => {
              const email = magicForm.getValues('email');
              if (email) passwordForm.setValue('email', email);
              setMode('password');
              setSent(false);
            }}
          >
            Войти с паролем
          </button>
        </form>
      )}

      {!(mode === 'magic' && sent) && (
        <p className="mt-6 text-center text-sm text-kse-muted">
          Нет аккаунта?{' '}
          <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
            Создать аккаунт
          </Link>
        </p>
      )}
    </AuthShell>
  );
}
