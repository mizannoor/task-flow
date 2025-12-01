/**
 * KanbanColumn Component
 * A single column in the Kanban board representing a task status
 */

import { memo, useCallback } from 'react';
import { KanbanCard } from './KanbanCard';
import { STATUS_LABELS } from '../../utils/constants';

/**
 * KanbanColumn component
 * @param {object} props
 * @param {string} props.status - The status this column represents
 * @param {string} props.title - Column title (optional, defaults to status label)
 * @param {Array} props.tasks - Tasks to display in this column (pre-sorted)
 * @param {boolean} props.isCollapsed - Whether the column is collapsed
 * @param {Function} props.onToggleCollapse - Callback to toggle collapse state
 * @param {Function} props.onCardClick - Callback when a card is clicked
 * @param {boolean} props.isDragTarget - Whether this column is the current drag target
 * @param {string | null} props.draggedTaskId - ID of the task being dragged (for styling)
 * @param {string | null} props.focusedCardId - ID of the focused card for keyboard nav
 * @param {Function} props.onCardFocus - Callback when a card receives focus
 * @param {object} props.dropHandlers - Drop zone handlers from useDragAndDrop
 * @param {Function} props.getDragHandlers - Function to get drag handlers for a card
 * @param {Function} props.onShowPreview - Callback to show card preview
 * @param {Function} props.onHidePreview - Callback to hide card preview
 */
function KanbanColumnComponent({
  status,
  title,
  tasks = [],
  isCollapsed = false,
  onToggleCollapse,
  onCardClick,
  isDragTarget = false,
  draggedTaskId = null,
  focusedCardId = null,
  onCardFocus,
  dropHandlers = {},
  getDragHandlers,
  onShowPreview,
  onHidePreview,
}) {
  const columnTitle = title || STATUS_LABELS[status] || status;
  const taskCount = tasks.length;

  // Handle toggle collapse click
  const handleToggleClick = useCallback((e) => {
    e.stopPropagation();
    onToggleCollapse?.();
  }, [onToggleCollapse]);

  // Handle collapsed column click (expand)
  const handleCollapsedClick = useCallback(() => {
    if (isCollapsed) {
      onToggleCollapse?.();
    }
  }, [isCollapsed, onToggleCollapse]);

  // Build column classes with Tailwind utilities
  const baseColumnClasses = 'flex flex-col bg-gray-50 rounded-lg shrink-0 transition-all duration-300 ease-in-out';
  const expandedClasses = 'min-w-80 max-w-80';
  const collapsedClasses = 'min-w-12 max-w-12 cursor-pointer';
  const dropTargetClasses = isDragTarget && !isCollapsed ? 'bg-indigo-50 ring-2 ring-inset ring-indigo-400' : '';

  const columnClasses = `${baseColumnClasses} ${isCollapsed ? collapsedClasses : expandedClasses} ${dropTargetClasses}`;

  // Collapsed column view
  if (isCollapsed) {
    return (
      <div
        className={`${columnClasses} kanban-column--collapsed`}
        onClick={handleCollapsedClick}
        role="button"
        tabIndex={0}
        aria-label={`${columnTitle} column (collapsed) - ${taskCount} tasks. Click to expand.`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCollapsedClick();
          }
        }}
      >
        <div className="flex flex-col items-center justify-center h-full py-4">
          {/* Collapsed title - rotated */}
          <span className="kanban-column-title text-sm font-medium text-gray-700 whitespace-nowrap">
            {columnTitle}
          </span>
          {/* Task count badge */}
          <span className="mt-2 bg-gray-200 text-gray-700 text-xs font-medium px-2 py-0.5 rounded-full">
            {taskCount}
          </span>
        </div>
      </div>
    );
  }

  // Expanded column view
  return (
    <div
      className={columnClasses}
      {...dropHandlers}
      role="region"
      aria-label={`${columnTitle} column with ${taskCount} tasks`}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-100 rounded-t-lg border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900">{columnTitle}</h3>
          {/* Task count badge */}
          <span className="bg-gray-200 text-gray-700 text-xs font-medium px-2 py-0.5 rounded-full">
            {taskCount}
          </span>
        </div>

        {/* Collapse button */}
        <button
          type="button"
          onClick={handleToggleClick}
          className="p-1 rounded hover:bg-gray-200 transition-colors"
          aria-label={`Collapse ${columnTitle} column`}
          title="Collapse column"
        >
          <svg
            className="w-4 h-4 text-gray-500"
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
        </button>
      </div>

      {/* Column content - scrollable */}
      <div className="kanban-column-content flex-1 overflow-y-auto p-2 space-y-2">
        {taskCount === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center h-32 text-gray-400 text-sm">
            <svg
              className="w-10 h-10 text-gray-300 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <span>No tasks</span>
          </div>
        ) : (
          /* Task cards */
          tasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              isDragging={task.id === draggedTaskId}
              isFocused={task.id === focusedCardId}
              onClick={onCardClick}
              dragHandlers={getDragHandlers?.(task.id, status)}
              onFocus={() => onCardFocus?.(task.id)}
              onShowPreview={onShowPreview}
              onHidePreview={onHidePreview}
            />
          ))
        )}

        {/* Drop indicator when dragging */}
        {isDragTarget && taskCount > 0 && (
          <div className="h-1 bg-indigo-500 rounded-full mx-2 transition-all duration-150" />
        )}
      </div>
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export const KanbanColumn = memo(KanbanColumnComponent);

export default KanbanColumn;
