/**
 * CalendarWeekView Component
 * Week view displaying 7 days with tasks
 * Feature: 007-calendar-view
 */

import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { CalendarCell } from './CalendarCell';
import { DAYS_OF_WEEK } from '../../utils/constants';
import { isSameDay, formatChartDate } from '../../utils/dateUtils';

/**
 * CalendarWeekView component
 */
export function CalendarWeekView({
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

  // Get week range string for header
  const weekRangeText = useMemo(() => {
    if (!gridData?.weekStart || !gridData?.weekEnd) return '';
    const start = formatChartDate(gridData.weekStart);
    const end = formatChartDate(gridData.weekEnd);
    return `${start} - ${end}`;
  }, [gridData]);

  return (
    <div className="flex h-full flex-col">
      {/* Week range header */}
      <div className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 px-4 py-2 text-center text-sm text-gray-600 dark:text-gray-300">
        {weekRangeText}
      </div>

      {/* Day names header row */}
      <div className="calendar-day-header">
        {DAYS_OF_WEEK.map((dayName, index) => {
          const day = days[index];
          return (
            <div key={dayName} className="calendar-day-header-cell flex flex-col">
              <span>{dayName}</span>
              {day && (
                <span className={`text-lg font-semibold ${day.isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                  {day.day}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Week grid - single row with taller cells */}
      <div className="grid flex-1 grid-cols-7 gap-px bg-gray-200 dark:bg-slate-700">
        {days.map((day, index) => (
          <div
            key={`${day.dateKey}-${index}`}
            className={`
              bg-white dark:bg-slate-800 p-2 overflow-y-auto
              ${day.isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
              ${selectedDate && isSameDay(day.date, selectedDate) ? 'ring-2 ring-blue-500 ring-inset' : ''}
            `}
            onClick={() => onDateSelect(day.date)}
            data-date={day.dateKey}
          >
            {/* Tasks for this day */}
            <div className="flex flex-col gap-1">
              {(tasksByDate.get(day.dateKey) || []).map((task) => (
                <div
                  key={task.id}
                  className="cursor-pointer rounded bg-gray-100 dark:bg-slate-700 p-2 text-sm hover:bg-gray-200 dark:hover:bg-slate-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTaskClick(task);
                  }}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('application/taskflow-calendar-task', task.id);
                  }}
                >
                  <div className="font-medium text-gray-900 dark:text-white truncate">
                    {task.taskName}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

CalendarWeekView.propTypes = {
  gridData: PropTypes.shape({
    weekStart: PropTypes.instanceOf(Date),
    weekEnd: PropTypes.instanceOf(Date),
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

CalendarWeekView.defaultProps = {
  selectedDate: null,
};

export default CalendarWeekView;
