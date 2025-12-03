# Tasks: Calendar View

**Input**: Design documents from `/specs/007-calendar-view/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/calendar-types.ts ✓, quickstart.md ✓

**Tests**: Not explicitly requested in specification - test tasks omitted

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and calendar-specific utilities

- [x] T001 Add calendar-specific constants (CALENDAR_CONSTANTS, VIEW_MODES, DAYS_OF_WEEK) to src/utils/constants.js
- [x] T002 [P] Add calendar date helper functions (getMonthGrid, getWeekGrid, formatDateKey, isToday, isSameDay) to src/utils/dateUtils.js
- [x] T003 [P] Add calendar-specific Tailwind styles (calendar-grid, calendar-cell, today-highlight) to src/styles/globals.css

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core hook and container that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Create useCalendar hook with state management (viewMode, currentDate, selectedDate, sidebarOpen) in src/hooks/useCalendar.js
- [x] T005 Implement localStorage persistence for calendar preferences in src/hooks/useCalendar.js
- [x] T006 Implement navigation functions (goToPrevious, goToNext, goToToday) in useCalendar hook
- [x] T007 Implement getMonthGrid function to generate 42-day grid (6 weeks × 7 days) in useCalendar hook
- [x] T008 Create CalendarView container component with task grouping by date (tasksByDate Map) in src/components/views/CalendarView.jsx
- [x] T009 Integrate useTasks hook for task data access in CalendarView.jsx
- [x] T010 Add CalendarView exports to src/components/views/index.js

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - View Tasks on Monthly Calendar (Priority: P1) 🎯 MVP

**Goal**: Display tasks on a monthly calendar grid positioned by deadline dates with navigation and today highlight

**Independent Test**: Navigate to Calendar view → See month grid with tasks on deadline dates → Navigate between months → Today is highlighted

### Implementation for User Story 1

- [x] T011 [US1] Create CalendarHeader component with month/year display and navigation arrows in src/components/views/CalendarHeader.jsx
- [x] T012 [US1] Implement "Today" quick navigation button in CalendarHeader
- [x] T013 [US1] Create CalendarGrid component with 7-column CSS grid layout in src/components/views/CalendarGrid.jsx
- [x] T014 [US1] Implement day names header row (Sun-Sat) in CalendarGrid
- [x] T015 [US1] Create CalendarCell component for single date display in src/components/views/CalendarCell.jsx
- [x] T016 [US1] Implement today's date visual highlight (distinct background/border) in CalendarCell
- [x] T017 [US1] Implement current month vs adjacent month date styling (muted for adjacent) in CalendarCell
- [x] T018 [US1] Create CalendarTaskIndicator component for task display on calendar in src/components/views/CalendarTaskIndicator.jsx
- [x] T019 [US1] Implement priority color-coding (urgent=red, high=orange, medium=yellow, low=gray) in CalendarTaskIndicator
- [x] T020 [US1] Implement completed task styling (muted/faded with strikethrough) in CalendarTaskIndicator
- [x] T021 [US1] Implement overdue task visual indicator (red border/warning icon) in CalendarTaskIndicator
- [x] T022 [US1] Implement "+N more" overflow indicator when date has >5 tasks in CalendarCell
- [x] T023 [US1] Create TaskOverflowPopover for showing all tasks on overflow click in src/components/views/TaskOverflowPopover.jsx
- [x] T024 [US1] Implement empty calendar state message when no tasks have deadlines
- [x] T025 [US1] Wire up month navigation to update displayed tasks in CalendarView

**Checkpoint**: User Story 1 complete - Monthly calendar displays tasks on deadline dates with full navigation

---

## Phase 4: User Story 2 - Reschedule Tasks via Drag and Drop (Priority: P2)

**Goal**: Enable drag-and-drop rescheduling of task deadlines between dates

**Independent Test**: Drag a task from one date → Drop on another date → Task deadline updates and persists

### Implementation for User Story 2

- [x] T026 [US2] Extend useDragAndDrop hook with calendar-specific drop target handling in src/hooks/useDragAndDrop.js
- [x] T027 [US2] Add data-date attribute to CalendarCell for drop target identification
- [x] T028 [US2] Implement drag initiation from CalendarTaskIndicator (draggable attribute, onDragStart)
- [x] T029 [US2] Implement drop zone visual feedback (highlight) on CalendarCell during drag hover
- [x] T030 [US2] Implement onDrop handler to update task deadline via updateTask in CalendarView
- [x] T031 [US2] Add visual drag preview (ghost element) during drag operation
- [x] T032 [US2] Handle drop outside valid target (revert to original position)
- [x] T033 [US2] Implement cross-month drag (navigate to destination month after drop)
- [x] T034 [US2] Ensure deadline changes persist to IndexedDB immediately after drop

**Checkpoint**: User Story 2 complete - Tasks can be rescheduled by drag-and-drop

---

## Phase 5: User Story 3 - Switch Between Calendar Views (Priority: P3)

**Goal**: Enable switching between Month, Week, and Day view modes with persistent preference

**Independent Test**: Click view mode buttons → Calendar switches between Month/Week/Day → Preference persists on reload

### Implementation for User Story 3

- [x] T035 [US3] Add view mode toggle buttons (Month/Week/Day) to CalendarHeader
- [x] T036 [US3] Create CalendarWeekView component for 7-day week display in src/components/views/CalendarWeekView.jsx
- [x] T037 [US3] Implement getWeekGrid function in useCalendar hook for week date generation
- [x] T038 [US3] Implement week navigation (previous/next week via arrows) in CalendarWeekView
- [x] T039 [US3] Create CalendarDayView component for single day display in src/components/views/CalendarDayView.jsx
- [x] T040 [US3] Implement getDayView function in useCalendar hook
- [x] T041 [US3] Implement day navigation (previous/next day via arrows) in CalendarDayView
- [x] T042 [US3] Display tasks in "due today" section at top of day view (no hourly slots)
- [x] T043 [US3] Update CalendarView to render correct view component based on viewMode
- [x] T044 [US3] Persist view mode preference to localStorage on change

**Checkpoint**: User Story 3 complete - All three view modes functional with persistent preference

---

## Phase 6: User Story 4 - View Task Details from Calendar (Priority: P4)

**Goal**: Click on task to open slide-out side panel with full details and quick actions

**Independent Test**: Click task on calendar → Side panel opens with details → Click actions (Start/Complete/Edit) → Panel closes on Escape/backdrop click

### Implementation for User Story 4

- [x] T045 [US4] Add selectedTask state to CalendarView for tracking clicked task
- [x] T046 [US4] Integrate existing TaskSidePanel component in CalendarView
- [x] T047 [US4] Wire up CalendarTaskIndicator onClick to open TaskSidePanel with task data
- [x] T048 [US4] Implement panel close on backdrop click
- [x] T049 [US4] Implement panel close on Escape key press
- [x] T050 [US4] Implement panel update when clicking different task while panel is open
- [x] T051 [US4] Wire up Start/Complete/Edit action buttons to existing task operations

**Checkpoint**: User Story 4 complete - Task details accessible via side panel from calendar

---

## Phase 7: User Story 5 - Manage Tasks Without Deadlines (Priority: P5)

**Goal**: Display unscheduled tasks in collapsible right sidebar with drag-to-calendar functionality

**Independent Test**: View sidebar with tasks that have no deadline → Drag task from sidebar to calendar date → Task gets deadline and moves to calendar

### Implementation for User Story 5

- [x] T052 [US5] Create UnscheduledSidebar component in src/components/views/UnscheduledSidebar.jsx
- [x] T053 [US5] Filter tasks with null deadline for sidebar display
- [x] T054 [US5] Implement sidebar collapse/expand toggle with visual indicator
- [x] T055 [US5] Set sidebar collapsed by default (per spec clarification)
- [x] T056 [US5] Display unscheduled task count badge on sidebar toggle button in CalendarHeader
- [x] T057 [US5] Implement empty state message when no unscheduled tasks exist
- [x] T058 [US5] Make unscheduled tasks draggable from sidebar
- [x] T059 [US5] Enable drop from sidebar to CalendarCell to set deadline
- [x] T060 [US5] Remove task from sidebar and add to calendar on successful drop
- [x] T061 [US5] Persist sidebar open/closed state to localStorage

**Checkpoint**: User Story 5 complete - Unscheduled tasks visible and can be scheduled via drag

---

## Phase 8: User Story 6 - Visual Priority Indicators on Calendar (Priority: P6)

**Goal**: Enhanced visual priority indicators and overdue task highlighting

**Independent Test**: View calendar with tasks of different priorities → Each shows correct color → Overdue incomplete tasks show warning styling

_Note: Basic priority colors already implemented in US1. This phase adds refinements._

### Implementation for User Story 6

- [x] T062 [US6] Enhance priority color contrast for accessibility (ensure WCAG AA compliance)
- [x] T063 [US6] Add priority legend/key to CalendarHeader or empty state
- [x] T064 [US6] Implement overdue indicator that persists across month navigation
- [x] T065 [US6] Add visual distinction between overdue-incomplete vs overdue-completed tasks

**Checkpoint**: User Story 6 complete - Priority indicators polished and accessible

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, responsiveness, keyboard navigation, and integration testing

- [x] T066 [P] Implement keyboard navigation: arrow keys to move between dates in CalendarGrid
- [x] T067 [P] Implement Enter key to view tasks on selected date
- [x] T068 [P] Implement Tab key to enter/exit calendar grid (roving tabindex)
- [x] T069 [P] Add ARIA labels and roles for screen reader accessibility
- [x] T070 [P] Implement responsive calendar cells for mobile (320px+) in CalendarCell
- [x] T071 [P] Implement touch-based drag-and-drop with long-press (500ms) initiation
- [x] T072 [P] Integrate existing filter functionality (user filter, category, priority) with calendar
- [x] T073 [P] Add calendar route/navigation entry point to main app navigation
- [x] T074 Verify all FR requirements met per spec.md checklist
- [x] T075 Run quickstart.md validation steps

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational) ← BLOCKS all user stories
    ↓
┌───┴───┬───────┬───────┬───────┬───────┐
↓       ↓       ↓       ↓       ↓       ↓
US1     US2     US3     US4     US5     US6
(P1)    (P2)    (P3)    (P4)    (P5)    (P6)
│       │       │       │       │       │
└───┬───┴───────┴───────┴───────┴───────┘
    ↓
Phase 9 (Polish)
```

