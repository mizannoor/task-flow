/**
 * CalendarTaskIndicator Component
 * Visual representation of a task on the calendar
 * Feature: 007-calendar-view
 */

import { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  CALENDAR_CONSTANTS,
  CALENDAR_PRIORITY_COLORS,
  STATUSES,
  PRIORITIES,
} from '../../utils/constants';
import { isOverdue } from '../../utils/dateUtils';

/**
 * CalendarTaskIndicator component
 */
export function CalendarTaskIndicator({
  task,
  onClick,
  compact,
  isDragging: externalDragging,
}) {
  const [isDragging, setIsDragging] = useState(false);

  // Check if task is completed
  const isCompleted = task.status === STATUSES.COMPLETED;

  // Check if task is overdue (has deadline in past and not completed)
  const isTaskOverdue = useMemo(() => {
    return !isCompleted && task.deadline && isOverdue(task.deadline);
  }, [task.deadline, isCompleted]);

  // Get priority color class
  const priorityColorClass = useMemo(() => {
    return CALENDAR_PRIORITY_COLORS[task.priority] || CALENDAR_PRIORITY_COLORS[PRIORITIES.MEDIUM];
  }, [task.priority]);

  // Build indicator class names
  const indicatorClassName = useMemo(() => {
    const classes = ['calendar-task-indicator', priorityColorClass];

    if (isCompleted) {
      classes.push('calendar-task-indicator--completed');
    }

    if (isTaskOverdue) {
      classes.push('calendar-task-indicator--overdue');
    }

    if (isDragging || externalDragging) {
      classes.push('calendar-task-indicator--dragging');
    }

    return classes.join(' ');
  }, [priorityColorClass, isCompleted, isTaskOverdue, isDragging, externalDragging]);

  // Drag event handlers
  const handleDragStart = useCallback(
    (e) => {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData(CALENDAR_CONSTANTS.DND_TYPE, task.id);

      // Create drag image
      const dragImage = e.currentTarget.cloneNode(true);
      dragImage.style.position = 'absolute';
      dragImage.style.top = '-1000px';
      dragImage.style.opacity = '0.8';
      document.body.appendChild(dragImage);
      e.dataTransfer.setDragImage(dragImage, 0, 0);

      // Clean up drag image after drag starts
      setTimeout(() => {
        document.body.removeChild(dragImage);
      }, 0);

      setIsDragging(true);
    },
    [task.id]
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Click handler
  const handleClick = useCallback(
    (e) => {
      e.stopPropagation(); // Prevent cell selection
      onClick(task);
    },
    [onClick, task]
  );

  // Keyboard handler
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        onClick(task);
      }
    },
    [onClick, task]
  );

  return (
    <div
      className={indicatorClassName}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      role="button"
      tabIndex={0}
      aria-label={`${task.taskName}${isTaskOverdue ? ' (overdue)' : ''}${isCompleted ? ' (completed)' : ''}`}
      title={task.taskName}
    >
      {/* Priority dot indicator for compact view */}
      {compact && (
        <span
          className={`h-2 w-2 flex-shrink-0 rounded-full ${priorityColorClass}`}
          aria-hidden="true"
        />
      )}

      {/* Task name */}
      <span className={`calendar-task-name ${isCompleted ? 'text-gray-500' : 'text-white'}`}>
        {task.taskName}
      </span>

      {/* Status indicators */}
      {!compact && (
        <div className="flex items-center gap-1">
          {/* Overdue warning icon */}
          {isTaskOverdue && (
            <svg
              className="h-3 w-3 flex-shrink-0 text-red-200"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-label="Overdue"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          )}

          {/* Completed checkmark */}
          {isCompleted && (
            <svg
              className="h-3 w-3 flex-shrink-0 text-green-200"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-label="Completed"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      )}
    </div>
  );
}

CalendarTaskIndicator.propTypes = {
  task: PropTypes.shape({
    id: PropTypes.string.isRequired,
    taskName: PropTypes.string.isRequired,
    priority: PropTypes.string,
    status: PropTypes.string,
    deadline: PropTypes.oneOfType([
      PropTypes.instanceOf(Date),
      PropTypes.string,
    ]),
  }).isRequired,
  onClick: PropTypes.func.isRequired,
  compact: PropTypes.bool,
  isDragging: PropTypes.bool,
};

CalendarTaskIndicator.defaultProps = {
  compact: false,
  isDragging: false,
};

export default CalendarTaskIndicator;
