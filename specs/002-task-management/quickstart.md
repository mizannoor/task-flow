# Quickstart: Task Management System

**Feature**: 002-task-management
**Date**: December 1, 2025

## Prerequisites

Before implementing this feature, ensure:

1. ✅ Authentication System (001-auth-system) is complete
2. ✅ Project structure from PRD Section 5.2 exists
3. ✅ Dependencies installed: `dexie`, `uuid`, `tailwindcss`

## Quick Setup

### 1. Extend Database Schema

Update `src/services/db.js`:

```javascript
// Add version 2 with tasks table
db.version(2).stores({
  users: '&id, &identifier, identifierType, createdAt',
  tasks: '&id, userId, createdBy, status, priority, category, createdAt, deadline',
});
```

### 2. Add Task Constants

Add to `src/utils/constants.js`:

```javascript
// Task priorities
export const PRIORITIES = {
  URGENT: 'urgent',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

// Task categories
export const CATEGORIES = {
  DEVELOPMENT: 'development',
  FIX: 'fix',
  SUPPORT: 'support',
};

// Task statuses
export const STATUSES = {
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
};

// Default task values
export const TASK_DEFAULTS = {
  COMPLEXITY: 5,
  PRIORITY: PRIORITIES.MEDIUM,
  CATEGORY: CATEGORIES.DEVELOPMENT,
  ESTIMATED_DURATION: 60,
};
```

### 3. Create Task Service

Create `src/services/taskService.js`:

```javascript
import { db } from './db';
import { v4 as uuidv4 } from 'uuid';

export async function createTask(input) {
  const now = new Date();
  const task = {
    id: uuidv4(),
    status: 'pending',
    actualDuration: 0,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
    ...input,
  };
  await db.tasks.add(task);
  return task;
}

export async function getAllTasks() {
  return db.tasks.toArray();
}

export async function getTasksByUser(userId) {
  return db.tasks.where('userId').equals(userId).toArray();
}

export async function updateTask(id, updates) {
  const now = new Date();
  await db.tasks.update(id, { ...updates, updatedAt: now });
  return db.tasks.get(id);
}

export async function deleteTask(id) {
  await db.tasks.delete(id);
}
```

### 4. Create TaskContext

Create `src/contexts/TaskContext.jsx`:

```javascript
import { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import * as taskService from '../services/taskService';

const TaskContext = createContext(null);

const initialState = {
  tasks: [],
  loading: true,
  error: null,
  filters: { status: [], priority: [], category: [], searchQuery: '', userId: null },
  sort: { field: 'priority', order: 'desc' },
};

function taskReducer(state, action) {
  switch (action.type) {
    case 'SET_TASKS':
      return { ...state, tasks: action.payload, loading: false };
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === action.payload.id ? { ...t, ...action.payload.updates } : t
        ),
      };
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.payload) };
    // ... more cases
    default:
      return state;
  }
}

export function TaskProvider({ children }) {
  const [state, dispatch] = useReducer(taskReducer, initialState);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      taskService.getAllTasks().then((tasks) => {
        dispatch({ type: 'SET_TASKS', payload: tasks });
      });
    }
  }, [currentUser]);

  // ... implement context value methods

  return <TaskContext.Provider value={{ ...state /* methods */ }}>{children}</TaskContext.Provider>;
}

export const useTasks = () => useContext(TaskContext);
```

### 5. Create Basic Components

Create component files in `src/components/tasks/`:

- `TaskForm.jsx` - Create/Edit form
- `TaskList.jsx` - Table view
- `TaskCard.jsx` - Single task card
- `TaskActions.jsx` - Status action buttons

### 6. Integrate with Dashboard

Update `src/components/Dashboard.jsx`:

```javascript
import { TaskProvider } from '../contexts/TaskContext';
import { TaskList } from './tasks/TaskList';
import { FilterBar } from './filters/FilterBar';

export function Dashboard() {
  return (
    <TaskProvider>
      <div className="container mx-auto p-4">
        <FilterBar />
        <TaskList />
      </div>
    </TaskProvider>
  );
}
```

## File Checklist

| File                                   | Purpose                  | Status |
| -------------------------------------- | ------------------------ | ------ |
| `src/services/db.js`                   | Extend with tasks table  | ✅     |
| `src/services/taskService.js`          | Task CRUD operations     | ✅     |
| `src/contexts/TaskContext.jsx`         | Task state management    | ✅     |
| `src/hooks/useTasks.js`                | Task context hook        | ✅     |
| `src/hooks/useDebounce.js`             | Search debounce          | ✅     |
| `src/utils/constants.js`               | Add task constants       | ✅     |
| `src/utils/validators.js`              | Add task validators      | ✅     |
| `src/utils/formatters.js`              | Date/duration formatting | ✅     |
| `src/components/tasks/TaskForm.jsx`    | Create/Edit form         | ✅     |
| `src/components/tasks/TaskList.jsx`    | Table view               | ✅     |
| `src/components/tasks/TaskCard.jsx`    | Task display card        | ⬜     |
| `src/components/tasks/TaskRow.jsx`     | Table row                | ✅     |
| `src/components/tasks/TaskActions.jsx` | Status buttons           | ✅     |
| `src/components/tasks/TaskModal.jsx`   | Modal wrapper            | ✅     |
| `src/components/tasks/FilterBar.jsx`   | Filter controls          | ✅     |
| `src/components/tasks/SearchInput.jsx` | Debounced search         | ✅     |
| `src/components/tasks/SortSelect.jsx`  | Sort dropdown            | ✅     |
| `src/components/ui/Modal.jsx`          | Reusable modal           | ✅     |
| `src/components/ui/Badge.jsx`          | Priority/status badges   | ✅     |
| `src/components/ui/EmptyState.jsx`     | No tasks message         | ✅     |
| `src/components/ui/ConfirmDialog.jsx`  | Delete confirmation      | ✅     |

## Verification Steps

After implementation, verify:

1. **Create Task**: Click "New Task", fill form, submit → Task appears in list
2. **View List**: Tasks display with correct columns and badges
3. **Edit Task**: Click task, edit fields, save → Changes persisted
4. **Status Flow**: Start → Complete → Re-open cycle works
5. **Delete**: Delete with confirmation → Task removed
6. **Sort**: Click column headers → List reorders
7. **Filter**: Apply status/priority filters → List filters
8. **Search**: Type in search → Results update after 300ms
9. **Persistence**: Refresh page → All data intact
10. **Performance**: Create 100 tasks → List renders < 100ms

## Key References

- **Spec**: `specs/002-task-management/spec.md`
- **Data Model**: `specs/002-task-management/data-model.md`
- **Contracts**: `specs/002-task-management/contracts/task-context.ts`
- **Research**: `specs/002-task-management/research.md`
- **PRD**: `docs/PRD.md` Section 6.2 (Task Management)
