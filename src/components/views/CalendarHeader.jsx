/**
 * CalendarHeader Component
 * Navigation controls, view mode toggle, and sidebar toggle for calendar view
 * Feature: 007-calendar-view
 */

import PropTypes from 'prop-types';
import {
  CALENDAR_VIEW_MODES,
  CALENDAR_VIEW_MODE_LABELS,
} from '../../utils/constants';

/**
 * CalendarHeader component
 */
export function CalendarHeader({
  viewMode,
  currentDate,
  headerText,
  onViewModeChange,
  onPrevious,
  onNext,
  onToday,
  sidebarOpen,
  onToggleSidebar,
  unscheduledCount,
}) {
  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
      {/* Left: Navigation Controls */}
      <div className="flex items-center gap-2">
        {/* Previous Button */}
        <button
          onClick={onPrevious}
          className="rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label={`Previous ${viewMode}`}
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Next Button */}
        <button
          onClick={onNext}
          className="rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label={`Next ${viewMode}`}
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
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        {/* Today Button */}
        <button
          onClick={onToday}
          className="ml-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Today
        </button>

        {/* Header Text (Month Year or Date) */}
        <h2 className="ml-4 text-lg font-semibold text-gray-900">
          {headerText}
        </h2>
      </div>

      {/* Right: View Mode Toggle & Sidebar Toggle */}
      <div className="flex items-center gap-3">
        {/* View Mode Toggle */}
        <div className="inline-flex rounded-md shadow-sm" role="group">
          {Object.values(CALENDAR_VIEW_MODES).map((mode) => (
            <button
              key={mode}
              onClick={() => onViewModeChange(mode)}
              className={`
                px-3 py-1.5 text-sm font-medium
                first:rounded-l-md last:rounded-r-md
                border border-gray-300
                focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500
                ${viewMode === mode
                  ? 'bg-blue-50 text-blue-700 border-blue-500'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
                }
              `}
              aria-pressed={viewMode === mode}
            >
              {CALENDAR_VIEW_MODE_LABELS[mode]}
            </button>
          ))}
        </div>

        {/* Unscheduled Sidebar Toggle */}
        <button
          onClick={onToggleSidebar}
          className={`
            relative rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            ${sidebarOpen
              ? 'bg-blue-50 text-blue-700'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }
          `}
          aria-label={sidebarOpen ? 'Hide unscheduled tasks' : 'Show unscheduled tasks'}
          aria-expanded={sidebarOpen}
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
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>

          {/* Badge for unscheduled count */}
          {unscheduledCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs font-medium text-white">
              {unscheduledCount > 99 ? '99+' : unscheduledCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}

CalendarHeader.propTypes = {
  viewMode: PropTypes.oneOf(Object.values(CALENDAR_VIEW_MODES)).isRequired,
  currentDate: PropTypes.instanceOf(Date).isRequired,
  headerText: PropTypes.string.isRequired,
  onViewModeChange: PropTypes.func.isRequired,
  onPrevious: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onToday: PropTypes.func.isRequired,
  sidebarOpen: PropTypes.bool.isRequired,
  onToggleSidebar: PropTypes.func.isRequired,
  unscheduledCount: PropTypes.number,
};

CalendarHeader.defaultProps = {
  unscheduledCount: 0,
};

export default CalendarHeader;
