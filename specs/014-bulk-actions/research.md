# Research: Bulk Actions

**Feature**: 014-bulk-actions  
**Date**: December 5, 2025  
**Phase**: 0 - Research

## Purpose

Resolve technical decisions and clarifications needed for implementing bulk actions in TaskFlow's List view.

---

## Research Topics

### 1. Bulk Operations in IndexedDB/Dexie.js

**Question**: How to efficiently perform atomic bulk operations on multiple tasks?

**Finding**: Dexie.js provides `db.transaction()` for atomic operations and `bulkDelete()`, `bulkPut()`, `bulkUpdate()` for efficient batch processing.

**Decision**: Use Dexie.js transaction wrapper for all bulk operations to ensure atomicity.

**Rationale**: Transactions ensure all-or-nothing semantics (FR edge case), and bulk methods are optimized for performance (SC-002: <2s for 20 tasks).

**Implementation Pattern**:

```javascript
// Bulk delete example
await db.transaction('rw', db.tasks, db.dependencies, async () => {
  await db.tasks.bulkDelete(taskIds);
  await db.dependencies.where('taskId').anyOf(taskIds).delete();
  await db.dependencies.where('blockedById').anyOf(taskIds).delete();
});
```

---

### 2. Selection State Management

**Question**: Where should selection state live - component state, context, or a new hook?

**Finding**: Existing `KeyboardShortcutContext` already manages `selectedTaskIds` as a Set for the Space key toggle functionality (feature 010).

**Decision**: Extend `KeyboardShortcutContext` to add bulk selection methods (selectAll, selectRange, setSelectedTasks) rather than creating new state.

**Rationale**:

- Reuses existing infrastructure
- Maintains single source of truth for selection
- Already integrated with keyboard shortcuts
- Already handles Escape to clear selections

**Alternatives Rejected**:

- New `SelectionContext`: Would duplicate state management and require synchronization
- Local component state: Would break keyboard shortcut integration

---

### 3. Shift+Click Range Selection

**Question**: How to implement shift+click range selection in the task list?

**Finding**: Standard pattern requires tracking:

1. Last clicked task ID (anchor)
2. Current shift+clicked task ID
3. Visible task order to determine range

**Decision**: Store `lastClickedTaskId` in selection context, compute range from visible task array on shift+click.

**Implementation Pattern**:

```javascript
function handleRowClick(taskId, event, visibleTasks) {
  if (event.shiftKey && lastClickedTaskId) {
    const startIdx = visibleTasks.findIndex((t) => t.id === lastClickedTaskId);
    const endIdx = visibleTasks.findIndex((t) => t.id === taskId);
    const [from, to] = startIdx < endIdx ? [startIdx, endIdx] : [endIdx, startIdx];
    const rangeIds = visibleTasks.slice(from, to + 1).map((t) => t.id);
    addToSelection(rangeIds);
  } else {
    toggleSelection(taskId);
    setLastClickedId(taskId);
  }
}
```

---

### 4. Bulk Action Bar Component Pattern

**Question**: What component pattern for the fixed bottom action bar?

**Finding**: Common patterns:

- Portal-based overlay (like modals)
- Fixed positioned container within main layout
- Conditionally rendered component in Dashboard

**Decision**: Create `BulkActionBar` as a fixed-position component rendered conditionally in Dashboard when `selectedTaskIds.size > 0`. Use CSS `position: fixed; bottom: 0` with smooth appear/disappear animation.

**Rationale**:

- Simpler than portal (no need to escape React tree)
- Dashboard already manages view state
- Animation easily achievable with CSS transitions + conditional class

---

### 5. Cascade Delete for Dependencies

**Question**: How to handle bulk delete when tasks have dependencies?

**Finding**: Existing `dependencyService.deleteDependenciesForTask(taskId)` handles single-task cascade. Bulk delete needs to:

1. Delete selected tasks
2. Delete dependencies where taskId in selected
3. Delete dependencies where blockedById in selected

