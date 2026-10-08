import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AppRouter } from '../router';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';

export default function App() {
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const token = useAuthStore((s) => s.token);
  const initTheme = useUiStore((s) => s.initTheme);

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  useEffect(() => {
    if (!token) return;
    const path = window.location.pathname;
    if (path.includes('/login') || path.includes('/register')) return;
    void fetchMe();
  }, [token, fetchMe]);

  return (
    <>
      <AppRouter />
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'text-sm !rounded-[14px] !border !border-[var(--card-border)] !shadow-[var(--shadow)]',
        }}
      />
    </>
  );
}
