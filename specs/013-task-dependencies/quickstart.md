# Quickstart: Task Dependencies

**Feature**: 013-task-dependencies  
**Date**: 2025-12-04  
**Audience**: Developers implementing this feature

## Overview

This feature adds task dependency management to TaskFlow, allowing users to define blocking relationships between tasks. A "dependent" task cannot start until all its "blocking" tasks are completed.

## Key Concepts

| Term                | Definition                                                           |
| ------------------- | -------------------------------------------------------------------- |
| **Dependent Task**  | A task that is blocked by another task                               |
| **Blocking Task**   | A task that must complete before dependents can start                |
| **Blocked**         | A task with at least one incomplete blocking task                    |
| **Ready**           | A task with all blocking tasks completed                             |
| **Finish-to-Start** | The dependency model: blocker must finish before dependent can start |

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Components    │────▶│  useDependencies │────▶│dependencyService│
│ (UI Layer)      │     │     (Hook)       │     │   (Service)     │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                │                        │
                                ▼                        ▼
                        ┌──────────────────┐     ┌─────────────────┐
                        │   TaskContext    │     │    IndexedDB    │
                        │ (State + Tasks)  │     │  (dependencies) │
                        └──────────────────┘     └─────────────────┘
```

## Getting Started

### 1. Database Schema (First!)

The `dependencies` table must be added in `src/services/db.js`:

```javascript
// Version 5 migration
db.version(5).stores({
  users: '&id, &identifier, identifierType, createdAt',
  tasks: '&id, userId, createdBy, status, priority, category, createdAt, deadline, timerStartedAt',
  shortcutUsage: '++id, [userId+shortcutKey+date], userId, date',
  dependencies: '&id, dependentTaskId, blockingTaskId, [dependentTaskId+blockingTaskId], createdAt',
});
```

### 2. Dependency Service

Create `src/services/dependencyService.js` following the contract:

```javascript
import { db } from './db';
import { v4 as uuidv4 } from 'uuid';
import { getTaskById } from './taskService';

export async function createDependency({ dependentTaskId, blockingTaskId, createdBy }) {
  // 1. Validate
  await validateDependency(dependentTaskId, blockingTaskId);

  // 2. Create record
  const dependency = {
    id: uuidv4(),
    dependentTaskId,
    blockingTaskId,
    createdBy,
    createdAt: new Date(),
  };

  await db.dependencies.add(dependency);
  return dependency;
}

// See contracts/dependencyService.contract.md for full API
```

### 3. React Hook

Create `src/hooks/useDependencies.js`:

```javascript
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTasks } from './useTasks';
import * as dependencyService from '../services/dependencyService';

