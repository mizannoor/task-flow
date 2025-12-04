/**
 * DependencyList Component
 * Displays a list of task dependencies with status and optional remove action
 */

import { STATUS_LABELS, STATUS_COLORS, STATUSES } from '../../utils/constants';

/**
 * DependencyList component
 * @param {object} props
 * @param {object[]} props.tasks - Array of task objects to display
 * @param {string[]} props.dependencyIds - Array of dependency IDs (for removal)
 * @param {string} props.emptyMessage - Message when list is empty
 * @param {string} props.title - Section title
 * @param {boolean} props.showRemove - Whether to show remove button
 * @param {Function} props.onRemove - Callback when remove is clicked (receives dependencyId)
 * @param {Function} props.onTaskClick - Callback when task is clicked (receives taskId)
 * @param {boolean} props.isLoading - Loading state
 * @param {'blocked-by' | 'blocks'} props.type - Type of list for proper labeling
 */
export function DependencyList({
  tasks = [],
  dependencyIds = [],
  emptyMessage = 'No dependencies',
  title,
  showRemove = false,
  onRemove,
  onTaskClick,
  isLoading = false,
  type = 'blocked-by',
}) {
  if (isLoading) {
    return (
      <div className="py-4">
        {title && (
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{title}</h4>
        )}
        <div className="flex items-center justify-center py-4">
          <svg
            className="w-5 h-5 text-gray-400 animate-spin"
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
          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Loading...</span>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="py-2">
        {title && (
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{title}</h4>
        )}
        <p className="text-sm text-gray-500 dark:text-gray-400 italic">{emptyMessage}</p>
      </div>
    );
  }

  // Get satisfaction status icon
  const getSatisfactionIcon = (task) => {
    const isCompleted = task.status === STATUSES.COMPLETED;

    if (isCompleted) {
      return (
        <svg
          className="w-4 h-4 text-green-500 dark:text-green-400"
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
      );
    }

    return (
      <svg
        className="w-4 h-4 text-yellow-500 dark:text-yellow-400"
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
    );
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const colorClass = STATUS_COLORS[status] || STATUS_COLORS[STATUSES.PENDING];
    const label = STATUS_LABELS[status] || status;

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}>
        {label}
      </span>
    );
  };

  return (
    <div className="py-2">
      {title && (
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
          {title}
          <span className="text-xs text-gray-500 dark:text-gray-400">({tasks.length})</span>
        </h4>
      )}

      <ul className="space-y-2" role="list">
        {tasks.map((task, index) => {
          const dependencyId = dependencyIds[index];
          const isCompleted = task.status === STATUSES.COMPLETED;

          return (
            <li
              key={task.id}
              className={`
                flex items-center justify-between
                p-2 rounded-lg
                bg-gray-50 dark:bg-gray-800/50
                border border-gray-200 dark:border-gray-700
                ${onTaskClick ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50' : ''}
                transition-colors
              `}
              onClick={() => onTaskClick?.(task.id)}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Satisfaction indicator */}
                <div className="flex-shrink-0">{getSatisfactionIcon(task)}</div>

                {/* Task info */}
                <div className="flex-1 min-w-0">
                  <p
                    className={`
                      text-sm font-medium truncate
                      ${isCompleted ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-gray-900 dark:text-gray-100'}
                    `}
                  >
                    {task.taskName}
                  </p>
                  {task.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {task.description}
                    </p>
                  )}
                </div>

                {/* Status badge */}
                <div className="flex-shrink-0">{getStatusBadge(task.status)}</div>
              </div>

              {/* Remove button */}
              {showRemove && onRemove && dependencyId && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(dependencyId);
                  }}
                  className={`
                    ml-2 p-1.5 rounded
                    text-gray-400 hover:text-red-500
                    dark:text-gray-500 dark:hover:text-red-400
                    hover:bg-red-50 dark:hover:bg-red-900/20
                    transition-colors
                    focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
                    dark:focus:ring-offset-gray-800
                  `}
                  aria-label={`Remove dependency on ${task.taskName}`}
                  title="Remove dependency"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {/* Helper text based on type */}
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        {type === 'blocked-by'
          ? 'Complete the tasks above to unblock this task'
          : 'Completing this task will unblock the tasks above'}
      </p>
    </div>
  );
}

/**
 * Compact dependency count display
 */
export function DependencyCount({ blockedByCount = 0, blocksCount = 0 }) {
  if (blockedByCount === 0 && blocksCount === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
      {blockedByCount > 0 && (
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          {blockedByCount} {blockedByCount === 1 ? 'blocker' : 'blockers'}
        </span>
      )}
      {blocksCount > 0 && (
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          Blocks {blocksCount}
        </span>
      )}
    </div>
  );
}

export default DependencyList;
