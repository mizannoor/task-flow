/**
 * TaskSidePanel Component
 * Slide-out panel showing full task details when a card is clicked
 */

import { useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  STATUS_LABELS,
  STATUS_COLORS,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  STATUSES,
} from '../../utils/constants';
import { formatDate, formatDuration } from '../../utils/formatters';

/**
 * TaskSidePanel component
 * @param {object} props
 * @param {object | null} props.task - Task to display (null = panel closed)
 * @param {boolean} props.isOpen - Whether panel is open
 * @param {Function} props.onClose - Callback when panel close is requested
 * @param {Function} props.onEdit - Callback when task edit is requested
 * @param {Function} props.onDelete - Callback when task delete is requested
 * @param {Function} props.onStatusChange - Callback when status change is requested
 */
export function TaskSidePanel({
  task,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
}) {
  const panelRef = useRef(null);
  const closeButtonRef = useRef(null);

  // Handle escape key to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus trap and initial focus
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isOpen]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle backdrop click
  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onClose?.();
    }
  }, [onClose]);

  // Handle status change
  const handleStatusChange = useCallback((newStatus) => {
    if (task && newStatus !== task.status) {
      onStatusChange?.(task.id, newStatus);
    }
  }, [task, onStatusChange]);

  // Don't render if not open
  if (!isOpen || !task) {
    return null;
  }

  // Panel classes
  const backdropClasses = `fixed inset-0 bg-black/30 dark:bg-black/50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`;
  const panelClasses = `fixed inset-y-0 right-0 w-full sm:w-96 bg-white dark:bg-slate-800 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`;

  const panelContent = (
    <>
      {/* Backdrop */}
      <div
        className={backdropClasses}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={panelClasses}
        role="dialog"
        aria-modal="true"
        aria-labelledby="side-panel-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
          <h2 id="side-panel-title" className="text-lg font-semibold text-gray-900 dark:text-white truncate pr-4">
            Task Details
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="Close panel"
          >
            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Task name */}
          <div>
            <h3 className="text-xl font-medium text-gray-900 dark:text-white">{task.taskName}</h3>
          </div>

          {/* Status section with quick change buttons */}
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-2">Status</label>
            <div className="flex gap-2 flex-wrap">
              {Object.entries(STATUSES).map(([key, value]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleStatusChange(value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${task.status === value
                    ? `${STATUS_COLORS[value]} ring-2 ring-offset-1 dark:ring-offset-slate-800 ring-current`
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                    }`}
                >
                  {STATUS_LABELS[value]}
                </button>
              ))}
            </div>
          </div>

          {/* Priority and Category row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">Priority</label>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${PRIORITY_COLORS[task.priority]}`}>
                {PRIORITY_LABELS[task.priority]}
              </span>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">Category</label>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${CATEGORY_COLORS[task.category]}`}>
                {CATEGORY_LABELS[task.category]}
              </span>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">Description</label>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          {/* Deadline */}
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">Deadline</label>
            <p className="text-gray-700 dark:text-gray-300">
              {task.deadline ? formatDate(task.deadline, { includeTime: true }) : 'No deadline set'}
            </p>
          </div>

          {/* Complexity and Duration row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">Complexity</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${(task.complexity / 10) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{task.complexity}/10</span>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">Estimated Duration</label>
              <p className="text-gray-700 dark:text-gray-300">{formatDuration(task.estimatedDuration)}</p>
            </div>
          </div>

          {/* Actual duration (if completed) */}
          {task.actualDuration > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">Actual Duration</label>
              <p className="text-gray-700 dark:text-gray-300">{formatDuration(task.actualDuration)}</p>
            </div>
          )}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-2">Tags</label>
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <label className="text-gray-500 dark:text-gray-400 block">Created</label>
              <p className="text-gray-700 dark:text-gray-300">{formatDate(task.createdAt, { includeTime: true })}</p>
            </div>
            <div>
              <label className="text-gray-500 dark:text-gray-400 block">Updated</label>
              <p className="text-gray-700 dark:text-gray-300">{formatDate(task.updatedAt, { includeTime: true })}</p>
            </div>
            {task.completedAt && (
              <div className="col-span-2">
                <label className="text-gray-500 dark:text-gray-400 block">Completed</label>
                <p className="text-gray-700 dark:text-gray-300">{formatDate(task.completedAt, { includeTime: true })}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer with actions */}
        <div className="p-4 border-t border-gray-200 dark:border-slate-700 flex gap-3">
          <button
            type="button"
            onClick={() => onEdit?.(task)}
            className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-slate-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-indigo-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete?.(task.id)}
            className="inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      </div>
    </>
  );

  // Render via portal to ensure proper z-index stacking
  return createPortal(panelContent, document.body);
}

export default TaskSidePanel;
