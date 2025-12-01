# Tasks: Today's Focus View

**Input**: Design documents from `/specs/004-todays-focus-view/`  
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓, quickstart.md ✓

**Tests**: Not explicitly requested - tests omitted per specification guidelines.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add Focus View constants and export structure

- [x] T001 [P] Add FOCUS_VIEW_MAX_TASKS, FOCUS_VIEW_TIERS, and FOCUS_TIER_LABELS constants to src/utils/constants.js
- [x] T002 [P] Create src/hooks/useFocusTasks.js skeleton with hook signature and imports

---

## Phase 2: Foundational (Selection Algorithm)

**Purpose**: Core selection logic that ALL user stories depend on - MUST complete before story implementation

**⚠️ CRITICAL**: The selection algorithm is the foundation for the entire Focus View. No UI work can proceed until this is complete.

- [x] T003 Implement getTodayMidnight() date utility function in src/hooks/useFocusTasks.js
- [x] T004 Implement classifyTask(task, today) tier classification logic in src/hooks/useFocusTasks.js
- [x] T005 Implement selectFocusTasks(tasks, userId, limit, offset) selection algorithm in src/hooks/useFocusTasks.js
- [x] T006 Implement calculateDailyProgress(tasks, userId, today) progress computation in src/hooks/useFocusTasks.js
- [x] T007 Wire up useFocusTasks hook with useTasks and useAuth contexts in src/hooks/useFocusTasks.js
- [x] T008 Add useFocusTasks export to src/hooks/useFocusTasks.js

**Checkpoint**: Selection algorithm ready - UI component implementation can now begin

---

## Phase 3: User Story 1 & 2 - View Curated Task List & Smart Selection (Priority: P1) 🎯 MVP

**Goal**: Display up to 10 prioritized tasks with correct tier ordering (overdue → due today → in-progress → high priority)

**Independent Test**: Navigate to Focus View, verify curated list appears with maximum 10 tasks sorted by tier then deadline then createdAt

### Implementation for User Stories 1 & 2

- [x] T009 [P] [US1] Create FocusEmptyState.jsx component shell with "no tasks" variant in src/components/views/FocusEmptyState.jsx
- [x] T010 [P] [US1] Create FocusCard.jsx component shell with task name, priority badge, deadline display in src/components/views/FocusCard.jsx
- [x] T011 [US1] Create FocusView.jsx main container component in src/components/views/FocusView.jsx
- [x] T012 [US1] Integrate useFocusTasks hook into FocusView.jsx for task selection
- [x] T013 [US1] Render FocusCard list with correct tier-based ordering in FocusView.jsx
- [x] T014 [US1] Implement empty state rendering when no qualifying tasks in FocusView.jsx
- [x] T015 [US1] Add FocusView, FocusCard, FocusEmptyState exports to src/components/views/index.js
- [x] T016 [US1] Add Focus View option to Dashboard.jsx view switcher navigation

**Checkpoint**: Users can navigate to Focus View and see their prioritized task list (MVP complete)

---

## Phase 4: User Story 3 - Quick Task Actions (Priority: P2)

**Goal**: Enable Start/Complete actions directly from Focus View cards

**Independent Test**: Click "Start" on pending task → status changes to In Progress; Click "Complete" on in-progress task → task removed from list

### Implementation for User Story 3

- [x] T017 [US3] Add onStart callback prop and "Start" button to FocusCard.jsx for pending tasks
- [x] T018 [US3] Add onComplete callback prop and "Complete" button to FocusCard.jsx for in-progress tasks
- [x] T019 [US3] Implement handleStartTask handler in FocusView.jsx calling updateTask
- [x] T020 [US3] Implement handleCompleteTask handler in FocusView.jsx calling updateTask
- [x] T021 [US3] Wire up action handlers from FocusView to FocusCard components
- [x] T022 [US3] Verify real-time list refresh after status change via TaskContext reactivity

**Checkpoint**: Users can start and complete tasks directly from Focus View

---

## Phase 5: User Story 4 - Daily Progress Tracking (Priority: P2)

**Goal**: Display daily progress indicator showing completed vs total tasks today

**Independent Test**: Complete tasks, verify progress indicator updates showing "X of Y completed"

### Implementation for User Story 4

- [x] T023 [P] [US4] Create FocusProgress.jsx component with progress bar and stats display in src/components/views/FocusProgress.jsx
- [x] T024 [US4] Implement progress percentage calculation and display in FocusProgress.jsx
- [x] T025 [US4] Integrate FocusProgress into FocusView.jsx header area
- [x] T026 [US4] Add "all done" completion state variant to FocusEmptyState.jsx with congratulatory message
- [x] T027 [US4] Implement "Load More" button in completion state when hasMore is true
- [x] T028 [US4] Wire loadMore callback from useFocusTasks to FocusEmptyState component
- [x] T029 [US4] Add FocusProgress export to src/components/views/index.js

**Checkpoint**: Users can see their daily progress and load more tasks after completion

---

## Phase 6: User Story 5 - Task Details Expansion (Priority: P3)

**Goal**: Allow users to expand task cards to view full details inline

**Independent Test**: Click on task card → expands to show description, complexity, tags, estimated duration

### Implementation for User Story 5

