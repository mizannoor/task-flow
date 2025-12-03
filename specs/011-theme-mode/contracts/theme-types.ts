/**
 * Theme Mode Type Definitions
 * Feature: 011-theme-mode
 */

// =============================================================================
// Core Types
// =============================================================================

/**
 * Theme mode values
 */
export type ThemeMode = 'light' | 'dark';

/**
 * Theme state managed by ThemeContext
 */
export interface ThemeState {
  /** Current active theme */
  theme: ThemeMode;
  /** Convenience flag for dark mode checks */
  isDark: boolean;
  /** True if using OS preference (no user-saved value) */
  isSystemDefault: boolean;
}

/**
 * Theme context value provided to consumers
 */
export interface ThemeContextValue extends ThemeState {
  /** Set theme to specific mode */
  setTheme: (theme: ThemeMode) => void;
  /** Toggle between light and dark */
  toggleTheme: () => void;
  /** Chart colors for current theme */
  chartColors: ChartColors;
}

// =============================================================================
// Color Configuration
// =============================================================================

/**
 * Color palette for chart components (Recharts)
 */
export interface ChartColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  grid: string;
  text: string;
  background: string;
}

/**
 * Full color palette for a theme mode
 */
export interface ThemeColors {
  // Backgrounds
  background: string;
  surface: string;
  surfaceHover: string;
  
  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  
  // Accents
  primary: string;
  secondary: string;
  accent: string;
  
  // Status
  success: string;
  warning: string;
  error: string;
  
  // Borders
  border: string;
  borderHover: string;
  
  // Inputs
  inputBg: string;
  inputBorder: string;
  inputFocus: string;
  placeholder: string;
}

/**
 * Priority badge colors per theme
 */
export interface PriorityColors {
  urgent: string;
  high: string;
  medium: string;
  low: string;
}

// =============================================================================
// Component Props
// =============================================================================

/**
 * Props for ThemeToggle component
 */
export interface ThemeToggleProps {
  /** Additional CSS classes */
  className?: string;
  /** Show label text (default: false, icon only) */
  showLabel?: boolean;
}

/**
 * Props for ThemeProvider component
 */
export interface ThemeProviderProps {
  /** Child components */
  children: React.ReactNode;
  /** Default theme if no preference saved (default: 'light') */
  defaultTheme?: ThemeMode;
  /** Storage key for localStorage (default: 'taskflow_theme') */
  storageKey?: string;
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Theme utility function signatures
 */
export interface ThemeUtils {
  /** Get system/OS preferred theme */
  getSystemTheme: () => ThemeMode;
  /** Validate theme value */
  isValidTheme: (value: unknown) => value is ThemeMode;
  /** Get theme from localStorage */
  getStoredTheme: (key?: string) => ThemeMode | null;
  /** Save theme to localStorage */
  setStoredTheme: (theme: ThemeMode, key?: string) => void;
  /** Apply theme class to document */
  applyThemeClass: (theme: ThemeMode) => void;
}

// =============================================================================
// Keyboard Shortcuts
// =============================================================================

/**
 * Theme-related keyboard shortcut actions
 */
export type ThemeShortcutAction = 'switchToDark' | 'switchToLight';

/**
 * Theme shortcut definition (extends existing shortcut structure)
 */
export interface ThemeShortcut {
  key: string;
  modifiers: ('ctrl' | 'alt' | 'shift' | 'meta')[];
  action: ThemeShortcutAction;
  context: 'global';
  category: 'global';
  description: string;
  enabled: boolean;
}

// =============================================================================
// Constants
// =============================================================================

/**
 * Default storage key for theme preference
 */
export const THEME_STORAGE_KEY = 'taskflow_theme';

/**
 * Default theme when no preference exists and OS detection fails
 */
export const DEFAULT_THEME: ThemeMode = 'light';

/**
 * CSS class applied to <html> for dark mode
 */
export const DARK_MODE_CLASS = 'dark';
