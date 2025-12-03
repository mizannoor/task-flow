/**
 * useListKeyboard Hook
 * Keyboard navigation for List view tasks
 */

import { useCallback, useEffect, useRef } from 'react';

/**
 * Hook for keyboard navigation in List view
 * @param {object} options - Configuration options
 * @param {Array} options.tasks - Array of task objects
 * @param {string|null} options.focusedTaskId - Currently focused task ID
 * @param {Function} options.onFocusChange - Callback when focus changes
 * @param {Function} options.onToggleSelect - Callback when selection toggles
 * @param {boolean} options.enabled - Whether keyboard navigation is enabled
 * @returns {object} - { taskRefs, handleKeyDown }
 */
export function useListKeyboard({
  tasks = [],
  focusedTaskId = null,
  onFocusChange,
  onToggleSelect,
  enabled = true,
}) {
  // Map of task ID to DOM ref
  const taskRefs = useRef(new Map());

  // Get index of currently focused task
  const getFocusedIndex = useCallback(() => {
    if (!focusedTaskId || !tasks.length) return -1;
    return tasks.findIndex((t) => t.id === focusedTaskId);
  }, [focusedTaskId, tasks]);

  // Focus a task by index
  const focusByIndex = useCallback(
    (index) => {
      if (index >= 0 && index < tasks.length) {
        const taskId = tasks[index].id;
        onFocusChange?.(taskId);

        // Focus the DOM element
        const element = taskRefs.current.get(taskId);
        if (element) {
          element.focus();
        }
      }
    },
    [tasks, onFocusChange]
  );

  // Navigate to previous task
  const navigatePrev = useCallback(() => {
    const currentIndex = getFocusedIndex();
    if (currentIndex > 0) {
      focusByIndex(currentIndex - 1);
      return true;
    }
    return false;
  }, [getFocusedIndex, focusByIndex]);

  // Navigate to next task
  const navigateNext = useCallback(() => {
    const currentIndex = getFocusedIndex();
    if (currentIndex < tasks.length - 1) {
      focusByIndex(currentIndex + 1);
      return true;
    }
    return false;
  }, [getFocusedIndex, focusByIndex, tasks.length]);

  // Toggle selection on current task
  const toggleSelection = useCallback(() => {
    if (focusedTaskId) {
      onToggleSelect?.(focusedTaskId);
      return true;
    }
    return false;
  }, [focusedTaskId, onToggleSelect]);

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (event) => {
      if (!enabled) return;

      switch (event.key) {
        case 'ArrowUp':
          if (navigatePrev()) {
            event.preventDefault();
          }
          break;
        case 'ArrowDown':
          if (navigateNext()) {
            event.preventDefault();
          }
          break;
        case ' ': // Space
          if (toggleSelection()) {
            event.preventDefault();
          }
          break;
        default:
          break;
      }
    },
    [enabled, navigatePrev, navigateNext, toggleSelection]
  );

  // Register task ref
  const registerRef = useCallback((taskId, element) => {
    if (element) {
      taskRefs.current.set(taskId, element);
    } else {
      taskRefs.current.delete(taskId);
    }
  }, []);

  // Focus first task when tasks change and nothing is focused
  useEffect(() => {
    if (!focusedTaskId && tasks.length > 0 && enabled) {
      // Don't auto-focus - let user initiate navigation
    }
  }, [focusedTaskId, tasks, enabled]);

  return {
    taskRefs,
    registerRef,
    handleKeyDown,
    navigatePrev,
    navigateNext,
    toggleSelection,
    focusByIndex,
  };
}

export default useListKeyboard;
