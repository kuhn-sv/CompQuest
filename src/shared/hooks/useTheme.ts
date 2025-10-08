import { useEffect, useCallback, useState } from 'react';

export type Theme = 'light' | 'dark';

const THEME_KEY = 'theme';

function getInitialTheme(): Theme {
  // Force dark mode by default, ignoring stored/system preferences for now
  return 'dark';
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme());

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  return { theme, setTheme, toggleTheme };
}
