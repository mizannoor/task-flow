# Quickstart: Bulk Actions Implementation

**Feature**: 014-bulk-actions  
**Date**: December 5, 2025  
**Estimated Time**: 2-3 days

---

## Overview

This guide provides step-by-step instructions for implementing bulk actions in TaskFlow's List view. Follow this sequence to ensure a working feature at each checkpoint.

---

## Prerequisites

Before starting, ensure you have:

- [ ] Branch `014-bulk-actions` checked out
- [ ] Dependencies installed (`npm install`)
- [ ] Development server running (`npm run dev`)
- [ ] Familiarity with existing files:
  - `src/contexts/KeyboardShortcutContext.jsx` (selection state)
  - `src/components/tasks/TaskList.jsx` (target integration)
  - `src/services/taskService.js` (existing task operations)

---

## Implementation Phases

### Phase 1: Core Selection Infrastructure

**Goal**: Enable checkbox-based multi-selection in List view

#### Step 1.1: Add Selection Constants

Add to `src/utils/constants.js`:

```javascript
// Bulk Actions Constants
export const BULK_ACTIONS = {
  MAX_SELECTION: 500,
  WARNING_THRESHOLD: 100,
};

// Keyboard shortcuts for bulk actions (add to KEYBOARD_SHORTCUTS array)
// { key: 'ctrl+a', action: 'selectAllTasks', context: 'list', ... }
// { key: 'ctrl+shift+d', action: 'bulkDelete', context: 'list', ... }
```

#### Step 1.2: Extend KeyboardShortcutContext

Add new state and actions to `src/contexts/KeyboardShortcutContext.jsx`:

```javascript
// Add to initial state
lastClickedTaskId: null,

// Add to reducer actions
SET_LAST_CLICKED: 'SET_LAST_CLICKED',
SELECT_ALL: 'SELECT_ALL',
ADD_TO_SELECTION: 'ADD_TO_SELECTION',

// Implement actions in provider
const selectAll = useCallback((taskIds) => {
  const limited = taskIds.slice(0, BULK_ACTIONS.MAX_SELECTION);
  dispatch({ type: ACTIONS.SET_SELECTED_TASKS, payload: limited });
}, []);

const addToSelection = useCallback((taskIds) => {
  dispatch({ type: ACTIONS.ADD_TO_SELECTION, payload: taskIds });
}, []);

const selectRange = useCallback((fromId, toId, visibleTasks) => {
  const fromIdx = visibleTasks.findIndex(t => t.id === fromId);
  const toIdx = visibleTasks.findIndex(t => t.id === toId);
  if (fromIdx === -1 || toIdx === -1) return;

  const [start, end] = fromIdx < toIdx ? [fromIdx, toIdx] : [toIdx, fromIdx];
  const rangeIds = visibleTasks.slice(start, end + 1).map(t => t.id);
  dispatch({ type: ACTIONS.ADD_TO_SELECTION, payload: rangeIds });
}, []);
```

#### Step 1.3: Add Checkbox Column to TaskList

Update `src/components/tasks/TaskList.jsx`:

```javascript
// Import selection hooks
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

// In component
const {
  selectedTaskIds,
  toggleTaskSelection,
  selectAll,
  selectRange,
  setLastClicked,
  clearSelections
} = useKeyboardShortcuts();

// Add header checkbox
<th className="w-10 px-2">
  <input
    type="checkbox"
    checked={selectedTaskIds.size === paginatedTasks.length && paginatedTasks.length > 0}
    onChange={(e) => e.target.checked ? selectAll(paginatedTasks.map(t => t.id)) : clearSelections()}
    aria-label={t('bulk.selectAll')}
  />
</th>

// Add row checkbox (in TaskRow or inline)
<td className="w-10 px-2">
  <input
    type="checkbox"
    checked={selectedTaskIds.has(task.id)}
    onChange={() => toggleTaskSelection(task.id)}
    onClick={(e) => handleCheckboxClick(e, task.id)}
  />
</td>
```

**✅ Checkpoint 1**: Can select/deselect tasks with checkboxes, Select All works

---

### Phase 2: Bulk Action Bar UI

**Goal**: Display contextual action bar when tasks are selected

#### Step 2.1: Create BulkActionBar Component

Create `src/components/tasks/BulkActionBar.jsx`:

```javascript
export function BulkActionBar({
  selectionCount,
  onDelete,
  onStatusChange,
  onReassign,
  onManageTags,
  onClearSelection,
  isProcessing,
}) {
  const { t } = useTranslation();

  if (selectionCount === 0) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 
                    border-t border-gray-200 dark:border-gray-700 shadow-lg
                    px-4 py-3 flex items-center justify-between z-50
                    transform transition-transform duration-200"
    >
      {/* Selection count */}
      <span className="text-sm font-medium">{t('bulk.selected', { count: selectionCount })}</span>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <button onClick={onDelete} disabled={isProcessing}>
          {t('bulk.delete.button')}
        </button>
        {/* Status dropdown, Reassign dropdown, Tags button */}
        <button onClick={onClearSelection}>{t('bulk.clearSelection')}</button>
      </div>
    </div>
  );
}
```

