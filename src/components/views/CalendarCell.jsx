/**
 * CalendarCell Component
 * Single date cell in the calendar grid
 * Feature: 007-calendar-view
 */

import { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { CalendarTaskIndicator } from './CalendarTaskIndicator';
import { TaskOverflowPopover } from './TaskOverflowPopover';
import { CALENDAR_CONSTANTS } from '../../utils/constants';

// Maximum visible tasks before showing overflow
const MAX_VISIBLE_TASKS = 3;

/**
 * CalendarCell component
 */
export function CalendarCell({
  day,
  tasks,
  isSelected,
  onSelect,
  onTaskClick,
  onTaskDrop,
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [showOverflow, setShowOverflow] = useState(false);
  const [overflowAnchor, setOverflowAnchor] = useState(null);

  // Split tasks into visible and overflow
  const { visibleTasks, overflowTasks, overflowCount } = useMemo(() => {
    if (tasks.length <= MAX_VISIBLE_TASKS) {
      return {
        visibleTasks: tasks,
        overflowTasks: [],
        overflowCount: 0,
      };
    }
    return {
      visibleTasks: tasks.slice(0, MAX_VISIBLE_TASKS - 1),
      overflowTasks: tasks.slice(MAX_VISIBLE_TASKS - 1),
      overflowCount: tasks.length - (MAX_VISIBLE_TASKS - 1),
    };
  }, [tasks]);

  // Build class names for cell
  const cellClassName = useMemo(() => {
    const classes = ['calendar-cell'];

    if (day.isToday) {
      classes.push('calendar-cell--today');
    }

    if (!day.isCurrentMonth) {
      classes.push('calendar-cell--adjacent');
    }

    if (isSelected) {
      classes.push('calendar-cell--selected');
    }

    if (isDragOver) {
      classes.push('calendar-cell--drop-target');
    }

    return classes.join(' ');
  }, [day.isToday, day.isCurrentMonth, isSelected, isDragOver]);

  // Handle drag events
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    // Only leave if actually leaving the cell (not entering a child)
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragOver(false);

      const taskId = e.dataTransfer.getData(CALENDAR_CONSTANTS.DND_TYPE);
      if (taskId) {
        onTaskDrop(taskId);
      }
    },
    [onTaskDrop]
  );

  // Handle overflow click
  const handleOverflowClick = useCallback((e) => {
    e.stopPropagation();
    setOverflowAnchor(e.currentTarget);
    setShowOverflow(true);
  }, []);

  const handleOverflowClose = useCallback(() => {
    setShowOverflow(false);
    setOverflowAnchor(null);
  }, []);

  return (
    <div
      className={cellClassName}
      onClick={onSelect}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-date={day.dateKey}
      role="gridcell"
      aria-selected={isSelected}
      tabIndex={0}
    >
      {/* Date number */}
      <div className="calendar-cell-date">
        {day.day}
      </div>

      {/* Task list */}
      <div className="mt-1 flex flex-col gap-0.5 overflow-hidden">
        {visibleTasks.map((task) => (
          <CalendarTaskIndicator
            key={task.id}
            task={task}
            onClick={() => onTaskClick(task)}
            compact
          />
        ))}

        {/* Overflow indicator */}
        {overflowCount > 0 && (
          <button
            className="calendar-overflow-indicator"
            onClick={handleOverflowClick}
            aria-label={`${overflowCount} more tasks`}
          >
            +{overflowCount} more
          </button>
        )}
      </div>

      {/* Overflow popover */}
      <TaskOverflowPopover
        tasks={overflowTasks}
        date={day.date}
        isOpen={showOverflow}
        onClose={handleOverflowClose}
        onTaskClick={onTaskClick}
        anchorEl={overflowAnchor}
      />
    </div>
  );
}

CalendarCell.propTypes = {
  day: PropTypes.shape({
    date: PropTypes.instanceOf(Date).isRequired,
    dateKey: PropTypes.string.isRequired,
    day: PropTypes.number.isRequired,
    isCurrentMonth: PropTypes.bool.isRequired,
    isToday: PropTypes.bool.isRequired,
  }).isRequired,
  tasks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      taskName: PropTypes.string.isRequired,
    })
  ),
  isSelected: PropTypes.bool,
  onSelect: PropTypes.func.isRequired,
  onTaskClick: PropTypes.func.isRequired,
  onTaskDrop: PropTypes.func.isRequired,
};

CalendarCell.defaultProps = {
  tasks: [],
  isSelected: false,
};

export default CalendarCell;
