# Quickstart: Today's Focus View

**Feature**: 004-todays-focus-view  
**Date**: December 1, 2025  
**Phase**: 1 - Design & Contracts

## Overview

This document provides implementation guidance for the Today's Focus View feature. It covers the selection algorithm, component structure, and integration points.

## Core Algorithm: Task Selection

The focus view displays up to 10 tasks selected by this priority algorithm:

```javascript
// Pseudo-code for useFocusTasks hook

function selectFocusTasks(tasks, currentUserId, limit = 10, offset = 0) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Step 1: Filter to current user's non-completed tasks
  const candidates = tasks.filter(
    (task) => task.userId === currentUserId && task.status !== 'completed'
  );

  // Step 2: Classify each task into a tier
  const classified = candidates.map((task) => ({
    ...task,
    selectionTier: classifyTask(task, today),
    tierLabel: getTierLabel(classifyTask(task, today)),
  }));

  // Step 3: Sort by tier, then deadline, then createdAt
  const sorted = classified.sort((a, b) => {
    // Primary: tier (1 > 2 > 3 > 4)
    if (a.selectionTier !== b.selectionTier) {
      return a.selectionTier - b.selectionTier;
    }
    // Secondary: deadline (earliest first, nulls last)
    if (a.deadline && b.deadline) {
      return new Date(a.deadline) - new Date(b.deadline);
    }
    if (a.deadline && !b.deadline) return -1;
    if (!a.deadline && b.deadline) return 1;
    // Tertiary: createdAt (oldest first)
    return new Date(a.createdAt) - new Date(b.createdAt);
  });

  // Step 4: Slice for pagination
  return sorted.slice(offset, offset + limit);
}

function classifyTask(task, today) {
  const deadline = task.deadline ? new Date(task.deadline) : null;
  const deadlineDay = deadline ? new Date(deadline.setHours(0, 0, 0, 0)) : null;

  // Tier 1: Overdue
  if (deadlineDay && deadlineDay < today) {
    return 1;
  }

  // Tier 2: Due Today
  if (deadlineDay && deadlineDay.getTime() === today.getTime()) {
    return 2;
  }

  // Tier 3: In Progress
  if (task.status === 'in-progress') {
    return 3;
  }

  // Tier 4: High/Urgent Priority (pending only)
  if (task.status === 'pending' && ['urgent', 'high'].includes(task.priority)) {
    return 4;
  }

  // Does not qualify for focus view
  return null;
}
```

## Component Architecture

```
FocusView (container)
├── FocusProgress (daily progress bar)
├── FocusCard[] (task cards, max 10)
│   ├── Task name
│   ├── Priority badge
│   ├── Deadline indicator
│   ├── Status actions (Start/Complete)
│   └── Expanded details (collapsible)
└── FocusEmptyState (when no tasks / all done)
    ├── "No tasks" message + Create button
    └── "All done!" message + Load More button
```

## Key Implementation Files

| File                                       | Purpose                                   |
| ------------------------------------------ | ----------------------------------------- |
| `src/hooks/useFocusTasks.js`               | Selection algorithm, progress calculation |
| `src/components/views/FocusView.jsx`       | Main container, keyboard handling         |
| `src/components/views/FocusCard.jsx`       | Individual task card with actions         |
| `src/components/views/FocusProgress.jsx`   | Daily progress indicator                  |
| `src/components/views/FocusEmptyState.jsx` | Empty/completion states                   |
| `src/utils/constants.js`                   | FOCUS*VIEW*\* constants                   |

## Integration Steps

### 1. Add Constants

```javascript
// src/utils/constants.js

// Focus View constants
export const FOCUS_VIEW_MAX_TASKS = 10;
export const FOCUS_VIEW_TIERS = {
  OVERDUE: 1,
  DUE_TODAY: 2,
  IN_PROGRESS: 3,
  HIGH_PRIORITY: 4,
};
export const FOCUS_TIER_LABELS = {
  1: 'Overdue',
  2: 'Due Today',
  3: 'In Progress',
  4: 'High Priority',
};
```

### 2. Create useFocusTasks Hook

