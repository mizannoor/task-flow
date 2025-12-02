# Implementation Plan: Calendar View

**Branch**: `007-calendar-view` | **Date**: December 2, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-calendar-view/spec.md`

## Summary

Implement a visual calendar view for task management with Month/Week/Day views, drag-and-drop deadline rescheduling, priority color-coding, an unscheduled tasks sidebar, and task detail side panel. The calendar positions tasks by their deadline dates with support for navigation, filtering, and keyboard accessibility.

## Technical Context

**Language/Version**: JavaScript ES2022+ (React 19.x)  
**Primary Dependencies**: React 19, Tailwind CSS, Dexie.js (existing)  
**Storage**: IndexedDB via Dexie.js (existing infrastructure)  
**Testing**: Vitest + React Testing Library (existing)  
**Target Platform**: Web browsers (320px+ responsive, Chrome/Firefox/Safari)
**Project Type**: Single SPA (frontend-only)  
**Performance Goals**: <1s calendar load for 500 tasks, <100ms drag-drop operations  
**Constraints**: Offline-capable (except AI), <100ms local operations, 10k tasks scalable  
**Scale/Scope**: Support 10,000+ tasks, display up to 500 tasks per month view

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                   | Status  | Notes                                                           |
| --------------------------- | ------- | --------------------------------------------------------------- |
| I. Client-Side First        | ✅ PASS | All operations local; drag-drop persists to IndexedDB           |
| II. AI-Augmented            | ✅ N/A  | Calendar view does not involve AI features                      |
| III. Performance Excellence | ✅ PASS | <1s load, <100ms operations; task grouping for efficient render |
| IV. Multi-User Experience   | ✅ PASS | Works with existing user filtering and context                  |
| V. Data Integrity           | ✅ PASS | Uses existing TaskContext and taskService for persistence       |
| VI. Responsive & Accessible | ✅ PASS | 320px+ support, keyboard nav, touch drag-drop                   |

**Gate Status**: ✅ PASSED - All constitution principles satisfied

### Post-Design Re-Check (Phase 1 Complete)

| Principle                   | Status  | Design Validation                                           |
| --------------------------- | ------- | ----------------------------------------------------------- |
| I. Client-Side First        | ✅ PASS | No new dependencies; uses existing IndexedDB infrastructure |
| II. AI-Augmented            | ✅ N/A  | No AI features in calendar view                             |
| III. Performance Excellence | ✅ PASS | useMemo for task grouping; CSS Grid for layout efficiency   |
| IV. Multi-User Experience   | ✅ PASS | Reuses existing TaskContext user filtering                  |
| V. Data Integrity           | ✅ PASS | Deadline updates via existing taskService.updateTask()      |
| VI. Responsive & Accessible | ✅ PASS | Roving tabindex; pointer events; 320px+ grid cells          |

**Post-Design Gate Status**: ✅ PASSED - Design maintains constitution compliance

## Project Structure

### Documentation (this feature)

```text
specs/007-calendar-view/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── calendar-types.ts  # TypeScript interface definitions
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── views/                     # EXISTING: View components directory
│   │   ├── CalendarView.jsx       # NEW: Main calendar container
│   │   ├── CalendarHeader.jsx     # NEW: Navigation + view mode toggle
│   │   ├── CalendarGrid.jsx       # NEW: Month grid layout
│   │   ├── CalendarWeekView.jsx   # NEW: Week view layout
│   │   ├── CalendarDayView.jsx    # NEW: Day view layout
│   │   ├── CalendarCell.jsx       # NEW: Single date cell
│   │   ├── CalendarTaskIndicator.jsx # NEW: Task display on calendar
│   │   ├── UnscheduledSidebar.jsx # NEW: Tasks without deadlines panel
│   │   ├── TaskSidePanel.jsx      # EXISTING - reuse from Kanban
│   │   └── index.js               # MODIFY: Add calendar exports
│   └── ui/                        # EXISTING
│       └── ... (Badge, Modal, etc.)
├── hooks/
│   ├── useTasks.js                # EXISTING - reuse for data
│   ├── useDragAndDrop.js          # EXISTING - extend for calendar drop
│   └── useCalendar.js             # NEW: Calendar state management
├── contexts/
│   └── TaskContext.jsx            # EXISTING - use updateTask for deadline changes
├── utils/
│   ├── constants.js               # MODIFY: Add calendar-specific constants
│   └── dateUtils.js               # MODIFY: Add calendar date helpers
└── styles/
    └── globals.css                # MODIFY: Add calendar-specific styles

tests/
├── components/
│   └── views/
│       ├── CalendarView.test.jsx
│       ├── CalendarGrid.test.jsx
│       └── CalendarCell.test.jsx
└── hooks/
    └── useCalendar.test.js
```

**Structure Decision**: Follows existing view component pattern established by Kanban (003-kanban-view). Calendar components placed in `src/components/views/` directory alongside existing KanbanView and FocusView. Reuses existing TaskSidePanel and useDragAndDrop hook with minimal extensions.

## Complexity Tracking

> No constitution violations requiring justification. All principles satisfied.
