# Contract: useDependencies Hook

**Module**: `src/hooks/useDependencies.js`  
**Type**: React Hook  
**Purpose**: Provides dependency management functionality to React components

## Overview

Custom hook that wraps dependencyService operations with React state management, loading states, and error handling. Integrates with TaskContext for task data.

## Usage

```javascript
import { useDependencies } from '../hooks/useDependencies';

function TaskDependencyManager({ taskId }) {
  const {
    dependencies,
    blockedBy,
    blocks,
    isBlocked,
    loading,
    error,
    addDependency,
    removeDependency,
    canAddDependency,
    getAvailableTasks,
  } = useDependencies(taskId);

  // ... component logic
}
```

## Hook Signature

```typescript
function useDependencies(taskId?: string): UseDependenciesReturn;
```

## Return Value

```typescript
interface UseDependenciesReturn {
  // State
  dependencies: TaskDependency[]; // All dependencies in system
  loading: boolean; // Loading state
  error: DependencyError | null; // Last error

  // Computed for current task (if taskId provided)
  blockedBy: Task[]; // Tasks blocking this task
  blockedByIds: string[]; // IDs of blocking tasks
  blocks: Task[]; // Tasks this task blocks
  blocksIds: string[]; // IDs of blocked tasks
  isBlocked: boolean; // Whether task has incomplete blockers
  dependencyCount: number; // Number of dependencies (as dependent)

  // Actions
  addDependency: (blockingTaskId: string) => Promise<TaskDependency>;
  removeDependency: (dependencyId: string) => Promise<void>;

  // Utilities
  canAddDependency: (blockingTaskId: string) => Promise<ValidationResult>;
  getAvailableTasks: () => Task[]; // Tasks eligible to be added as deps
  clearError: () => void;
  refresh: () => Promise<void>; // Reload dependencies from DB
}

interface ValidationResult {
  valid: boolean;
  reason?: 'self' | 'duplicate' | 'circular' | 'limit' | 'not_found';
  message?: string;
  path?: string[]; // For circular detection
}
```

## State Management

The hook manages its own loading/error state and syncs with TaskContext for task data:

```javascript
const useDependencies = (taskId) => {
  const { tasks } = useTasks();
  const [dependencies, setDependencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load dependencies on mount
  useEffect(() => {
    loadDependencies();
  }, []);

  // Computed values using useMemo
  const blockedBy = useMemo(() => {
    if (!taskId) return [];
    const deps = dependencies.filter((d) => d.dependentTaskId === taskId);
    return deps.map((d) => tasks.find((t) => t.id === d.blockingTaskId)).filter(Boolean);
  }, [taskId, dependencies, tasks]);

  // ... rest of implementation
};
```

## Actions

### `addDependency(blockingTaskId)`

Adds a new dependency where `taskId` (from hook param) depends on `blockingTaskId`.

**Behavior**:

1. Validates the dependency can be created
2. Calls `dependencyService.createDependency()`
3. Updates local state
4. Returns created dependency

**Error Handling**: Sets `error` state with DependencyError if validation fails

---

### `removeDependency(dependencyId)`

Removes a dependency relationship.

**Behavior**:

1. Calls `dependencyService.deleteDependency()`
2. Updates local state
3. Clears error if successful

---

### `canAddDependency(blockingTaskId)`

Pre-validates if a dependency can be added without actually adding it.

**Returns**: ValidationResult with detailed reason if invalid

**Use Case**: Disable/enable UI elements, show validation messages before submission

---

### `getAvailableTasks()`

Returns list of tasks that can be added as dependencies.

**Filters out**:

- Current task (no self-reference)
- Tasks already in blockedBy list (no duplicates)
- Tasks that would create cycles
- N/A if task has 10 dependencies (limit reached)

---

## Integration Points

### With TaskContext

```javascript
// Hook reads tasks from TaskContext
const { tasks, updateTask } = useTasks();
```

### With Components

```javascript
// DependencySelector component
function DependencySelector({ taskId, onAdd }) {
  const { getAvailableTasks, addDependency, error } = useDependencies(taskId);
  const availableTasks = getAvailableTasks();

  const handleSelect = async (blockingTaskId) => {
    try {
      await addDependency(blockingTaskId);
      onAdd?.();
    } catch (err) {
      // Error already in hook state
    }
  };

  return (
    <SearchableDropdown options={availableTasks} onSelect={handleSelect} error={error?.message} />
  );
}
```

## Memoization

The hook uses `useMemo` for computed values to prevent unnecessary recalculations:

```javascript
const isBlocked = useMemo(() => {
  return blockedBy.some((task) => task.status !== STATUSES.COMPLETED);
}, [blockedBy]);

const dependencyStatus = useMemo(() => {
  if (isBlocked) return 'blocked';
  if (blocks.length > 0) return 'blocking';
  if (blockedBy.length > 0) return 'ready'; // All deps completed
  return null;
}, [isBlocked, blocks, blockedBy]);
```

## Error Handling Pattern

```javascript
const addDependency = useCallback(
  async (blockingTaskId) => {
    setLoading(true);
    setError(null);

    try {
      const dep = await dependencyService.createDependency({
        dependentTaskId: taskId,
        blockingTaskId,
        createdBy: currentUser.id,
      });

      setDependencies((prev) => [...prev, dep]);
      return dep;
    } catch (err) {
      setError(err);
      throw err; // Re-throw for component handling
    } finally {
      setLoading(false);
    }
  },
  [taskId, currentUser]
);
```