**Decision**: Create `bulkDeleteTasks(taskIds)` in taskService that wraps the entire operation in a transaction.

**Implementation**:

```javascript
export async function bulkDeleteTasks(taskIds) {
  return db.transaction('rw', db.tasks, db.dependencies, async () => {
    // Delete all dependencies involving these tasks
    await db.dependencies.where('taskId').anyOf(taskIds).delete();
    await db.dependencies.where('blockedById').anyOf(taskIds).delete();
    // Delete the tasks themselves
    await db.tasks.bulkDelete(taskIds);
    return taskIds.length;
  });
}
```

---

### 6. Status Change with Blocked Task Warning

**Question**: How to implement the soft warning for starting blocked tasks?

**Finding**: Existing `BlockedTaskWarningModal` handles single-task warning. For bulk, need to:

1. Filter selected tasks to find those with unsatisfied dependencies
2. Show consolidated warning listing all blocked tasks
3. Allow "Skip blocked" or "Start anyway" options

**Decision**: Create `BulkBlockedWarningModal` component showing list of blocked tasks with options:

- "Start Unblocked Only" - updates only non-blocked tasks
- "Start All Anyway" - force-starts all including blocked
- "Cancel" - abort operation

---

### 7. Performance: 500 Task Selection Limit

**Question**: How to efficiently handle selection of up to 500 tasks without UI lag?

**Finding**:

- Set operations are O(1) for add/delete/has
- Bulk IndexedDB operations scale linearly
- React re-renders can be optimized with memoization

**Decision**:

- Use native `Set` for selectedTaskIds (already implemented)
- Memoize filtered tasks in TaskList
- Show progress indicator for bulk operations >50 tasks
- Implement selection count badge update via state, not DOM manipulation

**Performance Targets**:

- Selection toggle: <16ms (1 frame)
- Select All (500 tasks): <100ms
- Bulk delete (500 tasks): <2s with progress indicator

---

### 8. i18n Keys Structure

**Question**: How to organize translation keys for bulk actions?

**Decision**: Add `bulk` namespace to translations:

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
  status: {
    button: 'Change Status',
    success: '{{count}} tasks updated',
  },
  reassign: {
    button: 'Reassign',
    success: '{{count}} tasks reassigned to {{userName}}',
  },
  tags: {
    button: 'Manage Tags',
    add: 'Add Tags',
    remove: 'Remove Tags',
    success: '{{count}} tasks updated',
  },
}
```

---

## Summary of Decisions

| Topic              | Decision                            | Key Rationale                          |
| ------------------ | ----------------------------------- | -------------------------------------- |
| Bulk DB operations | Dexie transactions + bulk methods   | Atomicity + performance                |
| Selection state    | Extend KeyboardShortcutContext      | Reuse existing, single source of truth |
| Range selection    | Track lastClickedId, compute range  | Standard UX pattern                    |
| Action bar         | Fixed bottom component in Dashboard | Simple, no portal needed               |
| Cascade delete     | Transaction wrapping all deletes    | Data integrity                         |
| Blocked warning    | Dedicated BulkBlockedWarningModal   | UX for bulk vs single differs          |
| Performance        | Native Set, memoization, progress   | Handle 500 tasks smoothly              |
| i18n               | `bulk.*` namespace                  | Organized, consistent                  |

---

## Dependencies Confirmed

| Dependency              | Status       | Notes                                    |
| ----------------------- | ------------ | ---------------------------------------- |
| KeyboardShortcutContext | ✅ Available | Has selectedTaskIds, toggleTaskSelection |
| dependencyService       | ✅ Available | Has deleteDependenciesForTask            |
| BlockedTaskWarningModal | ✅ Available | Pattern for bulk version                 |
| Toast notifications     | ✅ Available | Via Dashboard callbacks                  |
| i18n infrastructure     | ✅ Available | useTranslation hook                      |
| Dexie.js transactions   | ✅ Available | db.transaction()                         |
