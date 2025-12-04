# Data Model: Task Dependencies

**Feature**: 013-task-dependencies  
**Date**: 2025-12-04  
**Status**: Design Complete

## Entity Definitions

### TaskDependency (NEW)

Represents a "finish-to-start" blocking relationship between two tasks.

| Field             | Type          | Required | Description                                                 |
| ----------------- | ------------- | -------- | ----------------------------------------------------------- |
| `id`              | string (UUID) | Yes      | Unique identifier for the dependency record                 |
| `dependentTaskId` | string (UUID) | Yes      | Task that is blocked (cannot start until blocker completes) |
| `blockingTaskId`  | string (UUID) | Yes      | Task that blocks (must complete first)                      |
| `createdAt`       | Date          | Yes      | When the dependency was created                             |
| `createdBy`       | string (UUID) | Yes      | User who created the dependency                             |

**Indexes**:

- Primary: `id`
- Index: `dependentTaskId` (for "what blocks this task?")
- Index: `blockingTaskId` (for "what does this task block?")
- Compound unique: `[dependentTaskId, blockingTaskId]` (prevent duplicates)

**Constraints**:

- `dependentTaskId` ≠ `blockingTaskId` (no self-dependencies)
- Max 10 dependencies per task (where task is dependent)
- No circular dependencies allowed
- Both task IDs must reference existing tasks

### Task (EXTENDED)

Existing Task entity gains computed dependency-related attributes.

| Field              | Type    | Stored   | Description                                |
| ------------------ | ------- | -------- | ------------------------------------------ |
| `isBlocked`        | boolean | Computed | True if any blocking task is incomplete    |
| `blockedBy`        | Task[]  | Computed | Array of incomplete blocking tasks         |
| `blockedByCount`   | number  | Computed | Count of incomplete blockers               |
| `blocks`           | Task[]  | Computed | Array of tasks this task blocks            |
| `blocksCount`      | number  | Computed | Count of tasks this blocks                 |
| `dependencyStatus` | enum    | Computed | 'blocked' \| 'ready' \| 'blocking' \| null |

**Note**: These fields are NOT stored in IndexedDB. They are computed at runtime from the `dependencies` table and task statuses.

## IndexedDB Schema Update

```javascript
// db.js - Version 5 schema migration
db.version(5).stores({
  users: '&id, &identifier, identifierType, createdAt',
  tasks: '&id, userId, createdBy, status, priority, category, createdAt, deadline, timerStartedAt',
  shortcutUsage: '++id, [userId+shortcutKey+date], userId, date',
  dependencies: '&id, dependentTaskId, blockingTaskId, [dependentTaskId+blockingTaskId], createdAt',
});
```

## State Shape

### DependencyState (in TaskContext or separate context)

```typescript
interface DependencyState {
  dependencies: TaskDependency[]; // All dependency records
  loading: boolean; // Loading state
  error: Error | null; // Last error
}

interface ComputedDependencyInfo {
  [taskId: string]: {
    isBlocked: boolean;
    blockedBy: Task[];
    blockedByIds: string[];
    blocks: Task[];
    blocksIds: string[];
    dependencyStatus: 'blocked' | 'ready' | 'blocking' | null;
  };
}
```

## Validation Rules

### Creating a Dependency

1. **Self-reference check**: `dependentTaskId !== blockingTaskId`
2. **Duplicate check**: No existing dependency with same pair
3. **Circular check**: Adding this dependency must not create a cycle
4. **Limit check**: Dependent task must have < 10 existing dependencies
5. **Existence check**: Both tasks must exist in database

### Error Messages

| Validation     | Error Message                                                                     |
| -------------- | --------------------------------------------------------------------------------- |
| Self-reference | "A task cannot depend on itself"                                                  |
| Duplicate      | "This dependency already exists"                                                  |
| Circular       | "Cannot add dependency: this would create a circular reference (A → B → ... → A)" |
| Limit exceeded | "Maximum of 10 dependencies per task reached"                                     |
| Task not found | "One or both tasks no longer exist"                                               |

## Relationships Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Task A                               │
│                    (dependentTaskId)                         │
│                                                              │
│   isBlocked: true (computed from B.status !== 'completed')  │
│   blockedBy: [Task B]                                       │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           │ TaskDependency
                           │ {
                           │   dependentTaskId: A.id,
                           │   blockingTaskId: B.id
                           │ }
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                         Task B                               │
│                    (blockingTaskId)                          │
│                                                              │
│   blocks: [Task A]                                          │
│   status: 'pending' | 'in-progress' | 'completed'           │
└─────────────────────────────────────────────────────────────┘

When Task B status → 'completed':
  → Task A.isBlocked recalculates to false
  → Task A shows "ready to start"
```

## Migration Strategy

**Version 5 Migration**:

- Add new `dependencies` table
- No data migration needed (new feature, no existing data)
- Backward compatible (existing tasks unaffected)

```javascript
db.version(5).stores({
  users: '&id, &identifier, identifierType, createdAt',
  tasks: '&id, userId, createdBy, status, priority, category, createdAt, deadline, timerStartedAt',
  shortcutUsage: '++id, [userId+shortcutKey+date], userId, date',
  dependencies: '&id, dependentTaskId, blockingTaskId, [dependentTaskId+blockingTaskId], createdAt',
});
// No upgrade function needed - empty table is fine
```

## Query Patterns

### Get dependencies for a task (what blocks it)

```javascript
const blockers = await db.dependencies.where('dependentTaskId').equals(taskId).toArray();
```

### Get tasks blocked by a task (what it blocks)

```javascript
const blocked = await db.dependencies.where('blockingTaskId').equals(taskId).toArray();
```

### Check if dependency exists

```javascript
const exists =
  (await db.dependencies
    .where('[dependentTaskId+blockingTaskId]')
    .equals([dependentId, blockingId])
    .count()) > 0;
```

### Delete all dependencies for a task

```javascript
await db.transaction('rw', db.dependencies, async () => {
  await db.dependencies.where('dependentTaskId').equals(taskId).delete();
  await db.dependencies.where('blockingTaskId').equals(taskId).delete();
});
```