export function useDependencies(taskId) {
  const { tasks } = useTasks();
  const [dependencies, setDependencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load all dependencies on mount
  useEffect(() => {
    dependencyService
      .getAllDependencies()
      .then(setDependencies)
      .finally(() => setLoading(false));
  }, []);

  // Computed: tasks blocking this task
  const blockedBy = useMemo(() => {
    if (!taskId) return [];
    return dependencies
      .filter((d) => d.dependentTaskId === taskId)
      .map((d) => tasks.find((t) => t.id === d.blockingTaskId))
      .filter(Boolean);
  }, [taskId, dependencies, tasks]);

  // See contracts/dependencyHook.contract.md for full API
  return { dependencies, blockedBy, loading, error /* ... */ };
}
```

### 4. UI Components

Key components to create/modify:

| Component            | Location            | Purpose                            |
| -------------------- | ------------------- | ---------------------------------- |
| `DependencySelector` | `components/tasks/` | Search/select tasks to add as deps |
| `DependencyList`     | `components/tasks/` | Show blocked-by and blocks lists   |
| `DependencyBadge`    | `components/tasks/` | Visual indicator for blocked tasks |
| `TaskForm`           | Modify existing     | Add dependency section             |
| `TaskDetail`         | Modify existing     | Show dependency info               |
| `TaskRow`            | Modify existing     | Show blocked indicator             |
| `FilterBar`          | Modify existing     | Add dependency filter              |

## Implementation Order

### Phase 1: Foundation (P1 Stories)

1. ✅ Database schema update (`db.js`)
2. ✅ Dependency service with CRUD (`dependencyService.js`)
3. ✅ Circular detection utility (`dependencyUtils.js`)
4. ✅ useDependencies hook (`useDependencies.js`)
5. ✅ Constants update (`constants.js`)

### Phase 2: Core UI (P1 Stories)

6. ✅ DependencySelector component
7. ✅ DependencyList component
8. ✅ DependencyBadge component
9. ✅ TaskForm integration
10. ✅ TaskDetail integration
11. ✅ TaskRow indicator

### Phase 3: Blocking Logic (P2 Stories)

12. ✅ Start task warning modal
13. ✅ Override confirmation
14. ✅ Circular prevention in selector

### Phase 4: Filtering (P3 Stories)

15. ✅ FilterBar dependency options
16. ✅ TaskContext filter integration

### Phase 5: Visualization (P3 Stories, Optional)

17. ⬜ DependencyChain visualization

## Testing Checklist

### Unit Tests (dependencyService)

- [ ] Create dependency - success
- [ ] Create dependency - self-reference error
- [ ] Create dependency - duplicate error
- [ ] Create dependency - circular error (direct)
- [ ] Create dependency - circular error (indirect)
- [ ] Create dependency - limit exceeded error
- [ ] Delete dependency
- [ ] Cascade delete when task deleted

### Integration Tests (useDependencies)

- [ ] Hook loads dependencies on mount
- [ ] blockedBy computed correctly
- [ ] blocks computed correctly
- [ ] isBlocked updates when blocker completes
- [ ] addDependency updates state
- [ ] removeDependency updates state

### Component Tests

- [ ] DependencySelector filters invalid options
- [ ] DependencyList shows both directions
- [ ] DependencyBadge appears on blocked tasks
- [ ] TaskForm shows dependency section
- [ ] Start button disabled for blocked tasks
- [ ] Override confirmation works

## Common Patterns

### Checking if Task is Blocked

```javascript
const { isBlocked, blockedBy } = useDependencies(taskId);

if (isBlocked) {
  const blockerNames = blockedBy.map((t) => t.taskName).join(', ');
  console.log(`Blocked by: ${blockerNames}`);
}
```

### Adding a Dependency

```javascript
const { addDependency, canAddDependency } = useDependencies(taskId);

const handleAdd = async (blockingTaskId) => {
  const validation = await canAddDependency(blockingTaskId);
  if (!validation.valid) {
    showError(validation.message);
    return;
  }
  await addDependency(blockingTaskId);
};
```

### Filtering Blocked Tasks

```javascript
const { setFilters } = useTasks();

// Show only blocked tasks
setFilters({ dependencyStatus: 'blocked' });

// Show tasks that block others
setFilters({ dependencyStatus: 'blocking' });
```

## Gotchas & Tips

1. **Circular Detection Performance**: The DFS algorithm is O(V+E). For 10 max deps per task, this is negligible.

2. **Cascade Delete**: Always delete dependencies in a transaction with task deletion to maintain consistency.

3. **Computed vs Stored**: `isBlocked` is COMPUTED from blocking task statuses. Never store it - it would get stale.

4. **Re-opening Tasks**: When a completed task is re-opened, dependent tasks become blocked again. The computed status handles this automatically.

5. **Max Dependencies**: The 10-dependency limit is enforced in `createDependency()`. The UI should check `dependencyCount` and disable the add button when limit reached.

## Files to Create/Modify

| File                                          | Action | Priority |
| --------------------------------------------- | ------ | -------- |
| `src/services/db.js`                          | MODIFY | P0       |
| `src/services/dependencyService.js`           | CREATE | P0       |
| `src/utils/dependencyUtils.js`                | CREATE | P0       |
| `src/utils/constants.js`                      | MODIFY | P0       |
| `src/hooks/useDependencies.js`                | CREATE | P1       |
| `src/components/tasks/DependencySelector.jsx` | CREATE | P1       |
| `src/components/tasks/DependencyList.jsx`     | CREATE | P1       |
| `src/components/tasks/DependencyBadge.jsx`    | CREATE | P1       |
| `src/components/tasks/TaskForm.jsx`           | MODIFY | P1       |
| `src/components/tasks/TaskDetail.jsx`         | MODIFY | P1       |
| `src/components/tasks/TaskRow.jsx`            | MODIFY | P1       |
| `src/components/tasks/FilterBar.jsx`          | MODIFY | P2       |
| `src/contexts/TaskContext.jsx`                | MODIFY | P2       |
| `src/services/taskService.js`                 | MODIFY | P1       |
