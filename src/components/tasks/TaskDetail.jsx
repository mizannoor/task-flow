/**
 * TaskDetail Component
 * Inline expandable detail view for tasks
 */

import { useState } from 'react';
import { StatusBadge, PriorityBadge, CategoryBadge } from '../ui/Badge';
import { formatDate, formatRelativeDate, formatDateTime } from '../../utils/formatters';
import { STATUSES, STATUS_LABELS } from '../../utils/constants';
import { TaskTimer } from './TaskTimer';
import { ManualTimeEntry } from './ManualTimeEntry';

/**
 * TaskDetail component
 * @param {object} props
 * @param {object} props.task - Task object to display
 * @param {boolean} props.isExpanded - Whether the detail view is expanded
 * @param {Function} props.onToggle - Callback to toggle expansion
 * @param {Function} props.onEdit - Callback when edit is clicked
 * @param {Function} props.onDelete - Callback when delete is clicked
 * @param {Function} props.onStatusChange - Callback when status action is clicked
 */
export function TaskDetail({
  task,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  onStatusChange,
}) {
  const [showManualEntry, setShowManualEntry] = useState(false);
  
  if (!isExpanded) return null;

  // Calculate time tracking info
  const getTimeInfo = () => {
    const info = [];

    if (task.createdAt) {
      info.push({
        label: 'Created',
        value: formatRelativeDate(task.createdAt),
        tooltip: formatDateTime(task.createdAt),
      });
    }

    if (task.startedAt) {
      info.push({
        label: 'Started',
        value: formatRelativeDate(task.startedAt),
        tooltip: formatDateTime(task.startedAt),
      });
    }

    if (task.completedAt) {
      info.push({
        label: 'Completed',
        value: formatRelativeDate(task.completedAt),
        tooltip: formatDateTime(task.completedAt),
      });
    }

    if (task.updatedAt && task.updatedAt !== task.createdAt) {
      info.push({
        label: 'Updated',
        value: formatRelativeDate(task.updatedAt),
        tooltip: formatDateTime(task.updatedAt),
      });
    }

    return info;
  };

  const timeInfo = getTimeInfo();

  return (
    <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column - Description and metadata */}
        <div className="space-y-4">
          {/* Description */}
          <div>
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              Description
            </h4>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {task.description || (
                <span className="text-gray-400 italic">No description provided</span>
              )}
            </p>
          </div>

          {/* Time Tracking */}
          <div>
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              Time Tracking
            </h4>
            <TaskTimer 
              task={task} 
              variant="full" 
              onManualEntry={() => setShowManualEntry(true)}
            />
          </div>

          {/* Properties */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                Status
              </h4>
              <StatusBadge status={task.status} />
            </div>
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                Priority
              </h4>
              <PriorityBadge priority={task.priority} />
            </div>
            <div>
              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                Category
              </h4>
              <CategoryBadge category={task.category} />
            </div>
            {task.dueDate && (
              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                  Due Date
                </h4>
                <span className="text-sm text-gray-700">
                  {formatDate(task.dueDate)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right column - Timeline and actions */}
        <div className="space-y-4">
          {/* Timeline */}
          <div>
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              Timeline
            </h4>
            <div className="space-y-2">
              {timeInfo.map((info, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-500">{info.label}:</span>
                  <span className="text-gray-700" title={info.tooltip}>
                    {info.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => onEdit?.(task)}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg
                className="h-4 w-4 mr-1.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Edit
            </button>
            <button
              type="button"
              onClick={() => onStatusChange?.(task)}
              className="inline-flex items-center px-3 py-1.5 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {task.status === STATUSES.PENDING && (
                <>
                  <svg
                    className="h-4 w-4 mr-1.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Start
                </>
              )}
              {task.status === STATUSES.IN_PROGRESS && (
                <>
                  <svg
                    className="h-4 w-4 mr-1.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Complete
                </>
              )}
              {task.status === STATUSES.COMPLETED && (
                <>
                  <svg
                    className="h-4 w-4 mr-1.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Reopen
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => onDelete?.(task)}
              className="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <svg
                className="h-4 w-4 mr-1.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Delete
            </button>
          </div>
        </div>
      </div>
      
      {/* Manual Time Entry Modal */}
      <ManualTimeEntry
        isOpen={showManualEntry}
        onClose={() => setShowManualEntry(false)}
        task={task}
        onSuccess={() => {
          setShowManualEntry(false);
        }}
      />
    </div>
  );
}

/**
 * ExpandToggle component - Button to toggle task detail expansion
 */
export function ExpandToggle({ isExpanded, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="p-1 rounded hover:bg-gray-100"
      aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
      aria-expanded={isExpanded}
    >
      <svg
        className={`h-5 w-5 text-gray-400 transform transition-transform ${isExpanded ? 'rotate-180' : ''
          }`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>
  );
}

export default TaskDetail;
