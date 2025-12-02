# Data Model: Kanban View

**Feature**: 003-kanban-view  
**Date**: December 1, 2025  
**Phase**: 1 - Design & Contracts

## Overview

The Kanban View feature does **not** require changes to the existing Task data model. It provides a visual representation of existing task data organized by status. This document defines the UI state models specific to the Kanban view.

## Existing Entities (No Changes)

### Task (Existing - from TaskContext)

The Kanban view reads from the existing Task entity:

| Field             | Type          | Usage in Kanban               |
| ----------------- | ------------- | ----------------------------- |
| id                | string (UUID) | Card key, drag identifier     |
| taskName          | string        | Card title                    |
| description       | string        | Preview popup content         |
| status            | enum          | Column assignment             |
| priority          | enum          | Card badge, sort order        |
| complexity        | number (1-10) | Card indicator                |
| deadline          | Date \| null  | Card display, overdue warning |
| userId            | string        | Card avatar/initials          |
| tags              | string[]      | Preview popup content         |
| estimatedDuration | number        | Preview popup content         |
| actualDuration    | number        | Preview popup content         |
| createdAt         | Date          | Sort tiebreaker               |

## New UI State Entities

### KanbanViewState

Represents the current state of the Kanban board UI.

| Field            | Type                    | Default                                                   | Description                                       |
| ---------------- | ----------------------- | --------------------------------------------------------- | ------------------------------------------------- |
| collapsedColumns | Record<Status, boolean> | `{ pending: false, inProgress: false, completed: false }` | Which columns are collapsed                       |
| selectedTaskId   | string \| null          | null                                                      | Task ID shown in side panel (null = panel closed) |
| focusedCardId    | string \| null          | null                                                      | Card ID with keyboard focus                       |
| focusedColumn    | Status \| null          | null                                                      | Column with keyboard focus                        |

**Persistence**: `collapsedColumns` persisted to localStorage; others are ephemeral.

### DragState

Represents the current state during a drag operation.

| Field         | Type           | Default | Description                                         |
| ------------- | -------------- | ------- | --------------------------------------------------- |
| isDragging    | boolean        | false   | Whether a drag is in progress                       |
| draggedTaskId | string \| null | null    | ID of task being dragged                            |
| sourceColumn  | Status \| null | null    | Original column of dragged task                     |
| targetColumn  | Status \| null | null    | Column currently hovered over                       |
| dropIndex     | number \| null | null    | Position within target column (for visual feedback) |

**Persistence**: None (ephemeral during interaction)

### HoverPreviewState

Represents the hover preview popup state.

| Field     | Type                     | Default        | Description                |
| --------- | ------------------------ | -------------- | -------------------------- |
| isVisible | boolean                  | false          | Whether preview is showing |
| taskId    | string \| null           | null           | Task ID being previewed    |
| position  | { x: number, y: number } | { x: 0, y: 0 } | Popup position             |

**Persistence**: None (ephemeral)

## State Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                    TaskContext (Existing)                    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ tasks: Task[]                                        │    │
│  │ filters: FilterState                                 │    │
│  │ updateTask(id, updates) → Promise                    │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ reads tasks, calls updateTask
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    KanbanView Component                      │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ kanbanState: KanbanViewState (local useState)        │    │
│  │ dragState: DragState (via useDragAndDrop hook)       │    │
│  └─────────────────────────────────────────────────────┘    │
│                              │                               │
│         ┌────────────────────┼────────────────────┐          │
│         ▼                    ▼                    ▼          │
│  ┌────────────┐       ┌────────────┐       ┌────────────┐   │
│  │ Pending    │       │ In Progress│       │ Completed  │   │
│  │ Column     │       │ Column     │       │ Column     │   │
│  └────────────┘       └────────────┘       └────────────┘   │
│         │                    │                    │          │
│         ▼                    ▼                    ▼          │
│  ┌────────────┐       ┌────────────┐       ┌────────────┐   │
│  │ KanbanCard │       │ KanbanCard │       │ KanbanCard │   │
│  │ (draggable)│       │ (draggable)│       │ (draggable)│   │
│  └────────────┘       └────────────┘       └────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ opens on card click
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    TaskSidePanel                             │
│  Displays full task details, allows editing                  │
└─────────────────────────────────────────────────────────────┘
```

## Computed Values

### tasksGroupedByStatus

Derived from `TaskContext.tasks` array:

```typescript
type TasksByStatus = {
  pending: Task[];
  inProgress: Task[];
  completed: Task[];
};
```

**Sort Order** (within each group):

1. Priority: Urgent > High > Medium > Low
2. Deadline: Earlier dates first (null deadlines last)
3. Creation date: Oldest first

### columnCounts

Derived from `tasksGroupedByStatus`:

```typescript
type ColumnCounts = {
  pending: number;
  inProgress: number;
  completed: number;
};
```

## Validation Rules

### Status Transitions (on drag-drop)

All transitions are valid (no restrictions):

- Pending → In Progress ✓
- Pending → Completed ✓
- In Progress → Pending ✓
- In Progress → Completed ✓
- Completed → Pending ✓
- Completed → In Progress ✓

### Collapse State

- At least one column must be expanded (cannot collapse all three)
- Collapsing a column with the focused card moves focus to nearest expanded column

## Storage Keys

| Key                       | Type        | Purpose                        |
| ------------------------- | ----------- | ------------------------------ |
| `taskflow_kanban_columns` | JSON string | Persist collapsed column state |

**Schema**:

```json
{
  "pending": false,
  "inProgress": false,
  "completed": false
}
```
