# Data Model: Today's Focus View

**Feature**: 004-todays-focus-view  
**Date**: December 1, 2025  
**Phase**: 1 - Design & Contracts

## Overview

The Today's Focus View feature does **not** require changes to the existing Task data model or IndexedDB schema. It provides a curated view of existing task data using a smart selection algorithm. This document defines the UI state models and computed types specific to the Focus View.

## Existing Entities (No Changes)

### Task (Existing - from TaskContext)

The Focus View reads from the existing Task entity:

| Field             | Type          | Usage in Focus View                              |
| ----------------- | ------------- | ------------------------------------------------ |
| id                | string (UUID) | Card key, action identifier                      |
| taskName          | string        | Card title                                       |
| description       | string        | Expanded details content                         |
| status            | enum          | Action buttons (Start/Complete), tier selection  |
| priority          | enum          | Card badge, tier 4 selection (high/urgent)       |
| complexity        | number (1-10) | Expanded details display                         |
| deadline          | Date \| null  | Tier selection (overdue/due today), card display |
| userId            | string        | User filter (current user only)                  |
| tags              | string[]      | Expanded details display                         |
| estimatedDuration | number        | Expanded details display                         |
| completedAt       | Date \| null  | Progress calculation (completed today)           |
| createdAt         | Date          | Secondary sort within tier                       |

## New UI State Entities

### FocusViewState

Represents the current state of the Focus View UI.

| Field          | Type           | Default | Description                                          |
| -------------- | -------------- | ------- | ---------------------------------------------------- |
| expandedTaskId | string \| null | null    | Task ID with expanded details (null = all collapsed) |
| focusedIndex   | number         | 0       | Index of keyboard-focused card (0-9)                 |
| showLoadMore   | boolean        | false   | Whether "Load More" button is visible                |

**Persistence**: None (ephemeral - resets on navigation)

### FocusTask

Extended task view with selection metadata (computed, not persisted).

| Field         | Type         | Description                                    |
| ------------- | ------------ | ---------------------------------------------- |
| ...Task       | Task         | All fields from base Task entity               |
| selectionTier | number (1-4) | Priority tier that qualified this task         |
| tierLabel     | string       | Human-readable tier name for debugging/display |

**Tier Values**:

- 1 = Overdue
- 2 = Due Today
- 3 = In Progress
- 4 = High/Urgent Priority

### DailyProgress

Computed progress statistics (derived, not persisted).

| Field           | Type    | Description                                       |
| --------------- | ------- | ------------------------------------------------- |
| date            | Date    | Today's date (for cache invalidation)             |
| completedToday  | number  | Count of tasks completed with today's completedAt |
| totalQualifying | number  | Total tasks that qualified for focus view today   |
| remainingTasks  | number  | Tasks still in focus view (not completed)         |
| hasMoreTasks    | boolean | Whether more qualifying tasks exist beyond limit  |

**Calculation**: Derived on each render from TaskContext tasks array.

## Selection Algorithm Model

### SelectionCriteria

The rules defining focus task selection (static configuration).

| Property      | Value                                         |
| ------------- | --------------------------------------------- |
| maxTasks      | 10                                            |
| tierOrder     | [overdue, dueToday, inProgress, highPriority] |
| secondarySort | deadline ASC NULLS LAST, then createdAt ASC   |
| userFilter    | tasks where userId === currentUser.id         |
| statusExclude | completed (never show in focus view)          |

### Tier Classification Logic

```
Tier 1 (Overdue):
  - deadline IS NOT NULL
  - deadline < today (midnight)
  - status !== 'completed'

Tier 2 (Due Today):
  - deadline IS NOT NULL
  - deadline === today (date comparison)
  - status !== 'completed'

Tier 3 (In Progress):
  - status === 'in-progress'
  - NOT already in Tier 1 or 2

Tier 4 (High/Urgent Priority):
  - priority IN ('urgent', 'high')
  - status === 'pending'
  - NOT already in Tier 1, 2, or 3
```

## State Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                    TaskContext (Existing)                    │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ tasks: Task[]                                        │    │
│  │ updateTask(id, updates)                              │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────────────┬──────────────────────────────────┘
                           │ reads
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   useFocusTasks Hook                         │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Input: tasks[], currentUser                          │    │
│  │ Output: { focusTasks, progress, hasMore, loadMore }  │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────────────┬──────────────────────────────────┘
                           │ provides
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      FocusView Component                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ focusTasks: FocusTask[] (max 10)                     │    │
│  │ progress: DailyProgress                              │    │
│  │ viewState: FocusViewState (local useState)           │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### Task Selection Flow

```
TaskContext.tasks
    │
    ▼
[Filter: userId === currentUser.id AND status !== 'completed']
    │
    ▼
[Classify: Assign tier 1-4 to each task]
    │
    ▼
[Sort: tier ASC, deadline ASC NULLS LAST, createdAt ASC]
    │
    ▼
[Slice: Take first 10]
    │
    ▼
FocusTask[]
```

### Progress Calculation Flow

```
TaskContext.tasks
    │
    ├──► [Filter: completedAt is today] ──► completedToday count
    │
    └──► [Filter: would qualify if not completed] ──► totalQualifying count
                │
                ▼
         DailyProgress { completedToday, totalQualifying, ... }
```

### Action Flow (Start/Complete)

```
User clicks "Start" on pending task
    │
    ▼
FocusCard calls onStart(taskId)
    │
    ▼
FocusView calls TaskContext.updateTask(taskId, { status: 'in-progress' })
    │
    ▼
TaskContext updates tasks array
    │
    ▼
useFocusTasks recomputes (via useMemo dependency)
    │
    ▼
FocusView re-renders with updated list
```

## Validation Rules

| Rule                          | Enforcement                                 |
| ----------------------------- | ------------------------------------------- |
| Max 10 tasks displayed        | Enforced in selection algorithm (slice)     |
| Only current user's tasks     | Enforced in selection filter                |
| No completed tasks in list    | Enforced in selection filter                |
| Valid status transitions only | Enforced by existing TaskContext validation |

## No Schema Changes Required

This feature operates entirely on the existing IndexedDB schema:

- No new tables
- No new indexes
- No migrations

All Focus View state is either:

1. **Derived** from existing Task data (selection, progress)
2. **Ephemeral** UI state (expanded card, keyboard focus)
