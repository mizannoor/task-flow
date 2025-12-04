# Contract: dependencyService.js

**Module**: `src/services/dependencyService.js`  
**Type**: Service Layer  
**Purpose**: CRUD operations for task dependencies in IndexedDB

## Overview

Handles all database operations for the `dependencies` table including creation, deletion, querying, and validation. Includes circular dependency detection logic.

## Exports

### `createDependency(input)`

Creates a new dependency relationship between two tasks.

**Parameters**:

```typescript
interface CreateDependencyInput {
  dependentTaskId: string; // Task that will be blocked
  blockingTaskId: string; // Task that blocks
  createdBy: string; // User creating the dependency
}
```

**Returns**: `Promise<TaskDependency>` - The created dependency record

**Throws**:

- `DependencyError('SELF_REFERENCE')` - If dependent === blocking
- `DependencyError('DUPLICATE')` - If dependency already exists
- `DependencyError('CIRCULAR')` - If would create circular reference
- `DependencyError('LIMIT_EXCEEDED')` - If task has 10+ dependencies
- `DependencyError('TASK_NOT_FOUND')` - If either task doesn't exist

**Example**:

```javascript
const dep = await createDependency({
  dependentTaskId: 'task-123',
  blockingTaskId: 'task-456',
  createdBy: 'user-789',
});
```

---

### `deleteDependency(dependencyId)`

Removes a single dependency relationship.

**Parameters**: `dependencyId: string` - ID of the dependency to remove

**Returns**: `Promise<void>`

**Example**:

```javascript
await deleteDependency('dep-123');
```

---

### `getDependenciesForTask(taskId)`

Gets all tasks that block the specified task.

**Parameters**: `taskId: string` - ID of the dependent task

**Returns**: `Promise<TaskDependency[]>` - Array of dependency records where this task is dependent

**Example**:

```javascript
const blockers = await getDependenciesForTask('task-123');
// Returns: [{ dependentTaskId: 'task-123', blockingTaskId: 'task-456', ... }]
```

---

### `getTasksBlockedBy(taskId)`

Gets all tasks that are blocked by the specified task.

**Parameters**: `taskId: string` - ID of the blocking task

**Returns**: `Promise<TaskDependency[]>` - Array of dependency records where this task is the blocker

**Example**:

```javascript
const blocked = await getTasksBlockedBy('task-456');
// Returns: [{ dependentTaskId: 'task-123', blockingTaskId: 'task-456', ... }]
```

---

### `getAllDependencies()`

Gets all dependency records in the database.

**Returns**: `Promise<TaskDependency[]>` - Array of all dependency records

---

### `deleteDependenciesForTask(taskId)`

Removes all dependencies involving a task (both as dependent and blocker). Used when deleting a task.

**Parameters**: `taskId: string` - ID of the task being deleted

**Returns**: `Promise<{ deletedCount: number }>` - Count of deleted dependencies

**Example**:

```javascript
const result = await deleteDependenciesForTask('task-123');
// result: { deletedCount: 5 }
```

---

### `wouldCreateCycle(dependentTaskId, blockingTaskId)`

Checks if adding a dependency would create a circular reference.

**Parameters**:

- `dependentTaskId: string` - Proposed dependent task
- `blockingTaskId: string` - Proposed blocking task

**Returns**: `Promise<{ wouldCycle: boolean, path?: string[] }>` - Whether it would cycle and the path if so

**Example**:

```javascript
const check = await wouldCreateCycle('task-A', 'task-C');
// If A→B→C exists: { wouldCycle: true, path: ['task-C', 'task-B', 'task-A'] }
// If no cycle: { wouldCycle: false }
```

---

### `getDependencyCount(taskId)`

Gets the count of dependencies for a task (where task is dependent).

**Parameters**: `taskId: string` - ID of the dependent task

**Returns**: `Promise<number>` - Count of dependencies

---

## Error Types

```javascript
export class DependencyError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

export const DEPENDENCY_ERROR_CODES = {
  SELF_REFERENCE: 'SELF_REFERENCE',
  DUPLICATE: 'DUPLICATE',
  CIRCULAR: 'CIRCULAR',
  LIMIT_EXCEEDED: 'LIMIT_EXCEEDED',
  TASK_NOT_FOUND: 'TASK_NOT_FOUND',
  NOT_FOUND: 'NOT_FOUND',
};
```

## Internal Functions (Not Exported)

### `validateDependency(dependentTaskId, blockingTaskId)`

Performs all validation checks before creating a dependency.

### `detectCycle(dependentTaskId, blockingTaskId, allDependencies)`

DFS algorithm to detect if adding dependency would create cycle.

## Dependencies

- `db` from `./db.js` - Database instance
- `uuid` from `uuid` - ID generation
- `getTaskById` from `./taskService.js` - Task existence check
