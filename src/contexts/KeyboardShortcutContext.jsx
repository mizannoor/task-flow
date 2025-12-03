/**
 * KeyboardShortcutContext
 * Global state management for keyboard shortcuts
 * Provides centralized shortcut handling and action dispatch
 */

import { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import { KEYBOARD_SHORTCUTS, SHORTCUT_CONTEXTS } from '../utils/constants';
import { isInputElement, matchShortcut, normalizeShortcutKey } from '../utils/platformUtils';
import { recordShortcutUsage } from '../services/shortcutService';

// Context
const KeyboardShortcutContext = createContext(null);

// Action types
const ACTIONS = {
  SET_FOCUSED_TASK: 'SET_FOCUSED_TASK',
  SET_FOCUSED_VIEW: 'SET_FOCUSED_VIEW',
  SET_HELP_OPEN: 'SET_HELP_OPEN',
  SET_MODAL_OPEN: 'SET_MODAL_OPEN',
  SET_SELECTED_TASKS: 'SET_SELECTED_TASKS',
  TOGGLE_TASK_SELECTION: 'TOGGLE_TASK_SELECTION',
  CLEAR_SELECTIONS: 'CLEAR_SELECTIONS',
  SET_LAST_SHORTCUT: 'SET_LAST_SHORTCUT',
};

// Initial state
const initialState = {
  focusedTaskId: null,
  focusedView: null,
  isHelpOverlayOpen: false,
  isModalOpen: false,
  selectedTaskIds: new Set(),
  lastShortcut: null,
};

// Reducer
function reducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_FOCUSED_TASK:
      return { ...state, focusedTaskId: action.payload };
    case ACTIONS.SET_FOCUSED_VIEW:
      return { ...state, focusedView: action.payload };
    case ACTIONS.SET_HELP_OPEN:
      return { ...state, isHelpOverlayOpen: action.payload };
    case ACTIONS.SET_MODAL_OPEN:
      return { ...state, isModalOpen: action.payload };
    case ACTIONS.SET_SELECTED_TASKS:
      return { ...state, selectedTaskIds: new Set(action.payload) };
    case ACTIONS.TOGGLE_TASK_SELECTION: {
      const newSet = new Set(state.selectedTaskIds);
      if (newSet.has(action.payload)) {
        newSet.delete(action.payload);
      } else {
        newSet.add(action.payload);
      }
      return { ...state, selectedTaskIds: newSet };
    }
    case ACTIONS.CLEAR_SELECTIONS:
      return { ...state, selectedTaskIds: new Set() };
    case ACTIONS.SET_LAST_SHORTCUT:
      return { ...state, lastShortcut: action.payload };
    default:
      return state;
  }
}

/**
 * KeyboardShortcutProvider
 * Wraps the application to provide keyboard shortcut functionality
 */
