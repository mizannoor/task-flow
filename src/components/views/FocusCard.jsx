/**
 * FocusCard Component
 * Individual task card for Focus View with actions and expandable details
 */

import { memo, useCallback, useRef } from 'react';
import {
  PRIORITY_COLORS,
  PRIORITY_LABELS,
  FOCUS_TIER_COLORS,
  STATUSES,
} from '../../utils/constants';
import { formatDate, formatDuration } from '../../utils/formatters';

/**
 * Get user initials from display name or identifier
 * @param {object} user - User object with displayName or identifier
 * @returns {string} - Two character initials
 */
function getUserInitials(user) {
  if (!user) return '??';
  const name = user.displayName || user.identifier || '';
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase() || '??';
}

/**
 * Get deadline display info
 * @param {Date|string|null} deadline
 * @param {number} tier - Selection tier
 * @returns {object} - { text, className }
 */
function getDeadlineDisplay(deadline, tier) {
  if (!deadline) {
    return { text: 'No deadline', className: 'text-gray-400' };
  }

  const date = deadline instanceof Date ? deadline : new Date(deadline);
  const formattedDate = formatDate(date);

  if (tier === 1) {
    // Overdue
    return { text: `Overdue: ${formattedDate}`, className: 'text-red-600 font-medium' };
  } else if (tier === 2) {
    // Due today
    return { text: 'Due Today', className: 'text-amber-600 font-medium' };
  }

  return { text: `Due: ${formattedDate}`, className: 'text-gray-600' };
}

/**
 * FocusCard component
 * @param {object} props
 * @param {object} props.task - FocusTask data with selectionTier
 * @param {boolean} props.isExpanded - Whether details are expanded
 * @param {boolean} props.isFocused - Whether card has keyboard focus
 * @param {Function} props.onClick - Click handler to toggle expand
 * @param {Function} props.onStart - Handler for "Start" action
 * @param {Function} props.onComplete - Handler for "Complete" action
 * @param {Function} props.onFocus - Handler when card receives focus
 * @param {Function} props.onKeyDown - Handler for keyboard events
 * @param {number} props.index - Card index for aria
 */
function FocusCardComponent({
  task,
  isExpanded = false,
  isFocused = false,
  onClick,
  onStart,
  onComplete,
  onFocus,
  onKeyDown,
  index = 0,
}) {
  const cardRef = useRef(null);

  // Get deadline display
  const deadlineDisplay = getDeadlineDisplay(task.deadline, task.selectionTier);

  // Handle card click
  const handleClick = useCallback((e) => {
    // Don't trigger if clicking on action buttons
    if (e.target.closest('button[data-action]')) return;
    onClick?.(task.id);
  }, [task.id, onClick]);

  // Handle start action
  const handleStart = useCallback((e) => {
    e.stopPropagation();
    onStart?.(task.id);
  }, [task.id, onStart]);

  // Handle complete action
  const handleComplete = useCallback((e) => {
    e.stopPropagation();
    onComplete?.(task.id);
  }, [task.id, onComplete]);

  // Handle keyboard events
  const handleKeyDown = useCallback((e) => {
    onKeyDown?.(e, task, index);
  }, [onKeyDown, task, index]);

  // Determine which action button to show
  const showStartButton = task.status === STATUSES.PENDING;
  const showCompleteButton = task.status === STATUSES.IN_PROGRESS;

  // Base card classes
  const cardClasses = `
    relative bg-white rounded-xl border-2 transition-all duration-200 ease-in-out
    ${isFocused ? 'ring-2 ring-indigo-500 ring-offset-2 border-indigo-300' : 'border-gray-200'}
    ${isExpanded ? 'shadow-lg' : 'shadow-sm hover:shadow-md'}
    cursor-pointer
  `.trim().replace(/\s+/g, ' ');

  return (
    <div
      ref={cardRef}
      className={cardClasses}
      role="button"
      tabIndex={isFocused ? 0 : -1}
      aria-label={`Task: ${task.taskName}. ${task.tierLabel}. ${deadlineDisplay.text}`}
      aria-expanded={isExpanded}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onFocus={onFocus}
    >
      {/* Tier indicator bar */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 rounded-t-xl ${FOCUS_TIER_COLORS[task.selectionTier]?.split(' ')[0] || 'bg-gray-200'}`}
      />

      {/* Card content */}
      <div className="p-5 pt-6">
        {/* Header row: tier badge + actions */}
        <div className="flex items-start justify-between gap-3 mb-3">
          {/* Tier badge */}
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${FOCUS_TIER_COLORS[task.selectionTier] || 'bg-gray-100 text-gray-800'}`}
          >
            {task.tierLabel}
          </span>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {showStartButton && (
              <button
                type="button"
                data-action="start"
                onClick={handleStart}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                aria-label={`Start task: ${task.taskName}`}
              >
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Start
              </button>
            )}
            {showCompleteButton && (
              <button
                type="button"
                data-action="complete"
                onClick={handleComplete}
                className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                aria-label={`Complete task: ${task.taskName}`}
              >
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Complete
              </button>
            )}
          </div>
        </div>

        {/* Task name */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {task.taskName}
        </h3>

        {/* Metadata row */}
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {/* Priority badge */}
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[task.priority] || 'bg-gray-100 text-gray-800'}`}
          >
            {PRIORITY_LABELS[task.priority] || task.priority}
          </span>

          {/* Deadline */}
          <span className={deadlineDisplay.className}>
            {deadlineDisplay.text}
          </span>

          {/* Complexity */}
          <span className="text-gray-500 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {task.complexity}/10
          </span>
        </div>

        {/* Expanded details */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-3 animate-fadeIn">
            {/* Description */}
            {task.description && (
              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Description
                </h4>
                <p className="text-gray-700 text-sm whitespace-pre-wrap">
                  {task.description}
                </p>
              </div>
            )}

            {/* Additional details grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Estimated duration */}
              {task.estimatedDuration > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Est. Duration
                  </h4>
                  <p className="text-gray-700 text-sm">
                    {formatDuration(task.estimatedDuration)}
                  </p>
                </div>
              )}

              {/* Category */}
              {task.category && (
                <div>
                  <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Category
                  </h4>
                  <p className="text-gray-700 text-sm capitalize">
                    {task.category}
                  </p>
                </div>
              )}
            </div>

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Tags
                </h4>
                <div className="flex flex-wrap gap-1">
                  {task.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Collapse hint */}
            <p className="text-xs text-gray-400 text-center pt-2">
              Click to collapse
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export const FocusCard = memo(FocusCardComponent);
export default FocusCard;
