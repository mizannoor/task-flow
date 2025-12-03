/**
 * ConfirmDialog Component
 * Modal dialog for confirming actions (delete, status change, etc.)
 */

import { Modal, ModalFooter } from './Modal';
import { useTranslation } from '../../hooks/useTranslation';

/**
 * ConfirmDialog component
 * @param {object} props
 * @param {boolean} props.isOpen - Whether the dialog is open
 * @param {Function} props.onClose - Callback when dialog should close
 * @param {Function} props.onConfirm - Callback when confirm is clicked
 * @param {string} props.title - Dialog title
 * @param {string} props.message - Main message
 * @param {string} props.confirmText - Confirm button text
 * @param {string} props.cancelText - Cancel button text
 * @param {string} props.variant - Style variant: 'danger' | 'warning' | 'info'
 * @param {boolean} props.isLoading - Whether an action is in progress
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  variant = 'danger',
  isLoading = false,
}) {
  const { t } = useTranslation();
  
  // Use provided text or fall back to translations
  const displayTitle = title || t('common.confirm');
  const displayMessage = message || t('common.confirmMessage');
  const displayConfirmText = confirmText || t('common.confirm');
  const displayCancelText = cancelText || t('common.cancel');
  // Variant styles
  const variantStyles = {
    danger: {
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      iconColor: 'text-red-600 dark:text-red-400',
      buttonClass:
        'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 focus:ring-red-500',
    },
    warning: {
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      buttonClass:
        'bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600 focus:ring-yellow-500',
    },
    info: {
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      buttonClass:
        'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:ring-blue-500',
    },
  };

  const styles = variantStyles[variant];

  // Icons for each variant
  const icons = {
    danger: (
      <svg
        className={`h-6 w-6 ${styles.iconColor}`}
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
        />
      </svg>
    ),
    warning: (
      <svg
        className={`h-6 w-6 ${styles.iconColor}`}
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
        />
      </svg>
    ),
    info: (
      <svg
        className={`h-6 w-6 ${styles.iconColor}`}
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
        />
      </svg>
    ),
  };

  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      showCloseButton={false}
      closeOnBackdropClick={!isLoading}
      closeOnEscape={!isLoading}
    >
      <div className="sm:flex sm:items-start">
        {/* Icon */}
        <div
          className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${styles.iconBg} sm:mx-0 sm:h-10 sm:w-10`}
        >
          {icons[variant]}
        </div>

        {/* Content */}
        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
          <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-white">
            {displayTitle}
          </h3>
          <div className="mt-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">{displayMessage}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <ModalFooter className="mt-5 sm:mt-4">
        <button
          type="button"
          className="inline-flex justify-center rounded-md bg-white dark:bg-slate-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 disabled:opacity-50"
          onClick={onClose}
          disabled={isLoading}
        >
          {displayCancelText}
        </button>
        <button
          type="button"
          className={`inline-flex justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${styles.buttonClass}`}
          onClick={handleConfirm}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
              {t('common.loading')}
            </>
          ) : (
            displayConfirmText
          )}
        </button>
      </ModalFooter>
    </Modal>
  );
}

/**
 * DeleteConfirmDialog - Pre-configured for delete actions
 */
export function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  itemName = 'this item',
  isLoading = false,
}) {
  const { t } = useTranslation();
  
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={t('tasks.deleteConfirmTitle')}
      message={t('tasks.deleteConfirmMessage', { name: itemName })}
      confirmText={t('common.delete')}
      cancelText={t('common.cancel')}
      variant="danger"
      isLoading={isLoading}
    />
  );
}

/**
 * ReopenConfirmDialog - Pre-configured for reopening completed tasks
 */
export function ReopenConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  taskName = 'this task',
  isLoading = false,
}) {
  const { t } = useTranslation();
  
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title={t('tasks.reopenConfirmTitle')}
      message={t('tasks.reopenConfirmMessage', { name: taskName })}
      confirmText={t('tasks.reopenTask')}
      cancelText={t('common.cancel')}
      variant="warning"
      isLoading={isLoading}
    />
  );
}

export default ConfirmDialog;
