# Tasks: Time Tracking / Task Timer

**Input**: Design documents from `/specs/005-time-tracking/`  
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/timer-types.ts ✓

**Tests**: Not explicitly requested in specification - omitting test tasks per template guidance.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Project type**: Single web application (React + Vite)
- **Source**: `src/` at repository root
- **Tests**: `tests/` at repository root (if needed)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Timer constants, utilities, and database schema preparation

- [X] T001 Add timer constants (TIMER_STATUS, TIMER_CONSTANTS) to `src/utils/constants.js`
- [X] T002 [P] Add duration formatting utilities (formatElapsedTime, formatDurationShort, formatDurationComparison) to `src/utils/formatters.js`
- [X] T003 [P] Add time validation utilities (validateManualTimeEntry) to `src/utils/validators.js`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema migration and timer service - MUST complete before ANY user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Add Dexie.js schema version 3 with timer fields (timerStartedAt index) to `src/services/db.js`
- [X] T005 Add schema upgrade handler to set default timer field values for existing tasks in `src/services/db.js`
- [X] T006 Create timerService.js with calculateElapsedSeconds function in `src/services/timerService.js`
- [X] T007 Add isLongSession threshold check function (240 minutes) to `src/services/timerService.js`
- [X] T008 Add getActiveTimerTask query function to find task with timerStartedAt set in `src/services/timerService.js`

**Checkpoint**: Foundation ready - timer calculation and persistence infrastructure complete

---

## Phase 3: User Story 1 - Start and Track Time (Priority: P1) 🎯 MVP

**Goal**: Users can start a timer on an in-progress task and see elapsed time updating in real-time

**Independent Test**: Start timer on in-progress task → observe HH:MM:SS display incrementing every second

### Implementation for User Story 1

- [X] T009 [US1] Add startTaskTimer function to persist timerStartedAt timestamp in `src/services/timerService.js`
- [X] T010 [US1] Create useTimer hook with timer state management and 1-second interval in `src/hooks/useTimer.js`
- [X] T011 [US1] Implement startTimer action in useTimer hook calling timerService in `src/hooks/useTimer.js`
- [X] T012 [US1] Create TaskTimer component with Start button and HH:MM:SS display in `src/components/tasks/TaskTimer.jsx`
- [X] T013 [US1] Add timer status checking (canStartTimer based on task.status === 'in-progress') to `src/components/tasks/TaskTimer.jsx`
- [X] T014 [US1] Add disabled state with tooltip for non-in-progress tasks in `src/components/tasks/TaskTimer.jsx`
- [X] T015 [US1] Integrate TaskTimer component into TaskDetail expanded view in `src/components/tasks/TaskDetail.jsx`

**Checkpoint**: User Story 1 complete - timer can be started and displays elapsed time

---

## Phase 4: User Story 2 - Pause and Resume Timer (Priority: P1)

**Goal**: Users can pause the timer during interruptions and resume without losing tracked time

**Independent Test**: Start timer → pause → wait 30 seconds → resume → verify pause duration not counted

### Implementation for User Story 2

- [X] T016 [US2] Add pauseTaskTimer function to set timerPausedAt and update accumulatedDuration in `src/services/timerService.js`
- [X] T017 [US2] Add resumeTaskTimer function to clear timerPausedAt and reset timerStartedAt in `src/services/timerService.js`
- [X] T018 [US2] Implement pauseTimer and resumeTimer actions in useTimer hook in `src/hooks/useTimer.js`
- [X] T019 [US2] Update calculateElapsedSeconds to handle paused state (use timerPausedAt instead of Date.now) in `src/services/timerService.js`
- [X] T020 [US2] Add Pause/Resume button toggle to TaskTimer component in `src/components/tasks/TaskTimer.jsx`
- [X] T021 [US2] Add "Paused" visual indicator when timer is paused in `src/components/tasks/TaskTimer.jsx`

**Checkpoint**: User Story 2 complete - timer can be paused and resumed accurately

---

## Phase 5: User Story 3 - Stop Timer and Save Time (Priority: P1)

**Goal**: Users can stop the timer and have tracked time saved to actualDuration

**Independent Test**: Run timer for 5 minutes → stop → verify task.actualDuration increased by 5

### Implementation for User Story 3

