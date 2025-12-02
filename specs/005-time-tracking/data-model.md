# Data Model: Time Tracking / Task Timer

**Feature**: 005-time-tracking  
**Date**: December 1, 2025  
**Status**: Complete

## Entity Changes

### Task Entity (Extended)

The existing Task entity is extended with timer-related fields. No new entities are created per clarification (cumulative storage only).

#### New Fields

| Field                 | Type         | Required | Default | Description                                                                  |
| --------------------- | ------------ | -------- | ------- | ---------------------------------------------------------------------------- |
| `timerStartedAt`      | Date \| null | No       | null    | Timestamp when timer was started; null if timer is not running               |
| `timerPausedAt`       | Date \| null | No       | null    | Timestamp when timer was paused; null if not paused                          |
| `accumulatedDuration` | number       | No       | 0       | Minutes accumulated in current session before pause; resets when timer stops |

#### Existing Fields (Used by Timer)

| Field               | Type   | Description                                                    |
| ------------------- | ------ | -------------------------------------------------------------- |
| `actualDuration`    | number | Total tracked time in minutes (cumulative across all sessions) |
| `estimatedDuration` | number | AI or user-provided estimate in minutes                        |
| `status`            | string | Task status; timer only available when "in-progress"           |

### Timer State (Transient)

Application state stored in React Context, not persisted to IndexedDB.

| Field            | Type                            | Description                                                      |
| ---------------- | ------------------------------- | ---------------------------------------------------------------- |
| `activeTaskId`   | string \| null                  | ID of task with currently running timer; null if no timer active |
| `displaySeconds` | number                          | Current elapsed seconds for UI display (updated every second)    |
| `timerStatus`    | 'idle' \| 'running' \| 'paused' | Current timer state for active task                              |

## Schema Migration

### Dexie.js Version Upgrade

```javascript
// db.js - Add version 3 for timer fields
db.version(3).stores({
  users: '&id, &identifier, identifierType, createdAt',
  tasks: '&id, userId, createdBy, status, priority, category, createdAt, deadline, timerStartedAt',
});
```

**Index Note**: `timerStartedAt` indexed to quickly find tasks with active timers on app load.

### Upgrade Handler

```javascript
db.version(3).stores({...}).upgrade(tx => {
  // Set default values for existing tasks
  return tx.table('tasks').toCollection().modify(task => {
    task.timerStartedAt = task.timerStartedAt ?? null;
    task.timerPausedAt = task.timerPausedAt ?? null;
    task.accumulatedDuration = task.accumulatedDuration ?? 0;
  });
});
```

## State Transitions

### Timer State Machine

```
                    ┌─────────────────┐
                    │      IDLE       │
                    │ (not started)   │
                    └────────┬────────┘
                             │ start()
                             ▼
                    ┌─────────────────┐
         resume() ─▶│    RUNNING      │◀─ start()
                    │ (counting time) │
                    └────────┬────────┘
                             │
               ┌─────────────┼─────────────┐
               │ pause()     │ stop()      │ complete()
               ▼             ▼             ▼
      ┌─────────────┐  ┌───────────┐  ┌───────────┐
      │   PAUSED    │  │  STOPPED  │  │ COMPLETED │
      │ (resumable) │  │  (saved)  │  │  (saved)  │
      └─────────────┘  └───────────┘  └───────────┘
               │
               │ stop()
               └───────────▶ STOPPED
```

### Field Updates by Action

| Action       | `timerStartedAt`    | `timerPausedAt`     | `accumulatedDuration`   | `actualDuration`  |
| ------------ | ------------------- | ------------------- | ----------------------- | ----------------- |
| **start**    | Set to `Date.now()` | Clear (null)        | Reset to 0              | No change         |
| **pause**    | No change           | Set to `Date.now()` | Add elapsed since start | No change         |
| **resume**   | Set to `Date.now()` | Clear (null)        | No change               | No change         |
| **stop**     | Clear (null)        | Clear (null)        | Reset to 0              | Add session total |
| **complete** | Clear (null)        | Clear (null)        | Reset to 0              | Add session total |

### Elapsed Time Calculation

```javascript
function calculateElapsedSeconds(task) {
  if (!task.timerStartedAt) return 0;

  const startTime = new Date(task.timerStartedAt).getTime();
  const endTime = task.timerPausedAt ? new Date(task.timerPausedAt).getTime() : Date.now();

  const sessionSeconds = Math.floor((endTime - startTime) / 1000);
  const accumulatedSeconds = (task.accumulatedDuration || 0) * 60;

  return sessionSeconds + accumulatedSeconds;
}
```

## Validation Rules

### Timer Start

- Task status MUST be "in-progress"
- Task MUST exist in database
- No validation on existing `actualDuration` (can track more time)

### Timer Stop/Save

- Session duration MUST be >= 0
- If session > 240 minutes (4 hours), MUST prompt user for review
- Adjusted time MUST be >= 0 and <= calculated elapsed time

### Manual Time Entry

- Hours MUST be >= 0 and <= 999 (reasonable upper bound)
- Minutes MUST be >= 0 and <= 59
- Total added time MUST be > 0 (no zero entries)
- Combined time (hours \* 60 + minutes) added to `actualDuration`

## Relationships

```
User (1) ───────── (0..n) Task
                          │
                          ├── actualDuration (cumulative)
                          ├── estimatedDuration (static)
                          ├── timerStartedAt (active session)
                          ├── timerPausedAt (paused session)
                          └── accumulatedDuration (paused accumulator)
```

## Data Integrity Constraints

1. **Single Active Timer**: If `timerStartedAt` is not null for Task A, starting timer on Task B must first stop and save Task A's timer
2. **Pause Consistency**: `timerPausedAt` can only be set if `timerStartedAt` is set
3. **Accumulation**: `accumulatedDuration` is only non-zero when timer is paused
4. **Status Guard**: Timer operations only allowed when task `status === 'in-progress'`
5. **Non-Negative Duration**: `actualDuration` and `accumulatedDuration` must always be >= 0
