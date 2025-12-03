/**
 * UnscheduledSidebar Component
 * Collapsible sidebar showing tasks without deadlines
 * Feature: 007-calendar-view
 */

import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { CalendarTaskIndicator } from './CalendarTaskIndicator';
import { CALENDAR_CONSTANTS, PRIORITIES, PRIORITY_ORDER } from '../../utils/constants';

/**
 * UnscheduledSidebar component
 */
export function UnscheduledSidebar({
  tasks,
  isOpen,
  onToggle,
  onTaskClick,
  onTaskDrop,
}) {
  // Sort tasks by priority
  const sortedTasks = [...tasks].sort((a, b) => {
    return (PRIORITY_ORDER[b.priority] || 0) - (PRIORITY_ORDER[a.priority] || 0);
  });

  // Handle drag start for unscheduled tasks
  const handleDragStart = useCallback((e, task) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData(CALENDAR_CONSTANTS.DND_TYPE, task.id);
  }, []);

  return (
    <aside
      className={`calendar-sidebar flex flex-col ${!isOpen ? 'calendar-sidebar--collapsed' : ''}`}
      aria-label="Unscheduled tasks"
    >
      {/* Toggle header */}
      <button
        className="calendar-sidebar-toggle"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Collapse unscheduled tasks' : 'Expand unscheduled tasks'}
      >
        {isOpen ? (
          <>
            <svg
              className="h-5 w-5 text-gray-500 dark:text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 5l7 7-7 7M5 5l7 7-7 7"
              />
            </svg>
            <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-200">
              Unscheduled ({tasks.length})
            </span>
          </>
        ) : (
          <div className="flex flex-col items-center">
            <svg
              className="h-5 w-5 text-gray-500 dark:text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
              />
            </svg>
            {tasks.length > 0 && (
              <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-xs font-medium text-white">
                {tasks.length > 99 ? '99+' : tasks.length}
              </span>
            )}
          </div>
        )}
      </button>

      {/* Task list (only visible when expanded) */}
      {isOpen && (
        <div className="calendar-sidebar-content flex-1 overflow-y-auto p-3">
          {sortedTasks.length > 0 ? (
            <div className="space-y-2">
              {sortedTasks.map((task) => (
                <div
                  key={task.id}
                  className="cursor-pointer rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 shadow-sm transition-shadow hover:shadow-md dark:shadow-slate-900/50"
                  draggable
                  onDragStart={(e) => handleDragStart(e, task)}
                  onClick={() => onTaskClick(task)}
                >
                  {/* Priority indicator */}
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className={`h-2 w-2 rounded-full ${task.priority === PRIORITIES.URGENT
                        ? 'bg-red-500'
                        : task.priority === PRIORITIES.HIGH
                          ? 'bg-orange-500'
                          : task.priority === PRIORITIES.MEDIUM
                            ? 'bg-yellow-500'
                            : 'bg-gray-400'
                        }`}
                    />
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {task.priority}
                    </span>
                  </div>

                  {/* Task name */}
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                    {task.taskName}
                  </h4>

                  {/* Drag hint */}
                  <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                    Drag to calendar to set deadline
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-32 items-center justify-center">
              <div className="text-center">
                <svg
                  className="mx-auto h-8 w-8 text-gray-300 dark:text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  All tasks are scheduled!
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}

UnscheduledSidebar.propTypes = {
  tasks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      taskName: PropTypes.string.isRequired,
      priority: PropTypes.string,
    })
  ),
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  onTaskClick: PropTypes.func.isRequired,
  onTaskDrop: PropTypes.func,
};

UnscheduledSidebar.defaultProps = {
  tasks: [],
  onTaskDrop: () => { },
};

export default UnscheduledSidebar;
