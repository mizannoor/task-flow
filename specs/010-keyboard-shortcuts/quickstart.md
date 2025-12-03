# Quickstart: Keyboard Shortcuts

**Feature**: 010-keyboard-shortcuts  
**Date**: December 3, 2025

## Overview

This guide covers implementing the keyboard shortcuts feature for TaskFlow. The feature enables power users to navigate and manage tasks efficiently using keyboard shortcuts.

## Prerequisites

- Node.js 18+ installed
- Existing TaskFlow codebase with:
  - React 18+ with functional components
  - Dexie.js for IndexedDB
  - Tailwind CSS for styling
  - Existing views: List, Kanban, Calendar, Focus

## Quick Implementation Steps

### Step 1: Add Constants

Add shortcut definitions to `src/utils/constants.js`:

```javascript
// Shortcut contexts
export const SHORTCUT_CONTEXTS = {
  GLOBAL: 'global',
  TASK_FOCUSED: 'task-focused',
  MODAL_OPEN: 'modal-open',
};

// Shortcut categories for help display
export const SHORTCUT_CATEGORIES = {
  GLOBAL: 'global',
  NAVIGATION: 'navigation',
  TASK_ACTIONS: 'task-actions',
  SELECTION: 'selection',
};

// Shortcut definitions
export const KEYBOARD_SHORTCUTS = [
  {
    key: 'n',
    modifiers: ['ctrl'],
    action: 'createTask',
    context: 'global',
    category: 'global',
    description: 'Create new task',
  },
  {
    key: 'f',
    modifiers: ['ctrl'],
    action: 'focusSearch',
    context: 'global',
    category: 'global',
    description: 'Focus search bar',
  },
  {
    key: '/',
    modifiers: ['ctrl'],
    action: 'showHelp',
    context: 'global',
    category: 'global',
    description: 'Show keyboard shortcuts',
  },
  {
    key: 'Escape',
    modifiers: [],
    action: 'closeOrClear',
    context: 'global',
    category: 'global',
    description: 'Close modal or clear',
  },
  {
    key: '1',
    modifiers: [],
    action: 'switchToList',
    context: 'global',
    category: 'navigation',
    description: 'List view',
  },
  {
    key: '2',
    modifiers: [],
    action: 'switchToKanban',
    context: 'global',
    category: 'navigation',
    description: 'Kanban view',
  },
  {
    key: '3',
    modifiers: [],
    action: 'switchToCalendar',
    context: 'global',
    category: 'navigation',
    description: 'Calendar view',
  },
  {
    key: '4',
    modifiers: [],
    action: 'switchToFocus',
    context: 'global',
    category: 'navigation',
    description: 'Focus view',
  },
  {
    key: 'e',
    modifiers: [],
    action: 'editTask',
    context: 'task-focused',
    category: 'task-actions',
    description: 'Edit task',
  },
  {
    key: 'd',
    modifiers: [],
    action: 'deleteTask',
    context: 'task-focused',
    category: 'task-actions',
    description: 'Delete task',
  },
  {
    key: 'c',
    modifiers: [],
    action: 'completeTask',
    context: 'task-focused',
    category: 'task-actions',
    description: 'Complete task',
  },
  {
    key: 's',
    modifiers: [],
    action: 'startTask',
    context: 'task-focused',
    category: 'task-actions',
    description: 'Start task',
  },
  {
    key: ' ',
    modifiers: [],
    action: 'toggleSelect',
    context: 'task-focused',
    category: 'selection',
    description: 'Toggle selection',
  },
];
```

### Step 2: Create Platform Utils

Create `src/utils/platformUtils.js`:

