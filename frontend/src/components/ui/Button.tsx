import { cn } from '../../utils';
import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';

const variants = {
  primary:
    'bg-brand-500 text-white hover:bg-brand-600 shadow-[0_1px_2px_rgba(52,129,145,0.25)] focus-visible:ring-brand-400/40',
  secondary:
    'bg-panel text-ink border border-kse-border hover:bg-kse-surface dark:bg-panel-dark dark:text-white dark:border-border-dark dark:hover:bg-brand-900/40 focus-visible:ring-brand-400/25',
  ghost:
    'bg-transparent text-kse-muted hover:bg-kse-surface hover:text-ink dark:text-kse-gray dark:hover:bg-border-dark/60 dark:hover:text-white focus-visible:ring-brand-400/20',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-sm focus-visible:ring-rose-400/40',
};

const sizes = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-base',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: PropsWithChildren<ButtonProps>) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold tracking-tight transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-offset-panel-dark',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
