/**
 * CalendarDayView Component
 * Single day view with tasks due on that date
 * Feature: 007-calendar-view
 */

import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { CalendarTaskIndicator } from './CalendarTaskIndicator';
import { STATUSES, PRIORITIES, PRIORITY_ORDER } from '../../utils/constants';

/**
 * CalendarDayView component
 */
export function CalendarDayView({
  dayData,
  tasks,
  onTaskClick,
  onTaskDrop,
}) {
  // Format date for display
  const dateDisplay = useMemo(() => {
    if (!dayData?.date) return '';
    return dayData.date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [dayData]);

  // Group and sort tasks
  const { pendingTasks, inProgressTasks, completedTasks } = useMemo(() => {
    const pending = [];
    const inProgress = [];
    const completed = [];

    tasks.forEach((task) => {
      if (task.status === STATUSES.COMPLETED) {
        completed.push(task);
      } else if (task.status === STATUSES.IN_PROGRESS) {
        inProgress.push(task);
      } else {
        pending.push(task);
      }
    });

    // Sort each group by priority
    const sortByPriority = (a, b) => {
      return (PRIORITY_ORDER[b.priority] || 0) - (PRIORITY_ORDER[a.priority] || 0);
    };

    pending.sort(sortByPriority);
    inProgress.sort(sortByPriority);
    completed.sort(sortByPriority);

    return { pendingTasks: pending, inProgressTasks: inProgress, completedTasks: completed };
  }, [tasks]);

  // Handle drop on the day view
  const handleDrop = (e) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('application/taskflow-calendar-task');
    if (taskId && dayData?.date) {
      onTaskDrop(taskId, dayData.date);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  return (
    <div
      className="flex h-full flex-col overflow-auto bg-white dark:bg-slate-900"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Day header */}
      <div className="sticky top-0 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {dateDisplay}
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {tasks.length} task{tasks.length !== 1 ? 's' : ''} due
        </p>
      </div>

      {/* Task sections */}
      <div className="flex-1 space-y-6 p-6">
        {/* In Progress Section */}
        {inProgressTasks.length > 0 && (
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-700 dark:text-blue-400">
              <span className="h-2 w-2 rounded-full bg-blue-500"></span>
              In Progress ({inProgressTasks.length})
            </h3>
            <div className="space-y-2">
              {inProgressTasks.map((task) => (
                <TaskCard key={task.id} task={task} onClick={onTaskClick} />
              ))}
            </div>
          </section>
        )}

        {/* Pending Section */}
        {pendingTasks.length > 0 && (
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <span className="h-2 w-2 rounded-full bg-gray-400"></span>
              Pending ({pendingTasks.length})
            </h3>
            <div className="space-y-2">
              {pendingTasks.map((task) => (
                <TaskCard key={task.id} task={task} onClick={onTaskClick} />
              ))}
            </div>
          </section>
        )}

        {/* Completed Section */}
        {completedTasks.length > 0 && (
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-green-700 dark:text-green-400">
              <span className="h-2 w-2 rounded-full bg-green-500"></span>
              Completed ({completedTasks.length})
            </h3>
            <div className="space-y-2">
              {completedTasks.map((task) => (
                <TaskCard key={task.id} task={task} onClick={onTaskClick} />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {tasks.length === 0 && (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                No tasks due on this day
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Task card component for day view
 */
function TaskCard({ task, onClick }) {
  const priorityColors = {
    [PRIORITIES.URGENT]: 'border-l-red-500',
    [PRIORITIES.HIGH]: 'border-l-orange-500',
    [PRIORITIES.MEDIUM]: 'border-l-yellow-500',
    [PRIORITIES.LOW]: 'border-l-gray-400',
  };

  const isCompleted = task.status === STATUSES.COMPLETED;

  return (
    <div
      className={`
        cursor-pointer rounded-lg border border-l-4 bg-white dark:bg-slate-800 p-4 shadow-sm
        transition-shadow hover:shadow-md dark:shadow-slate-900/50
        ${priorityColors[task.priority] || priorityColors[PRIORITIES.MEDIUM]}
        ${isCompleted ? 'opacity-60' : ''}
      `}
      onClick={() => onClick(task)}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('application/taskflow-calendar-task', task.id);
      }}
    >
      <h4 className={`font-medium text-gray-900 dark:text-white ${isCompleted ? 'line-through' : ''}`}>
        {task.taskName}
      </h4>
      {task.description && (
        <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
          {task.description}
        </p>
      )}
      <div className="mt-2 flex items-center gap-2">
        <span className={`
          rounded-full px-2 py-0.5 text-xs font-medium
          ${task.status === STATUSES.IN_PROGRESS ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300' : ''}
          ${task.status === STATUSES.PENDING ? 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300' : ''}
          ${task.status === STATUSES.COMPLETED ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300' : ''}
        `}>
          {task.status}
        </span>
      </div>
    </div>
  );
}

TaskCard.propTypes = {
  task: PropTypes.shape({
    id: PropTypes.string.isRequired,
    taskName: PropTypes.string.isRequired,
    description: PropTypes.string,
    priority: PropTypes.string,
    status: PropTypes.string,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
};

CalendarDayView.propTypes = {
  dayData: PropTypes.shape({
    date: PropTypes.instanceOf(Date).isRequired,
    dateKey: PropTypes.string.isRequired,
    isToday: PropTypes.bool.isRequired,
  }).isRequired,
  tasks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      taskName: PropTypes.string.isRequired,
    })
  ),
  onTaskClick: PropTypes.func.isRequired,
  onTaskDrop: PropTypes.func.isRequired,
};

CalendarDayView.defaultProps = {
  tasks: [],
};

export default CalendarDayView;
