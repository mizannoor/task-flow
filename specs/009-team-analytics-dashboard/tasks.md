# Tasks: Team Analytics Dashboard

**Feature**: 009-team-analytics-dashboard  
**Input**: Design documents from `/specs/009-team-analytics-dashboard/`  
**Prerequisites**: plan.md ✅, spec.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅, research.md ✅

**Tests**: Not explicitly requested in specification. Tasks focus on implementation only.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Constants, shared utilities, and base infrastructure for team analytics

- [X] T001 Add TEAM_ANALYTICS constants to `src/utils/constants.js` (view type, storage keys, default settings)
- [X] T002 [P] Add team analytics color palette constants for chart consistency in `src/utils/constants.js`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core service functions and hook that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 Implement `calculateTeamWorkload()` function in `src/services/analyticsService.js`
- [X] T004 [P] Implement `calculateTeamCompletions()` function in `src/services/analyticsService.js`
- [X] T005 [P] Implement `calculateLeaderboard()` function in `src/services/analyticsService.js`
- [X] T006 [P] Implement `calculateTeamVelocity()` function in `src/services/analyticsService.js`
- [X] T007 [P] Implement `calculateTeamCategoryDistribution()` function in `src/services/analyticsService.js`
- [X] T008 Create `src/hooks/useTeamAnalytics.js` hook with date filtering, memoization, and all team metrics
- [X] T009 Create `src/components/analytics/TeamEmptyState.jsx` component for no-data scenarios
- [X] T010 [P] Create `src/components/analytics/MetricErrorFallback.jsx` for FR-017 error handling with info tooltip

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View Team Workload Distribution (Priority: P1) 🎯 MVP

**Goal**: Display horizontal bar chart showing task counts assigned to each team member

**Independent Test**: Open Team Analytics, verify bar chart shows all users with accurate task counts and tooltips

### Implementation for User Story 1

- [X] T011 [US1] Create `src/components/analytics/TeamWorkloadChart.jsx` with Recharts horizontal BarChart
- [X] T012 [US1] Implement responsive container and proper Y-axis user labels in TeamWorkloadChart
- [X] T013 [US1] Add tooltip showing exact task count, user name, and percentage on hover
- [X] T014 [US1] Ensure users with zero tasks appear with zero-length bars (FR-010)
- [X] T015 [US1] Add loading skeleton state matching chart dimensions

**Checkpoint**: User Story 1 complete - Workload distribution chart is functional and testable independently

---

## Phase 4: User Story 2 - Compare Team Completion Performance (Priority: P1)

**Goal**: Display grouped bar chart showing completed tasks per user with period comparison

**Independent Test**: Open Team Analytics, verify completion chart shows accurate counts per user, period toggle works

### Implementation for User Story 2

- [X] T016 [US2] Create `src/components/analytics/TeamCompletionChart.jsx` with Recharts grouped BarChart
- [X] T017 [US2] Implement bar grouping for current period completions per user
- [X] T018 [US2] Add period toggle control (This Week / Last Week / This Month / Last Month)
- [X] T019 [US2] Implement comparison mode with side-by-side bars for current vs previous period
- [X] T020 [US2] Add tooltip showing completion count and percentage of team total
- [X] T021 [US2] Handle users with zero completions (show zero-height bar, not hidden)

**Checkpoint**: User Story 2 complete - Completion comparison chart is functional and testable independently

---

## Phase 5: User Story 3 - View Team Leaderboard (Priority: P1)

**Goal**: Display ranked table with sortable columns, rank badges, and current user highlighting

**Independent Test**: Open Team Analytics, verify leaderboard shows all users ranked correctly, sorting works, current user highlighted

### Implementation for User Story 3

- [X] T022 [US3] Create `src/components/analytics/TeamLeaderboard.jsx` with sortable table structure
- [X] T023 [US3] Implement rank column with badge emojis (🥇🥈🥉) for top 3 performers (FR-004)
- [X] T024 [US3] Add columns: Rank, User Name, Tasks Completed, Estimation Accuracy %, Current Streak
- [X] T025 [US3] Implement sortable column headers with click handlers for Completed/Accuracy/Streak (FR-014)
- [X] T026 [US3] Add sort indicator icons showing current sort column and direction
- [X] T027 [US3] Implement current user row highlighting with distinct background color (FR-011)
- [X] T028 [US3] Implement tie-breaking logic: accuracy as secondary sort when completions are equal
- [X] T029 [US3] Add ARIA attributes for table accessibility (aria-sort on headers)
- [X] T029a [US3] Implement "Show Top 10" default view with "Show All" expand option for teams with 50+ users

**Checkpoint**: User Story 3 complete - Leaderboard is functional with sorting and highlighting

---

## Phase 6: User Story 4 - Track Team Velocity Over Time (Priority: P2)

**Goal**: Display area chart showing aggregate completions over time with daily/weekly toggle

