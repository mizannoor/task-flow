# Research: Task Dependencies

**Feature**: 013-task-dependencies  
**Date**: 2025-12-04  
**Purpose**: Resolve technical unknowns and establish best practices before design phase

## Research Tasks

### 1. Dependency Data Model Pattern

**Question**: How should task dependencies be stored in IndexedDB for efficient querying?

**Decision**: Separate `dependencies` table with compound indexes

**Rationale**:

- Enables efficient queries in both directions (blocked-by AND blocks)
- Avoids storing arrays in task records (which don't index well in IndexedDB)
- Supports cascade operations without modifying task records
- Follows relational pattern suitable for Dexie.js

**Alternatives Considered**:

1. **Store dependency IDs in task record** - Rejected because:
   - Arrays don't index efficiently in IndexedDB
   - Requires updating task records when dependencies change
   - Harder to query "what does this task block?"
2. **Single denormalized collection** - Rejected because:
   - Would require complex joins for dependency chains
   - Higher storage overhead with duplication

**Implementation Pattern**:

```javascript
// Dexie schema
db.version(5).stores({
  // ... existing tables
  dependencies: '++id, dependentTaskId, blockingTaskId, [dependentTaskId+blockingTaskId]',
});
```

---

### 2. Circular Dependency Detection Algorithm

**Question**: What algorithm efficiently detects circular dependencies before they're created?

**Decision**: Depth-First Search (DFS) with visited tracking

**Rationale**:

- O(V+E) time complexity where V=tasks, E=dependencies
- Simple to implement and understand
- Handles indirect circular references (A→B→C→A)
- Can return the path for user-friendly error messages

**Alternatives Considered**:

1. **Topological Sort (Kahn's Algorithm)** - More complex, better for full graph analysis but overkill for single-addition validation
2. **Union-Find** - Better for dynamic connectivity but doesn't easily show the cycle path

**Implementation Pattern**:

```javascript
function wouldCreateCycle(dependentId, blockingId, existingDeps) {
  // Check if adding blockingId as dependency of dependentId would create cycle
  // DFS from blockingId to see if we can reach dependentId
  const visited = new Set();
  const path = [];

  function dfs(currentId) {
    if (currentId === dependentId) return true; // Found cycle
    if (visited.has(currentId)) return false;

    visited.add(currentId);
    path.push(currentId);

    const deps = existingDeps.filter((d) => d.dependentTaskId === currentId);
    for (const dep of deps) {
      if (dfs(dep.blockingTaskId)) return true;
    }

    path.pop();
    return false;
  }

  return dfs(blockingId);
}
```

---

### 3. Blocked Status Calculation Strategy

**Question**: Should blocked status be stored or computed on-demand?

**Decision**: Compute on-demand with memoization in React context

**Rationale**:

- Avoids data synchronization issues when blocking tasks change status
- Single source of truth (blocking task completion status)
- React's useMemo handles caching efficiently
- Aligns with existing TaskContext pattern

**Alternatives Considered**:

1. **Store isBlocked field on task** - Rejected because:
   - Requires updating dependent tasks whenever blocking task changes
   - Risk of stale data
   - Complex cascade updates
2. **Compute without caching** - Performance risk at scale

**Implementation Pattern**:

```javascript
// In TaskContext or useDependencies hook
const blockedStatus = useMemo(() => {
  return tasks.reduce((acc, task) => {
    const deps = dependencies.filter((d) => d.dependentTaskId === task.id);
    const blockedBy = deps
      .map((d) => tasks.find((t) => t.id === d.blockingTaskId))
      .filter((t) => t && t.status !== 'completed');

    acc[task.id] = {
      isBlocked: blockedBy.length > 0,
      blockedBy: blockedBy,
      blockedCount: blockedBy.length,
    };
    return acc;
  }, {});
}, [tasks, dependencies]);
```

---

### 4. Cascade Delete Behavior

**Question**: What happens to dependencies when a task is deleted?

**Decision**: Automatically remove all dependencies involving the deleted task

**Rationale**:

- Prevents orphaned dependency records
- Aligns with user expectation (deleted task can't block anything)
- Spec explicitly requires this behavior (FR-010)

**Implementation Pattern**:

```javascript
// In taskService.deleteTask
export async function deleteTask(taskId) {
  await db.transaction('rw', db.tasks, db.dependencies, async () => {
    // Remove task
    await db.tasks.delete(taskId);
    // Remove dependencies where task is dependent
    await db.dependencies.where('dependentTaskId').equals(taskId).delete();
    // Remove dependencies where task is blocker
    await db.dependencies.where('blockingTaskId').equals(taskId).delete();
  });
}
```

---

### 5. UI Component Pattern for Dependency Selection

**Question**: How should users search and select tasks for dependencies?

**Decision**: Searchable dropdown with type-ahead filtering

**Rationale**:

- Familiar pattern (similar to user assignment dropdown)
- Efficient for finding tasks by name
- Can show task status inline for context
- Easily excludes invalid options (self, would-create-cycle)

**Alternatives Considered**:

1. **Modal with full task list** - More intrusive, slower for quick additions
2. **Drag-and-drop from task list** - Complex to implement, accessibility concerns

**Implementation Pattern**:

- Reuse existing searchable dropdown patterns from FilterBar
- Filter out: current task, tasks that would create cycles, tasks at max dependency limit
- Show task name + status badge in dropdown options

---

### 6. Filter Integration Pattern

**Question**: How should dependency filters integrate with existing filter system?

**Decision**: Add new filter properties to existing FilterContext pattern

**Rationale**:

- Consistent with existing filter architecture
- Combines naturally with status/priority/category filters
- Persists with other filter preferences

**Implementation Pattern**:

```javascript
// Extend DEFAULT_FILTERS in constants.js
export const DEFAULT_FILTERS = {
  // ... existing filters
  dependencyStatus: null, // 'blocked' | 'blocking' | null
};

// Extend filterTasks function
if (filters.dependencyStatus === 'blocked') {
  if (!blockedStatus[task.id]?.isBlocked) return false;
}
if (filters.dependencyStatus === 'blocking') {
  const blocks = dependencies.filter((d) => d.blockingTaskId === task.id);
  if (blocks.length === 0) return false;
}
```

---

## Technology Decisions Summary

| Decision           | Choice                        | Key Reason                          |
| ------------------ | ----------------------------- | ----------------------------------- |
| Storage pattern    | Separate dependencies table   | Efficient bidirectional queries     |
| Cycle detection    | DFS with path tracking        | O(V+E), shows cycle path for errors |
| Blocked status     | Computed with memoization     | Single source of truth              |
| Cascade delete     | Automatic in transaction      | Data integrity                      |
| Selection UI       | Searchable dropdown           | Familiar pattern, accessible        |
| Filter integration | Extend existing FilterContext | Consistency                         |

## Open Questions (None)

All technical unknowns have been resolved. Ready for Phase 1 design.
