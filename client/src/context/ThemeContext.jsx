import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

const THEME_STORAGE_KEY = 'capacity-connect-theme';
const LEGACY_THEME_STORAGE_KEY = 'cognisphere_theme';

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    try {
      const savedTheme =
        localStorage.getItem(THEME_STORAGE_KEY) ||
        localStorage.getItem(LEGACY_THEME_STORAGE_KEY);
      if (savedTheme === 'dark' || savedTheme === 'light') {
        return savedTheme;
      }
      return 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
      if (body) {
        body.classList.add('dark');
        body.classList.remove('light');
      }
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
      root.setAttribute('data-theme', 'light');
      if (body) {
        body.classList.remove('dark');
        body.classList.add('light');
      }
    }

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
      localStorage.setItem(LEGACY_THEME_STORAGE_KEY, theme);
    } catch (e) {
      console.warn('Unable to persist theme to localStorage:', e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setTheme = (newTheme) => {
    if (newTheme === 'dark' || newTheme === 'light') {
      setThemeState(newTheme);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === 'dark',
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
