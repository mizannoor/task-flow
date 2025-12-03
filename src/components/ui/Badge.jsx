/**
 * Badge Component
 * Displays status and priority badges with appropriate colors
 */

import {
  PRIORITY_COLORS,
  PRIORITY_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
} from '../../utils/constants';

/**
 * Base Badge component
 * @param {object} props
 * @param {string} props.children - Badge content
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.size - Badge size: 'sm' | 'md' | 'lg'
 */
export function Badge({ children, className = '', size = 'sm' }) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${sizeClasses[size]} ${className}`}
    >
      {children}
    </span>
  );
}

/**
 * Priority Badge component
 * @param {object} props
 * @param {string} props.priority - Priority value: 'urgent' | 'high' | 'medium' | 'low'
 * @param {string} props.size - Badge size: 'sm' | 'md' | 'lg'
 * @param {boolean} props.showLabel - Whether to show the label text
 */
export function PriorityBadge({ priority, size = 'sm', showLabel = true }) {
  const colorClass = PRIORITY_COLORS[priority] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
  const label = PRIORITY_LABELS[priority] || priority;

  return (
    <Badge className={colorClass} size={size}>
      {showLabel ? label : null}
    </Badge>
  );
}

/**
 * Status Badge component
 * @param {object} props
 * @param {string} props.status - Status value: 'pending' | 'in-progress' | 'completed'
 * @param {string} props.size - Badge size: 'sm' | 'md' | 'lg'
 * @param {boolean} props.showLabel - Whether to show the label text
 */
export function StatusBadge({ status, size = 'sm', showLabel = true }) {
  const colorClass = STATUS_COLORS[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
  const label = STATUS_LABELS[status] || status;

  return (
    <Badge className={colorClass} size={size}>
      {showLabel ? label : null}
    </Badge>
  );
}

/**
 * Category Badge component
 * @param {object} props
 * @param {string} props.category - Category value: 'development' | 'fix' | 'support'
 * @param {string} props.size - Badge size: 'sm' | 'md' | 'lg'
 * @param {boolean} props.showLabel - Whether to show the label text
 */
export function CategoryBadge({ category, size = 'sm', showLabel = true }) {
  const colorClass = CATEGORY_COLORS[category] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
  const label = CATEGORY_LABELS[category] || category;

  return (
    <Badge className={colorClass} size={size}>
      {showLabel ? label : null}
    </Badge>
  );
}

/**
 * Tag Badge component for custom tags
 * @param {object} props
 * @param {string} props.tag - The tag text
 * @param {string} props.size - Badge size: 'sm' | 'md' | 'lg'
 * @param {Function} props.onRemove - Callback when remove button is clicked
 */
export function TagBadge({ tag, size = 'sm', onRemove }) {
  return (
    <Badge className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300" size={size}>
      <span>{tag}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(tag);
          }}
          className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label={`Remove ${tag} tag`}
        >
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </Badge>
  );
}

/**
 * Deadline Badge component
 * @param {object} props
 * @param {boolean} props.isOverdue - Whether the deadline is past
 * @param {boolean} props.isToday - Whether the deadline is today
 * @param {boolean} props.isSoon - Whether the deadline is within 3 days
 * @param {string} props.text - The deadline text to display
 * @param {string} props.size - Badge size: 'sm' | 'md' | 'lg'
 */
export function DeadlineBadge({ isOverdue, isToday, isSoon, text, size = 'sm' }) {
  let colorClass = 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';

  if (isOverdue) {
    colorClass = 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300';
  } else if (isToday) {
    colorClass = 'bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-300';
  } else if (isSoon) {
    colorClass = 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300';
  }

  return (
    <Badge className={colorClass} size={size}>
      {text}
    </Badge>
  );
}

export default Badge;