### User Story Dependencies

| Story    | Depends On                                | Can Run After      |
| -------- | ----------------------------------------- | ------------------ |
| US1 (P1) | Phase 2                                   | Phase 2 completion |
| US2 (P2) | Phase 2, US1 (T018 CalendarTaskIndicator) | US1 T018           |
| US3 (P3) | Phase 2, US1 (T013 CalendarGrid)          | US1 T013           |
| US4 (P4) | Phase 2, US1 (T018 CalendarTaskIndicator) | US1 T018           |
| US5 (P5) | Phase 2, US2 (drag-drop infrastructure)   | US2 completion     |
| US6 (P6) | US1 (priority colors)                     | US1 T019           |

### MVP Delivery Path

For fastest MVP delivery (User Story 1 only):

```
T001 → T002 ⟂ T003 (parallel)
    ↓
T004 → T005 → T006 → T007 → T008 → T009 → T010
    ↓
T011 → T012 → T013 → T014 → T015 → T016 → T017 → T018 → T019 → T020 → T021 → T022 → T023 → T024 → T025
```

**MVP Complete at T025**: Monthly calendar displaying tasks on deadlines with navigation

### Parallel Opportunities

Within each phase, tasks marked [P] can run in parallel:

- **Phase 1**: T002, T003 can run in parallel after T001
- **Phase 9**: T066-T073 can all run in parallel

