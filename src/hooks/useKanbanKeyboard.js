/**
 * useKanbanKeyboard Hook
 * Manages keyboard navigation for Kanban board using roving tabindex pattern
 * Implements WCAG-compliant keyboard accessibility
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { KANBAN_COLUMNS, STATUSES } from '../utils/constants';

/**
 * Get the column statuses in order
 */
const COLUMN_ORDER = KANBAN_COLUMNS.map((col) => col.status);

/**
 * Custom hook for Kanban keyboard navigation
 * @param {object} options - Hook options
 * @param {object} options.groupedTasks - Tasks grouped by status { pending: [], 'in-progress': [], completed: [] }
 * @param {Function} options.onStatusChange - Callback when status change is requested via keyboard
 * @param {Function} options.onCardSelect - Callback when a card is selected (Enter/Space)
 * @returns {object} - Keyboard state and handlers
 */
export function useKanbanKeyboard({ groupedTasks = {}, onStatusChange, onCardSelect } = {}) {
  // Current focus state
  const [focusedCardId, setFocusedCardId] = useState(null);
  const [focusedColumn, setFocusedColumn] = useState(null);

  // Status dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dropdownTaskId, setDropdownTaskId] = useState(null);

  // Refs for focus management
  const boardRef = useRef(null);
  const cardRefs = useRef(new Map());
  const dropdownRef = useRef(null);

  /**
   * Register a card ref for focus management
   */
  const registerCardRef = useCallback((taskId, element) => {
    if (element) {
      cardRefs.current.set(taskId, element);
    } else {
      cardRefs.current.delete(taskId);
    }
  }, []);

  /**
   * Set focus to a specific card
   * @param {string} cardId - Task ID
   * @param {string} column - Column status
   */
  const setFocus = useCallback((cardId, column) => {
    setFocusedCardId(cardId);
    setFocusedColumn(column);

    // Focus the actual DOM element
    const element = cardRefs.current.get(cardId);
    if (element) {
      element.focus();
    }
  }, []);

  /**
   * Clear focus (e.g., when leaving board)
   */
  const clearFocus = useCallback(() => {
    setFocusedCardId(null);
    setFocusedColumn(null);
    setIsDropdownOpen(false);
    setDropdownTaskId(null);
  }, []);

  /**
   * Open status dropdown for a card
   */
  const openDropdown = useCallback((taskId) => {
    setDropdownTaskId(taskId);
    setIsDropdownOpen(true);
  }, []);

  /**
   * Close status dropdown
   */
  const closeDropdown = useCallback(() => {
    setIsDropdownOpen(false);
    setDropdownTaskId(null);

    // Return focus to the card
    if (focusedCardId) {
      const element = cardRefs.current.get(focusedCardId);
      if (element) {
        element.focus();
      }
    }
  }, [focusedCardId]);

  /**
   * Get the next card in the current column
   */
  const getNextCardInColumn = useCallback((direction) => {
    if (!focusedColumn || !focusedCardId) return null;

    const tasksInColumn = groupedTasks[focusedColumn] || [];
    const currentIndex = tasksInColumn.findIndex((t) => t.id === focusedCardId);

    if (currentIndex === -1) return null;

    const nextIndex = direction === 'down'
      ? Math.min(currentIndex + 1, tasksInColumn.length - 1)
      : Math.max(currentIndex - 1, 0);

    return tasksInColumn[nextIndex]?.id || null;
  }, [focusedColumn, focusedCardId, groupedTasks]);

  /**
   * Get the first card in an adjacent column
   */
  const getCardInAdjacentColumn = useCallback((direction) => {
    if (!focusedColumn) return { cardId: null, column: null };

    const currentColumnIndex = COLUMN_ORDER.indexOf(focusedColumn);
    const nextColumnIndex = direction === 'right'
      ? Math.min(currentColumnIndex + 1, COLUMN_ORDER.length - 1)
      : Math.max(currentColumnIndex - 1, 0);

    if (nextColumnIndex === currentColumnIndex) {
      return { cardId: focusedCardId, column: focusedColumn };
    }

    const nextColumn = COLUMN_ORDER[nextColumnIndex];
    const tasksInNextColumn = groupedTasks[nextColumn] || [];

    // Try to maintain relative position
    const currentTasks = groupedTasks[focusedColumn] || [];
    const currentIndex = currentTasks.findIndex((t) => t.id === focusedCardId);
    const targetIndex = Math.min(currentIndex, tasksInNextColumn.length - 1);

    return {
      cardId: tasksInNextColumn[Math.max(0, targetIndex)]?.id || null,
      column: nextColumn,
    };
  }, [focusedColumn, focusedCardId, groupedTasks]);

  /**
   * Handle keyboard events for the board
   */
  const handleKeyDown = useCallback((e) => {
    // If dropdown is open, handle dropdown navigation
    if (isDropdownOpen) {
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          closeDropdown();
          break;
        case 'Enter':
        case ' ':
          // Selection handled by dropdown items
          break;
        default:
          break;
      }
      return;
    }

    // Handle board navigation
    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        const nextCard = getNextCardInColumn('down');
        if (nextCard && nextCard !== focusedCardId) {
          setFocus(nextCard, focusedColumn);
        }
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        const prevCard = getNextCardInColumn('up');
        if (prevCard && prevCard !== focusedCardId) {
          setFocus(prevCard, focusedColumn);
        }
        break;
      }
      case 'ArrowRight': {
        e.preventDefault();
        const { cardId, column } = getCardInAdjacentColumn('right');
        if (cardId && column) {
          setFocus(cardId, column);
        }
        break;
      }
      case 'ArrowLeft': {
        e.preventDefault();
        const { cardId, column } = getCardInAdjacentColumn('left');
        if (cardId && column) {
          setFocus(cardId, column);
        }
        break;
      }
      case 'Enter':
      case ' ': {
        e.preventDefault();
        if (focusedCardId) {
          // Open status dropdown for keyboard status change
          openDropdown(focusedCardId);
        }
        break;
      }
      case 'Escape': {
        // Clear focus and exit board navigation
        clearFocus();
        break;
      }
      default:
        break;
    }
  }, [
    isDropdownOpen,
    focusedCardId,
    focusedColumn,
    closeDropdown,
    getNextCardInColumn,
    getCardInAdjacentColumn,
    setFocus,
    clearFocus,
    openDropdown,
  ]);

  /**
   * Handle focus entering the board
   */
  const handleBoardFocus = useCallback(() => {
    // If no card is focused, focus the first card in the first non-empty column
    if (!focusedCardId) {
      for (const status of COLUMN_ORDER) {
        const tasks = groupedTasks[status] || [];
        if (tasks.length > 0) {
          setFocus(tasks[0].id, status);
          break;
        }
      }
    }
  }, [focusedCardId, groupedTasks, setFocus]);

  /**
   * Handle status selection from dropdown
   */
  const handleStatusSelect = useCallback((newStatus) => {
    if (dropdownTaskId && onStatusChange) {
      onStatusChange(dropdownTaskId, newStatus);
    }
    closeDropdown();
  }, [dropdownTaskId, onStatusChange, closeDropdown]);

  /**
   * Get keyboard handlers for the board container
   */
  const getKeyboardHandlers = useCallback(() => ({
    ref: boardRef,
    onKeyDown: handleKeyDown,
    onFocus: handleBoardFocus,
    tabIndex: 0,
    role: 'application',
    'aria-label': 'Kanban board. Use arrow keys to navigate between cards and columns. Press Enter to change task status.',
  }), [handleKeyDown, handleBoardFocus]);

  /**
   * Get props for status dropdown
   */
  const getDropdownProps = useCallback(() => ({
    isOpen: isDropdownOpen,
    taskId: dropdownTaskId,
    onSelect: handleStatusSelect,
    onClose: closeDropdown,
    ref: dropdownRef,
  }), [isDropdownOpen, dropdownTaskId, handleStatusSelect, closeDropdown]);

  return {
    // State
    focusedCardId,
    focusedColumn,
    isDropdownOpen,
    dropdownTaskId,

    // Actions
    setFocus,
    clearFocus,
    openDropdown,
    closeDropdown,
    registerCardRef,

    // Handlers
    getKeyboardHandlers,
    getDropdownProps,
    handleStatusSelect,
  };
}

export default useKanbanKeyboard;
