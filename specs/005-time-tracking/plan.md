# Implementation Plan: Time Tracking / Task Timer

**Branch**: `005-time-tracking` | **Date**: December 1, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-time-tracking/spec.md`

## Summary

Implement a built-in timer for tracking actual time spent on tasks with Start/Pause/Resume/Stop controls, timestamp-based elapsed time calculation, IndexedDB persistence across browser sessions, and comparison display against estimated duration. The timer enforces single-active-timer per user and prompts review for sessions exceeding 4 hours.

## Technical Context

**Language/Version**: JavaScript ES2022+ (React 18+)  
**Primary Dependencies**: React Context API, Dexie.js (IndexedDB), Tailwind CSS  
**Storage**: IndexedDB via Dexie.js - extends existing Task table with timer fields  
**Testing**: Vitest + React Testing Library  
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge) - client-side only  
**Project Type**: Web application (single-page React app)  
**Performance Goals**: Timer controls respond in <100ms, timer display updates every 1 second with <1s accuracy  
**Constraints**: Offline-capable, no backend, single active timer per user, client-side only  
**Scale/Scope**: Support 10,000+ tasks, timer state persistence across sessions

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Client-Side First | ✅ PASS | All timer logic executes in browser; IndexedDB stores timer state; no backend required |
| II. AI-Augmented Intelligence | ✅ N/A | Timer feature does not involve AI |
| III. Performance Excellence | ✅ PASS | Timer operations are local (<100ms); timestamp-based calculation ensures accuracy at scale |
| IV. Multi-User Experience | ✅ PASS | Timer state is per-user; user switching saves/restores timer state |
| V. Data Integrity | ✅ PASS | Timer state persists in IndexedDB; validation prevents negative time entries |
| VI. Responsive & Accessible Design | ✅ PASS | Timer controls work across all breakpoints; keyboard accessible |

**Pre-Design Result**: All applicable gates pass. No violations requiring justification.

**Post-Design Re-Check** (December 1, 2025):
- ✅ Data model extends existing Task entity (no new tables) - aligns with V. Data Integrity
- ✅ Timer service uses Dexie.js schema migration - aligns with I. Client-Side First
- ✅ useTimer hook uses standard React patterns - aligns with III. Performance Excellence
- ✅ Type contracts define clear interfaces - supports maintainability

**Final Result**: All gates pass post-design. Ready for Phase 2 task generation.

## Project Structure

### Documentation (this feature)

```text
specs/005-time-tracking/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── timer-types.ts   # TypeScript type definitions
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   └── tasks/
│       ├── TaskTimer.jsx           # NEW - Timer display and controls component
│       ├── TaskDetail.jsx          # MODIFY - Integrate timer display
│       ├── TaskRow.jsx             # MODIFY - Add timer indicator
│       └── ManualTimeEntry.jsx     # NEW - Manual time entry form
├── contexts/
│   └── TaskContext.jsx             # MODIFY - Add timer state and actions
├── hooks/
│   └── useTimer.js                 # NEW - Timer logic hook
├── services/
│   ├── db.js                       # MODIFY - Add timer fields to schema
│   ├── taskService.js              # MODIFY - Add timer persistence functions
│   └── timerService.js             # NEW - Timer-specific business logic
├── utils/
│   ├── constants.js                # MODIFY - Add timer constants
│   └── formatters.js               # MODIFY - Add time formatting utilities
└── styles/
    └── globals.css                 # MODIFY - Timer component styles (if needed)

tests/
├── unit/
│   ├── useTimer.test.js            # NEW - Timer hook tests
│   └── timerService.test.js        # NEW - Timer service tests
└── integration/
    └── timer-flow.test.js          # NEW - Full timer workflow tests
```

**Structure Decision**: Single web application structure following existing PRD Section 5.2 layout. Timer components integrate into existing `/components/tasks/` directory. New `timerService.js` separates timer business logic from task CRUD operations.

## Complexity Tracking

> No violations requiring justification - all Constitution gates pass.
