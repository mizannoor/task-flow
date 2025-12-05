/**
 * BulkBlockedWarningModal Component
 * Warning dialog when bulk status change includes blocked tasks
 */

import { useTranslation } from '../../hooks/useTranslation';

/**
 * BulkBlockedWarningModal component
 * @param {object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Array} props.blockedTasks - Array of blocked task info [{taskId, taskName, blockedByCount}]
 * @param {number} props.totalTaskCount - Total tasks being changed
 * @param {Function} props.onSkipBlocked - Callback to proceed with unblocked tasks only
 * @param {Function} props.onForceAll - Callback to force change all tasks
 * @param {Function} props.onCancel - Callback to cancel the operation
 * @param {boolean} props.isLoading - Whether operation is in progress
 */
export function BulkBlockedWarningModal({
  isOpen,
  blockedTasks = [],
  totalTaskCount,
  onSkipBlocked,
  onForceAll,
  onCancel,
  isLoading = false,
}) {
  const { t } = useTranslation();

  if (!isOpen) {
    return null;
  }

  const blockedCount = blockedTasks.length;
  const unblockeddCount = totalTaskCount - blockedCount;

  // Prevent clicking behind modal
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      onCancel();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 transition-opacity" />

      {/* Modal container */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          {/* Modal content */}
          <div className="bg-white dark:bg-gray-800 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              {/* Warning icon */}
              <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30 sm:mx-0 sm:h-10 sm:w-10">
                <svg
                  className="h-6 w-6 text-yellow-600 dark:text-yellow-400"
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
              </div>

              {/* Content */}
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left flex-1">
                <h3
                  className="text-lg font-semibold leading-6 text-gray-900 dark:text-white"
                  id="modal-title"
                >
                  {t('bulk.status.blockedWarning')}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    {t('bulk.status.blockedCount', { count: blockedCount })}
                  </p>

                  {/* List of blocked tasks */}
                  <div className="max-h-40 overflow-y-auto rounded border border-gray-200 dark:border-gray-700">
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                      {blockedTasks.map((task) => (
                        <li
                          key={task.taskId}
                          className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2"
                        >
                          <svg className="h-4 w-4 text-yellow-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          <span className="truncate">{task.taskName}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal actions */}
          <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-2">
            {/* Skip blocked - proceed with unblocked only */}
            {unblockeddCount > 0 && (
              <button
                type="button"
                onClick={onSkipBlocked}
                disabled={isLoading}
                className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
              >
                {isLoading ? (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  `${t('bulk.status.skipBlocked')} (${unblockeddCount})`
                )}
              </button>
            )}

            {/* Force start all */}
            <button
              type="button"
              onClick={onForceAll}
              disabled={isLoading}
              className="mt-2 sm:mt-0 inline-flex w-full justify-center rounded-md bg-yellow-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
            >
              {t('bulk.status.forceStart')}
            </button>

            {/* Cancel */}
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="mt-2 sm:mt-0 inline-flex w-full justify-center rounded-md bg-white dark:bg-gray-600 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BulkBlockedWarningModal;