Between user stories (after Foundational phase):

- US1 and US3 can start in parallel (different components)
- US4 can start once US1 T018 is complete
- US6 can start once US1 T019 is complete

---

## Task Summary

| Phase                 | Task Range | Count  | Focus                                     |
| --------------------- | ---------- | ------ | ----------------------------------------- |
| Phase 1: Setup        | T001-T003  | 3      | Constants, utilities, styles              |
| Phase 2: Foundational | T004-T010  | 7      | useCalendar hook, CalendarView container  |
| Phase 3: US1 (P1)     | T011-T025  | 15     | Monthly calendar display                  |
| Phase 4: US2 (P2)     | T026-T034  | 9      | Drag-and-drop rescheduling                |
| Phase 5: US3 (P3)     | T035-T044  | 10     | View mode switching                       |
| Phase 6: US4 (P4)     | T045-T051  | 7      | Task detail side panel                    |
| Phase 7: US5 (P5)     | T052-T061  | 10     | Unscheduled sidebar                       |
| Phase 8: US6 (P6)     | T062-T065  | 4      | Priority indicator polish                 |
| Phase 9: Polish       | T066-T075  | 10     | Accessibility, responsiveness, validation |
| **Total**             | T001-T075  | **75** |                                           |

---

## Files Created/Modified Summary

### New Files (10)

| File                                           | Created In     |
| ---------------------------------------------- | -------------- |
| src/hooks/useCalendar.js                       | Phase 2 (T004) |
| src/components/views/CalendarView.jsx          | Phase 2 (T008) |
| src/components/views/CalendarHeader.jsx        | Phase 3 (T011) |
| src/components/views/CalendarGrid.jsx          | Phase 3 (T013) |
| src/components/views/CalendarCell.jsx          | Phase 3 (T015) |
| src/components/views/CalendarTaskIndicator.jsx | Phase 3 (T018) |
| src/components/views/TaskOverflowPopover.jsx   | Phase 3 (T023) |
| src/components/views/CalendarWeekView.jsx      | Phase 5 (T036) |
| src/components/views/CalendarDayView.jsx       | Phase 5 (T039) |
| src/components/views/UnscheduledSidebar.jsx    | Phase 7 (T052) |

### Modified Files (5)

| File                          | Modified In    |
| ----------------------------- | -------------- |
| src/utils/constants.js        | Phase 1 (T001) |
| src/utils/dateUtils.js        | Phase 1 (T002) |
| src/styles/globals.css        | Phase 1 (T003) |
| src/hooks/useDragAndDrop.js   | Phase 4 (T026) |
| src/components/views/index.js | Phase 2 (T010) |
