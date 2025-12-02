/**
 * FocusEmptyState Component
 * Empty and completion states for Focus View
 */

import { memo } from 'react';

/**
 * FocusEmptyState component
 * @param {object} props
 * @param {'no-tasks' | 'all-done'} props.type - Type of empty state
 * @param {boolean} props.hasMoreTasks - Whether more tasks can be loaded
 * @param {Function} [props.onCreateTask] - Callback for "Create Task" button
 * @param {Function} [props.onLoadMore] - Callback for "Load More" button
 */
function FocusEmptyStateComponent({
  type = 'no-tasks',
  hasMoreTasks = false,
  onCreateTask,
  onLoadMore,
}) {
  if (type === 'all-done') {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        {/* Celebration icon */}
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6">
          <svg
            className="w-10 h-10 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          All Done! 🎉
        </h3>
        <p className="text-gray-600 text-center max-w-sm mb-6">
          You've completed all your focus tasks for today. Great work!
        </p>

        {hasMoreTasks && onLoadMore && (
          <button
            type="button"
            onClick={onLoadMore}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Load More Tasks
          </button>
        )}
      </div>
    );
  }

  // Default: no-tasks state
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Empty state icon */}
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
        <svg
          className="w-10 h-10 text-gray-400"
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
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        No Focus Tasks
      </h3>
      <p className="text-gray-600 text-center max-w-sm mb-6">
        You don't have any urgent or overdue tasks right now. Create a high-priority task or set a deadline for today to see it here.
      </p>

      {onCreateTask && (
        <button
          type="button"
          onClick={onCreateTask}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Create Task
        </button>
      )}
    </div>
  );
}

export const FocusEmptyState = memo(FocusEmptyStateComponent);
export default FocusEmptyState;
