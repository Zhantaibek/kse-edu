import { createContext, useContext } from 'react';
import type { EmbedConfig } from './runtime';

export interface EducationContextValue extends EmbedConfig {
  /** Convenience: eduPath bound to current basePath */
  path: (suffix: string) => string;
}

const EducationContext = createContext<EducationContextValue | null>(null);

export function EducationProvider({
  value,
  children,
}: {
  value: EducationContextValue;
  children: React.ReactNode;
}) {
  return <EducationContext.Provider value={value}>{children}</EducationContext.Provider>;
}

export function useEducation() {
  const ctx = useContext(EducationContext);
  if (!ctx) {
    // Standalone fallback — keeps pages working outside EducationApp
    return {
      basePath: '',
      apiBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
      mode: 'standalone' as const,
      hideLogout: false,
      path: (suffix: string) => {
        const clean = suffix.replace(/^\//, '');
        return clean ? `/${clean}` : '/';
      },
    };
  }
  return ctx;
}
