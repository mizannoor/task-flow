/**
 * KanbanCard Component
 * Individual task card in the Kanban board with drag support
 */

import { useRef, useCallback, memo } from 'react';
import { PRIORITY_COLORS, PRIORITY_LABELS, KANBAN_PREVIEW_DELAY, TIMER_STATUS } from '../../utils/constants';
import { formatDate, formatDuration, formatTimeCompact, getTimeStatusColor } from '../../utils/formatters';
import { useTimer } from '../../hooks/useTimer';

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
 * Check if a deadline is overdue or due today
 * @param {Date | string | null} deadline - The deadline to check
 * @returns {object} - { isOverdue: boolean, isDueToday: boolean }
 */
function getDeadlineStatus(deadline) {
  if (!deadline) return { isOverdue: false, isDueToday: false };

  const deadlineDate = deadline instanceof Date ? deadline : new Date(deadline);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const deadlineDay = new Date(deadlineDate.getFullYear(), deadlineDate.getMonth(), deadlineDate.getDate());

  return {
    isOverdue: deadlineDay < today,
    isDueToday: deadlineDay.getTime() === today.getTime(),
  };
}

/**
 * KanbanCard component
 * @param {object} props
 * @param {object} props.task - Task data
 * @param {boolean} props.isDragging - Whether this card is being dragged
 * @param {boolean} props.isFocused - Whether this card has keyboard focus
 * @param {Function} props.onClick - Click handler to open task details
 * @param {object} props.dragHandlers - Drag event handlers from useDragAndDrop
 * @param {Function} props.onFocus - Focus handler for keyboard navigation
 * @param {Function} props.onShowPreview - Callback to show preview popup
 * @param {Function} props.onHidePreview - Callback to hide preview popup
 */
function KanbanCardComponent({
  task,
  isDragging = false,
  isFocused = false,
  onClick,
  dragHandlers = {},
  onFocus,
  onShowPreview,
  onHidePreview,
}) {
  const hoverTimeoutRef = useRef(null);
  const cardRef = useRef(null);
  const { getTaskTimerState } = useTimer();

  // Get timer state for this task
  const taskTimerState = getTaskTimerState(task.id);
  const isTimerActive = taskTimerState.isActive;

  // Handle mouse enter for preview
  const handleMouseEnter = useCallback(() => {
    if (onShowPreview) {
      hoverTimeoutRef.current = setTimeout(() => {
        if (cardRef.current) {
          const rect = cardRef.current.getBoundingClientRect();
          onShowPreview(task, { x: rect.right + 8, y: rect.top });
        }
      }, KANBAN_PREVIEW_DELAY);
    }
  }, [task, onShowPreview]);

  // Handle mouse leave for preview
  const handleMouseLeave = useCallback(() => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    if (onHidePreview) {
      onHidePreview();
    }
  }, [onHidePreview]);

  // Handle card click
  const handleClick = useCallback((e) => {
    // Don't trigger click on drag
    if (isDragging) return;
    onClick?.(task);
  }, [task, onClick, isDragging]);

  // Handle keyboard events
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(task);
    }
  }, [task, onClick]);

  // Get deadline status
  const { isOverdue, isDueToday } = getDeadlineStatus(task.deadline);

  // Build class names with Tailwind utilities
  const baseCardClasses = 'bg-white rounded-lg shadow-sm border border-gray-200 p-3 cursor-grab transition-all duration-200 ease-in-out hover:shadow-md hover:border-gray-300 active:cursor-grabbing';
  const draggingClasses = isDragging ? 'opacity-50 shadow-lg ring-2 ring-indigo-500 ring-offset-2' : '';
  const focusedClasses = isFocused ? 'ring-2 ring-indigo-500 ring-offset-2 outline-none' : '';

  const cardClasses = `${baseCardClasses} ${draggingClasses} ${focusedClasses}`.trim();

  return (
    <div
      ref={cardRef}
      className={cardClasses}
      role="button"
      tabIndex={isFocused ? 0 : -1}
      aria-label={`Task: ${task.taskName}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={onFocus}
      {...dragHandlers}
    >
      {/* Task name */}
      <h4 className="font-medium text-gray-900 text-sm mb-2 line-clamp-2">
        {task.taskName}
      </h4>

      {/* Task metadata row */}
      <div className="flex items-center justify-between gap-2 text-xs">
        {/* Priority badge */}
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[task.priority] || 'bg-gray-100 text-gray-800'
            }`}
        >
          {PRIORITY_LABELS[task.priority] || task.priority}
        </span>

        {/* Timer/Time tracking indicator */}
        {(isTimerActive || task.actualDuration > 0 || task.estimatedDuration > 0) && (
          <div className={`flex items-center gap-1 text-xs ${getTimeStatusColor(task.actualDuration || 0, task.estimatedDuration || 0)}`}>
            {isTimerActive && (
              <span className={`w-2 h-2 rounded-full ${taskTimerState.status === TIMER_STATUS.RUNNING ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
            )}
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{formatTimeCompact(task.actualDuration || 0, task.estimatedDuration || 0) || formatDuration(task.estimatedDuration)}</span>
          </div>
        )}

        {/* Complexity indicator - only show if no time data */}
        {!isTimerActive && !task.actualDuration && !task.estimatedDuration && (
          <div className="flex items-center gap-1 text-gray-500" title={`Complexity: ${task.complexity}/10`}>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>{task.complexity}</span>
          </div>
        )}
      </div>

      {/* Bottom row: deadline and assignee */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
        {/* Deadline */}
        {task.deadline ? (
          <span
            className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-red-600 font-medium' : isDueToday ? 'text-orange-600 font-medium' : 'text-gray-500'
              }`}
            title={isOverdue ? 'Overdue' : isDueToday ? 'Due today' : 'Deadline'}
          >
            {(isOverdue || isDueToday) && (
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate(task.deadline)}
          </span>
        ) : (
          <span className="text-xs text-gray-400">No deadline</span>
        )}

        {/* User avatar */}
        <div
          className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-medium"
          title={task.assignee?.displayName || task.assignee?.identifier || 'Unassigned'}
        >
          {getUserInitials(task.assignee)}
        </div>
      </div>
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export const KanbanCard = memo(KanbanCardComponent);

export default KanbanCard;
