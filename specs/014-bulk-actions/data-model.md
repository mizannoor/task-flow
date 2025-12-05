# Data Model: Bulk Actions

**Feature**: 014-bulk-actions  
**Date**: December 5, 2025  
**Phase**: 1 - Design & Contracts

---

## Overview

Bulk Actions primarily extends existing UI state management rather than introducing new database entities. Selection state is ephemeral (session-only) and bulk operations modify existing Task entities.

---

## State Entities

### SelectionState (Extended from KeyboardShortcutContext)

Represents the current multi-selection state in the List view.

```
SelectionState
├── selectedTaskIds: Set<string>     // Set of selected task IDs (existing)
├── lastClickedTaskId: string | null // Anchor for Shift+click range (NEW)
├── selectionAnchorId: string | null // First task in range selection (NEW)
└── isSelectAllActive: boolean       // Whether "Select All" is toggled (NEW)
```

**Constraints**:

- Maximum 500 task IDs in selectedTaskIds (FR-009)
- Selection is cleared on filter change or view change
- Selection persists across pagination within List view (FR-007)

**Storage**: React Context state only (not persisted)

---

### BulkOperationState (Component State)

Tracks in-progress bulk operations for UI feedback.

```
BulkOperationState
├── isProcessing: boolean           // Whether a bulk op is in progress
├── operationType: string | null    // 'delete' | 'status' | 'reassign' | 'tags'
├── totalCount: number              // Total tasks being operated on
├── processedCount: number          // Tasks processed so far (for progress)
└── error: string | null            // Error message if operation failed
```

**Usage**: Local state in BulkActionBar or Dashboard component

---

### BulkOperationResult (Return Type)

Returned from bulk service functions.

```
BulkOperationResult
├── success: boolean                // Whether operation completed
├── operationType: string           // Type of operation performed
├── affectedCount: number           // Number of tasks modified
├── skippedCount: number            // Number of tasks skipped (e.g., blocked)
├── skippedTaskIds: string[]        // IDs of skipped tasks
└── error: string | null            // Error message if failed
```

---

## State Relationships

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        KeyboardShortcutContext                           │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ selectedTaskIds: Set<string>      (existing)                       │  │
│  │ lastClickedTaskId: string | null  (NEW)                            │  │
│  │ toggleTaskSelection(id)           (existing)                       │  │
│  │ clearSelections()                 (existing)                       │  │
│  │ selectAll(taskIds)                (NEW)                            │  │
│  │ selectRange(fromId, toId, tasks)  (NEW)                            │  │
│  │ addToSelection(taskIds)           (NEW)                            │  │
│  │ removeFromSelection(taskIds)      (NEW)                            │  │
│  │ setLastClicked(taskId)            (NEW)                            │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    reads selectedTaskIds, calls selection methods
                                    │
┌───────────────────────────────────┴─────────────────────────────────────┐
│                              TaskList                                    │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ • Renders checkbox column                                          │  │
│  │ • Handles click/shift+click on checkboxes                          │  │
│  │ • Passes visible tasks to selection context for range calc         │  │
│  │ • Shows selection highlighting on selected rows                    │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    selectedTaskIds.size > 0 triggers
                                    │
┌───────────────────────────────────┴─────────────────────────────────────┐
│                            BulkActionBar                                 │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ • Fixed bottom position                                            │  │
│  │ • Shows selection count                                            │  │
│  │ • Action buttons: Delete, Status, Reassign, Tags, Clear            │  │
│  │ • Calls bulk service functions on action click                     │  │
│  │ • Manages BulkOperationState for progress/loading                  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    calls bulk operations
                                    │
┌───────────────────────────────────┴─────────────────────────────────────┐
│                          bulkService.js (NEW)                            │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ bulkDeleteTasks(taskIds)          → BulkOperationResult            │  │
│  │ bulkUpdateStatus(taskIds, status) → BulkOperationResult            │  │
│  │ bulkReassignTasks(taskIds, userId)→ BulkOperationResult            │  │
│  │ bulkAddTags(taskIds, tags)        → BulkOperationResult            │  │
│  │ bulkRemoveTags(taskIds, tags)     → BulkOperationResult            │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                    │                                     │
│                    uses Dexie transactions                               │
│                                    ▼                                     │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                         IndexedDB                                  │  │
│  │  tasks table, dependencies table                                   │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Task Entity Extensions