export function KeyboardShortcutProvider({
  children,
  userId,
  currentView,
  onViewChange,
  onCreateTask,
  // onFocusSearch - handled via searchRef
  onEditTask,
  onDeleteTask,
  onCompleteTask,
  onStartTask,
  searchRef,
}) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const handlersRef = useRef(new Map());
  const announcerRef = useRef(null);

  // Update focused view when currentView prop changes
  useEffect(() => {
    dispatch({ type: ACTIONS.SET_FOCUSED_VIEW, payload: currentView });
  }, [currentView]);

  // Announce to screen readers
  const announce = useCallback((message) => {
    if (announcerRef.current) {
      announcerRef.current.textContent = message;
      // Clear after announcement to allow repeated messages
      setTimeout(() => {
        if (announcerRef.current) {
          announcerRef.current.textContent = '';
        }
      }, 1000);
    }
  }, []);

  // Record shortcut usage
  const recordUsage = useCallback(
    (shortcut, context) => {
      if (userId) {
        const key = normalizeShortcutKey(shortcut);
        recordShortcutUsage(userId, key, context || state.focusedView || 'global');
      }
    },
    [userId, state.focusedView]
  );

  // Register action handlers
  useEffect(() => {
    const handlers = handlersRef.current;

    // Global shortcuts
    handlers.set('createTask', () => {
      if (!state.isModalOpen && onCreateTask) {
        onCreateTask();
        announce('Creating new task');
        return true;
      }
      return false;
    });

    handlers.set('focusSearch', () => {
      if (!state.isModalOpen && searchRef?.current) {
        searchRef.current.focus();
        searchRef.current.select?.();
        announce('Search focused');
        return true;
      }
      return false;
    });

    handlers.set('showHelp', () => {
      dispatch({ type: ACTIONS.SET_HELP_OPEN, payload: !state.isHelpOverlayOpen });
      announce(state.isHelpOverlayOpen ? 'Help closed' : 'Keyboard shortcuts help');
      return true;
    });

    handlers.set('closeOrClear', () => {
      // Priority: modal > help > selection > search > focus
      if (state.isHelpOverlayOpen) {
        dispatch({ type: ACTIONS.SET_HELP_OPEN, payload: false });
        announce('Help closed');
        return true;
      }
      if (state.selectedTaskIds.size > 0) {
        dispatch({ type: ACTIONS.CLEAR_SELECTIONS });
        announce('Selection cleared');
        return true;
      }
      if (document.activeElement === searchRef?.current) {
        searchRef.current.value = '';
        searchRef.current.blur();
        announce('Search cleared');
        return true;
      }
      if (state.focusedTaskId) {
        dispatch({ type: ACTIONS.SET_FOCUSED_TASK, payload: null });
        announce('Focus cleared');
        return true;
      }
      return false;
    });

    // View switching
    handlers.set('switchToList', () => {
      if (currentView !== 'list' && onViewChange) {
        onViewChange('list');
        announce('Switched to List view');
        return true;
      }
      return false;
    });

    handlers.set('switchToKanban', () => {
      if (currentView !== 'kanban' && onViewChange) {
        onViewChange('kanban');
        announce('Switched to Kanban view');
        return true;
      }
      return false;
    });

    handlers.set('switchToCalendar', () => {
      if (currentView !== 'calendar' && onViewChange) {
        onViewChange('calendar');
        announce('Switched to Calendar view');
        return true;
      }
      return false;
    });

    handlers.set('switchToFocus', () => {
      if (currentView !== 'focus' && onViewChange) {
        onViewChange('focus');
        announce('Switched to Focus view');
        return true;
      }
      return false;
    });

    // Task actions (require focused task)
    handlers.set('editTask', () => {
      if (state.focusedTaskId && onEditTask) {
        onEditTask(state.focusedTaskId);
        announce('Editing task');
        return true;
      }
      return false;
    });

    handlers.set('deleteTask', () => {
      if (state.focusedTaskId && onDeleteTask) {
        onDeleteTask(state.focusedTaskId);
        announce('Delete task');
        return true;
      }
      return false;
    });

    handlers.set('completeTask', () => {
      if (state.focusedTaskId && onCompleteTask) {
        onCompleteTask(state.focusedTaskId);
        announce('Task completed');
        return true;
      }
      return false;
    });

    handlers.set('startTask', () => {
      if (state.focusedTaskId && onStartTask) {
        onStartTask(state.focusedTaskId);
        announce('Task started');
        return true;
      }
      return false;
    });

    // Selection
    handlers.set('toggleSelect', () => {
      if (state.focusedTaskId) {
        dispatch({ type: ACTIONS.TOGGLE_TASK_SELECTION, payload: state.focusedTaskId });
        const isSelected = state.selectedTaskIds.has(state.focusedTaskId);
        announce(isSelected ? 'Task deselected' : 'Task selected');
        return true;
      }
      return false;
    });

    // Navigation (handled by view-specific hooks)
    handlers.set('navigatePrev', () => false);
    handlers.set('navigateNext', () => false);
  }, [
    state.isModalOpen,
    state.isHelpOverlayOpen,
    state.focusedTaskId,
    state.selectedTaskIds,
    currentView,
    onCreateTask,
    onViewChange,
    onEditTask,
    onDeleteTask,
    onCompleteTask,
    onStartTask,
    searchRef,
    announce,
  ]);

  // Global keyboard event handler
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Find matching shortcut
      const shortcut = KEYBOARD_SHORTCUTS.find(
        (s) => s.enabled && matchShortcut(event, s)
      );

      if (!shortcut) return;

      // Check if we should ignore this shortcut
      const isInput = isInputElement(event.target);
      const hasModifiers = shortcut.modifiers && shortcut.modifiers.length > 0;

      // Single-key shortcuts are disabled in input fields
      if (isInput && !hasModifiers) {
        return;
      }

      // Check context-specific shortcuts
      if (shortcut.context === SHORTCUT_CONTEXTS.TASK_FOCUSED && !state.focusedTaskId) {
        return;
      }

      // Block most shortcuts when modal is open (except Escape)
      if (state.isModalOpen && shortcut.action !== 'closeOrClear') {
        return;
      }

      // Prevent default BEFORE executing handler for shortcuts with modifiers
      // This is critical for browser-reserved shortcuts like Ctrl+N, Ctrl+S, etc.
      if (shortcut.modifiers && shortcut.modifiers.length > 0) {
        event.preventDefault();
        event.stopPropagation();
      }

      // Get handler and execute
      const handler = handlersRef.current.get(shortcut.action);
      if (handler) {
        const handled = handler();
        if (handled) {
          // Prevent default for non-modifier shortcuts (single keys) if handled
          if (!shortcut.modifiers || shortcut.modifiers.length === 0) {
            event.preventDefault();
            event.stopPropagation();
          }
          dispatch({ type: ACTIONS.SET_LAST_SHORTCUT, payload: shortcut.action });
          recordUsage(shortcut, state.focusedView);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [state.focusedTaskId, state.isModalOpen, state.focusedView, recordUsage]);

  // Context value
  const value = {
    // State
    focusedTaskId: state.focusedTaskId,
    focusedView: state.focusedView,
    isHelpOverlayOpen: state.isHelpOverlayOpen,
    isModalOpen: state.isModalOpen,
    selectedTaskIds: state.selectedTaskIds,
    lastShortcut: state.lastShortcut,

    // Actions
    setFocusedTask: (taskId) => dispatch({ type: ACTIONS.SET_FOCUSED_TASK, payload: taskId }),
    setFocusedView: (view) => dispatch({ type: ACTIONS.SET_FOCUSED_VIEW, payload: view }),
    setHelpOpen: (open) => dispatch({ type: ACTIONS.SET_HELP_OPEN, payload: open }),
    setModalOpen: (open) => dispatch({ type: ACTIONS.SET_MODAL_OPEN, payload: open }),
    toggleTaskSelection: (taskId) => dispatch({ type: ACTIONS.TOGGLE_TASK_SELECTION, payload: taskId }),
    clearSelections: () => dispatch({ type: ACTIONS.CLEAR_SELECTIONS }),
    isTaskSelected: (taskId) => state.selectedTaskIds.has(taskId),

    // Register custom handler (for view-specific navigation)
    registerHandler: (action, handler) => {
      handlersRef.current.set(action, handler);
    },

    // Shortcut definitions for help display
    shortcuts: KEYBOARD_SHORTCUTS,

    // Announcer ref for screen reader support
    announcerRef,
    announce,
  };

  return (
    <KeyboardShortcutContext.Provider value={value}>
      {children}
      {/* Screen reader announcer */}
      <div
        ref={announcerRef}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
    </KeyboardShortcutContext.Provider>
  );
}

/**
 * Hook to access keyboard shortcut context
 */
export function useKeyboardShortcutContext() {
  const context = useContext(KeyboardShortcutContext);
  if (!context) {
    throw new Error('useKeyboardShortcutContext must be used within KeyboardShortcutProvider');
  }
  return context;
}

export default KeyboardShortcutContext;
