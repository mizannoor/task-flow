/**
 * LoginForm Component
 * Passwordless login form with identifier validation
 */

import { useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';

export function LoginForm() {
  const { login, error, isLoading, clearError } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [localError, setLocalError] = useState(null);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (!identifier.trim()) {
      setLocalError('Please enter an email, username, or phone number');
      return;
    }

    try {
      await login(identifier);
    } catch (err) {
      // Error is already handled by AuthContext
      setLocalError(err.message);
    }
  }, [identifier, login]);

  /**
   * Handle input change
   */
  const handleInputChange = useCallback((e) => {
    setIdentifier(e.target.value);
    // Clear errors when user starts typing
    if (localError) setLocalError(null);
    if (error) clearError();
  }, [localError, error, clearError]);

  // Display error from context or local state
  const displayError = error?.message || localError;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            TaskFlow
          </h1>
          <h2 className="mt-2 text-center text-xl text-gray-600 dark:text-gray-300">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
            Enter your email, username, or phone number to continue.
            {' '}
            <span className="text-indigo-600 dark:text-indigo-400">
              No password needed!
            </span>
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="identifier" className="sr-only">
                Email, username, or phone
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                autoComplete="username"
                required
                className={`appearance-none rounded-md relative block w-full px-3 py-3 border ${displayError
                  ? 'border-red-300 dark:border-red-500 placeholder-red-400 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 dark:border-slate-600 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500'
                  } text-gray-900 dark:text-white dark:bg-slate-800 focus:outline-none focus:z-10 sm:text-sm`}
                placeholder="Email, username, or phone number"
                value={identifier}
                onChange={handleInputChange}
                disabled={isLoading}
                aria-describedby={displayError ? 'identifier-error' : undefined}
                aria-invalid={!!displayError}
              />
            </div>
          </div>

          {/* Error message */}
          {displayError && (
            <div
              id="identifier-error"
              className="rounded-md bg-red-50 dark:bg-red-900/30 p-4"
              role="alert"
              aria-live="polite"
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400 dark:text-red-300"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    {displayError}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Submit button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
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
                  Signing in...
                </>
              ) : (
                'Continue'
              )}
            </button>
          </div>
        </form>

        {/* Help text */}
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            By continuing, you agree to use TaskFlow for task management.
            Your data is stored locally on this device.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
