/**
 * useDragAndDrop Hook
 * Manages drag-and-drop state for Kanban board using native HTML5 Drag and Drop API
 * with pointer events for unified mouse/touch handling
 */

import { useState, useCallback, useRef } from 'react';
import { KANBAN_DND_TYPE } from '../utils/constants';

/**
 * Initial drag state
 */
const initialDragState = {
  isDragging: false,
  draggedTaskId: null,
  sourceColumn: null,
  targetColumn: null,
  dropIndex: null,
};

/**
 * Custom hook for drag-and-drop functionality
 * @param {object} options - Hook options
 * @param {Function} options.onDrop - Callback when a card is dropped (taskId, newStatus, oldStatus) => void
 * @returns {object} - Drag state and handlers
 */
export function useDragAndDrop({ onDrop } = {}) {
  const [dragState, setDragState] = useState(initialDragState);
  const dragImageRef = useRef(null);
  const touchStartPos = useRef(null);
  const touchDragTaskId = useRef(null);

  /**
   * Start a drag operation
   * @param {string} taskId - The ID of the task being dragged
   * @param {string} sourceColumn - The status/column the task is dragged from
   */
  const startDrag = useCallback((taskId, sourceColumn) => {
    setDragState({
      isDragging: true,
      draggedTaskId: taskId,
      sourceColumn,
      targetColumn: sourceColumn,
      dropIndex: null,
    });
  }, []);

  /**
   * Update the target column during drag
   * @param {string | null} targetColumn - The column currently being hovered
   * @param {number | null} dropIndex - The position within the column (optional)
   */
  const updateTarget = useCallback((targetColumn, dropIndex = null) => {
    setDragState((prev) => ({
      ...prev,
      targetColumn,
      dropIndex,
    }));
  }, []);

  /**
   * End drag operation successfully
   */
  const endDrag = useCallback(() => {
    const { draggedTaskId, targetColumn, sourceColumn } = dragState;

    // Call the onDrop callback if the column changed
    if (draggedTaskId && targetColumn && targetColumn !== sourceColumn && onDrop) {
      onDrop(draggedTaskId, targetColumn, sourceColumn);
    }

    setDragState(initialDragState);
  }, [dragState, onDrop]);

  /**
   * Cancel drag operation (revert to original position)
   */
  const cancelDrag = useCallback(() => {
    setDragState(initialDragState);
  }, []);

  /**
   * Get drag handlers for a card element
   * @param {string} taskId - The task ID
   * @param {string} status - The current status/column of the task
   * @returns {object} - Props to spread on the draggable element
   */
  const getDragHandlers = useCallback(
    (taskId, status) => ({
      draggable: true,

      onDragStart: (e) => {
        // Set the drag data
        e.dataTransfer.setData(KANBAN_DND_TYPE, JSON.stringify({ taskId, sourceColumn: status }));
        e.dataTransfer.effectAllowed = 'move';

        // Create custom drag image if needed
        if (e.target) {
          const rect = e.target.getBoundingClientRect();
          e.dataTransfer.setDragImage(e.target, rect.width / 2, 20);
        }

        // Start the drag state
        startDrag(taskId, status);
      },

      onDragEnd: (e) => {
        // If the drop was successful (dropEffect is 'move'), the state was already updated
        // If cancelled (dropEffect is 'none'), reset the state
        if (e.dataTransfer.dropEffect === 'none') {
          cancelDrag();
        } else {
          endDrag();
        }
      },

      // Touch support via pointer events
      onPointerDown: (e) => {
        // Only handle touch events for mobile drag support
        if (e.pointerType === 'touch') {
          touchStartPos.current = { x: e.clientX, y: e.clientY };
          touchDragTaskId.current = taskId;
        }
      },
    }),
    [startDrag, endDrag, cancelDrag]
  );

  /**
   * Get drop handlers for a column element
   * @param {string} status - The status/column identifier
   * @returns {object} - Props to spread on the drop zone element
   */
  const getDropHandlers = useCallback(
    (status) => ({
      onDragOver: (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        // Calculate drop index based on mouse position (optional enhancement)
        // For now, we just highlight the column
        updateTarget(status);
      },

      onDragEnter: (e) => {
        e.preventDefault();
        updateTarget(status);
      },

      onDragLeave: (e) => {
        // Only clear if we're actually leaving the column (not entering a child)
        const relatedTarget = e.relatedTarget;
        if (relatedTarget && !e.currentTarget.contains(relatedTarget)) {
          // Keep the target but could clear here if needed
        }
      },

      onDrop: (e) => {
        e.preventDefault();

        try {
          const data = e.dataTransfer.getData(KANBAN_DND_TYPE);
          if (data) {
            const { taskId, sourceColumn } = JSON.parse(data);

            // Call onDrop callback if column changed
            if (taskId && status !== sourceColumn && onDrop) {
              onDrop(taskId, status, sourceColumn);
            }
          }
        } catch (err) {
          console.error('Failed to parse drag data:', err);
        }

        // Reset drag state
        setDragState(initialDragState);
      },
    }),
    [updateTarget, onDrop]
  );

  return {
    dragState,
    startDrag,
    updateTarget,
    endDrag,
    cancelDrag,
    getDragHandlers,
    getDropHandlers,
  };
}

export default useDragAndDrop;
