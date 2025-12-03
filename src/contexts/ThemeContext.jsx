/**
 * ThemeContext
 * Global state management for theme (dark/light mode)
 * Provides theme state, toggle functionality, and chart colors
 */

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { THEME_MODES } from '../utils/constants';
import {
  getInitialTheme,
  setStoredTheme,
  applyThemeClass,
  isValidTheme,
} from '../utils/themeUtils';

// Context
const ThemeContext = createContext(null);

// Chart colors for Recharts (per data-model.md palette)
const LIGHT_CHART_COLORS = {
  primary: '#3B82F6',
  secondary: '#64748B',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  grid: '#E2E8F0',
  text: '#475569',
  background: '#FFFFFF',
};

const DARK_CHART_COLORS = {
  primary: '#60A5FA',
  secondary: '#94A3B8',
  success: '#4ADE80',
  warning: '#FBBF24',
  error: '#F87171',
  grid: '#334155',
  text: '#CBD5E1',
  background: '#0F172A',
};

/**
 * ThemeProvider
 * Wraps the application to provide theme functionality
 */
export function ThemeProvider({ children }) {
  // Initialize state from stored preference or system default
  const [state, setState] = useState(() => {
    const initial = getInitialTheme();
    return {
      theme: initial.theme,
      isSystemDefault: initial.isSystemDefault,
    };
  });

  // Apply theme class to document on mount and when theme changes
  useEffect(() => {
    applyThemeClass(state.theme);
  }, [state.theme]);

  // Set theme to a specific value
  const setTheme = useCallback((newTheme) => {
    if (!isValidTheme(newTheme)) {
      console.warn(`Invalid theme value: ${newTheme}`);
      return;
    }
    setState({ theme: newTheme, isSystemDefault: false });
    setStoredTheme(newTheme);

    // Announce to screen readers
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const announcement = newTheme === THEME_MODES.DARK
        ? 'Dark mode enabled'
        : 'Light mode enabled';
      // Use aria-live region instead of speech synthesis for better compatibility
    }
  }, []);

  // Toggle between light and dark
  const toggleTheme = useCallback(() => {
    const newTheme = state.theme === THEME_MODES.DARK
      ? THEME_MODES.LIGHT
      : THEME_MODES.DARK;
    setTheme(newTheme);
  }, [state.theme, setTheme]);

  // Memoized chart colors based on current theme
  const chartColors = useMemo(() => {
    return state.theme === THEME_MODES.DARK
      ? DARK_CHART_COLORS
      : LIGHT_CHART_COLORS;
  }, [state.theme]);

  // Context value
  const value = useMemo(() => ({
    theme: state.theme,
    isDark: state.theme === THEME_MODES.DARK,
    isSystemDefault: state.isSystemDefault,
    setTheme,
    toggleTheme,
    chartColors,
  }), [state.theme, state.isSystemDefault, setTheme, toggleTheme, chartColors]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * useTheme hook
 * Access theme context from any component
 * @returns {Object} - Theme context value
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

export default ThemeContext;
