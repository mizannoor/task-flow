/**
 * TaskOverflowPopover Component
 * Popover showing all tasks when a date has more than can be displayed
 * Feature: 007-calendar-view
 */

import { useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { CalendarTaskIndicator } from './CalendarTaskIndicator';
import { formatChartDate } from '../../utils/dateUtils';

/**
 * TaskOverflowPopover component
 */
export function TaskOverflowPopover({
  tasks,
  date,
  isOpen,
  onClose,
  onTaskClick,
  anchorEl,
}) {
  const popoverRef = useRef(null);

  // Handle click outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target) &&
        anchorEl &&
        !anchorEl.contains(e.target)
      ) {
        onClose();
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, anchorEl]);

  // Handle task click
  const handleTaskClick = useCallback(
    (task) => {
      onTaskClick(task);
      onClose();
    },
    [onTaskClick, onClose]
  );

  if (!isOpen || !tasks.length) {
    return null;
  }

  // Format date for header
  const dateStr = date ? formatChartDate(date) : '';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Popover */}
      <div
        ref={popoverRef}
        className="absolute z-50 mt-1 w-64 rounded-lg border border-gray-200 bg-white shadow-lg"
        role="dialog"
        aria-label={`Tasks for ${dateStr}`}
        style={{
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        {/* Header */}
        <div className="border-b border-gray-200 px-3 py-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">
              {dateStr}
            </h3>
            <span className="text-xs text-gray-500">
              {tasks.length} task{tasks.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Task list */}
        <div className="max-h-64 overflow-y-auto p-2">
          <div className="flex flex-col gap-1">
            {tasks.map((task) => (
              <CalendarTaskIndicator
                key={task.id}
                task={task}
                onClick={() => handleTaskClick(task)}
                compact={false}
              />
            ))}
          </div>
        </div>

        {/* Footer with close button */}
        <div className="border-t border-gray-200 px-3 py-2">
          <button
            onClick={onClose}
            className="w-full rounded-md bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}

TaskOverflowPopover.propTypes = {
  tasks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      taskName: PropTypes.string.isRequired,
    })
  ).isRequired,
  date: PropTypes.instanceOf(Date),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onTaskClick: PropTypes.func.isRequired,
  anchorEl: PropTypes.instanceOf(Element),
};

TaskOverflowPopover.defaultProps = {
  date: null,
  anchorEl: null,
};

export default TaskOverflowPopover;
