# Tasks: Kanban View

**Input**: Design documents from `/specs/003-kanban-view/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Not explicitly requested in specification - test tasks omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root (per plan.md)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and directory structure

- [X] T001 Create views directory structure at src/components/views/
- [X] T002 [P] Add Kanban-specific constants to src/utils/constants.js (KANBAN_STORAGE_KEY, column config)
- [X] T003 [P] Add Kanban-specific Tailwind styles to src/styles/globals.css (drag states, column transitions)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Create useDragAndDrop hook in src/hooks/useDragAndDrop.js with DragState management
- [X] T005 Implement drag handlers (getDragHandlers) in src/hooks/useDragAndDrop.js
- [X] T006 Implement drop handlers (getDropHandlers) in src/hooks/useDragAndDrop.js
- [X] T007 Add groupTasksByStatus utility function to src/utils/formatters.js
- [X] T008 Add sortTasksInColumn utility function to src/utils/formatters.js (priority → deadline → createdAt)

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - View Tasks in Kanban Board (Priority: P1) 🎯 MVP

**Goal**: Display tasks in a three-column Kanban board layout with columns for Pending, In Progress, and Completed statuses

**Independent Test**: Load Kanban view and verify tasks appear in correct columns based on their status

### Implementation for User Story 1

- [X] T009 [P] [US1] Create KanbanCard component in src/components/views/KanbanCard.jsx with basic task display (name only)
- [X] T010 [P] [US1] Create KanbanColumn component in src/components/views/KanbanColumn.jsx with column header and task count badge
- [X] T011 [US1] Create KanbanView component in src/components/views/KanbanView.jsx with three-column layout
- [X] T012 [US1] Integrate useTasks hook in KanbanView to fetch and group tasks by status
- [X] T013 [US1] Implement empty state messaging in KanbanColumn for columns with no tasks
- [X] T014 [US1] Add column scrolling support in KanbanColumn when tasks exceed visible area
- [X] T015 [US1] Integrate KanbanView with Dashboard.jsx (add view toggle between List and Kanban)

**Checkpoint**: User Story 1 complete - Kanban board displays tasks in correct columns

---

## Phase 4: User Story 2 - Change Task Status via Drag and Drop (Priority: P2)

**Goal**: Enable drag-and-drop functionality to move task cards between columns and update status

**Independent Test**: Drag a task from one column to another and verify status updates in IndexedDB

### Implementation for User Story 2

- [X] T016 [US2] Wire useDragAndDrop hook into KanbanView component
- [X] T017 [US2] Add draggable attribute and drag handlers to KanbanCard component
- [X] T018 [US2] Add drop zone handlers to KanbanColumn component
- [X] T019 [US2] Implement visual feedback during drag (ghost card, drop zone highlighting) via CSS classes
- [X] T020 [US2] Implement optimistic status update in KanbanView when card is dropped
- [X] T021 [US2] Call taskService.updateTask on drop to persist status change to IndexedDB
- [X] T022 [US2] Implement rollback animation if status update fails (edge case)
- [X] T023 [US2] Add touch/pointer event support in useDragAndDrop for mobile devices

**Checkpoint**: User Story 2 complete - Drag-drop changes task status and persists to storage

---

## Phase 5: User Story 3 - View Task Details on Card (Priority: P3)

**Goal**: Display key task information on cards (priority badge, assignee, deadline, complexity)

**Independent Test**: View task cards and verify all expected information is visible and color-coded correctly

### Implementation for User Story 3

- [X] T024 [US3] Add priority badge with color-coding to KanbanCard component
- [X] T025 [US3] Add assigned user avatar/initials display to KanbanCard component
- [X] T026 [US3] Add deadline display with overdue warning indicator to KanbanCard component
- [X] T027 [US3] Add complexity indicator to KanbanCard component
- [X] T028 [US3] Create TaskSidePanel component in src/components/views/TaskSidePanel.jsx (portal-based slide-out)
- [X] T029 [US3] Implement slide-in/slide-out animation for TaskSidePanel via CSS transforms
- [X] T030 [US3] Wire card click handler to open TaskSidePanel in KanbanView
- [X] T031 [US3] Add close button and backdrop click handler to TaskSidePanel

**Checkpoint**: User Story 3 complete - Cards show task details, clicking opens side panel

---

## Phase 6: User Story 4 - Quick Task Preview on Hover (Priority: P4)

**Goal**: Show preview popup on hover with extended task details (description, tags, duration)

**Independent Test**: Hover over a card for 500ms and verify preview popup appears with correct content

### Implementation for User Story 4

- [X] T032 [US4] Create KanbanCardPreview component in src/components/views/KanbanCardPreview.jsx
- [X] T033 [US4] Implement 500ms hover delay logic in KanbanCard (useRef + setTimeout)
- [X] T034 [US4] Add preview positioning logic relative to card location
- [X] T035 [US4] Display description, tags, and estimated/actual duration in preview
- [X] T036 [US4] Implement preview close on mouse leave
- [X] T037 [US4] Add long-press support for touch devices (500ms hold to show preview)

**Checkpoint**: User Story 4 complete - Hover previews work on desktop, long-press on mobile

---

## Phase 7: User Story 5 - Sort Tasks Within Columns (Priority: P5)

**Goal**: Automatically sort tasks within columns by priority, then deadline, then creation date

**Independent Test**: Add tasks with different priorities and verify they appear in correct order within each column

### Implementation for User Story 5

- [X] T038 [US5] Verify sortTasksInColumn utility handles priority ordering (Urgent > High > Medium > Low)
- [X] T039 [US5] Verify sortTasksInColumn handles deadline secondary sort (earliest first, null last)
- [X] T040 [US5] Verify sortTasksInColumn handles createdAt tertiary sort (oldest first)
- [X] T041 [US5] Apply sortTasksInColumn to each column in KanbanView before rendering

**Checkpoint**: User Story 5 complete - Tasks sorted correctly within columns

---

## Phase 8: Additional Features (From Clarifications)

**Purpose**: Features added during clarification session

### Column Collapse (FR-016)

- [X] T042 Add collapsedColumns state to KanbanView with localStorage persistence
- [X] T043 Add collapse/expand toggle button to KanbanColumn header
- [X] T044 Implement collapsed column rendering (thin strip with name and count only)
- [X] T045 Implement expand animation with CSS transitions
- [X] T046 Persist collapse state to localStorage on change (key: taskflow_kanban_columns)

### Keyboard Accessibility (FR-014)

- [X] T047 Create useKanbanKeyboard hook in src/hooks/useKanbanKeyboard.js
- [X] T048 Implement roving tabindex pattern in KanbanView
- [X] T049 Add arrow key navigation (← → between columns, ↑ ↓ between cards)
- [X] T050 Add Enter/Space key to open status dropdown on focused card
- [X] T051 Create inline status dropdown component for keyboard status changes
- [X] T052 Add Escape key to close dropdown and return focus to card
- [X] T053 Add ARIA attributes for screen reader support

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T054 [P] Add responsive breakpoints for mobile (320px+) in KanbanView
- [X] T055 [P] Add responsive breakpoints for tablet (640px-1024px) in KanbanView
- [X] T056 [P] Integrate existing FilterBar component into KanbanView
- [X] T057 Performance optimization: implement windowed virtualization for columns with >50 cards
- [X] T058 Run quickstart.md validation checklist
- [X] T059 Create index.js export file for src/components/views/

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
- **Additional Features (Phase 8)**: Depends on User Story 1 (US1) completion
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational - Uses components from US1 but can develop in parallel with US1 late tasks
- **User Story 3 (P3)**: Can start after US1 core components exist (T009, T010, T011)
- **User Story 4 (P4)**: Can start after US3 KanbanCard enhancements (T024-T027)
- **User Story 5 (P5)**: Can start in parallel with US1 (utility functions only)

### Within Each User Story

- Core components before integration
- State management before UI wiring
- Desktop functionality before mobile enhancements

### Parallel Opportunities

```text
Phase 1 (all parallel):
  T001, T002, T003

