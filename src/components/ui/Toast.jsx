/**
 * Toast Component
 * Displays notification messages to users
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Toast types for styling
 */
const TOAST_TYPES = {
  success: {
    bgColor: 'bg-green-50 dark:bg-green-900/30',
    borderColor: 'border-green-400 dark:border-green-500',
    textColor: 'text-green-800 dark:text-green-200',
    iconColor: 'text-green-400 dark:text-green-300',
    icon: (
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
        clipRule="evenodd"
      />
    ),
  },
  error: {
    bgColor: 'bg-red-50 dark:bg-red-900/30',
    borderColor: 'border-red-400 dark:border-red-500',
    textColor: 'text-red-800 dark:text-red-200',
    iconColor: 'text-red-400 dark:text-red-300',
    icon: (
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
        clipRule="evenodd"
      />
    ),
  },
  warning: {
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/30',
    borderColor: 'border-yellow-400 dark:border-yellow-500',
    textColor: 'text-yellow-800 dark:text-yellow-200',
    iconColor: 'text-yellow-400 dark:text-yellow-300',
    icon: (
      <path
        fillRule="evenodd"
        d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
        clipRule="evenodd"
      />
    ),
  },
  info: {
    bgColor: 'bg-blue-50 dark:bg-blue-900/30',
    borderColor: 'border-blue-400 dark:border-blue-500',
    textColor: 'text-blue-800 dark:text-blue-200',
    iconColor: 'text-blue-400 dark:text-blue-300',
    icon: (
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
        clipRule="evenodd"
      />
    ),
  },
};

/**
 * Individual Toast Item
 */
function ToastItem({ id, type = 'info', message, onDismiss, duration = 5000 }) {
  const [isVisible, setIsVisible] = useState(true);
  const styles = TOAST_TYPES[type] || TOAST_TYPES.info;

  // Auto-dismiss after duration
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onDismiss(id), 300); // Wait for animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, id, onDismiss]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => onDismiss(id), 300);
  }, [id, onDismiss]);

  return (
    <div
      className={`transform transition-all duration-300 ease-in-out ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}
    >
      <div
        className={`rounded-md border-l-4 ${styles.borderColor} ${styles.bgColor} p-4 shadow-lg`}
        role="alert"
        aria-live="polite"
      >
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className={`h-5 w-5 ${styles.iconColor}`}
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              {styles.icon}
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <p className={`text-sm ${styles.textColor}`}>{message}</p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              type="button"
              onClick={handleDismiss}
              className={`inline-flex ${styles.textColor} hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-${type === 'error' ? 'red' : type === 'success' ? 'green' : type === 'warning' ? 'yellow' : 'blue'}-50 focus:ring-${type === 'error' ? 'red' : type === 'success' ? 'green' : type === 'warning' ? 'yellow' : 'blue'}-600 rounded-md`}
            >
              <span className="sr-only">Dismiss</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Toast Container
 * Manages and displays multiple toasts
 */
export function ToastContainer({ toasts = [], onDismiss }) {
  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          id={toast.id}
          type={toast.type}
          message={toast.message}
          duration={toast.duration}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
}

/**
 * Custom hook for managing toasts
 */
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, message, duration = 5000) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message, duration }]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = {
    success: (message, duration) => addToast('success', message, duration),
    error: (message, duration) => addToast('error', message, duration),
    warning: (message, duration) => addToast('warning', message, duration),
    info: (message, duration) => addToast('info', message, duration),
  };

  return { toasts, toast, removeToast };
}

export default ToastContainer;