No schema changes required. Bulk operations modify existing Task fields:

| Field       | Bulk Delete | Bulk Status | Bulk Reassign | Bulk Tags  |
| ----------- | ----------- | ----------- | ------------- | ---------- |
| status      | -           | ✓ Modified  | -             | -          |
| completedAt | -           | ✓ Set/Clear | -             | -          |
| userId      | -           | -           | ✓ Modified    | -          |
| tags        | -           | -           | -             | ✓ Modified |
| updatedAt   | -           | ✓ Updated   | ✓ Updated     | ✓ Updated  |

---

## Validation Rules

### Selection Validation

| Rule                  | Constraint        | Error                               |
| --------------------- | ----------------- | ----------------------------------- |
| Max selection size    | ≤ 500 tasks       | "Cannot select more than 500 tasks" |
| Non-empty for actions | ≥ 1 task selected | Action buttons disabled             |

### Bulk Delete Validation

| Rule                  | Constraint | Behavior                                        |
| --------------------- | ---------- | ----------------------------------------------- |
| Confirmation required | Always     | Show confirmation dialog                        |
| Cascade dependencies  | Auto       | Delete related dependencies in same transaction |

### Bulk Status Change Validation

| Rule                 | Constraint                        | Behavior                        |
| -------------------- | --------------------------------- | ------------------------------- |
| Valid status value   | pending/in-progress/completed     | Enforce enum                    |
| Blocked task warning | Tasks with unsatisfied deps       | Show warning modal with options |
| completedAt handling | Auto-set when → completed         | Set to now                      |
| completedAt handling | Auto-clear when completed → other | Clear to null                   |

### Bulk Reassign Validation

| Rule                | Constraint            | Behavior                  |
| ------------------- | --------------------- | ------------------------- |
| Valid user ID       | User must exist in DB | Validate before operation |
| Self-assign allowed | Yes                   | No special handling       |

### Bulk Tag Validation

| Rule                | Constraint                  | Behavior            |
| ------------------- | --------------------------- | ------------------- |
| Tag format          | Non-empty strings, trimmed  | Clean before adding |
| Additive only       | Add doesn't remove existing | Merge tags          |
| Remove from present | Only remove if task has tag | No-op if missing    |

---

## UI State Flows

### Selection Flow

```
User clicks checkbox
       │
       ▼
┌─────────────────────┐
│ Is Shift held?      │
└─────────────────────┘
       │
  No   │   Yes
       │    │
       ▼    ▼
┌──────────────┐  ┌─────────────────────────┐
│ Toggle single │  │ Get lastClickedTaskId   │
│ selection     │  │ Compute range from      │
│               │  │ visible tasks           │
│ Set lastClick │  │ Add range to selection  │
└──────────────┘  └─────────────────────────┘
       │                    │
       └────────┬───────────┘
                ▼
       Selection state updated
                │
                ▼
       BulkActionBar visibility updated
```

### Bulk Operation Flow

```
User clicks action button (e.g., Delete)
       │
       ▼
┌─────────────────────┐
│ Show confirmation/  │
│ options if needed   │
└─────────────────────┘
       │
       ▼ (confirmed)
┌─────────────────────┐
│ Set isProcessing    │
│ Show loading state  │
└─────────────────────┘
       │
       ▼
┌─────────────────────┐
│ Call bulk service   │
│ (runs in DB         │
│ transaction)        │
└─────────────────────┘
       │
       ▼
┌─────────────────────┐
│ Update TaskContext  │
│ (refresh task list) │
└─────────────────────┘
       │
       ▼
┌─────────────────────┐
│ Clear selection     │
│ Show toast result   │
│ Clear isProcessing  │
└─────────────────────┘
```

---

## Dark Mode Colors

Selection highlighting colors (matching existing theme patterns):

| State               | Light Mode        | Dark Mode                    |
| ------------------- | ----------------- | ---------------------------- |
| Selected row bg     | `bg-blue-50`      | `dark:bg-blue-900/30`        |
| Selected row border | `border-blue-200` | `dark:border-blue-700`       |
| Checkbox checked    | `bg-blue-600`     | `dark:bg-blue-500`           |
| Action bar bg       | `bg-white`        | `dark:bg-gray-800`           |
| Action bar border   | `border-gray-200` | `dark:border-gray-700`       |
| Action bar shadow   | `shadow-lg`       | `shadow-lg` (darker ambient) |
