/**
 * TaskActions Component
 * Status action buttons for task workflow transitions
 */

import { useState } from 'react';
import { STATUSES, STATUS_LABELS } from '../../utils/constants';
import { ReopenConfirmDialog } from '../ui/ConfirmDialog';

/**
 * TaskActions component
 * @param {object} props
 * @param {object} props.task - The task to show actions for
 * @param {Function} props.onStart - Callback when start is clicked
 * @param {Function} props.onComplete - Callback when complete is clicked
 * @param {Function} props.onReopen - Callback when reopen is clicked
 * @param {Function} props.onEdit - Callback when edit is clicked
 * @param {Function} props.onDelete - Callback when delete is clicked
 * @param {boolean} props.showEdit - Whether to show edit button
 * @param {boolean} props.showDelete - Whether to show delete button
 * @param {string} props.size - Button size: 'sm' | 'md' | 'lg'
 * @param {string} props.layout - Layout: 'horizontal' | 'vertical'
 */
export function TaskActions({
  task,
  onStart,
  onComplete,
  onReopen,
  onEdit,
  onDelete,
  showEdit = false,
  showDelete = false,
  size = 'sm',
  layout = 'horizontal',
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null);
  const [showReopenConfirm, setShowReopenConfirm] = useState(false);

  // Size classes
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  // Layout classes
  const layoutClasses = {
    horizontal: 'flex items-center gap-2',
    vertical: 'flex flex-col gap-2',
  };

  // Handle action with loading state
  const handleAction = async (action, callback) => {
    if (isLoading) return;

    setIsLoading(true);
    setLoadingAction(action);

    try {
      await callback();
    } catch (error) {
      console.error(`Failed to ${action} task:`, error);
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  };

  // Handle start task
  const handleStart = () => {
    handleAction('start', () => onStart && onStart(task.id));
  };

  // Handle complete task
  const handleComplete = () => {
    handleAction('complete', () => onComplete && onComplete(task.id));
  };

  // Handle reopen task (with confirmation)
  const handleReopenClick = () => {
    setShowReopenConfirm(true);
  };

  const handleReopenConfirm = async () => {
    await handleAction('reopen', () => onReopen && onReopen(task.id));
    setShowReopenConfirm(false);
  };

  // Render loading spinner
  const LoadingSpinner = () => (
    <svg
      className="animate-spin h-4 w-4"
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
  );

  return (
    <>
      <div
        className={layoutClasses[layout]}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Status-specific actions */}
        {task.status === STATUSES.PENDING && (
          <button
            type="button"
            onClick={handleStart}
            disabled={isLoading}
            className={`inline-flex items-center justify-center rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 ${sizeClasses[size]}`}
            aria-label="Start task"
          >
            {loadingAction === 'start' ? (
              <LoadingSpinner />
            ) : (
              <>
                <svg
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Start
              </>
            )}
          </button>
        )}

        {task.status === STATUSES.IN_PROGRESS && (
          <button
            type="button"
            onClick={handleComplete}
            disabled={isLoading}
            className={`inline-flex items-center justify-center rounded-md font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 ${sizeClasses[size]}`}
            aria-label="Complete task"
          >
            {loadingAction === 'complete' ? (
              <LoadingSpinner />
            ) : (
              <>
                <svg
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Complete
              </>
            )}
          </button>
        )}

        {task.status === STATUSES.COMPLETED && (
          <button
            type="button"
            onClick={handleReopenClick}
            disabled={isLoading}
            className={`inline-flex items-center justify-center rounded-md font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 disabled:opacity-50 ${sizeClasses[size]}`}
            aria-label="Reopen task"
          >
            {loadingAction === 'reopen' ? (
              <LoadingSpinner />
            ) : (
              <>
                <svg
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Reopen
              </>
            )}
          </button>
        )}

        {/* Edit button */}
        {showEdit && onEdit && (
          <button
            type="button"
            onClick={() => onEdit(task)}
            disabled={isLoading}
            className={`inline-flex items-center justify-center rounded-md font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 ${sizeClasses[size]}`}
            aria-label="Edit task"
          >
            <svg
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit
          </button>
        )}

        {/* Delete button */}
        {showDelete && onDelete && (
          <button
            type="button"
            onClick={() => onDelete(task)}
            disabled={isLoading}
            className={`inline-flex items-center justify-center rounded-md font-medium text-red-700 bg-white border border-red-300 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 ${sizeClasses[size]}`}
            aria-label="Delete task"
          >
            <svg
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete
          </button>
        )}
      </div>

      {/* Reopen Confirmation Dialog */}
      <ReopenConfirmDialog
        isOpen={showReopenConfirm}
        onClose={() => setShowReopenConfirm(false)}
        onConfirm={handleReopenConfirm}
        taskName={task.taskName}
        isLoading={loadingAction === 'reopen'}
      />
    </>
  );
}

/**
 * TaskStatusButton - Compact status change button
 */
export function TaskStatusButton({ task, onStatusChange, disabled = false }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async (e) => {
    e.stopPropagation();
    if (!onStatusChange || isLoading || disabled) return;

    setIsLoading(true);
    try {
      await onStatusChange(task);
    } finally {
      setIsLoading(false);
    }
  };

  // Get next status and button styling
  const getButtonConfig = () => {
    switch (task.status) {
      case STATUSES.PENDING:
        return {
          nextStatus: STATUSES.IN_PROGRESS,
          label: 'Start',
          className: 'text-blue-600 hover:text-blue-800 hover:bg-blue-50',
        };
      case STATUSES.IN_PROGRESS:
        return {
          nextStatus: STATUSES.COMPLETED,
          label: 'Complete',
          className: 'text-green-600 hover:text-green-800 hover:bg-green-50',
        };
      case STATUSES.COMPLETED:
        return {
          nextStatus: STATUSES.PENDING,
          label: 'Reopen',
          className: 'text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50',
        };
      default:
        return null;
    }
  };

  const config = getButtonConfig();
  if (!config) return null;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading || disabled}
      className={`p-1 rounded transition-colors disabled:opacity-50 ${config.className}`}
      title={`${config.label} task`}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-4 w-4"
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
      ) : (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {task.status === STATUSES.PENDING && (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
          )}
          {task.status === STATUSES.IN_PROGRESS && (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          )}
          {task.status === STATUSES.COMPLETED && (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          )}
        </svg>
      )}
    </button>
  );
}

export default TaskActions;
