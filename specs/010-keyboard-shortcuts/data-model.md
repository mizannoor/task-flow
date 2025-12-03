# Data Model: Keyboard Shortcuts

**Feature**: 010-keyboard-shortcuts  
**Date**: December 3, 2025  
**Status**: Complete

## Entities

### 1. ShortcutDefinition

Represents a registered keyboard shortcut configuration.

| Field       | Type             | Required | Description                                            |
| ----------- | ---------------- | -------- | ------------------------------------------------------ |
| key         | string           | Yes      | Primary key (e.g., 'n', 'f', '/', '1', 'ArrowUp')      |
| modifiers   | string[]         | No       | Required modifiers: 'ctrl', 'shift', 'alt', 'meta'     |
| action      | string           | Yes      | Action identifier (e.g., 'createTask', 'switchToList') |
| context     | ShortcutContext  | Yes      | Where shortcut is active                               |
| category    | ShortcutCategory | Yes      | Grouping for help display                              |
| description | string           | Yes      | Human-readable description                             |
| enabled     | boolean          | Yes      | Whether shortcut is currently active                   |

**Validation Rules**:

- `key` must be a valid KeyboardEvent.key value
- `modifiers` can only contain valid modifier names
- `action` must map to a registered action handler
- `description` must be non-empty, max 100 characters

**Notes**: This entity is not persisted - it's defined in constants and loaded at runtime.

---

### 2. ShortcutContext (Enum)

Defines the scope where a shortcut is valid.

| Value         | Description                                           |
| ------------- | ----------------------------------------------------- |
| GLOBAL        | Active everywhere except in modals (unless Escape)    |
| VIEW_LIST     | Active only in List view                              |
| VIEW_KANBAN   | Active only in Kanban view                            |
| VIEW_CALENDAR | Active only in Calendar view                          |
| VIEW_FOCUS    | Active only in Focus view                             |
| TASK_FOCUSED  | Active when a task/card has focus                     |
| MODAL_OPEN    | Active when any modal is open (typically only Escape) |

---

### 3. ShortcutCategory (Enum)

Grouping for display in help overlay.

| Value        | Display Name | Description                        |
| ------------ | ------------ | ---------------------------------- |
| GLOBAL       | Global       | Shortcuts available everywhere     |
| NAVIGATION   | Navigation   | View switching and task navigation |
| TASK_ACTIONS | Task Actions | Actions on focused tasks           |
| SELECTION    | Selection    | Multi-select operations            |

---

### 4. ShortcutUsage (Persisted)

Records aggregated keyboard shortcut usage for personal analytics.

| Field       | Type   | Required | Description                                     |
| ----------- | ------ | -------- | ----------------------------------------------- |
| id          | number | Yes      | Auto-increment primary key                      |
| userId      | string | Yes      | User who used the shortcut                      |
| shortcutKey | string | Yes      | Normalized shortcut identifier (e.g., 'ctrl+n') |
| date        | string | Yes      | Date of usage (YYYY-MM-DD)                      |
| count       | number | Yes      | Number of times used on this date               |
| lastUsedAt  | Date   | Yes      | Timestamp of last usage                         |
| context     | string | Yes      | Primary view context where used                 |

**Validation Rules**:

- `userId` must be valid user ID from users table
- `shortcutKey` must be lowercase, modifiers in alphabetical order
- `date` must be valid ISO date string
- `count` must be positive integer
- `context` must be valid view name or 'global'

**Indexes**:

- Compound: `[userId, shortcutKey, date]` (unique lookup)
- `userId` (filter by user)
- `date` (cleanup old records)

**Retention**: Records older than 90 days may be purged.

---

### 5. KeyboardState (Runtime Only)

Represents the current keyboard navigation state.

| Field             | Type           | Description                            |
| ----------------- | -------------- | -------------------------------------- |
| focusedTaskId     | string \| null | Currently focused task ID              |
| focusedView       | string \| null | Current view with focus                |
| isHelpOverlayOpen | boolean        | Whether help modal is showing          |
| activeModifiers   | Set\<string\>  | Currently held modifier keys           |
| lastShortcut      | string \| null | Last executed shortcut (for debugging) |