**Independent Test**: Open Team Analytics, verify velocity chart plots correct data, aggregation toggle works

### Implementation for User Story 4

- [X] T030 [US4] Create `src/components/analytics/TeamVelocityChart.jsx` with Recharts AreaChart
- [X] T031 [US4] Implement daily aggregation mode (default) with date points on X-axis
- [X] T032 [US4] Add aggregation toggle control (Daily / Weekly) in chart header
- [X] T033 [US4] Implement "Show by User" toggle for stacked area mode showing per-user contribution
- [X] T034 [US4] Add tooltip showing exact date and completion count on hover
- [X] T035 [US4] Handle insufficient data scenario (<7 days) with informative message

**Checkpoint**: User Story 4 complete - Velocity trend chart is functional and testable independently

---

## Phase 7: User Story 5 - View Category Distribution by User (Priority: P2)

**Goal**: Display stacked horizontal bar chart showing category breakdown per user

**Independent Test**: Open Team Analytics, verify stacked bars show correct category distribution per user

### Implementation for User Story 5

- [X] T036 [US5] Create `src/components/analytics/TeamCategoryChart.jsx` with Recharts stacked horizontal BarChart
- [X] T037 [US5] Implement stacked segments for Development, Fix, Support categories with distinct colors
- [X] T038 [US5] Add tooltip showing user name, category, task count, and percentage of user total
- [X] T039 [US5] Implement "Show Team Totals" toggle for aggregate summary bar
- [X] T040 [US5] Add legend showing category colors

**Checkpoint**: User Story 5 complete - Category distribution chart is functional and testable independently

---

## Phase 8: User Story 6 - Filter Team Analytics by Date Range (Priority: P2)

**Goal**: Provide global date range filtering that applies to all team charts

**Independent Test**: Select different date ranges, verify all charts update to reflect filtered data

### Implementation for User Story 6

- [X] T041 [US6] Integrate `PeriodFilter` component (reused from personal analytics) in TeamDashboard header
- [X] T042 [US6] Wire date range state from useTeamAnalytics hook to all chart components
- [X] T043 [US6] Implement session persistence of selected date range in localStorage (FR-016)
- [X] T044 [US6] Add custom date range picker for "Custom" option
- [X] T045 [US6] Implement empty state message "No data available for selected period" when date range has no data (FR-015)

**Checkpoint**: User Story 6 complete - Date filtering works globally across all charts

---

## Phase 9: User Story 7 - Access Team Analytics from Navigation (Priority: P3)

**Goal**: Add Team Analytics to main navigation, enabling easy access from Dashboard

**Independent Test**: Click "Team Analytics" in navigation, verify dashboard loads with all charts

### Implementation for User Story 7

- [X] T046 [US7] Add `VIEW_TYPES.TEAM_ANALYTICS` constant to `src/components/Dashboard.jsx`
- [X] T047 [US7] Add "Team Analytics" option to view switcher in Dashboard navigation
- [X] T048 [US7] Create `src/components/analytics/TeamDashboard.jsx` main container component
- [X] T049 [US7] Implement responsive grid layout for all team charts in TeamDashboard
- [X] T050 [US7] Wire TeamDashboard rendering when VIEW_TYPES.TEAM_ANALYTICS is selected
- [X] T051 [US7] Add tab navigation between Personal Analytics and Team Analytics (when on analytics views)
- [X] T052 [US7] Ensure mobile navigation includes Team Analytics option
- [X] T052a [US7] Display "Add more team members to see comparative analytics" message when only 1 user exists in system

**Checkpoint**: User Story 7 complete - Team Analytics is accessible from navigation

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Final integration, exports, and documentation

- [X] T053 [P] Export all team components from `src/components/analytics/index.js`
- [X] T054 [P] Add JSDoc comments to all new functions in analyticsService.js
- [X] T055 Verify error handling with MetricErrorFallback renders "—" with tooltip on calculation failures (FR-017)
- [X] T056 Run quickstart.md validation - verify all documented flows work
- [X] T057 [P] Update README.md with Team Analytics feature documentation

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup) ──────────────────────────────────────┐
                                                       │
Phase 2 (Foundational) ◄───────────────────────────────┘
     │
     │ ⚠️ BLOCKS ALL USER STORIES
     ▼
