# Data Model: Task Management System

**Feature**: 002-task-management
**Date**: December 1, 2025
**Source**: spec.md Key Entities + PRD Section 6.2.1

## Entity Definitions

### Task

The core work item entity stored in IndexedDB.

| Field               | Type       | Required | Default         | Constraints                     | Description            |
| ------------------- | ---------- | -------- | --------------- | ------------------------------- | ---------------------- |
| `id`                | string     | Yes      | UUID v4         | Primary key, unique             | Unique task identifier |
| `userId`            | string     | Yes      | Current user ID | FK to users.id                  | Assigned user          |
| `createdBy`         | string     | Yes      | Current user ID | FK to users.id                  | Creator user           |
| `taskName`          | string     | Yes      | -               | 1-200 chars                     | Task title             |
| `description`       | string     | No       | `''`            | Max 5000 chars                  | Detailed description   |
| `complexity`        | number     | No       | `5`             | 1-10 integer                    | Difficulty rating      |
| `priority`          | enum       | No       | `'medium'`      | urgent\|high\|medium\|low       | Urgency level          |
| `category`          | enum       | No       | `'development'` | development\|fix\|support       | Work type              |
| `tags`              | string[]   | No       | `[]`            | Array of strings                | Custom labels          |
| `estimatedDuration` | number     | No       | `60`            | Minutes (positive int)          | Time estimate          |
| `actualDuration`    | number     | No       | `0`             | Minutes (positive int)          | Tracked time           |
| `status`            | enum       | Yes      | `'pending'`     | pending\|in-progress\|completed | Workflow state         |
| `deadline`          | Date\|null | No       | `null`          | Valid date or null              | Due date               |
| `createdAt`         | Date       | Yes      | Now             | ISO timestamp                   | Creation time          |
| `updatedAt`         | Date       | Yes      | Now             | ISO timestamp                   | Last modification      |
| `completedAt`       | Date\|null | No       | `null`          | Set when completed              | Completion time        |

### Enums

```typescript
type Priority = 'urgent' | 'high' | 'medium' | 'low';
type Category = 'development' | 'fix' | 'support';
type Status = 'pending' | 'in-progress' | 'completed';
```

### Priority Definitions

| Value    | Display | Color  | Definition                    |
| -------- | ------- | ------ | ----------------------------- |
| `urgent` | Urgent  | Red    | Critical, blocking other work |
| `high`   | High    | Orange | Important, significant impact |
| `medium` | Medium  | Yellow | Standard work item            |
| `low`    | Low     | Green  | Nice to have, backlog         |

### Category Definitions

| Value         | Display     | Description                 |
| ------------- | ----------- | --------------------------- |
| `development` | Development | New features, enhancements  |
| `fix`         | Fix         | Bug fixes, corrections      |
| `support`     | Support     | Maintenance, research, docs |

### Status Transitions

```
┌─────────┐     Start      ┌─────────────┐    Complete    ┌───────────┐
│ Pending │ ─────────────► │ In Progress │ ─────────────► │ Completed │
└─────────┘                └─────────────┘                └───────────┘
     ▲                                                          │
     │                        Re-open                           │
     └──────────────────────────────────────────────────────────┘
```

## IndexedDB Schema

### Dexie Schema Definition

```javascript
// db.js - Version 2 upgrade
db.version(2).stores({
  users: '&id, &identifier, identifierType, createdAt',
  tasks: '&id, userId, createdBy, status, priority, category, createdAt, deadline',
});
```

### Indexed Fields Rationale

| Index       | Query Pattern      |
| ----------- | ------------------ |
| `&id`       | Primary key lookup |
| `userId`    | Filter "My Tasks"  |
| `createdBy` | Audit trail        |
| `status`    | Filter by status   |
| `priority`  | Sort by priority   |
| `category`  | Filter by category |
| `createdAt` | Sort by date       |
| `deadline`  | Sort by due date   |

## Filter State Model

```typescript
interface TaskFilter {
  status: Status[]; // Multi-select filter
  priority: Priority[]; // Multi-select filter
  category: Category[]; // Multi-select filter
  searchQuery: string; // Text search (name + description)
  userId: string | null; // "My Tasks" vs "All Tasks" vs specific user
}
```

### Default Filter State

```javascript
const DEFAULT_FILTERS = {
  status: [], // All statuses
  priority: [], // All priorities
  category: [], // All categories
  searchQuery: '', // No search
  userId: null, // All tasks (current user context)
};
```

## Sort State Model

```typescript
interface TaskSort {
  field: SortField;
  order: 'asc' | 'desc';
}

type SortField =
  | 'priority'
  | 'complexity'
  | 'estimatedDuration'
  | 'createdAt'
  | 'deadline'
  | 'taskName';
```

### Default Sort State

```javascript
const DEFAULT_SORT = {
  field: 'priority',
  order: 'desc', // Urgent first
};
```

### Priority Sort Order

When sorting by priority, use numeric mapping for correct ordering:

```javascript
const PRIORITY_ORDER = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
};
```

## Relationships

```
┌─────────────┐         ┌─────────────┐
│    User     │ 1     * │    Task     │
│─────────────│─────────│─────────────│
│ id (PK)     │         │ id (PK)     │
│ identifier  │         │ userId (FK) │──── Assigned To
│ displayName │         │ createdBy   │──── Created By
└─────────────┘         │ taskName    │
                        │ ...         │
                        └─────────────┘
```

## Validation Rules

### Task Name

- Required
- Min: 1 character (after trim)
- Max: 200 characters
- Trim whitespace before validation

### Description

- Optional
- Max: 5000 characters

### Complexity

- Optional (default: 5)
- Range: 1-10 (inclusive)
- Integer only

### Estimated Duration

- Optional (default: 60)
- Range: 1-99999 minutes
- Integer only

### Deadline

- Optional
- Valid Date object or null
- Past dates allowed with warning

### Tags

- Optional (default: empty array)
- Array of non-empty strings
- Duplicate tags removed