```javascript
export function isMac() {
  return (
    navigator.platform?.toLowerCase().includes('mac') ||
    navigator.userAgentData?.platform?.toLowerCase().includes('macos')
  );
}

export function getModifierKey() {
  return isMac() ? '⌘' : 'Ctrl';
}

export function getModifierKeyName() {
  return isMac() ? 'meta' : 'ctrl';
}

export function formatShortcut(shortcut) {
  const parts = [];
  if (shortcut.modifiers?.includes('ctrl')) {
    parts.push(getModifierKey());
  }
  if (shortcut.modifiers?.includes('shift')) {
    parts.push('Shift');
  }
  if (shortcut.modifiers?.includes('alt')) {
    parts.push(isMac() ? '⌥' : 'Alt');
  }

  // Format key display
  let keyDisplay = shortcut.key;
  if (keyDisplay === ' ') keyDisplay = 'Space';
  if (keyDisplay === 'ArrowUp') keyDisplay = '↑';
  if (keyDisplay === 'ArrowDown') keyDisplay = '↓';
  if (keyDisplay === 'Escape') keyDisplay = 'Esc';

  parts.push(keyDisplay.toUpperCase());
  return parts.join('+');
}
```

### Step 3: Create Keyboard Context

Create `src/contexts/KeyboardShortcutContext.jsx`:

```javascript
import { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import { KEYBOARD_SHORTCUTS } from '../utils/constants';
import { isMac } from '../utils/platformUtils';

const KeyboardShortcutContext = createContext(null);

const initialState = {
  focusedTaskId: null,
  isHelpOverlayOpen: false,
  handlers: new Map(),
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_FOCUSED_TASK':
      return { ...state, focusedTaskId: action.payload };
    case 'TOGGLE_HELP':
      return { ...state, isHelpOverlayOpen: !state.isHelpOverlayOpen };
    case 'OPEN_HELP':
      return { ...state, isHelpOverlayOpen: true };
    case 'CLOSE_HELP':
      return { ...state, isHelpOverlayOpen: false };
    default:
      return state;
  }
}

export function KeyboardShortcutProvider({ children, onViewChange, onCreateTask, onFocusSearch }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const handlersRef = useRef(new Map());

  // Register action handlers passed from parent
  useEffect(() => {
    if (onViewChange) handlersRef.current.set('switchToList', () => onViewChange('list'));
    if (onViewChange) handlersRef.current.set('switchToKanban', () => onViewChange('kanban'));
    if (onViewChange) handlersRef.current.set('switchToCalendar', () => onViewChange('calendar'));
    if (onViewChange) handlersRef.current.set('switchToFocus', () => onViewChange('focus'));
    if (onCreateTask) handlersRef.current.set('createTask', onCreateTask);
    if (onFocusSearch) handlersRef.current.set('focusSearch', onFocusSearch);
    handlersRef.current.set('showHelp', () => dispatch({ type: 'TOGGLE_HELP' }));
  }, [onViewChange, onCreateTask, onFocusSearch]);

  // Global keyboard event handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if in input field for non-modifier shortcuts
      const isInInput =
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) || e.target.isContentEditable;

      // Find matching shortcut
      const shortcut = KEYBOARD_SHORTCUTS.find((s) => {
        if (s.key.toLowerCase() !== e.key.toLowerCase()) return false;
        const needsCtrl = s.modifiers?.includes('ctrl');
        const hasCtrl = isMac() ? e.metaKey : e.ctrlKey;
        if (needsCtrl !== hasCtrl) return false;
        return true;
      });

      if (!shortcut) return;

      // Skip non-modifier shortcuts when in input
      if (isInInput && !shortcut.modifiers?.length) return;

      // Execute handler
      const handler = handlersRef.current.get(shortcut.action);
      if (handler) {
        e.preventDefault();
        handler(state.focusedTaskId);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [state.focusedTaskId]);

  const value = {
    focusedTaskId: state.focusedTaskId,
    isHelpOpen: state.isHelpOverlayOpen,
    setFocusedTask: (id) => dispatch({ type: 'SET_FOCUSED_TASK', payload: id }),
    openHelp: () => dispatch({ type: 'OPEN_HELP' }),
    closeHelp: () => dispatch({ type: 'CLOSE_HELP' }),
    registerHandler: (action, handler) => handlersRef.current.set(action, handler),
    shortcuts: KEYBOARD_SHORTCUTS,
  };

  return (
    <KeyboardShortcutContext.Provider value={value}>{children}</KeyboardShortcutContext.Provider>
  );
}

export function useKeyboardShortcuts() {
  const context = useContext(KeyboardShortcutContext);
  if (!context) {
    throw new Error('useKeyboardShortcuts must be used within KeyboardShortcutProvider');
  }
  return context;
}
```

