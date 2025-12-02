/**
 * CalendarGrid Component
 * Month view grid displaying 6 weeks × 7 days with tasks
 * Feature: 007-calendar-view
 */

import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { CalendarCell } from './CalendarCell';
import { DAYS_OF_WEEK } from '../../utils/constants';
import { isSameDay } from '../../utils/dateUtils';

/**
 * CalendarGrid component for month view
 */
export function CalendarGrid({
  gridData,
  tasksByDate,
  selectedDate,
  onDateSelect,
  onTaskClick,
  onTaskDrop,
}) {
  // Ensure gridData has days
  const days = useMemo(() => {
    return gridData?.days || [];
  }, [gridData]);

  return (
    <div className="flex h-full flex-col">
      {/* Day names header row */}
      <div className="calendar-day-header">
        {DAYS_OF_WEEK.map((dayName) => (
          <div key={dayName} className="calendar-day-header-cell">
            {dayName}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="calendar-grid flex-1">
        {days.map((day, index) => (
          <CalendarCell
            key={`${day.dateKey}-${index}`}
            day={day}
            tasks={tasksByDate.get(day.dateKey) || []}
            isSelected={selectedDate ? isSameDay(day.date, selectedDate) : false}
            onSelect={() => onDateSelect(day.date)}
            onTaskClick={onTaskClick}
            onTaskDrop={(taskId) => onTaskDrop(taskId, day.date)}
          />
        ))}
      </div>
    </div>
  );
}

CalendarGrid.propTypes = {
  gridData: PropTypes.shape({
    year: PropTypes.number,
    month: PropTypes.number,
    startDate: PropTypes.instanceOf(Date),
    endDate: PropTypes.instanceOf(Date),
    days: PropTypes.arrayOf(
      PropTypes.shape({
        date: PropTypes.instanceOf(Date).isRequired,
        dateKey: PropTypes.string.isRequired,
        day: PropTypes.number.isRequired,
        isCurrentMonth: PropTypes.bool.isRequired,
        isToday: PropTypes.bool.isRequired,
      })
    ),
  }).isRequired,
  tasksByDate: PropTypes.instanceOf(Map).isRequired,
  selectedDate: PropTypes.instanceOf(Date),
  onDateSelect: PropTypes.func.isRequired,
  onTaskClick: PropTypes.func.isRequired,
  onTaskDrop: PropTypes.func.isRequired,
};

CalendarGrid.defaultProps = {
  selectedDate: null,
};

export default CalendarGrid;