- [X] T022 [US3] Add stopTaskTimer function to calculate session total and update actualDuration in `src/services/timerService.js`
- [X] T023 [US3] Add timer field reset (clear timerStartedAt, timerPausedAt, accumulatedDuration) on stop in `src/services/timerService.js`
- [X] T024 [US3] Implement stopTimer action in useTimer hook in `src/hooks/useTimer.js`
- [X] T025 [US3] Add "Stop & Save" button to TaskTimer component in `src/components/tasks/TaskTimer.jsx`
- [X] T026 [US3] Create LongSessionModal component for 4+ hour session review in `src/components/tasks/LongSessionModal.jsx`
- [X] T027 [US3] Add long session detection (>240 min) and modal trigger on stop in `src/components/tasks/TaskTimer.jsx`
- [X] T028 [US3] Add time adjustment input in LongSessionModal before save in `src/components/tasks/LongSessionModal.jsx`
- [ ] T029 [US3] Add timer recovery check on app load in TaskContext provider in `src/contexts/TaskContext.jsx`
- [X] T030 [US3] Create TimerRecoveryModal for abandoned timer sessions in `src/components/tasks/TimerRecoveryModal.jsx`
- [X] T031 [US3] Display total tracked time (actualDuration) in TaskDetail when no timer active in `src/components/tasks/TaskDetail.jsx`

**Checkpoint**: User Story 3 complete - timer saves time and handles edge cases (long sessions, recovery)

---

## Phase 6: User Story 4 - Single Active Timer Enforcement (Priority: P2)

**Goal**: System enforces one timer at a time, auto-stopping previous timer when new one starts

**Independent Test**: Start timer on Task A → start timer on Task B → verify Task A stopped and saved

### Implementation for User Story 4

- [X] T032 [US4] Add activeTaskId tracking to timer context state in `src/hooks/useTimer.js`
- [X] T033 [US4] Modify startTimer to check for existing active timer and auto-stop it in `src/hooks/useTimer.js`
- [X] T034 [US4] Add toast notification when auto-stopping previous timer in `src/hooks/useTimer.js`
- [X] T035 [US4] Add global timer indicator showing active task name in app header in `src/components/Dashboard.jsx`

**Checkpoint**: User Story 4 complete - single active timer enforced with user notification

---

## Phase 7: User Story 5 - View Time Tracking Progress (Priority: P2)

**Goal**: Users can see tracked time compared to estimated time with visual feedback

**Independent Test**: Task with 2h estimate, 1.5h tracked → displays "75%" with progress indicator

### Implementation for User Story 5

- [X] T036 [US5] Add time comparison calculation (percentage, over/under) to `src/utils/formatters.js`
- [X] T037 [US5] Create TimeProgressDisplay component showing tracked vs estimated in `src/components/tasks/TimeProgressDisplay.jsx`
- [X] T038 [US5] Add color-coded indicator (green/yellow/red) for estimate status in `src/components/tasks/TimeProgressDisplay.jsx`
- [X] T039 [US5] Integrate TimeProgressDisplay into TaskTimer (full variant) in `src/components/tasks/TaskTimer.jsx`
- [X] T040 [US5] Add compact time indicator to TaskRow for list view in `src/components/tasks/TaskRow.jsx`
- [X] T041 [P] [US5] Add compact time indicator to KanbanCard for board view in `src/components/views/KanbanCard.jsx`
- [X] T042 [P] [US5] Add compact time indicator to FocusCard for focus view in `src/components/views/FocusCard.jsx`

**Checkpoint**: User Story 5 complete - time progress visible across all views

---

## Phase 8: User Story 6 - Manual Time Entry (Priority: P3)

**Goal**: Users can manually add time to tasks for missed tracking or corrections

**Independent Test**: Click "Add Time" → enter 1h 30m → verify actualDuration increased by 90

### Implementation for User Story 6

- [X] T043 [US6] Add addManualTimeEntry function to timerService in `src/services/timerService.js`
- [X] T044 [US6] Create ManualTimeEntry component with hours/minutes inputs in `src/components/tasks/ManualTimeEntry.jsx`
- [X] T045 [US6] Add validation for manual entry (non-negative, valid numbers) in `src/components/tasks/ManualTimeEntry.jsx`
- [X] T046 [US6] Add "Add Time Manually" button/link to TaskTimer component in `src/components/tasks/TaskTimer.jsx`
- [X] T047 [US6] Show success toast with added time confirmation in `src/components/tasks/ManualTimeEntry.jsx`

**Checkpoint**: User Story 6 complete - manual time entry available as fallback

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Integration, edge cases, and cleanup across all user stories

- [X] T048 Auto-stop timer when task status changes to "completed" in `src/services/taskService.js`
- [X] T049 Handle timer cleanup when task is deleted in `src/services/taskService.js`
- [ ] T050 [P] Handle user account switching - save/restore timer state in `src/contexts/AuthContext.jsx`
- [ ] T051 [P] Add keyboard shortcuts for timer controls (if keyboard shortcuts enabled) in `src/hooks/useTimer.js`
- [X] T052 Ensure timer controls are keyboard accessible (tab navigation, enter/space) in `src/components/tasks/TaskTimer.jsx`
- [X] T053 Add ARIA labels for timer status and controls in `src/components/tasks/TaskTimer.jsx`
- [ ] T054 Run quickstart.md validation - verify all documented scenarios work

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1: Setup ──────────────────┐
                                 │
