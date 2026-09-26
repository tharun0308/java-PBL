'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'dark' | 'light' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'dark' | 'light';
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  setTheme: () => {},
  resolvedTheme: 'light',
});

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  attribute?: string;
  enableSystem?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  storageKey = 'scms-theme',
  enableSystem = false,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>('light');

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey) as Theme | null;
      if (stored && stored !== 'dark') {
        setThemeState(stored);
      } else {
        setThemeState('light');
        localStorage.setItem(storageKey, 'light');
      }
    } catch {
      // localStorage may be unavailable
    }
  }, [storageKey]);

  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = (targetTheme: Theme) => {
      const active: 'dark' | 'light' =
        targetTheme === 'system'
          ? mediaQuery.matches
            ? 'dark'
            : 'light'
          : targetTheme;

      root.classList.remove('light', 'dark');
      root.classList.add(active);
      setResolvedTheme(active);
    };

    applyTheme(theme);

    const listener = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    try {
      localStorage.setItem(storageKey, newTheme);
    } catch {
      // localStorage may be unavailable
    }
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
