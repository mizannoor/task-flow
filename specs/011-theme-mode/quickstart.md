# Quickstart: Theme Mode (Dark/Light)

**Feature**: 011-theme-mode  
**Date**: December 3, 2025

## Overview

This guide covers implementing dark/light theme support for TaskFlow. The feature enables users to switch themes via a header toggle or keyboard shortcuts, with persistence and OS detection.

## Prerequisites

- Node.js 18+ installed
- Existing TaskFlow codebase with:
  - React 18+ with functional components
  - Tailwind CSS for styling
  - Existing keyboard shortcut infrastructure (010-keyboard-shortcuts)

## Quick Implementation Steps

### Step 1: Configure Tailwind Dark Mode

Update `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

### Step 2: Add Theme Constants

Add to `src/utils/constants.js`:

```javascript
// =============================================================================
// Theme Constants
// =============================================================================

// Theme storage key for localStorage
export const THEME_STORAGE_KEY = 'taskflow_theme';

// Theme modes
export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
};

// Default theme when no preference exists
export const DEFAULT_THEME = THEME_MODES.LIGHT;
```

Add theme shortcuts to KEYBOARD_SHORTCUTS array:

```javascript
// Theme shortcuts (in KEYBOARD_SHORTCUTS array)
{
  key: 'd',
  modifiers: ['ctrl', 'alt'],
  action: 'switchToDark',
  context: SHORTCUT_CONTEXTS.GLOBAL,
  category: SHORTCUT_CATEGORIES.GLOBAL,
  description: 'Switch to dark mode',
  enabled: true,
},
{
  key: 'l',
  modifiers: ['ctrl', 'alt'],
  action: 'switchToLight',
  context: SHORTCUT_CONTEXTS.GLOBAL,
  category: SHORTCUT_CATEGORIES.GLOBAL,
  description: 'Switch to light mode',
  enabled: true,
},
```

### Step 3: Create Theme Utilities

Create `src/utils/themeUtils.js`:

```javascript
import { THEME_MODES, THEME_STORAGE_KEY, DEFAULT_THEME } from './constants';

/**
 * Get the system/OS preferred theme
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
 */
export function isValidTheme(value) {
  return value === THEME_MODES.LIGHT || value === THEME_MODES.DARK;
}

/**
 * Get stored theme from localStorage
 */
export function getStoredTheme() {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return isValidTheme(stored) ? stored : null;
  } catch {
    return null;
  }
}

/**
 * Save theme to localStorage
 */
export function setStoredTheme(theme) {
  try {
    if (isValidTheme(theme)) {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  } catch (e) {
    console.warn('Failed to save theme preference:', e);
  }
}

/**
 * Apply theme class to document
 */
export function applyThemeClass(theme) {
  const root = document.documentElement;
  if (theme === THEME_MODES.DARK) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

/**
 * Get initial theme (stored > system > default)
 */
export function getInitialTheme() {
  const stored = getStoredTheme();
  if (stored) return { theme: stored, isSystemDefault: false };
  
  const system = getSystemTheme();
  return { theme: system, isSystemDefault: true };
}
```

### Step 4: Create ThemeContext

Create `src/contexts/ThemeContext.jsx`:

```javascript
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { THEME_MODES } from '../utils/constants';
import {
  getInitialTheme,
  setStoredTheme,
  applyThemeClass,
  isValidTheme,
} from '../utils/themeUtils';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [state, setState] = useState(() => {
    const initial = getInitialTheme();
    return {
      theme: initial.theme,
      isSystemDefault: initial.isSystemDefault,
    };
  });

  // Apply theme class on mount and when theme changes
  useEffect(() => {
    applyThemeClass(state.theme);
  }, [state.theme]);

  const setTheme = useCallback((newTheme) => {
    if (!isValidTheme(newTheme)) return;
    setState({ theme: newTheme, isSystemDefault: false });
    setStoredTheme(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = state.theme === THEME_MODES.DARK 
      ? THEME_MODES.LIGHT 
      : THEME_MODES.DARK;
    setTheme(newTheme);
  }, [state.theme, setTheme]);

  const value = {
    theme: state.theme,
    isDark: state.theme === THEME_MODES.DARK,
    isSystemDefault: state.isSystemDefault,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

### Step 5: Create ThemeToggle Component

Create `src/components/ui/ThemeToggle.jsx`:

```javascript
import { useTheme } from '../../contexts/ThemeContext';

export function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${className}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode (Ctrl+Alt+L)' : 'Switch to dark mode (Ctrl+Alt+D)'}
    >
      {isDark ? (
        // Sun icon for dark mode (click to go light)
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        // Moon icon for light mode (click to go dark)
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
}
```

### Step 6: Integrate with Dashboard

Update `src/components/Dashboard.jsx`:

```javascript
import { ThemeProvider } from '../contexts/ThemeContext';
import { ThemeToggle } from './ui/ThemeToggle';

// In header section (next to UserSwitcher):
<div className="flex items-center space-x-2">
  <ThemeToggle />
  <UserSwitcher />
</div>

// Wrap with ThemeProvider at top level (before KeyboardShortcutProvider)
```

### Step 7: Add CSS Transitions

Update `src/styles/globals.css`:

```css
/* Theme transition */
html {
  transition: background-color 150ms ease-in-out;
}

/* Prevent transition on initial load */
html.no-transition,
html.no-transition * {
  transition: none !important;
}
```

### Step 8: Update Components with Dark Mode Classes

Add `dark:` variants to components. Example patterns:

```jsx
// Backgrounds
<div className="bg-white dark:bg-slate-900">

// Text
<p className="text-gray-900 dark:text-white">
<span className="text-gray-500 dark:text-gray-400">

// Borders
<div className="border border-gray-200 dark:border-gray-700">

// Inputs
<input className="bg-white dark:bg-slate-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500">

// Buttons
<button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white">

// Cards
<div className="bg-white dark:bg-slate-800 shadow dark:shadow-slate-700/20">
```

## Testing

### Manual Testing Checklist

1. **Theme Toggle**
   - [ ] Click toggle in header switches between light/dark
   - [ ] Icon updates to reflect current mode
   - [ ] All elements update immediately

2. **Keyboard Shortcuts**
   - [ ] Ctrl+Alt+D switches to dark mode
   - [ ] Ctrl+Alt+L switches to light mode
   - [ ] Shortcuts work when typing in input fields
   - [ ] Shortcuts listed in Ctrl+/ help overlay

3. **Persistence**
   - [ ] Theme persists after page refresh
   - [ ] Theme persists after browser restart
   - [ ] Theme persists after logout/login

4. **OS Detection**
   - [ ] Clear localStorage, set OS to dark → app starts dark
   - [ ] Clear localStorage, set OS to light → app starts light

5. **Visual Inspection**
   - [ ] All text readable in dark mode
   - [ ] All inputs visible in dark mode
   - [ ] All buttons distinguishable in dark mode
   - [ ] Charts/analytics visible in dark mode
   - [ ] No unthemed elements

## Common Issues

### Flash of Wrong Theme

If you see a flash of light theme before dark loads:
1. Add theme detection script in `<head>` of index.html
2. Apply `no-transition` class initially, remove after hydration

### Charts Not Themed

Recharts requires programmatic color updates:
1. Use ThemeContext to get `chartColors`
2. Pass colors to chart component props

### Third-Party Component Issues

For components that don't respect Tailwind dark mode:
1. Use CSS variables in globals.css
2. Apply overrides with `.dark` selector

## Next Steps

After basic implementation:
1. Theme all remaining components
2. Test across all views
3. Verify WCAG contrast compliance
4. Add print styles (force light theme)
