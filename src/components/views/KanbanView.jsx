/**
 * KanbanView Component
 * Main Kanban board container with three columns (Pending, In Progress, Completed)
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCardPreview } from './KanbanCardPreview';
import { TaskSidePanel } from './TaskSidePanel';
import { useTasks } from '../../hooks/useTasks';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import { useTranslation } from '../../hooks/useTranslation';
import { useTranslatedLabels } from '../../hooks/useTranslatedLabels';
import {
  KANBAN_COLUMNS,
  KANBAN_STORAGE_KEY,
  DEFAULT_COLLAPSED_COLUMNS,
  STATUSES,
} from '../../utils/constants';
import { groupTasksByStatus, sortTasksInColumn } from '../../utils/formatters';

/**
 * Load collapsed columns state from localStorage
 * @returns {object} - Collapsed state by status
 */
function loadCollapsedState() {
  try {
    const saved = localStorage.getItem(KANBAN_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Failed to load Kanban column state:', e);
  }
  return { ...DEFAULT_COLLAPSED_COLUMNS };
}

/**
 * Save collapsed columns state to localStorage
 * @param {object} state - Collapsed state by status
 */
function saveCollapsedState(state) {
  try {
    localStorage.setItem(KANBAN_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save Kanban column state:', e);
  }
}

/**
 * KanbanView component
 * @param {object} props
 * @param {Function} props.onEditTask - Callback when task edit is requested
 * @param {Function} props.onDeleteTask - Callback when task delete is requested
 * @param {Function} props.onCreateTask - Callback when create task is requested (from empty state)
 * @param {Function} props.onStatusChange - Callback when task status changes via drag-drop
 */
export function KanbanView({
  onEditTask,
  onDeleteTask,
  onCreateTask,
  onStatusChange,
}) {
  const { t } = useTranslation();
  const { statusLabels } = useTranslatedLabels();
  const { tasks, updateTask, loading, error } = useTasks();

  // Collapsed columns state (persisted to localStorage)
  const [collapsedColumns, setCollapsedColumns] = useState(loadCollapsedState);

  // Selected task for side panel
  const [selectedTask, setSelectedTask] = useState(null);

  // Preview popup state
  const [previewState, setPreviewState] = useState({
    isVisible: false,
    task: null,
    position: { x: 0, y: 0 },
  });

  // Keyboard focus state
  const [focusedCardId, setFocusedCardId] = useState(null);

  // Handle task status update on drag-drop
  const handleDrop = useCallback(async (taskId, newStatus, oldStatus) => {
    try {
      // Optimistic update handled by TaskContext
      await updateTask(taskId, { status: newStatus });

      // Notify parent if needed
      onStatusChange?.({ taskId, newStatus, oldStatus });
    } catch (error) {
      console.error('Failed to update task status:', error);
      // TaskContext handles rollback on error
    }
  }, [updateTask, onStatusChange]);

  // Drag and drop hook
  const {
    dragState,
    getDragHandlers,
    getDropHandlers,
  } = useDragAndDrop({ onDrop: handleDrop });

  // Group and sort tasks by status
  const groupedTasks = useMemo(() => {
    const grouped = groupTasksByStatus(tasks);

    // Sort tasks within each column
    return {
      [STATUSES.PENDING]: sortTasksInColumn(grouped[STATUSES.PENDING]),
      [STATUSES.IN_PROGRESS]: sortTasksInColumn(grouped[STATUSES.IN_PROGRESS]),
      [STATUSES.COMPLETED]: sortTasksInColumn(grouped[STATUSES.COMPLETED]),
    };
  }, [tasks]);

  // Toggle column collapse state
  const toggleColumnCollapse = useCallback((status) => {
    setCollapsedColumns((prev) => {
      // Ensure at least one column remains expanded
      const expandedCount = Object.values(prev).filter((v) => !v).length;
      const isCurrentlyCollapsed = prev[status];

      // Don't collapse if this is the last expanded column
      if (!isCurrentlyCollapsed && expandedCount <= 1) {
        return prev;
      }

      const newState = { ...prev, [status]: !prev[status] };
      saveCollapsedState(newState);
      return newState;
    });
  }, []);

  // Handle card click to open side panel
  const handleCardClick = useCallback((task) => {
    setSelectedTask(task);
  }, []);

  // Handle side panel close
  const handleCloseSidePanel = useCallback(() => {
    setSelectedTask(null);
  }, []);

  // Handle show preview
  const handleShowPreview = useCallback((task, position) => {
    setPreviewState({
      isVisible: true,
      task,
      position,
    });
  }, []);

  // Handle hide preview
  const handleHidePreview = useCallback(() => {
    setPreviewState((prev) => ({
      ...prev,
      isVisible: false,
    }));
  }, []);

  // Handle card focus for keyboard navigation
  const handleCardFocus = useCallback((taskId) => {
    setFocusedCardId(taskId);
  }, []);

  // Handle task edit from side panel
  const handleEditFromPanel = useCallback((task) => {
    setSelectedTask(null);
    onEditTask?.(task);
  }, [onEditTask]);

  // Handle task delete from side panel
  const handleDeleteFromPanel = useCallback((taskId) => {
    setSelectedTask(null);
    onDeleteTask?.(taskId);
  }, [onDeleteTask]);

  // Handle status change from side panel
  const handleStatusChangeFromPanel = useCallback(async (taskId, newStatus) => {
    try {
      await updateTask(taskId, { status: newStatus });
      // Update the selected task if it's still open
      setSelectedTask((prev) => prev ? { ...prev, status: newStatus } : null);
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  }, [updateTask]);

  // Kanban board container classes
  const boardClasses = 'flex gap-4 h-[calc(100vh-280px)] min-h-96 overflow-x-auto pb-4';

  // Loading state
  if (loading) {
    return (
      <div className={`${boardClasses} items-center justify-center`}>
        <div className="text-gray-500">{t('common.loading')}</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`${boardClasses} items-center justify-center`}>
        <div className="text-red-500">Error loading tasks: {error.message || 'Unknown error'}</div>
      </div>
    );
  }

  return (
    <>
      {/* Kanban board */}
      <div className={boardClasses} role="application" aria-label={t('kanban.title')}>
        {KANBAN_COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            status={column.status}
            title={statusLabels[column.status] || column.title}
            tasks={groupedTasks[column.status] || []}
            isCollapsed={collapsedColumns[column.status]}
            onToggleCollapse={() => toggleColumnCollapse(column.status)}
            onCardClick={handleCardClick}
            isDragTarget={dragState.targetColumn === column.status}
            draggedTaskId={dragState.draggedTaskId}
            focusedCardId={focusedCardId}
            onCardFocus={handleCardFocus}
            dropHandlers={getDropHandlers(column.status)}
            getDragHandlers={getDragHandlers}
            onShowPreview={handleShowPreview}
            onHidePreview={handleHidePreview}
          />
        ))}
      </div>

      {/* Card preview popup */}
      {previewState.isVisible && previewState.task && (
        <KanbanCardPreview
          task={previewState.task}
          position={previewState.position}
          onClose={handleHidePreview}
        />
      )}

      {/* Task side panel */}
      <TaskSidePanel
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={handleCloseSidePanel}
        onEdit={handleEditFromPanel}
        onDelete={handleDeleteFromPanel}
        onStatusChange={handleStatusChangeFromPanel}
      />
    </>
  );
}

export default KanbanView;
