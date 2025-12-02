# Quickstart: Time Tracking / Task Timer

**Feature**: 005-time-tracking  
**Date**: December 1, 2025

## Overview

This guide provides the essential information to start implementing the Time Tracking feature for TaskFlow.

## Prerequisites

- Existing TaskFlow codebase with:
  - React 18+ with Context API
  - Dexie.js for IndexedDB
  - Tailwind CSS for styling
  - Toast notification system
- Familiarity with existing `TaskContext.jsx` and `taskService.js` patterns

## Quick Start Steps

### 1. Update Database Schema

Add timer fields to the Task entity in `src/services/db.js`:

```javascript
// Version 3: Add timer fields
db.version(3).stores({
  users: '&id, &identifier, identifierType, createdAt',
  tasks: '&id, userId, createdBy, status, priority, category, createdAt, deadline, timerStartedAt',
});
```

### 2. Add Timer Constants

Add to `src/utils/constants.js`:

```javascript
export const TIMER_CONSTANTS = {
  DISPLAY_INTERVAL_MS: 1000,
  LONG_SESSION_THRESHOLD_MINUTES: 240,
  MAX_MANUAL_HOURS: 999,
};

export const TIMER_STATUS = {
  IDLE: 'idle',
  RUNNING: 'running',
  PAUSED: 'paused',
};
```

### 3. Add Formatting Utilities

Add to `src/utils/formatters.js`:

```javascript
export function formatElapsedTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function formatDurationShort(minutes) {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
```

### 4. Create Timer Service

Create `src/services/timerService.js` with core functions:

```javascript
export function calculateElapsedSeconds(task) {
  if (!task.timerStartedAt) return 0;

  const startTime = new Date(task.timerStartedAt).getTime();
  const endTime = task.timerPausedAt ? new Date(task.timerPausedAt).getTime() : Date.now();

  const sessionSeconds = Math.floor((endTime - startTime) / 1000);
  const accumulatedSeconds = (task.accumulatedDuration || 0) * 60;

  return sessionSeconds + accumulatedSeconds;
}

export function isLongSession(elapsedMinutes) {
  return elapsedMinutes >= 240; // 4 hours
}
```

### 5. Create useTimer Hook

Create `src/hooks/useTimer.js`:

```javascript
import { useState, useEffect, useRef, useCallback } from 'react';
import { useTasks } from './useTasks';
import * as timerService from '../services/timerService';

export function useTimer(taskId) {
  const { tasks, updateTask } = useTasks();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const intervalRef = useRef(null);

  const task = tasks.find((t) => t.id === taskId);
  const isRunning = task?.timerStartedAt && !task?.timerPausedAt;

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds(timerService.calculateElapsedSeconds(task));
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, task]);

  // ... implement start, pause, resume, stop actions
}
```

### 6. Create TaskTimer Component

Create `src/components/tasks/TaskTimer.jsx`:

```jsx
export function TaskTimer({ task, variant = 'full' }) {
  const { elapsedSeconds, isRunning, isPaused, actions } = useTimer(task.id);

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-lg">{formatElapsedTime(elapsedSeconds)}</span>
      {/* Timer control buttons */}
    </div>
  );
}
```

## Key Implementation Notes

### Timestamp-Based Accuracy

Always calculate elapsed time from `Date.now() - timerStartedAt`, never increment a counter. This ensures accuracy even if the display interval lags.

### Single Active Timer

Before starting a timer, check for any task with `timerStartedAt !== null`. If found, stop and save that timer first, then show a toast notification.

### Long Session Handling

When stopping a timer where `elapsedMinutes >= 240`, show a modal allowing the user to adjust the time before saving.

### Timer Recovery

On app load, query for tasks where `timerStartedAt !== null`. If found, prompt user to save, adjust, or discard the recovered time.

## File Checklist

| File                                       | Action | Purpose                                |
| ------------------------------------------ | ------ | -------------------------------------- |
| `src/services/db.js`                       | Modify | Add schema version 3 with timer fields |
| `src/services/timerService.js`             | Create | Timer business logic                   |
| `src/services/taskService.js`              | Modify | Add timer persistence functions        |
| `src/hooks/useTimer.js`                    | Create | Timer state management hook            |
| `src/contexts/TaskContext.jsx`             | Modify | Add active timer tracking              |
| `src/components/tasks/TaskTimer.jsx`       | Create | Timer display component                |
| `src/components/tasks/ManualTimeEntry.jsx` | Create | Manual time entry form                 |
| `src/components/tasks/TaskDetail.jsx`      | Modify | Integrate timer display                |
| `src/utils/constants.js`                   | Modify | Add timer constants                    |
| `src/utils/formatters.js`                  | Modify | Add duration formatting                |

## Testing Strategy

1. **Unit Tests**: Timer calculation functions, formatting utilities
2. **Hook Tests**: useTimer state transitions, interval management
3. **Integration Tests**: Full timer flow from start to save
4. **Edge Cases**: Browser close recovery, user switching, long sessions

## Common Patterns Reference

### Checking Timer Availability

```javascript
const canStartTimer = task.status === 'in-progress';
const canPauseTimer = task.timerStartedAt && !task.timerPausedAt;
const canResumeTimer = task.timerStartedAt && task.timerPausedAt;
```

### Calculating Session Total

```javascript
const sessionMinutes = Math.ceil(elapsedSeconds / 60);
const newActualDuration = task.actualDuration + sessionMinutes;
```

### Comparison Display

```javascript
const percentage = task.estimatedDuration
  ? Math.round((task.actualDuration / task.estimatedDuration) * 100)
  : null;
const isOverEstimate = percentage > 100;
```