- [x] T030 [US5] Add expandedTaskId state to FocusView.jsx
- [x] T031 [US5] Add isExpanded prop and expanded details section to FocusCard.jsx
- [x] T032 [US5] Implement onClick handler to toggle expansion in FocusView.jsx
- [x] T033 [US5] Display description, complexity, tags, estimatedDuration in expanded FocusCard
- [x] T034 [US5] Add collapse behavior when clicking elsewhere or collapse button
- [x] T035 [US5] Style expanded state with smooth transition animation

**Checkpoint**: Users can expand any card to see full task details

---

## Phase 7: User Story 6 - Distraction-Free Design & Keyboard Navigation (Priority: P3)

**Goal**: Clean minimal interface with full keyboard accessibility

**Independent Test**: Navigate Focus View using only keyboard (Tab, Arrow keys, Enter/Space); verify clean layout with large cards

### Implementation for User Story 6

- [x] T036 [US6] Add focusedIndex state and keyboard event handler to FocusView.jsx
- [x] T037 [US6] Implement Arrow Up/Down navigation between cards in FocusView.jsx
- [x] T038 [US6] Implement Enter/Space to trigger primary action (Start or Complete) on focused card
- [x] T039 [US6] Implement Escape to collapse expanded card
- [x] T040 [US6] Add isFocused prop and focus ring styling to FocusCard.jsx
- [x] T041 [US6] Add proper ARIA attributes (role, aria-label, tabIndex) to FocusCard.jsx
- [x] T042 [US6] Style FocusView with large cards, ample spacing, minimal chrome using Tailwind
- [x] T043 [US6] Ensure responsive layout works from 320px to desktop widths

**Checkpoint**: Focus View is fully keyboard accessible with clean, minimal design

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final integration and quality improvements

- [x] T044 [P] Add aria-valuenow and aria-valuemax to FocusProgress for screen readers
- [x] T045 [P] Add loading skeleton state to FocusView.jsx while tasks load
- [x] T046 Verify all edge cases: no tasks, all completed, deadline passing while viewing
- [x] T047 Run quickstart.md validation - verify all integration steps complete
- [x] T048 Performance check: memoize FocusCard with React.memo, verify useMemo dependencies

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup) ─────────────────────────────────┐
                                                  │
Phase 2 (Foundational) ◄─────────────────────────┘
    │
    │ BLOCKS ALL USER STORIES
    ▼
┌─────────────────────────────────────────────────┐
│  Phase 3 (US1+2: P1) ──► MVP COMPLETE           │
│      │                                           │
│      ├── Phase 4 (US3: P2) ──► Quick Actions    │
│      │                                           │
│      ├── Phase 5 (US4: P2) ──► Progress         │
│      │                                           │
│      ├── Phase 6 (US5: P3) ──► Expansion        │
│      │                                           │
│      └── Phase 7 (US6: P3) ──► Keyboard/Design  │
└─────────────────────────────────────────────────┘
    │
    ▼
Phase 8 (Polish)
```

### User Story Dependencies

| Story      | Depends On             | Can Parallel With          |
| ---------- | ---------------------- | -------------------------- |
| US1+2 (P1) | Phase 2 (Foundational) | None - must complete first |
| US3 (P2)   | US1+2 complete         | US4, US5, US6              |
| US4 (P2)   | US1+2 complete         | US3, US5, US6              |
| US5 (P3)   | US1+2 complete         | US3, US4, US6              |
| US6 (P3)   | US1+2 complete         | US3, US4, US5              |

### Parallel Opportunities per Phase

**Phase 1**: T001, T002 can run in parallel (different files)

**Phase 3**: T009, T010 can run in parallel (different component files)

**Phase 5**: T023 can start while T022 completes (different component)

**Phase 8**: T044, T045 can run in parallel (independent improvements)

---

## Implementation Strategy

### MVP Scope (Recommended First Delivery)

Complete through **Phase 3** for a functional Focus View:

- ✅ Selection algorithm working
- ✅ Task list displays with correct priority ordering
- ✅ Empty state handling
- ✅ Navigation integration

**Estimated tasks for MVP**: T001-T016 (16 tasks)

### Incremental Delivery

| Increment | Phases | New Capability              |
| --------- | ------ | --------------------------- |
| MVP       | 1-3    | View prioritized task list  |
| +Actions  | 4      | Start/Complete tasks inline |
| +Progress | 5      | Daily progress tracking     |
| +Details  | 6      | Expand cards for full info  |
| +Polish   | 7-8    | Keyboard nav, accessibility |

---

## Task Count Summary

| Phase        | Tasks  | Story Coverage      |
| ------------ | ------ | ------------------- |
| Setup        | 2      | Infrastructure      |
| Foundational | 6      | Selection Algorithm |
| US1+2 (P1)   | 8      | Core View (MVP)     |
| US3 (P2)     | 6      | Quick Actions       |
| US4 (P2)     | 7      | Progress Tracking   |
| US5 (P3)     | 6      | Task Expansion      |
| US6 (P3)     | 8      | Keyboard/Design     |
| Polish       | 5      | Cross-cutting       |
| **Total**    | **48** | Full Feature        |

---

## Validation Checklist

- [x] All tasks follow checklist format: `- [ ] [ID] [P?] [Story?] Description with file path`
- [x] Tasks organized by user story (US1-US6)
- [x] P1 stories (MVP) come before P2/P3
- [x] Foundational phase blocks all user stories
- [x] Each user story has independent test criteria
- [x] Parallel opportunities marked with [P]
- [x] File paths included in all implementation tasks