#### Step 2.2: Integrate into Dashboard

Add to `src/components/Dashboard.jsx`:

```javascript
import { BulkActionBar } from './tasks/BulkActionBar';

// In render
{
  currentView === 'list' && (
    <BulkActionBar
      selectionCount={selectedTaskIds.size}
      onDelete={handleBulkDelete}
      onStatusChange={handleBulkStatusChange}
      onReassign={handleBulkReassign}
      onManageTags={handleBulkManageTags}
      onClearSelection={clearSelections}
      isProcessing={bulkOperationState.isProcessing}
    />
  );
}
```

**✅ Checkpoint 2**: Action bar appears/disappears based on selection, shows count

---

### Phase 3: Bulk Service Operations

**Goal**: Implement database operations for bulk actions

#### Step 3.1: Create Bulk Service

Create `src/services/bulkService.js`:

```javascript
import { db } from './db';

export async function bulkDeleteTasks(taskIds) {
  return db.transaction('rw', db.tasks, db.dependencies, async () => {
    // Delete dependencies first
    await db.dependencies.where('taskId').anyOf(taskIds).delete();
    await db.dependencies.where('blockedById').anyOf(taskIds).delete();
    // Delete tasks
    await db.tasks.bulkDelete(taskIds);
    return { success: true, affectedCount: taskIds.length };
  });
}

export async function bulkUpdateStatus(taskIds, newStatus, options = {}) {
  const now = new Date();
  const updates = {
    status: newStatus,
    updatedAt: now,
    completedAt: newStatus === 'completed' ? now : null,
  };

  return db.transaction('rw', db.tasks, async () => {
    for (const id of taskIds) {
      await db.tasks.update(id, updates);
    }
    return { success: true, affectedCount: taskIds.length };
  });
}

export async function bulkReassignTasks(taskIds, newUserId) {
  const now = new Date();
  return db.transaction('rw', db.tasks, async () => {
    for (const id of taskIds) {
      await db.tasks.update(id, { userId: newUserId, updatedAt: now });
    }
    return { success: true, affectedCount: taskIds.length };
  });
}

export async function bulkAddTags(taskIds, newTags) {
  const now = new Date();
  return db.transaction('rw', db.tasks, async () => {
    for (const id of taskIds) {
      const task = await db.tasks.get(id);
      if (task) {
        const mergedTags = [...new Set([...task.tags, ...newTags])];
        await db.tasks.update(id, { tags: mergedTags, updatedAt: now });
      }
    }
    return { success: true, affectedCount: taskIds.length };
  });
}

export async function bulkRemoveTags(taskIds, tagsToRemove) {
  const now = new Date();
  return db.transaction('rw', db.tasks, async () => {
    for (const id of taskIds) {
      const task = await db.tasks.get(id);
      if (task) {
        const filteredTags = task.tags.filter((t) => !tagsToRemove.includes(t));
        await db.tasks.update(id, { tags: filteredTags, updatedAt: now });
      }
    }
    return { success: true, affectedCount: taskIds.length };
  });
}
```

**✅ Checkpoint 3**: Service functions work (test via console or unit tests)

---

### Phase 4: Wire Up Actions

**Goal**: Connect UI to service layer with confirmation dialogs

#### Step 4.1: Create Confirmation Modal

Create `src/components/tasks/BulkDeleteConfirmModal.jsx`:

```javascript
export function BulkDeleteConfirmModal({ isOpen, taskCount, onConfirm, onCancel, isDeleting }) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <Modal onClose={onCancel}>
      <h2>{t('bulk.delete.confirm', { count: taskCount })}</h2>
      <p className="text-red-600">{t('bulk.delete.warning')}</p>
      <div className="flex gap-2 mt-4">
        <button onClick={onCancel} disabled={isDeleting}>
          {t('common.cancel')}
        </button>
        <button onClick={onConfirm} disabled={isDeleting} className="bg-red-600">
          {isDeleting ? t('common.deleting') : t('bulk.delete.button')}
        </button>
      </div>
    </Modal>
  );
}
```

#### Step 4.2: Implement Handlers in Dashboard

```javascript
const handleBulkDelete = async () => {
  setShowDeleteConfirm(true);
};

const confirmBulkDelete = async () => {
  setBulkState({ isProcessing: true, operationType: 'delete' });
  try {
    const result = await bulkDeleteTasks([...selectedTaskIds]);
    await refreshTasks();
    clearSelections();
    showToast(t('bulk.delete.success', { count: result.affectedCount }), 'success');
  } catch (error) {
    showToast(t('errors.bulkDeleteFailed'), 'error');
  } finally {
    setBulkState({ isProcessing: false });
    setShowDeleteConfirm(false);
  }
};
```

