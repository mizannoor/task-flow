# Tasks: Personal Analytics Dashboard

**Input**: Design documents from `/specs/006-personal-analytics/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in the feature specification - test tasks are optional/deferred.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths assume single React web app structure per plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and add analytics constants

- [X] T001 Verify Recharts is installed (`npm install recharts` - already done)
- [X] T002 [P] Add analytics constants (DATE_RANGES, PERIOD_LABELS, CATEGORY_COLORS, ANALYTICS_STORAGE_KEY) in src/utils/constants.js
- [X] T003 [P] Add percentage formatting utility in src/utils/formatters.js

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core utilities and services that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Create date range utilities (getDateRange, isDateInRange, formatChartDate) in src/utils/dateUtils.js
- [X] T005 [P] Create calculateTaskSummary function in src/services/analyticsService.js
- [X] T006 [P] Create calculateEstimationAccuracy function (variance-based formula) in src/services/analyticsService.js
- [X] T007 [P] Create calculateStreak function (current and best streak) in src/services/analyticsService.js
- [X] T008 [P] Create calculateCategoryDistribution function in src/services/analyticsService.js
- [X] T009 [P] Create calculateComplexityDistribution function in src/services/analyticsService.js
- [X] T010 [P] Create calculateVelocity function in src/services/analyticsService.js
- [X] T011 [P] Create calculateTimeTracked function in src/services/analyticsService.js
- [X] T012 Create useAnalytics hook with TaskContext subscription and memoization in src/hooks/useAnalytics.js
- [X] T013 Create AnalyticsEmptyState component in src/components/analytics/AnalyticsEmptyState.jsx
- [X] T014 Create PeriodFilter dropdown component in src/components/analytics/PeriodFilter.jsx
- [X] T015 Create PersonalDashboard container component (skeleton layout) in src/components/analytics/PersonalDashboard.jsx
- [X] T016 Add "My Statistics" navigation link in src/components/Dashboard.jsx (per FR-014)

**Checkpoint**: Foundation ready - useAnalytics hook returns data, navigation works, empty state displays

---

## Phase 3: User Story 1 - View Task Summary Statistics (Priority: P1) 🎯 MVP

**Goal**: Display task counts (total, completed, in-progress, pending) in stat cards

**Independent Test**: Create tasks in various statuses, verify dashboard displays accurate counts with real-time updates

### Implementation for User Story 1

- [X] T017 [US1] Create StatCards component with 4 stat cards (Total, Completed, In Progress, Pending) in src/components/analytics/StatCards.jsx
- [X] T018 [US1] Integrate StatCards into PersonalDashboard.jsx, passing summary data from useAnalytics
- [X] T019 [US1] Handle empty state in StatCards (show 0 values with friendly message when no tasks)
- [X] T020 [US1] Verify real-time update: Change a task status and confirm StatCards updates without refresh

**Checkpoint**: User Story 1 complete - StatCards display accurate counts and update in real-time

---

## Phase 4: User Story 2 - Track Estimation Accuracy (Priority: P1)

**Goal**: Display estimation accuracy percentage and trend chart comparing estimated vs actual time

**Independent Test**: Complete tasks with estimated and actual durations, verify accuracy percentage matches formula

### Implementation for User Story 2

- [X] T021 [P] [US2] Create EstimationAccuracy component with percentage display and dual-bar/line comparison chart in src/components/analytics/EstimationAccuracy.jsx
- [X] T022 [US2] Integrate EstimationAccuracy into PersonalDashboard.jsx, passing accuracy data from useAnalytics
- [X] T023 [US2] Handle empty state: Show "Track time on completed tasks to see your estimation accuracy" when no data
- [X] T024 [US2] Add Recharts Tooltip showing exact estimated vs actual values on hover

**Checkpoint**: User Story 2 complete - Accuracy percentage displays correctly with visual comparison

---

## Phase 5: User Story 3 - View Completion Streak (Priority: P2)

**Goal**: Display current streak and best streak with motivational styling

**Independent Test**: Complete tasks on consecutive days, verify streak counter increments correctly

### Implementation for User Story 3

- [X] T025 [P] [US3] Create StreakDisplay component with current streak, best streak, and fire emoji styling in src/components/analytics/StreakDisplay.jsx
- [X] T026 [US3] Integrate StreakDisplay into PersonalDashboard.jsx, passing streak data from useAnalytics
- [X] T027 [US3] Handle new user state: Show "🔥 1 day streak!" with encouragement message
- [X] T028 [US3] Handle broken streak: Show "Current streak: 0 days" and "Best streak: X days"

**Checkpoint**: User Story 3 complete - Streak displays correctly with motivational messaging

---

## Phase 6: User Story 4 - View Category Distribution (Priority: P2)

**Goal**: Display pie chart showing task distribution by category (Development, Fix, Support)

**Independent Test**: Create tasks in different categories, verify pie chart percentages match

### Implementation for User Story 4

- [X] T029 [P] [US4] Create CategoryChart component with Recharts PieChart, custom colors, and legend in src/components/analytics/CategoryChart.jsx
- [X] T030 [US4] Integrate CategoryChart into PersonalDashboard.jsx, passing categoryDistribution from useAnalytics
- [X] T031 [US4] Add Recharts Tooltip showing exact count and percentage on segment hover
- [X] T032 [US4] Handle single-category case: Display 100% pie with appropriate message

**Checkpoint**: User Story 4 complete - Pie chart displays category distribution with tooltips

---

## Phase 7: User Story 5 - View Complexity Distribution (Priority: P2)

**Goal**: Display bar chart showing task counts across complexity levels 1-10 with average

**Independent Test**: Create tasks with various complexity levels, verify bar chart and average calculation

### Implementation for User Story 5

- [X] T033 [P] [US5] Create ComplexityChart component with Recharts BarChart (levels 1-10) and average display in src/components/analytics/ComplexityChart.jsx
- [X] T034 [US5] Integrate ComplexityChart into PersonalDashboard.jsx, passing complexityDistribution from useAnalytics
- [X] T035 [US5] Add Recharts Tooltip showing exact count per complexity level
- [X] T036 [US5] Apply color gradient (green→amber→red) based on complexity level

**Checkpoint**: User Story 5 complete - Bar chart displays complexity distribution with color coding

---

## Phase 8: User Story 6 - View Velocity Trend (Priority: P3)

**Goal**: Display line chart showing tasks completed per day over selected period

**Independent Test**: Complete tasks over multiple days, verify line chart plots correct daily counts

### Implementation for User Story 6

- [X] T037 [P] [US6] Create VelocityChart component with Recharts LineChart showing daily completions in src/components/analytics/VelocityChart.jsx
- [X] T038 [US6] Add daily/weekly view toggle to VelocityChart (aggregate by day or week based on selection)
- [X] T039 [US6] Integrate VelocityChart into PersonalDashboard.jsx, passing velocity data from useAnalytics
- [X] T040 [US6] Add period comparison display (vs previous period percentage change)
- [X] T041 [US6] Handle insufficient data: Show "More data coming as you use TaskFlow" message

**Checkpoint**: User Story 6 complete - Line chart displays velocity trend with period comparison

---

## Phase 9: User Story 7 - View Time Tracked Summary (Priority: P3)

**Goal**: Display total time tracked for selected period with formatted hours/minutes

**Independent Test**: Track time on multiple tasks, verify total matches sum of actualDuration

### Implementation for User Story 7

- [X] T042 [P] [US7] Create TimeTrackedSummary component with total time card and daily average in src/components/analytics/TimeTrackedSummary.jsx
- [X] T043 [US7] Integrate TimeTrackedSummary into PersonalDashboard.jsx, passing timeTracked from useAnalytics
- [X] T044 [US7] Handle zero tracked time: Show "0h 0m" with prompt to start tracking

**Checkpoint**: User Story 7 complete - Time summary displays correctly with formatting

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T045 [P] Ensure all charts use ResponsiveContainer for mobile responsiveness (320px+)
- [X] T046 [P] Add ARIA labels to all chart components for accessibility
- [X] T047 Verify localStorage persistence of selectedDateRange filter across sessions
- [X] T048 Test dashboard load performance with 1,000 task dataset
- [X] T049 [P] Add index.js barrel export for src/components/analytics/ directory
- [X] T050 Run quickstart.md validation - verify all steps work as documented

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - can start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 - BLOCKS all user stories
- **Phases 3-9 (User Stories)**: All depend on Phase 2 completion
  - Can proceed in parallel (P1 → P1 → P2 → P2 → P2 → P3 → P3)
  - Or sequentially by priority
- **Phase 10 (Polish)**: Depends on desired user stories being complete

### User Story Dependencies

- **US1 (Task Summary)**: P1 - Can start after Phase 2 - No dependencies on other stories
- **US2 (Estimation Accuracy)**: P1 - Can start after Phase 2 - No dependencies on other stories
- **US3 (Completion Streak)**: P2 - Can start after Phase 2 - No dependencies on other stories
- **US4 (Category Distribution)**: P2 - Can start after Phase 2 - No dependencies on other stories
- **US5 (Complexity Distribution)**: P2 - Can start after Phase 2 - No dependencies on other stories
- **US6 (Velocity Trend)**: P3 - Can start after Phase 2 - No dependencies on other stories
- **US7 (Time Tracked Summary)**: P3 - Can start after Phase 2 - No dependencies on other stories

### Parallel Opportunities per Phase

**Phase 1**:
```
T002 ─┬─ parallel
T003 ─┘
```

**Phase 2**:
```
T004 (sequential - first)
     ↓
T005 ─┬─ all parallel after T004
T006 ─┤
T007 ─┤
T008 ─┤
T009 ─┤
T010 ─┤
T011 ─┘
     ↓
T012 (depends on T005-T011)
     ↓
T013 ─┬─ parallel
T014 ─┤
T015 ─┤
T016 ─┘
```

**User Stories (after Phase 2)**:
```
US1 ─┬─ all stories can start in parallel
US2 ─┤  (different component files)
US3 ─┤
US4 ─┤
US5 ─┤
US6 ─┤
US7 ─┘
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL)
3. Complete Phase 3: User Story 1 (Task Summary) - P1
4. Complete Phase 4: User Story 2 (Estimation Accuracy) - P1
5. **STOP and VALIDATE**: Both P1 stories independently functional
6. Deploy/demo if ready - users can see task stats and accuracy

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (Task Summary) → Test → Deploy (MVP!)
3. Add US2 (Estimation Accuracy) → Test → Deploy
4. Add US3-US5 (P2 stories) → Test → Deploy
5. Add US6-US7 (P3 stories) → Test → Deploy
6. Each story adds value without breaking previous stories

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Recharts already installed (npm install recharts completed)
- No schema changes required - reads from existing Task entity
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
