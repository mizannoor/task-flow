/**
 * Theme Utilities
 * Functions for theme detection, validation, persistence, and application
 */

import { THEME_MODES, THEME_STORAGE_KEY, DEFAULT_THEME } from './constants';

/**
 * Get the system/OS preferred theme using prefers-color-scheme media query
 * @returns {string} - 'dark' or 'light'
 */
export function getSystemTheme() {
  if (typeof window !== 'undefined' && window.matchMedia) {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return THEME_MODES.DARK;
    }
  }
  return THEME_MODES.LIGHT;
}

/**
 * Validate if a value is a valid theme
 * @param {*} value - Value to validate
 * @returns {boolean} - True if valid theme
 */
export function isValidTheme(value) {
  return value === THEME_MODES.LIGHT || value === THEME_MODES.DARK;
}

/**
 * Get stored theme from localStorage
 * @returns {string|null} - Stored theme or null if not found/invalid
 */
export function getStoredTheme() {
  try {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return isValidTheme(stored) ? stored : null;
  } catch {
    // localStorage may be unavailable (private browsing, etc.)
    return null;
  }
}

/**
 * Save theme to localStorage
 * @param {string} theme - Theme to save ('light' or 'dark')
 */
export function setStoredTheme(theme) {
  try {
    if (typeof localStorage === 'undefined') {
      return;
    }
    if (isValidTheme(theme)) {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  } catch (e) {
    // localStorage may be unavailable (private browsing, etc.)
    console.warn('Failed to save theme preference:', e);
  }
}

/**
 * Apply theme class to document root element
 * Adds or removes 'dark' class from <html>
 * @param {string} theme - Theme to apply ('light' or 'dark')
 */
export function applyThemeClass(theme) {
  if (typeof document === 'undefined') {
    return;
  }
  const root = document.documentElement;
  if (theme === THEME_MODES.DARK) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

/**
 * Get initial theme based on priority: stored > system > default
 * @returns {{ theme: string, isSystemDefault: boolean }} - Initial theme and source
 */
export function getInitialTheme() {
  // Priority 1: Check localStorage for user preference
  const stored = getStoredTheme();
  if (stored) {
    return { theme: stored, isSystemDefault: false };
  }

  // Priority 2: Check OS/system preference
  const system = getSystemTheme();
  return { theme: system, isSystemDefault: true };
}

/**
 * Check if localStorage is available
 * @returns {boolean} - True if localStorage is available
 */
export function isStorageAvailable() {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}
