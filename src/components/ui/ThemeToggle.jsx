/**
 * ThemeToggle Component
 * Button to toggle between light and dark themes
 * Displays sun icon in dark mode, moon icon in light mode
 */

import { useTheme } from '../../contexts/ThemeContext';

/**
 * Sun icon for dark mode (click to switch to light)
 */
function SunIcon({ className = 'w-5 h-5' }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  );
}

/**
 * Moon icon for light mode (click to switch to dark)
 */
function MoonIcon({ className = 'w-5 h-5' }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  );
}

/**
 * ThemeToggle Button
 * Accessible button that toggles between light and dark themes
 */
export function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme();

  // Determine tooltip text based on current theme
  const tooltipText = isDark
    ? 'Switch to light mode (Ctrl+Alt+L)'
    : 'Switch to dark mode (Ctrl+Alt+D)';

  // Determine aria-label for accessibility
  const ariaLabel = isDark
    ? 'Switch to light mode'
    : 'Switch to dark mode';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`
        p-2 rounded-lg
        text-gray-500 hover:text-gray-700
        dark:text-gray-400 dark:hover:text-gray-200
        hover:bg-gray-100 dark:hover:bg-gray-700
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        dark:focus:ring-offset-gray-800
        transition-colors duration-150
        ${className}
      `}
      aria-label={ariaLabel}
      title={tooltipText}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

export default ThemeToggle;
