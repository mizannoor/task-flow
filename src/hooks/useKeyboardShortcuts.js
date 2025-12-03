/**
 * useKeyboardShortcuts Hook
 * Convenience hook for accessing keyboard shortcut functionality
 * Re-exports from KeyboardShortcutContext with additional utilities
 */

import { useKeyboardShortcutContext } from '../contexts/KeyboardShortcutContext';
import { formatShortcut, getModifierKey } from '../utils/platformUtils';
import { KEYBOARD_SHORTCUTS, SHORTCUT_CATEGORIES, SHORTCUT_CATEGORY_LABELS } from '../utils/constants';

/**
 * Main hook for keyboard shortcuts
 * Provides access to shortcut state, actions, and formatting utilities
 */
export function useKeyboardShortcuts() {
  const context = useKeyboardShortcutContext();

  return {
    // State from context
    focusedTaskId: context.focusedTaskId,
    focusedView: context.focusedView,
    isHelpOpen: context.isHelpOverlayOpen,
    isModalOpen: context.isModalOpen,
    selectedTaskIds: context.selectedTaskIds,

    // Actions from context
    setFocusedTask: context.setFocusedTask,
    setFocusedView: context.setFocusedView,
    openHelp: () => context.setHelpOpen(true),
    closeHelp: () => context.setHelpOpen(false),
    toggleHelp: () => context.setHelpOpen(!context.isHelpOverlayOpen),
    setModalOpen: context.setModalOpen,
    toggleTaskSelection: context.toggleTaskSelection,
    clearSelections: context.clearSelections,
    isTaskSelected: context.isTaskSelected,
    registerHandler: context.registerHandler,
    announce: context.announce,

    // Shortcut definitions
    shortcuts: KEYBOARD_SHORTCUTS,

    // Utilities
    getModifierDisplay: getModifierKey,
    formatShortcut,
  };
}

/**
 * Get shortcuts grouped by category for help display
 * @returns {Array} Array of { category, label, shortcuts }
 */
export function useShortcutsByCategory() {
  const categoryOrder = [
    SHORTCUT_CATEGORIES.GLOBAL,
    SHORTCUT_CATEGORIES.NAVIGATION,
    SHORTCUT_CATEGORIES.TASK_ACTIONS,
    SHORTCUT_CATEGORIES.SELECTION,
  ];

  return categoryOrder.map((category) => ({
    category,
    label: SHORTCUT_CATEGORY_LABELS[category],
    shortcuts: KEYBOARD_SHORTCUTS.filter(
      (s) => s.category === category && s.enabled
    ),
  }));
}

/**
 * Hook to check if a specific shortcut is available in current context
 * @param {string} action - The shortcut action to check
 * @returns {boolean} True if shortcut is available
 */
export function useShortcutAvailable(action) {
  const { focusedTaskId, isModalOpen, isHelpOpen } = useKeyboardShortcuts();

  const shortcut = KEYBOARD_SHORTCUTS.find((s) => s.action === action);
  if (!shortcut || !shortcut.enabled) return false;

  // Check modal state
  if (isModalOpen && action !== 'closeOrClear') return false;
  if (isHelpOpen && action !== 'closeOrClear' && action !== 'showHelp') return false;

  // Check task-focused requirement
  if (shortcut.context === 'task-focused' && !focusedTaskId) return false;

  return true;
}

export default useKeyboardShortcuts;
