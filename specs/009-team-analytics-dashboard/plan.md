# Implementation Plan: Team Analytics Dashboard

**Branch**: `009-team-analytics-dashboard` | **Date**: December 2, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-team-analytics-dashboard/spec.md`

## Summary

Implement a Team Analytics Dashboard that displays team-wide productivity metrics including workload distribution, completion comparisons, leaderboard rankings, velocity trends, and category distribution by user. The dashboard extends the existing analytics infrastructure (006-personal-analytics) with team-scoped calculations and visualizations using Recharts. All data is derived from IndexedDB task/user data with real-time updates via React Context.

## Technical Context

**Language/Version**: JavaScript ES2022+ (React 18+)  
**Primary Dependencies**: React Context API, Dexie.js (IndexedDB), Recharts (existing), Tailwind CSS  
**Storage**: IndexedDB via Dexie.js - reads from existing Task and User tables, no schema changes needed  
**Testing**: Vitest + React Testing Library  
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge) - client-side only  
**Project Type**: Web application (single-page React app)  
**Performance Goals**: Dashboard renders in <3 seconds with up to 50 users and 10,000 tasks; chart interactions respond in <200ms  
**Constraints**: Offline-capable, no backend, client-side analytics calculations only  
**Scale/Scope**: Support analytics for 50+ users and 10,000+ tasks; responsive charts from 320px to 2560px width

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                          | Status  | Notes                                                                                                |
| ---------------------------------- | ------- | ---------------------------------------------------------------------------------------------------- |
| I. Client-Side First               | ✅ PASS | All team analytics calculations in browser; reads from IndexedDB; no backend required                |
| II. AI-Augmented Intelligence      | ✅ N/A  | Team Analytics feature does not involve AI                                                           |
| III. Performance Excellence        | ✅ PASS | Memoized calculations; aggregation optimized for multi-user data; <200ms interactions                |
| IV. Multi-User Experience          | ✅ PASS | Aggregates data across ALL users; highlights current user in leaderboard; real-time updates          |
| V. Data Integrity                  | ✅ PASS | Read-only dashboard; no data modifications; derives from existing Task/User schema                   |
| VI. Responsive & Accessible Design | ✅ PASS | Responsive Recharts containers; keyboard-accessible toggles; ARIA labels; mobile-friendly navigation |

**Pre-Design Result**: All applicable gates pass. No violations requiring justification.

## Dependencies

### Required Features (must be implemented first)

1. **006-personal-analytics** - Provides:
   - `analyticsService.js` - Reusable calculation patterns (streak, accuracy, velocity)
   - `useAnalytics.js` - Hook patterns for date filtering and memoization
   - Recharts components patterns (`CategoryChart`, `VelocityChart`, etc.)
   - `PeriodFilter.jsx` - Reusable date range filter component
   - `dateUtils.js` - Date range calculation utilities

### Existing Infrastructure to Leverage

1. **TaskContext** - Provides `tasks` array for all users (filter by userId for personal, aggregate for team)
2. **AuthContext** - Provides `currentUser` for highlighting and `users` list for team roster
3. **Recharts** - Already installed and configured
4. **Tailwind CSS** - Styling system
5. **db.js** - IndexedDB access for users table

## Project Structure

### Documentation (this feature)

```text
specs/009-team-analytics-dashboard/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output (if needed)
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── team-analytics-types.ts   # TypeScript type definitions
├── tasks.md             # Phase 2 output (via /speckit.tasks)
└── checklists/
    └── requirements.md  # Specification checklist
```

### Source Code Changes

```text
src/
├── components/
│   ├── analytics/                        # EXISTING - Extend with team analytics
│   │   ├── index.js                      # MODIFY - Export new team components
│   │   ├── TeamDashboard.jsx             # NEW - Main team dashboard container
│   │   ├── TeamWorkloadChart.jsx         # NEW - Horizontal bar chart (tasks per user)
│   │   ├── TeamCompletionChart.jsx       # NEW - Grouped bar chart (completions per user)
│   │   ├── TeamLeaderboard.jsx           # NEW - Ranked table with sorting
│   │   ├── TeamVelocityChart.jsx         # NEW - Area chart (team velocity over time)
│   │   ├── TeamCategoryChart.jsx         # NEW - Stacked bar chart (category by user)
│   │   └── TeamEmptyState.jsx            # NEW - Empty state for team analytics
│   └── Dashboard.jsx                     # MODIFY - Add Team Analytics view/navigation
├── hooks/
│   └── useTeamAnalytics.js               # NEW - Team analytics calculations hook
├── services/
│   └── analyticsService.js               # MODIFY - Add team calculation functions
└── utils/
    └── constants.js                      # MODIFY - Add team analytics constants

