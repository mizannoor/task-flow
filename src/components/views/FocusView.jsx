/**
 * FocusView Component
 * Main container for Today's Focus View
 * Displays curated task list with progress tracking and keyboard navigation
 */

import { useState, useCallback, useRef, useEffect, memo } from 'react';
import { useFocusTasks } from '../../hooks/useFocusTasks';
import { useTasks } from '../../hooks/useTasks';
import { FocusCard } from './FocusCard';
import { FocusProgress } from './FocusProgress';
import { FocusEmptyState } from './FocusEmptyState';
import { STATUSES } from '../../utils/constants';

/**
 * FocusView component
 * @param {object} props
 * @param {Function} props.onEditTask - Callback when task edit is requested
 * @param {Function} props.onDeleteTask - Callback when task delete is requested
 * @param {Function} props.onCreateTask - Callback when create task is requested
 */
function FocusViewComponent({
  onEditTask,
  onDeleteTask,
  onCreateTask,
}) {
  const { focusTasks, progress, hasMore, loadMore, loading, error } = useFocusTasks();
  const { updateTask, startTask, completeTask } = useTasks();

  // UI state
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [focusedIndex, setFocusedIndex] = useState(0);

  // Refs for keyboard navigation
  const containerRef = useRef(null);
  const cardRefs = useRef([]);

  // Reset focused index when tasks change
  useEffect(() => {
    if (focusedIndex >= focusTasks.length && focusTasks.length > 0) {
      setFocusedIndex(focusTasks.length - 1);
    }
  }, [focusTasks.length, focusedIndex]);

  // Handle card click to toggle expansion
  const handleCardClick = useCallback((taskId) => {
    setExpandedTaskId(prev => prev === taskId ? null : taskId);
  }, []);

  // Handle start task action
  const handleStartTask = useCallback(async (taskId) => {
    try {
      await startTask(taskId);
    } catch (err) {
      console.error('Failed to start task:', err);
    }
  }, [startTask]);

  // Handle complete task action
  const handleCompleteTask = useCallback(async (taskId) => {
    try {
      await completeTask(taskId);
      // Collapse if the completed task was expanded
      if (expandedTaskId === taskId) {
        setExpandedTaskId(null);
      }
    } catch (err) {
      console.error('Failed to complete task:', err);
    }
  }, [completeTask, expandedTaskId]);

  // Handle keyboard navigation on individual cards
  const handleCardKeyDown = useCallback((e, task, index) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(i => Math.min(i + 1, focusTasks.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        // Trigger primary action based on status
        if (task.status === STATUSES.PENDING) {
          handleStartTask(task.id);
        } else if (task.status === STATUSES.IN_PROGRESS) {
          handleCompleteTask(task.id);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setExpandedTaskId(null);
        break;
      case 'e':
      case 'E':
        // Toggle expansion
        e.preventDefault();
        handleCardClick(task.id);
        break;
      default:
        break;
    }
  }, [focusTasks.length, handleStartTask, handleCompleteTask, handleCardClick]);

  // Focus management effect
  useEffect(() => {
    if (cardRefs.current[focusedIndex]) {
      cardRefs.current[focusedIndex].focus();
    }
  }, [focusedIndex]);

  // Handle container keyboard events
  const handleContainerKeyDown = useCallback((e) => {
    // Only handle if no card is focused
    if (document.activeElement === containerRef.current) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        setFocusedIndex(0);
        cardRefs.current[0]?.focus();
      }
    }
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        {/* Loading skeleton */}
        <div className="bg-gray-100 rounded-xl p-5 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-3" />
          <div className="h-3 bg-gray-200 rounded-full" />
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-xl border-2 border-gray-200 p-5 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-3" />
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 className="text-lg font-semibold text-red-800 mb-2">Failed to load tasks</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  // Empty state (no qualifying tasks)
  if (focusTasks.length === 0) {
    // Determine which empty state to show
    const isAllDone = progress && progress.completedToday > 0 && progress.remainingTasks === 0;

    return (
      <div
        ref={containerRef}
        className="focus-view"
        tabIndex={0}
        onKeyDown={handleContainerKeyDown}
      >
        {/* Show progress if there were completions */}
        {progress && progress.completedToday > 0 && (
          <FocusProgress progress={progress} />
        )}

        <FocusEmptyState
          type={isAllDone ? 'all-done' : 'no-tasks'}
          hasMoreTasks={hasMore}
          onCreateTask={onCreateTask}
          onLoadMore={loadMore}
        />
      </div>
    );
  }

  // Main view with tasks
  return (
    <div
      ref={containerRef}
      className="focus-view"
      tabIndex={0}
      onKeyDown={handleContainerKeyDown}
      aria-label="Today's Focus View"
    >
      {/* Progress indicator */}
      {progress && <FocusProgress progress={progress} />}

      {/* Task list */}
      <div className="space-y-4" role="list" aria-label="Focus tasks">
        {focusTasks.map((task, index) => (
          <div
            key={task.id}
            ref={el => cardRefs.current[index] = el}
            role="listitem"
          >
            <FocusCard
              task={task}
              isExpanded={expandedTaskId === task.id}
              isFocused={focusedIndex === index}
              onClick={handleCardClick}
              onStart={handleStartTask}
              onComplete={handleCompleteTask}
              onFocus={() => setFocusedIndex(index)}
              onKeyDown={handleCardKeyDown}
              index={index}
            />
          </div>
        ))}
      </div>

      {/* Load more (if all displayed tasks were completed) */}
      {hasMore && focusTasks.length < 10 && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={loadMore}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Load More Tasks
          </button>
        </div>
      )}

      {/* Keyboard shortcuts hint */}
      <div className="mt-6 text-center text-xs text-gray-400">
        <span className="inline-flex items-center gap-2">
          <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border text-gray-600">↑↓</kbd> Navigate
          <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border text-gray-600">Enter</kbd> Action
          <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border text-gray-600">E</kbd> Expand
          <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border text-gray-600">Esc</kbd> Collapse
        </span>
      </div>
    </div>
  );
}

export const FocusView = memo(FocusViewComponent);
export default FocusView;
