/**
 * App Component
 * Main application shell with conditional rendering based on auth state
 */

import { useAuth } from './hooks/useAuth';
import { useTranslation } from './hooks/useTranslation';
import { ThemeProvider } from './contexts/ThemeContext';
import { LoginForm } from './components/auth/LoginForm';
import { Dashboard } from './components/Dashboard';

/**
 * Loading Spinner Component
 */
function LoadingSpinner() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
      <div className="text-center">
        <svg
          className="animate-spin h-10 w-10 text-indigo-600 dark:text-indigo-400 mx-auto"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
      </div>
    </div>
  );
}

/**
 * Storage Error Component
 * Displayed when IndexedDB or localStorage is unavailable
 */
function StorageError() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30">
          <svg
            className="h-6 w-6 text-red-600 dark:text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
          {t('errors.storageUnavailable').split('.')[0]}
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {t('errors.storageUnavailable')}
        </p>
        <div className="mt-6">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-900"
          >
            {t('common.retry')}
          </button>
        </div>
        <div className="mt-4">
          <p className="text-xs text-gray-500 dark:text-gray-500">
            Please ensure your browser allows local storage and IndexedDB,
            and that you're not in private/incognito mode.
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Main App Component
 */
function App() {
  const { isAuthenticated, isLoading, error } = useAuth();

  // Show loading spinner while checking auth state
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Show storage error if IndexedDB/localStorage is unavailable
  if (error?.code === 'STORAGE_UNAVAILABLE') {
    return <StorageError />;
  }

  // Route protection: show login form if not authenticated
  // Authenticated redirect: show dashboard if authenticated
  return isAuthenticated ? <Dashboard /> : <LoginForm />;
}

/**
 * App with Theme Provider
 * Wraps the entire app with theme context
 */
function AppWithTheme() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
}

export default AppWithTheme;
