/**
 * TaskRow Component
 * Table row display for a single task in the task list
 */

import { PriorityBadge, StatusBadge, CategoryBadge } from '../ui/Badge';
import useTranslation from '../../hooks/useTranslation';
import { formatDate, formatDuration, formatDeadline } from '../../utils/formatters';
import { TaskStatusButton } from './TaskActions';
import { TaskTimer } from './TaskTimer';
import { DependencyIndicator } from './DependencyBadge';

/**
 * TaskRow component
 * @param {object} props
 * @param {object} props.task - The task to display
 * @param {Function} props.onEdit - Callback when edit is clicked
 * @param {Function} props.onStatusChange - Callback when status action is clicked
 * @param {Function} props.onDelete - Callback when delete is clicked
 * @param {boolean} props.showActions - Whether to show action buttons
 * @param {object} props.dependencyInfo - Dependency information for this task
 */
export function TaskRow({
  task,
  onEdit,
  onStatusChange,
  onDelete,
  showActions = true,
  dependencyInfo = null,
}) {
  const { t } = useTranslation();
  const deadline = formatDeadline(task.deadline);

  // Handle row click for editing
  const handleRowClick = () => {
    if (onEdit) {
      onEdit(task);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleRowClick();
    }
  };

  return (
    <tr
      className="hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer"
      onClick={handleRowClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`${t('common.edit')} ${t('tasks.task')}: ${task.taskName}`}
    >
      {/* Task Name */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">
              {task.taskName}
            </span>
            {/* Dependency indicator */}
            {dependencyInfo && (
              <DependencyIndicator
                isBlocked={dependencyInfo.isBlocked}
                blocksCount={dependencyInfo.blocksIds?.length || 0}
                size="sm"
              />
            )}
          </div>
          {task.description && (
            <span className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
              {task.description}
            </span>
          )}
        </div>
      </td>

      {/* Status */}
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge status={task.status} />
      </td>

      {/* Priority */}
      <td className="px-6 py-4 whitespace-nowrap">
        <PriorityBadge priority={task.priority} />
      </td>

      {/* Category */}
      <td className="px-6 py-4 whitespace-nowrap">
        <CategoryBadge category={task.category} />
      </td>

      {/* Deadline */}
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`text-sm ${deadline.isOverdue
            ? 'text-red-600 font-medium'
            : deadline.isToday
              ? 'text-orange-600 font-medium'
              : deadline.isSoon
                ? 'text-yellow-600'
                : 'text-gray-500'
            }`}
        >
          {deadline.text}
        </span>
      </td>

      {/* Duration - now shows tracked/estimated with timer indicator */}
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <div className="flex flex-col items-start gap-1">
          {/* Show timer indicator if applicable */}
          <TaskTimer task={task} variant="compact" />
          {/* Fallback to estimated only if no tracked time and no active timer */}
          {!task.actualDuration && !task.timerStartedAt && (
            <span className="text-gray-500 dark:text-gray-400">
              {formatDuration(task.estimatedDuration)}
            </span>
          )}
        </div>
      </td>

      {/* Created */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
        {formatDate(task.createdAt, { relative: true })}
      </td>

      {/* Actions */}
      {showActions && (
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div
            className="flex items-center justify-end gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Status change button */}
            {onStatusChange && (
              <TaskStatusButton task={task} onStatusChange={onStatusChange} />
            )}

            {/* Edit button */}
            <button
              type="button"
              onClick={() => onEdit && onEdit(task)}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
              aria-label={`${t('common.edit')} ${task.taskName}`}
            >
              <svg
                className="h-5 w-5"
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
            </button>

            {/* Delete button */}
            <button
              type="button"
              onClick={() => onDelete && onDelete(task)}
              className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
              aria-label={`${t('common.delete')} ${task.taskName}`}
            >
              <svg
                className="h-5 w-5"
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
            </button>
          </div>
        </td>
      )}
    </tr>
  );
}

/**
 * TaskRowCompact - Compact row variant for mobile/smaller views
 */
export function TaskRowCompact({
  task,
  onEdit,
  onStatusChange,
  onDelete,
  dependencyInfo = null,
}) {
  const { t } = useTranslation();
  const deadline = formatDeadline(task.deadline);

  return (
    <div
      className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md dark:hover:shadow-slate-900/50 transition-shadow cursor-pointer"
      onClick={() => onEdit && onEdit(task)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onEdit && onEdit(task);
        }
      }}
      aria-label={`${t('common.edit')} ${t('tasks.task')}: ${task.taskName}`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {task.taskName}
          </h4>
          {/* Dependency indicator */}
          {dependencyInfo && (
            <DependencyIndicator
              isBlocked={dependencyInfo.isBlocked}
              blocksCount={dependencyInfo.blocksIds?.length || 0}
              size="sm"
            />
          )}
        </div>
        <div className="ml-2 flex items-center gap-1">
          <PriorityBadge priority={task.priority} size="sm" />
          <StatusBadge status={task.status} size="sm" />
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate mb-2">
          {task.description}
        </p>
      )}

      {/* Footer row */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-3">
          <CategoryBadge category={task.category} size="sm" />
          {task.deadline && (
            <span
              className={
                deadline.isOverdue
                  ? 'text-red-600'
                  : deadline.isToday
                    ? 'text-orange-600'
                    : ''
              }
            >
              {deadline.text}
            </span>
          )}
        </div>
        <span>{formatDuration(task.estimatedDuration)}</span>
      </div>
    </div>
  );
}

export default TaskRow;