**Notes**: This state is managed in React context, not persisted.

---

## Relationships

```
┌─────────────────────┐
│ ShortcutDefinition  │
│ (Static Config)     │
└──────────┬──────────┘
           │ defines
           ▼
┌─────────────────────┐      records      ┌─────────────────────┐
│  KeyboardState      │─────────────────► │   ShortcutUsage     │
│  (Runtime)          │                   │   (IndexedDB)       │
└──────────┬──────────┘                   └──────────┬──────────┘
           │                                         │
           │ context                                 │ belongs to
           ▼                                         ▼
┌─────────────────────┐                   ┌─────────────────────┐
│     User/Task       │                   │       User          │
│  (Existing Models)  │                   │   (Existing)        │
└─────────────────────┘                   └─────────────────────┘
```

---

## State Transitions

### ShortcutUsage Lifecycle

```
[New Shortcut Press]
        │
        ▼
┌───────────────────┐
│ Check if record   │
│ exists for today  │
└────────┬──────────┘
         │
    ┌────┴────┐
    │         │
    ▼ No      ▼ Yes
┌────────┐ ┌──────────────┐
│ Create │ │ Increment    │
│ new    │ │ count,       │
│ record │ │ update       │
└────────┘ │ lastUsedAt   │
           └──────────────┘
```

### KeyboardState Focus Flow

```
[Initial State: No Focus]
        │
        ├─► [Tab/Click on Task] ──► [Task Focused]
        │                                │
        │                                ├─► [Arrow Key] ──► [Next/Prev Task Focused]
        │                                │
        │                                ├─► [E/D/C/S Key] ──► [Action Executed]
        │                                │
        │                                └─► [Escape] ──► [No Focus]
        │
        └─► [Ctrl+N] ──► [Modal Open] ──► [Escape] ──► [Previous State]
```

---

## IndexedDB Schema Update

```javascript
// db.js - Version 4 addition
db.version(4).stores({
  users: '&id, &identifier, identifierType, createdAt',
  tasks: '&id, userId, createdBy, status, priority, category, createdAt, deadline, timerStartedAt',
  shortcutUsage: '++id, [userId+shortcutKey+date], userId, date',
});
```

---

## Constants Definition

```javascript
// constants.js additions

export const SHORTCUT_CONTEXTS = {
  GLOBAL: 'global',
  VIEW_LIST: 'view-list',
  VIEW_KANBAN: 'view-kanban',
  VIEW_CALENDAR: 'view-calendar',
  VIEW_FOCUS: 'view-focus',
  TASK_FOCUSED: 'task-focused',
  MODAL_OPEN: 'modal-open',
};

export const SHORTCUT_CATEGORIES = {
  GLOBAL: 'global',
  NAVIGATION: 'navigation',
  TASK_ACTIONS: 'task-actions',
  SELECTION: 'selection',
};

export const KEYBOARD_SHORTCUTS = [
  // Global shortcuts
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
    description: 'Close modal or clear selection',
  },

  // Navigation shortcuts
  {
    key: '1',
    modifiers: [],
    action: 'switchToList',
    context: 'global',
    category: 'navigation',
    description: 'Switch to List view',
  },
  {
    key: '2',
    modifiers: [],
    action: 'switchToKanban',
    context: 'global',
    category: 'navigation',
    description: 'Switch to Kanban view',
  },
  {
    key: '3',
    modifiers: [],
    action: 'switchToCalendar',
    context: 'global',
    category: 'navigation',
    description: 'Switch to Calendar view',
  },
  {
    key: '4',
    modifiers: [],
    action: 'switchToFocus',
    context: 'global',
    category: 'navigation',
    description: 'Switch to Focus view',
  },
  {
    key: 'ArrowUp',
    modifiers: [],
    action: 'navigatePrev',
    context: 'task-focused',
    category: 'navigation',
    description: 'Previous task',
  },
  {
    key: 'ArrowDown',
    modifiers: [],
    action: 'navigateNext',
    context: 'task-focused',
    category: 'navigation',
    description: 'Next task',
  },

  // Task action shortcuts
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

  // Selection shortcuts
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