tests/
├── unit/
│   ├── useTeamAnalytics.test.js          # NEW - Team analytics hook tests
│   └── teamAnalyticsService.test.js      # NEW - Team analytics service tests
└── integration/
    └── team-analytics-dashboard.test.js  # NEW - Team dashboard integration tests
```

## Implementation Phases

### Phase 0: Research (Optional)

_Skip if no unknowns exist. Document findings in `research.md`._

**Research Questions**:
- None required - team analytics builds on proven patterns from 006-personal-analytics

### Phase 1: Design

**Deliverables**:
1. `data-model.md` - Team analytics data structures and aggregation logic
2. `quickstart.md` - Developer onboarding guide
3. `contracts/team-analytics-types.ts` - TypeScript interfaces for team metrics

**Key Design Decisions**:

1. **Team Scope Definition**
   - All users in the system constitute "the team" (no explicit team/group entity)
   - Query all tasks, group by `userId` for per-user metrics
   - Aggregate across all users for team totals

2. **Data Aggregation Strategy**
   - Reuse `calculateStreak()`, `calculateEstimationAccuracy()` per user
   - New `calculateTeamWorkload()` - group task counts by userId
   - New `calculateTeamCompletions()` - group completed tasks by userId + date range
   - New `calculateLeaderboard()` - rank users by configurable metric
   - New `calculateTeamVelocity()` - aggregate completions over time (daily/weekly)
   - New `calculateTeamCategoryDistribution()` - category counts per user

3. **Leaderboard Ranking Logic**
   - Primary sort: Selected metric (Completed/Accuracy/Streak)
   - Tie-breaker: Estimation accuracy (higher wins)
   - Default sort: Tasks Completed (descending)

4. **Date Filtering**
   - Reuse `PeriodFilter` component from personal analytics
   - Same presets: Today, This Week, Last Week, This Month, Last Month, Last 30 Days, Custom
   - Filter persisted in session (localStorage for this session)

5. **Error Handling Strategy**
   - Failed metrics show "—" with info tooltip (per clarification)
   - Individual chart failures don't block other charts
   - Graceful degradation for missing user data

### Phase 2: Implementation Tasks

_Tasks will be generated via `/speckit.tasks` based on user stories._

**Task Breakdown by User Story**:

#### US1: Team Workload Distribution (P1) - ~4 hours
- [ ] Implement `calculateTeamWorkload()` in analyticsService.js
- [ ] Create `TeamWorkloadChart.jsx` component (horizontal bar chart)
- [ ] Add unit tests for workload calculation
- [ ] Add integration test for workload chart

#### US2: Team Completion Performance (P1) - ~4 hours
- [ ] Implement `calculateTeamCompletions()` in analyticsService.js
- [ ] Create `TeamCompletionChart.jsx` component (grouped bar chart)
- [ ] Add period comparison mode toggle
- [ ] Add unit tests for completion calculation

#### US3: Team Leaderboard (P1) - ~5 hours
- [ ] Implement `calculateLeaderboard()` in analyticsService.js
- [ ] Create `TeamLeaderboard.jsx` component (sortable table)
- [ ] Add rank badges (🥇🥈🥉) logic
- [ ] Implement sortable column headers
- [ ] Add current user row highlighting
- [ ] Add unit tests for ranking/tie-breaking logic

#### US4: Team Velocity Over Time (P2) - ~3 hours
- [ ] Implement `calculateTeamVelocity()` in analyticsService.js
- [ ] Create `TeamVelocityChart.jsx` component (area chart)
- [ ] Add daily/weekly aggregation toggle
- [ ] Add "Show by User" stacked mode

#### US5: Category Distribution by User (P2) - ~3 hours
- [ ] Implement `calculateTeamCategoryDistribution()` in analyticsService.js
- [ ] Create `TeamCategoryChart.jsx` component (stacked bar chart)
- [ ] Add team totals summary bar option

#### US6: Date Range Filtering (P2) - ~2 hours
- [ ] Create `useTeamAnalytics.js` hook with date filtering
- [ ] Integrate `PeriodFilter` component
- [ ] Ensure filter applies globally to all team charts
- [ ] Persist filter selection in session

#### US7: Navigation Access (P3) - ~2 hours
- [ ] Modify `Dashboard.jsx` to add Team Analytics view
- [ ] Add navigation tab/link between Personal and Team Analytics
- [ ] Ensure mobile navigation accessibility

#### Infrastructure & Integration - ~4 hours
- [ ] Create `TeamDashboard.jsx` main container component
- [ ] Create `TeamEmptyState.jsx` for no-data scenarios
- [ ] Add team analytics constants to `constants.js`
- [ ] Update `analytics/index.js` exports
- [ ] Add FR-017 error handling with fallback UI

**Total Estimated Effort**: ~27 hours (3-4 developer days)

### Phase 3: Verification

**Testing Strategy**:

1. **Unit Tests** (Vitest)
   - `teamAnalyticsService.test.js` - All calculation functions
   - `useTeamAnalytics.test.js` - Hook behavior, memoization, filtering

2. **Integration Tests** (React Testing Library)
   - `team-analytics-dashboard.test.js` - Full dashboard rendering
   - Chart interactions (tooltips, sorting, filtering)
   - Empty state handling
   - Error state handling (FR-017)

3. **Manual Testing Checklist**
   - [ ] Workload chart displays all users including zero-task users
   - [ ] Completion chart updates on period change
   - [ ] Leaderboard sorts correctly by each column
   - [ ] Current user row is highlighted
   - [ ] Velocity chart shows correct aggregation
   - [ ] Category chart segments are accurate
   - [ ] Date filter applies globally
   - [ ] Mobile responsiveness (320px - 768px)
   - [ ] Desktop layouts (768px - 2560px)
   - [ ] Empty states appear when no data
   - [ ] Error fallback ("—") appears for failed calculations

4. **Performance Verification**
   - [ ] Dashboard loads in <3 seconds with 50 users, 10,000 tasks
   - [ ] Chart interactions respond in <200ms
   - [ ] No memory leaks on repeated filter changes

### Phase 4: Documentation

- [ ] Update `README.md` with Team Analytics feature overview
- [ ] Add JSDoc comments to all new functions/components
- [ ] Update `FEATURES.md` to mark Team Statistics as implemented

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Performance degradation with 50+ users | Medium | High | Implement pagination/virtualization for leaderboard; memoize calculations |
| Recharts memory issues with large datasets | Low | Medium | Use data sampling for velocity chart; limit visible data points |
| Date filtering complexity | Low | Low | Reuse proven patterns from personal analytics |
| User deletion edge case | Low | Medium | Exclude deleted users from current analytics; document behavior |

## Success Criteria Mapping

| Success Criteria | Implementation | Verification |
|------------------|----------------|--------------|
| SC-001: <3s dashboard load | Memoized calculations, efficient queries | Performance test with 50 users |
| SC-002: 100% accuracy | Unit tests for all calculations | Test coverage report |
| SC-003: 50 users, 10k tasks | IndexedDB query optimization | Load test with synthetic data |
| SC-004: Identify imbalances in <10s | Clear visual bar chart | UX testing |
| SC-005: <200ms interactions | React memoization, efficient state updates | Performance profiling |
| SC-006: 320px - 2560px responsive | Recharts ResponsiveContainer | Browser testing at breakpoints |
| SC-007: Leaderboard motivation | Gamification elements (badges) | User feedback collection |
| SC-008: Period comparison in <30s | Intuitive filter UI | UX testing |

## Next Steps

1. Run `/speckit.tasks` to generate detailed task breakdown
2. Create feature branch from `main` if not already on `009-team-analytics-dashboard`
3. Begin Phase 1 design deliverables
4. Implement P1 user stories first (US1, US2, US3)
5. Implement P2 stories (US4, US5, US6)
6. Implement P3 story (US7)
7. Complete testing and documentation
