/**
 * BlockedTaskWarningModal Component
 * Displays a warning when user attempts to start a blocked task
 * Allows viewing blocking tasks and optionally overriding the block
 */

import { Modal, ModalFooter } from '../ui/Modal';
import { useTranslation } from '../../hooks/useTranslation';
import { STATUS_COLORS, STATUSES } from '../../utils/constants';

/**
 * BlockedTaskWarningModal component
 * @param {object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Callback when modal should close
 * @param {Function} props.onStartAnyway - Callback when user confirms starting anyway
 * @param {object} props.task - The blocked task being started
 * @param {object[]} props.blockingTasks - Array of tasks blocking this task
 * @param {boolean} props.isLoading - Whether the start action is in progress
 */
export function BlockedTaskWarningModal({
  isOpen,
  onClose,
  onStartAnyway,
  task,
  blockingTasks = [],
  isLoading = false,
}) {
  const { t } = useTranslation();

  // Count incomplete blocking tasks
  const incompleteBlockers = blockingTasks.filter(
    (bt) => bt.status !== STATUSES.COMPLETED
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('dependencies.blockedWarningTitle', 'Task is Blocked')}
      size="md"
    >
      <div className="space-y-4">
        {/* Warning Icon and Message */}
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-yellow-600 dark:text-yellow-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {t(
                'dependencies.blockedWarningMessage',
                'This task has incomplete dependencies that should be completed first.'
              )}
            </p>
            {task && (
              <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
                "{task.taskName}"
              </p>
            )}
          </div>
        </div>

        {/* Blocking Tasks List */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
            <svg
              className="w-4 h-4 mr-2 text-red-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                clipRule="evenodd"
              />
              <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
            </svg>
            {t(
              'dependencies.blockingTasksTitle',
              `Blocking Tasks (${incompleteBlockers.length} incomplete)`
            )}
          </h4>

          {blockingTasks.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
              {t('dependencies.noBlockingTasks', 'No blocking tasks found')}
            </p>
          ) : (
            <ul className="space-y-2">
              {blockingTasks.map((blockingTask) => {
                const isCompleted = blockingTask.status === STATUSES.COMPLETED;
                const statusColor = STATUS_COLORS[blockingTask.status] || 'gray';

                return (
                  <li
                    key={blockingTask.id}
                    className={`flex items-center justify-between p-2 rounded-md ${isCompleted
                        ? 'bg-green-50 dark:bg-green-900/20'
                        : 'bg-white dark:bg-gray-700/50'
                      }`}
                  >
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      {/* Status Icon */}
                      {isCompleted ? (
                        <svg
                          className="w-4 h-4 text-green-500 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          aria-label="Completed"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-4 h-4 text-yellow-500 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          aria-label="Pending"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}

                      {/* Task Name */}
                      <span
                        className={`text-sm truncate ${isCompleted
                            ? 'text-gray-500 dark:text-gray-400 line-through'
                            : 'text-gray-900 dark:text-gray-100'
                          }`}
                        title={blockingTask.taskName}
                      >
                        {blockingTask.taskName}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0 ${isCompleted
                          ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300'
                          : `bg-${statusColor}-100 text-${statusColor}-800 dark:bg-${statusColor}-800/30 dark:text-${statusColor}-300`
                        }`}
                    >
                      {isCompleted
                        ? t('status.completed', 'Completed')
                        : t(`status.${blockingTask.status}`, blockingTask.status)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Info Note */}
        {incompleteBlockers.length > 0 && (
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-start">
            <svg
              className="w-4 h-4 mr-1 flex-shrink-0 text-blue-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            {t(
              'dependencies.startAnywayNote',
              'You can still start this task if needed, but consider completing the blocking tasks first for better workflow.'
            )}
          </p>
        )}
      </div>

      <ModalFooter>
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {t('common.cancel', 'Cancel')}
        </button>
        <button
          type="button"
          onClick={onStartAnyway}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 dark:bg-yellow-500 dark:hover:bg-yellow-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 inline-flex items-center"
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4"
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
              {t('common.starting', 'Starting...')}
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
              </svg>
              {t('dependencies.startAnyway', 'Start Anyway')}
            </>
          )}
        </button>
      </ModalFooter>
    </Modal>
  );
}

export default BlockedTaskWarningModal;
