/**
 * DependencyBadge Component
 * Visual indicator showing task dependency status
 */

import { DEPENDENCY_STATUS, DEPENDENCY_STATUS_LABELS } from '../../utils/constants';

/**
 * DependencyBadge component
 * @param {object} props
 * @param {boolean} props.isBlocked - Whether task is blocked
 * @param {number} props.blockedByCount - Number of incomplete blockers
 * @param {number} props.blocksCount - Number of tasks this blocks
 * @param {string} props.size - Badge size ('sm' | 'md' | 'lg')
 * @param {boolean} props.showLabel - Whether to show text label
 * @param {Function} props.onClick - Optional click handler
 */
export function DependencyBadge({
  isBlocked = false,
  blockedByCount = 0,
  blocksCount = 0,
  size = 'sm',
  showLabel = false,
  onClick,
}) {
  // No dependencies - don't render anything
  if (!isBlocked && blocksCount === 0 && blockedByCount === 0) {
    return null;
  }

  // Determine status and styling
  let status;
  let colorClasses;
  let icon;

  if (isBlocked) {
    status = DEPENDENCY_STATUS.BLOCKED;
    colorClasses = 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
    icon = (
      <svg
        className={`${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
    );
  } else if (blocksCount > 0) {
    status = DEPENDENCY_STATUS.BLOCKING;
    colorClasses = 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300';
    icon = (
      <svg
        className={`${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    );
  } else if (blockedByCount > 0) {
    // Has dependencies but all completed (ready)
    status = DEPENDENCY_STATUS.READY;
    colorClasses = 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300';
    icon = (
      <svg
        className={`${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    );
  }

  // Size classes
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  const label = DEPENDENCY_STATUS_LABELS[status];
  const count = isBlocked ? blockedByCount : blocksCount;

  const content = (
    <>
      {icon}
      {showLabel && <span className="ml-1">{label}</span>}
      {count > 0 && (
        <span
          className={`
          ml-1 font-medium
          ${size === 'sm' ? 'text-xs' : ''}
        `}
        >
          ({count})
        </span>
      )}
    </>
  );

  const baseClasses = `
    inline-flex items-center rounded-full font-medium
    ${sizeClasses[size]}
    ${colorClasses}
    ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
  `;

  // Tooltip text
  const tooltipText = isBlocked
    ? `Blocked by ${blockedByCount} task${blockedByCount > 1 ? 's' : ''}`
    : blocksCount > 0
      ? `Blocks ${blocksCount} task${blocksCount > 1 ? 's' : ''}`
      : 'All dependencies completed';

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={baseClasses}
        title={tooltipText}
        aria-label={tooltipText}
      >
        {content}
      </button>
    );
  }

  return (
    <span className={baseClasses} title={tooltipText} aria-label={tooltipText}>
      {content}
    </span>
  );
}

/**
 * Compact dependency indicator (icon only)
 */
export function DependencyIndicator({ isBlocked, blocksCount, size = 'sm' }) {
  if (!isBlocked && blocksCount === 0) {
    return null;
  }

  const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-5 h-5' : 'w-6 h-6';

  if (isBlocked) {
    return (
      <span
        className="text-red-500 dark:text-red-400"
        title="Blocked by dependencies"
        aria-label="Blocked by dependencies"
      >
        <svg className={sizeClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      </span>
    );
  }

  return (
    <span
      className="text-amber-500 dark:text-amber-400"
      title={`Blocks ${blocksCount} task${blocksCount > 1 ? 's' : ''}`}
      aria-label={`Blocks ${blocksCount} tasks`}
    >
      <svg className={sizeClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    </span>
  );
}

export default DependencyBadge;