Phase 2: Foundational ───────────┼──► BLOCKS ALL USER STORIES
                                 │
         ┌───────────────────────┴────────────────────────┐
         │                                                │
         ▼                                                ▼
Phase 3: US1 (Start Timer)           Phase 6: US4 (Single Timer)*
         │                                    │
         ▼                                    │
Phase 4: US2 (Pause/Resume)                   │
         │                                    │
         ▼                                    │
Phase 5: US3 (Stop/Save) ─────────────────────┤
         │                                    │
         ├────────────────────────────────────┤
         │                                    │
         ▼                                    ▼
Phase 7: US5 (Progress Display)    Phase 8: US6 (Manual Entry)
         │                                    │
         └────────────────┬───────────────────┘
                          ▼
               Phase 9: Polish

* US4 can start after Phase 2 but integrates with US1-US3 logic
```

### User Story Dependencies

- **US1 (Start Timer)**: Depends on Phase 2 only - MVP entry point
- **US2 (Pause/Resume)**: Depends on US1 (extends timer controls)
- **US3 (Stop/Save)**: Depends on US2 (completes timer lifecycle)
- **US4 (Single Timer)**: Depends on US1 (wraps startTimer) - can parallel with US2/US3
- **US5 (Progress Display)**: Depends on US3 (needs actualDuration saved)
- **US6 (Manual Entry)**: Independent after Phase 2 - can parallel with US4/US5

### Within Each User Story

1. Service functions before hook actions
2. Hook actions before component UI
3. Core functionality before visual polish
4. Main component before view integrations

### Parallel Opportunities per Phase

**Phase 1 (Setup)**:
```
T002 formatters.js  ─┬─ parallel
T003 validators.js  ─┘
```

**Phase 7 (US5 Progress Display)**:
```
T041 KanbanCard.jsx  ─┬─ parallel (different files)
T042 FocusCard.jsx   ─┘
```

**Phase 9 (Polish)**:
```
T050 AuthContext.jsx ─┬─ parallel (different files)
T051 useTimer.js     ─┘
```

---

## Parallel Example: After Foundational Phase

```bash
# Once Phase 2 completes, these can run in parallel if team capacity allows:

# Developer A: User Stories 1-3 (core timer flow)
T009-T031 in sequence

# Developer B: User Story 4 (single timer enforcement)
T032-T035 in sequence (can start after T011 completes)

# Developer C: User Story 6 (manual entry - independent)
T043-T047 in sequence
```

---

## Implementation Strategy

### MVP First (User Stories 1-3 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T008)
3. Complete Phase 3: US1 - Start Timer (T009-T015)
4. **VALIDATE**: Can start timer and see elapsed time
5. Complete Phase 4: US2 - Pause/Resume (T016-T021)
6. **VALIDATE**: Can pause and resume accurately
7. Complete Phase 5: US3 - Stop/Save (T022-T031)
8. **VALIDATE**: Timer saves to actualDuration, recovery works
9. **MVP COMPLETE** - Core timer functionality ready

### Incremental Delivery

| Increment | User Stories | Value Delivered |
|-----------|--------------|-----------------|
| MVP | US1, US2, US3 | Full timer lifecycle (start/pause/stop/save) |
| +1 | US4 | Single active timer protection |
| +2 | US5 | Time vs estimate comparison |
| +3 | US6 | Manual time entry fallback |
| Final | Polish | Accessibility, keyboard, edge cases |

---

## Task Count Summary

| Phase | Tasks | Parallel |
|-------|-------|----------|
| Phase 1: Setup | 3 | 2 |
| Phase 2: Foundational | 5 | 0 |
| Phase 3: US1 (Start Timer) | 7 | 0 |
| Phase 4: US2 (Pause/Resume) | 6 | 0 |
| Phase 5: US3 (Stop/Save) | 10 | 0 |
| Phase 6: US4 (Single Timer) | 4 | 0 |
| Phase 7: US5 (Progress Display) | 7 | 2 |
| Phase 8: US6 (Manual Entry) | 5 | 0 |
| Phase 9: Polish | 7 | 2 |
| **Total** | **54** | **6** |

---

## Notes

- All tasks follow checklist format: `- [ ] [ID] [P?] [Story?] Description with file path`
- [P] marks parallelizable tasks (different files, no blocking dependencies)
- [US#] marks which user story each task belongs to
- MVP scope: Phases 1-5 (US1, US2, US3) = 31 tasks
- Each phase has a checkpoint for validation
- Timer accuracy relies on timestamp-based calculation (T006), not interval counting