┌────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  Phase 3 (US1: Workload) ──┬──► Phase 4 (US2: Completions) ───┐    │
│          │                 │                                   │    │
│          │                 └──► Phase 5 (US3: Leaderboard) ───┤    │
│          │                                                     │    │
│          │ Can run in parallel after Phase 2                   │    │
│          │                                                     │    │
│          └──► Phase 6 (US4: Velocity) ────────────────────────┤    │
│          │                                                     │    │
│          └──► Phase 7 (US5: Category) ────────────────────────┤    │
│                                                                │    │
│  Phase 8 (US6: Filtering) ◄────────────────────────────────────┘    │
│          │                                                          │
│          │ Depends on US1-US5 charts existing                       │
│          ▼                                                          │
│  Phase 9 (US7: Navigation) ◄────────────────────────────────────────┘
│          │
│          │ Depends on TeamDashboard having content
│          ▼
│  Phase 10 (Polish)
└────────────────────────────────────────────────────────────────────┘
```

### User Story Dependencies

| User Story | Depends On | Can Start After |
|------------|------------|-----------------|
| US1 (Workload) | Phase 2 | Phase 2 complete |
| US2 (Completions) | Phase 2 | Phase 2 complete |
| US3 (Leaderboard) | Phase 2 | Phase 2 complete |
| US4 (Velocity) | Phase 2 | Phase 2 complete |
| US5 (Category) | Phase 2 | Phase 2 complete |
| US6 (Filtering) | US1-US5 charts | At least one chart exists |
| US7 (Navigation) | US1-US5 | At least one chart exists |

### Parallel Opportunities

**Within Phase 2 (Foundational)**:
```bash
# These can all run in parallel:
T003: calculateTeamWorkload()
T004: calculateTeamCompletions()
T005: calculateLeaderboard()
T006: calculateTeamVelocity()
T007: calculateTeamCategoryDistribution()
T010: MetricErrorFallback.jsx
```

**After Phase 2 (User Stories)**:
```bash
# All P1 stories can run in parallel:
Phase 3 (US1: Workload Chart)
Phase 4 (US2: Completion Chart)
Phase 5 (US3: Leaderboard)

# All P2 stories can run in parallel:
Phase 6 (US4: Velocity Chart)
Phase 7 (US5: Category Chart)
```

---

## Implementation Strategy

### MVP First (P1 Stories Only)

1. Complete Phase 1: Setup (constants)
2. Complete Phase 2: Foundational (service functions + hook)
3. Complete Phase 3: US1 - Workload Chart
4. **VALIDATE**: Workload chart works independently
5. Complete Phase 4: US2 - Completion Chart
6. Complete Phase 5: US3 - Leaderboard
7. Complete Phase 9: US7 - Navigation (partial - just to access dashboard)
8. **MVP READY**: Team leads can see workload, completions, and leaderboard

### Incremental Delivery

| Increment | Stories | Value Delivered |
|-----------|---------|-----------------|
| MVP | US1 + US2 + US3 + US7 (partial) | Core team metrics visible |
| +Velocity | US4 | Trend analysis enabled |
| +Category | US5 | Work type visibility |
| +Filtering | US6 | Period comparison enabled |
| +Polish | Phase 10 | Production-ready |

### Parallel Team Strategy

With 2 developers after Phase 2:

| Developer A | Developer B |
|-------------|-------------|
| US1 (Workload) | US2 (Completions) |
| US3 (Leaderboard) | US4 (Velocity) |
| US6 (Filtering) | US5 (Category) |
| US7 (Navigation) | Phase 10 (Polish) |

---

## Summary

| Metric | Count |
|--------|-------|
| **Total Tasks** | 59 |
| **Phase 1 (Setup)** | 2 |
| **Phase 2 (Foundational)** | 8 |
| **US1 (Workload) - P1** | 5 |
| **US2 (Completions) - P1** | 6 |
| **US3 (Leaderboard) - P1** | 9 |
| **US4 (Velocity) - P2** | 6 |
| **US5 (Category) - P2** | 5 |
| **US6 (Filtering) - P2** | 5 |
| **US7 (Navigation) - P3** | 8 |
| **Phase 10 (Polish)** | 5 |
| **Parallelizable Tasks** | 15 |

### Task Distribution by Story

| Story | Task Count | Priority |
|-------|------------|----------|
| US1 | 5 | P1 |
| US2 | 6 | P1 |
| US3 | 9 | P1 |
| US4 | 6 | P2 |
| US5 | 5 | P2 |
| US6 | 5 | P2 |
| US7 | 8 | P3 |

### MVP Scope

For minimum viable product, complete:
- Phase 1 (2 tasks)
- Phase 2 (8 tasks)
- Phase 3/US1 (5 tasks) - Workload Chart
- Phase 4/US2 (6 tasks) - Completion Chart  
- Phase 5/US3 (8 tasks) - Leaderboard
- Phase 9/US7 partial (3 tasks) - Navigation access

**MVP Total**: ~34 tasks

---

## Notes

- All chart components use Recharts (already installed)
- Reuse `PeriodFilter` from personal analytics (006)
- Reuse `calculateStreak()` and `calculateEstimationAccuracy()` per-user from existing analyticsService
- Error handling per FR-017: show "—" with info tooltip on failures
- All users appear in charts including those with zero tasks (FR-010)
- Leaderboard visibility is mandatory - no opt-out (per clarification)
- Feature name is "Team Analytics" (per clarification)