### Step 4: Create Help Overlay Component

Create `src/components/ui/KeyboardShortcutsHelp.jsx`:

```javascript
import { Modal } from './Modal';
import { KEYBOARD_SHORTCUTS, SHORTCUT_CATEGORIES } from '../../utils/constants';
import { formatShortcut } from '../../utils/platformUtils';

export function KeyboardShortcutsHelp({ isOpen, onClose }) {
  const categories = [
    { key: 'global', label: 'Global' },
    { key: 'navigation', label: 'Navigation' },
    { key: 'task-actions', label: 'Task Actions' },
    { key: 'selection', label: 'Selection' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts">
      <div className="space-y-6">
        {categories.map(({ key, label }) => {
          const shortcuts = KEYBOARD_SHORTCUTS.filter((s) => s.category === key);
          if (!shortcuts.length) return null;

          return (
            <div key={key}>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                {label}
              </h3>
              <div className="space-y-1">
                {shortcuts.map((shortcut) => (
                  <div key={shortcut.action} className="flex justify-between py-1">
                    <span className="text-gray-700">{shortcut.description}</span>
                    <kbd className="px-2 py-0.5 bg-gray-100 border rounded text-sm font-mono">
                      {formatShortcut(shortcut)}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
```

### Step 5: Integrate with Dashboard

Update `src/components/Dashboard.jsx`:

```javascript
import {
  KeyboardShortcutProvider,
  useKeyboardShortcuts,
} from '../contexts/KeyboardShortcutContext';
import { KeyboardShortcutsHelp } from './ui/KeyboardShortcutsHelp';

// Inside DashboardContent component:
function DashboardContent() {
  // ... existing code ...

  const { isHelpOpen, closeHelp } = useKeyboardShortcuts();

  return (
    <>
      {/* ... existing JSX ... */}
      <KeyboardShortcutsHelp isOpen={isHelpOpen} onClose={closeHelp} />
    </>
  );
}

// Wrap with provider in Dashboard component:
export function Dashboard() {
  const [currentView, setCurrentView] = useState('list');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const searchRef = useRef(null);

  return (
    <KeyboardShortcutProvider
      onViewChange={setCurrentView}
      onCreateTask={() => setIsTaskModalOpen(true)}
      onFocusSearch={() => searchRef.current?.focus()}
    >
      <DashboardContent />
    </KeyboardShortcutProvider>
  );
}
```

## Testing

### Manual Testing Checklist

1. **Global Shortcuts**
   - [ ] `Ctrl+N` / `⌘N` opens task creation modal
   - [ ] `Ctrl+F` / `⌘F` focuses search bar
   - [ ] `Ctrl+/` / `⌘/` opens help overlay
   - [ ] `Escape` closes modals and clears selection

2. **View Switching**
   - [ ] `1` switches to List view
   - [ ] `2` switches to Kanban view
   - [ ] `3` switches to Calendar view
   - [ ] `4` switches to Focus view
   - [ ] Number keys don't work when typing in input

3. **Task Actions (when task focused)**
   - [ ] `E` opens edit dialog
   - [ ] `D` opens delete confirmation
   - [ ] `S` starts pending task
   - [ ] `C` completes in-progress task

4. **Accessibility**
   - [ ] Help overlay is keyboard navigable
   - [ ] Screen reader announces shortcut actions
   - [ ] Focus indicators are visible

## Common Issues

### Shortcuts not working

1. Check if focus is in an input field (single-key shortcuts disabled)
2. Verify browser isn't intercepting the shortcut
3. Check console for JavaScript errors

### Wrong modifier key on macOS

Ensure `platformUtils.js` is correctly detecting the platform and the event handler checks `e.metaKey` for macOS.

## Next Steps

After basic implementation:

1. Add shortcut usage analytics (IndexedDB)
2. Extend List view with task navigation
3. Add shortcut hints to tooltips and menus
4. Implement screen reader announcements