```javascript
// src/hooks/useFocusTasks.js

import { useMemo, useState, useCallback } from 'react';
import { useTasks } from './useTasks';
import { useAuth } from './useAuth';
import { FOCUS_VIEW_MAX_TASKS, STATUSES, PRIORITIES } from '../utils/constants';

export function useFocusTasks() {
  const { tasks, loading, error } = useTasks();
  const { currentUser } = useAuth();
  const [offset, setOffset] = useState(0);

  const { focusTasks, progress, hasMore } = useMemo(() => {
    if (!currentUser) return { focusTasks: [], progress: null, hasMore: false };

    // Selection logic here (see algorithm above)
    // ...
  }, [tasks, currentUser, offset]);

  const loadMore = useCallback(() => {
    setOffset((prev) => prev + FOCUS_VIEW_MAX_TASKS);
  }, []);

  return { focusTasks, progress, hasMore, loadMore, loading, error };
}
```

### 3. Create FocusView Component

```jsx
// src/components/views/FocusView.jsx

import { useState, useCallback, useRef, useEffect } from 'react';
import { useFocusTasks } from '../../hooks/useFocusTasks';
import { useTasks } from '../../hooks/useTasks';
import { FocusCard } from './FocusCard';
import { FocusProgress } from './FocusProgress';
import { FocusEmptyState } from './FocusEmptyState';

export function FocusView({ onEditTask, onDeleteTask, onCreateTask }) {
  const { focusTasks, progress, hasMore, loadMore, loading } = useFocusTasks();
  const { updateTask } = useTasks();

  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [focusedIndex, setFocusedIndex] = useState(0);

  // Keyboard navigation handler
  const handleKeyDown = useCallback(
    (e) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((i) => Math.min(i + 1, focusTasks.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((i) => Math.max(i - 1, 0));
          break;
        // ... Enter, Space, Escape handlers
      }
    },
    [focusTasks.length]
  );

  // ... rest of component
}
```

### 4. Update View Exports

```javascript
// src/components/views/index.js

export { KanbanView } from './KanbanView';
export { KanbanCard } from './KanbanCard';
export { KanbanColumn } from './KanbanColumn';
export { KanbanCardPreview } from './KanbanCardPreview';
export { TaskSidePanel } from './TaskSidePanel';

// NEW
export { FocusView } from './FocusView';
export { FocusCard } from './FocusCard';
export { FocusProgress } from './FocusProgress';
export { FocusEmptyState } from './FocusEmptyState';
```

### 5. Add to Navigation

Update the view switcher in Dashboard.jsx to include Focus View option.

## Keyboard Navigation Spec

| Key           | Action                                                     |
| ------------- | ---------------------------------------------------------- |
| Tab           | Move focus to Focus View container                         |
| ↓ Arrow Down  | Move focus to next card                                    |
| ↑ Arrow Up    | Move focus to previous card                                |
| Enter / Space | Primary action (Start if pending, Complete if in-progress) |
| Escape        | Collapse expanded card                                     |

## Testing Strategy

### Unit Tests (useFocusTasks)

1. Verify tier classification for each case
2. Verify sorting order within and across tiers
3. Verify max 10 limit
4. Verify user filtering
5. Verify progress calculation

### Integration Tests (FocusView)

1. Verify keyboard navigation
2. Verify Start action updates status
3. Verify Complete action removes from list
4. Verify empty states display correctly
5. Verify Load More pagination

## Performance Optimizations

1. **Memoize selection**: Use `useMemo` with tasks array dependency
2. **Memoize cards**: Wrap FocusCard in `React.memo`
3. **Stable callbacks**: Use `useCallback` for action handlers
4. **Avoid date re-creation**: Cache today's midnight boundary in useMemo

## Accessibility Checklist

- [ ] Cards have `role="button"` and `aria-label`
- [ ] Focus visible indicator (ring-2 ring-indigo-500)
- [ ] Roving tabindex pattern implemented
- [ ] Progress has `aria-valuenow` and `aria-valuemax`
- [ ] Empty state messages are screen-reader friendly