Phase 2 (sequential):
  T004 → T005 → T006 (same file)
  T007, T008 (parallel with each other, same file so careful)

Phase 3 (User Story 1):
  T009, T010 (parallel - different files)
  T011 (depends on T009, T010)
  T012-T015 (sequential within KanbanView)

Phase 4 (User Story 2):
  T016-T023 (mostly sequential - same components)

Phase 5 (User Story 3):
  T024-T027 (parallel - same file but different sections)
  T028-T031 (sequential - TaskSidePanel)

Phase 6 (User Story 4):
  T032-T037 (sequential - new component)

Phase 7 (User Story 5):
  T038-T041 (sequential - utility verification and integration)

Phase 8:
  Column Collapse (T042-T046) parallel with Keyboard (T047-T053)

Phase 9 (all parallel):
  T054, T055, T056 (different concerns)
```

---

## Parallel Example: User Story 1

```bash
# Launch these tasks in parallel (different files):
Task T009: "Create KanbanCard component in src/components/views/KanbanCard.jsx"
Task T010: "Create KanbanColumn component in src/components/views/KanbanColumn.jsx"

# Then sequentially:
Task T011: "Create KanbanView component" (depends on T009, T010)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T008)
3. Complete Phase 3: User Story 1 (T009-T015)
4. **STOP and VALIDATE**: Test Kanban board displays tasks correctly
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Basic board visible → Deploy/Demo (MVP!)
3. Add User Story 2 → Drag-drop works → Deploy/Demo
4. Add User Story 3 → Rich card info + side panel → Deploy/Demo
5. Add User Story 4 → Hover previews → Deploy/Demo
6. Add User Story 5 → Auto-sorting → Deploy/Demo
7. Add Phase 8 → Collapse + Keyboard → Deploy/Demo
8. Polish → Production ready

### File Creation Order

```text
1. src/utils/constants.js (modify - add KANBAN_STORAGE_KEY)
2. src/utils/formatters.js (modify - add groupTasksByStatus, sortTasksInColumn)
3. src/hooks/useDragAndDrop.js (new)
4. src/components/views/KanbanCard.jsx (new)
5. src/components/views/KanbanColumn.jsx (new)
6. src/components/views/KanbanView.jsx (new)
7. src/components/views/TaskSidePanel.jsx (new)
8. src/components/views/KanbanCardPreview.jsx (new)
9. src/hooks/useKanbanKeyboard.js (new)
10. src/components/views/index.js (new - exports)
11. src/components/Dashboard.jsx (modify - add view toggle)
```

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- No external dependencies needed - all native browser APIs

---

## Summary

| Metric                     | Count                |
| -------------------------- | -------------------- |
| **Total Tasks**            | 59                   |
| **Phase 1 (Setup)**        | 3                    |
| **Phase 2 (Foundational)** | 5                    |
| **User Story 1 (P1)**      | 7                    |
| **User Story 2 (P2)**      | 8                    |
| **User Story 3 (P3)**      | 8                    |
| **User Story 4 (P4)**      | 6                    |
| **User Story 5 (P5)**      | 4                    |
| **Phase 8 (Additional)**   | 12                   |
| **Phase 9 (Polish)**       | 6                    |
| **Parallel Opportunities** | 15 tasks marked [P]  |
| **MVP Scope**              | T001-T015 (15 tasks) |
