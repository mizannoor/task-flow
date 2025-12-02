# Implementation Plan: Personal Analytics Dashboard

**Branch**: `006-personal-analytics` | **Date**: December 2, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-personal-analytics/spec.md`

## Summary

Implement a Personal Analytics Dashboard that displays task statistics, estimation accuracy, completion streaks, category/complexity distributions, velocity trends, and time tracking summaries. The dashboard uses Recharts for visualizations, derives all metrics from existing Task data in IndexedDB, and updates in real-time via React Context subscription.

## Technical Context

**Language/Version**: JavaScript ES2022+ (React 18+)  
**Primary Dependencies**: React Context API, Dexie.js (IndexedDB), Recharts (NEW), Tailwind CSS  
**Storage**: IndexedDB via Dexie.js - reads from existing Task table, no schema changes needed  
**Testing**: Vitest + React Testing Library  
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge) - client-side only  
**Project Type**: Web application (single-page React app)  
**Performance Goals**: Dashboard renders in <2 seconds with up to 1,000 tasks; chart interactions respond in <200ms  
**Constraints**: Offline-capable (except AI), no backend, client-side analytics calculations only  
**Scale/Scope**: Support analytics for 10,000+ tasks; responsive charts from 320px to 2560px width

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                          | Status  | Notes                                                                                             |
| ---------------------------------- | ------- | ------------------------------------------------------------------------------------------------- |
| I. Client-Side First               | ✅ PASS | All analytics calculations in browser; reads from IndexedDB; no backend required                  |
| II. AI-Augmented Intelligence      | ✅ N/A  | Analytics feature does not involve AI                                                             |
| III. Performance Excellence        | ✅ PASS | Memoized calculations; Recharts virtualization for large datasets; <100ms local operations        |
| IV. Multi-User Experience          | ✅ PASS | Analytics scoped to current user via `userId` filter; updates on user switch                      |
| V. Data Integrity                  | ✅ PASS | Read-only dashboard; no data modifications; derives from existing Task schema                     |
| VI. Responsive & Accessible Design | ✅ PASS | Responsive Recharts containers; keyboard-accessible toggles; proper ARIA labels on chart elements |

**Pre-Design Result**: All applicable gates pass. No violations requiring justification.

**Post-Design Re-Check** (December 2, 2025):

- ✅ All analytics calculations execute client-side using existing IndexedDB data - aligns with I. Client-Side First
- ✅ No new database schema required; reads from existing Task entity - aligns with V. Data Integrity
- ✅ Recharts with ResponsiveContainer ensures responsive charts (320px+) - aligns with VI. Responsive & Accessible Design
- ✅ useMemo memoization prevents recalculation on every render - aligns with III. Performance Excellence
- ✅ Analytics scoped to currentUser.id; updates on user switch - aligns with IV. Multi-User Experience
- ✅ Recharts 3.0 has built-in accessibility (keyboard nav, screen reader) - aligns with VI. Responsive & Accessible Design

**Final Result**: All gates pass post-design. Ready for Phase 2 task generation.

## Project Structure

### Documentation (this feature)

```text
specs/006-personal-analytics/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── analytics-types.ts   # TypeScript type definitions
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── analytics/                   # NEW - Analytics feature components
│   │   ├── PersonalDashboard.jsx    # NEW - Main dashboard container
│   │   ├── StatCards.jsx            # NEW - Task summary stat cards
│   │   ├── EstimationAccuracy.jsx   # NEW - Accuracy chart + percentage
│   │   ├── StreakDisplay.jsx        # NEW - Current/best streak display
│   │   ├── CategoryChart.jsx        # NEW - Pie chart for categories
│   │   ├── ComplexityChart.jsx      # NEW - Bar chart for complexity
│   │   ├── VelocityChart.jsx        # NEW - Line chart for velocity trend
│   │   ├── TimeTrackedSummary.jsx   # NEW - Total time tracked card
│   │   ├── PeriodFilter.jsx         # NEW - Time period filter dropdown
│   │   └── AnalyticsEmptyState.jsx  # NEW - Empty state when no data
│   └── Dashboard.jsx                # MODIFY - Add analytics navigation link
├── contexts/
│   └── TaskContext.jsx              # EXISTING - Used for task data subscription
├── hooks/
│   └── useAnalytics.js              # NEW - Analytics calculations hook
├── services/
│   └── analyticsService.js          # NEW - Analytics calculation functions
├── utils/
│   ├── constants.js                 # MODIFY - Add analytics constants
│   ├── formatters.js                # MODIFY - Add percentage formatting
│   └── dateUtils.js                 # NEW - Date range helpers for filters
└── styles/
    └── globals.css                  # MODIFY - Analytics component styles (if needed)

tests/
├── unit/
│   ├── useAnalytics.test.js         # NEW - Analytics hook tests
│   ├── analyticsService.test.js     # NEW - Analytics service tests
│   └── dateUtils.test.js            # NEW - Date utility tests
└── integration/
    └── analytics-dashboard.test.js  # NEW - Dashboard integration tests
```

**Structure Decision**: Single web application structure following existing PRD Section 5.2 layout. New `/components/analytics/` directory isolates analytics UI components. `analyticsService.js` contains pure calculation functions, `useAnalytics.js` hook provides reactive data to components.

## Complexity Tracking

> No violations requiring justification - all Constitution gates pass.