**✅ Checkpoint 4**: Can bulk delete tasks with confirmation

---

### Phase 5: Status Change with Blocked Warning

**Goal**: Handle blocked task warnings during bulk status change

#### Step 5.1: Create Blocked Warning Modal

Create `src/components/tasks/BulkBlockedWarningModal.jsx` following the pattern of existing `BlockedTaskWarningModal`.

#### Step 5.2: Implement Status Change Handler

```javascript
const handleBulkStatusChange = async (newStatus) => {
  if (newStatus === 'in-progress') {
    // Check for blocked tasks
    const blockedTasks = await getBlockedTasks([...selectedTaskIds]);
    if (blockedTasks.length > 0) {
      setBlockedWarningState({ show: true, blockedTasks, newStatus });
      return;
    }
  }
  await executeBulkStatusChange(newStatus);
};
```

**✅ Checkpoint 5**: Status change works with blocked task handling

---

### Phase 6: Reassign and Tags

**Goal**: Complete remaining bulk operations

#### Step 6.1: User Dropdown for Reassign

Add user selection dropdown to BulkActionBar using existing user list from AuthContext.

#### Step 6.2: Tag Management Modal

Create `src/components/tasks/BulkTagModal.jsx` with:

- Tab/toggle for Add vs Remove mode
- Text input for new tags (Add mode)
- Multi-select from existing tags (Remove mode)

**✅ Checkpoint 6**: All bulk operations functional

---

### Phase 7: Keyboard Shortcuts and Polish

**Goal**: Add keyboard support and i18n

#### Step 7.1: Register Bulk Shortcuts

Add handlers in KeyboardShortcutContext:

```javascript
handlers.set('selectAllTasks', () => {
  if (currentView === 'list' && visibleTasksRef.current) {
    selectAll(visibleTasksRef.current.map((t) => t.id));
    return true;
  }
  return false;
});

handlers.set('bulkDelete', () => {
  if (selectedTaskIds.size > 0) {
    onBulkDelete?.();
    return true;
  }
  return false;
});
```

#### Step 7.2: Add i18n Translations

Add to `src/i18n/locales/en.ts` and `ms.ts`:

```javascript
bulk: {
  selected: '{{count}} tasks selected',
  selectAll: 'Select All',
  clearSelection: 'Clear Selection',
  delete: {
    button: 'Delete',
    confirm: 'Delete {{count}} tasks?',
    warning: 'This action cannot be undone.',
    success: '{{count}} tasks deleted',
  },
  // ... rest of translations
}
```

**✅ Checkpoint 7**: Keyboard shortcuts work, all text is translated

---

## Key Files Reference

| File                                               | Purpose                       | Status |
| -------------------------------------------------- | ----------------------------- | ------ |
| `src/utils/constants.js`                           | Bulk action constants         | Modify |
| `src/contexts/KeyboardShortcutContext.jsx`         | Selection state, shortcuts    | Modify |
| `src/services/bulkService.js`                      | Bulk DB operations            | NEW    |
| `src/components/tasks/BulkActionBar.jsx`           | Action bar UI                 | NEW    |
| `src/components/tasks/BulkDeleteConfirmModal.jsx`  | Delete confirmation           | NEW    |
| `src/components/tasks/BulkBlockedWarningModal.jsx` | Blocked task warning          | NEW    |
| `src/components/tasks/BulkTagModal.jsx`            | Tag management modal          | NEW    |
| `src/components/tasks/TaskList.jsx`                | Checkbox column               | Modify |
| `src/components/tasks/TaskRow.jsx`                 | Row checkbox, selection style | Modify |
| `src/components/Dashboard.jsx`                     | Action bar integration        | Modify |
| `src/i18n/locales/en.ts`                           | English translations          | Modify |
| `src/i18n/locales/ms.ts`                           | Malay translations            | Modify |

---

## Testing Checklist

- [ ] Select single task via checkbox
- [ ] Select multiple tasks via checkboxes
- [ ] Select All selects all visible tasks
- [ ] Shift+click selects range
- [ ] Selection limit enforced (500 max)
- [ ] Action bar appears when tasks selected
- [ ] Action bar disappears when selection cleared
- [ ] Bulk delete with confirmation
- [ ] Bulk status change works
- [ ] Blocked task warning appears for in-progress
- [ ] Bulk reassign updates all selected tasks
- [ ] Bulk add tags merges without replacing
- [ ] Bulk remove tags only removes specified
- [ ] Escape clears selection
- [ ] Ctrl+A selects all in List view
- [ ] All text displays in selected language
- [ ] Dark mode styling correct
- [ ] Mobile responsive layout works
