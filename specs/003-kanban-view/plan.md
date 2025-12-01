# Implementation Plan: Kanban View

**Branch**: `003-kanban-view` | **Date**: December 1, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-kanban-view/spec.md`

## Summary

Implement a visual Kanban board view for task management with three columns (Pending, In Progress, Completed), drag-and-drop status changes, task cards with key information, hover previews, collapsible columns, keyboard accessibility, and a slide-out side panel for task details.

## Technical Context

**Language/Version**: JavaScript ES2022+ (React 19.x)  
**Primary Dependencies**: React 19, Tailwind CSS, Dexie.js (existing)  
**Storage**: IndexedDB via Dexie.js (existing infrastructure)  
**Testing**: Vitest + React Testing Library (existing)  
**Target Platform**: Web browsers (320px+ responsive, Chrome/Firefox/Safari)
**Project Type**: Single SPA (frontend-only)  
**Performance Goals**: <1s board load for 500 tasks, <100ms drag-drop operations  
**Constraints**: Offline-capable (except AI), <100ms local operations, 10k tasks scalable  
**Scale/Scope**: Support 10,000+ tasks, 100+ per column without degradation

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                   | Status  | Notes                                                      |
| --------------------------- | ------- | ---------------------------------------------------------- |
| I. Client-Side First        | ✅ PASS | All operations local; drag-drop persists to IndexedDB      |
| II. AI-Augmented            | ✅ N/A  | Kanban view does not involve AI features                   |
| III. Performance Excellence | ✅ PASS | <1s load, <100ms operations; virtualization for 100+ cards |
| IV. Multi-User Experience   | ✅ PASS | Works with existing user filtering and context             |
| V. Data Integrity           | ✅ PASS | Uses existing TaskContext and taskService for persistence  |
| VI. Responsive & Accessible | ✅ PASS | 320px+ support, keyboard nav, touch drag-drop              |

**Gate Status**: ✅ PASSED - All constitution principles satisfied

## Project Structure

### Documentation (this feature)

```text
specs/003-kanban-view/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── kanban-types.ts  # TypeScript interface definitions
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── views/                    # NEW: View components directory
│   │   ├── KanbanView.jsx        # Main Kanban board container
│   │   ├── KanbanColumn.jsx      # Single column component
│   │   ├── KanbanCard.jsx        # Task card component
│   │   ├── KanbanCardPreview.jsx # Hover preview popup
│   │   └── TaskSidePanel.jsx     # Slide-out task detail panel
│   ├── tasks/                    # EXISTING
│   │   └── ... (TaskList, TaskForm, etc.)
│   └── ui/                       # EXISTING
│       └── ... (Badge, Modal, etc.)
├── hooks/
│   ├── useTasks.js               # EXISTING - reuse for data
│   └── useDragAndDrop.js         # NEW: Drag-drop state management
├── contexts/
│   └── TaskContext.jsx           # EXISTING - add updateTaskStatus action
├── utils/
│   └── constants.js              # EXISTING - add Kanban-specific constants
└── styles/
    └── globals.css               # EXISTING - add Kanban-specific styles

tests/
├── components/
│   └── views/
│       ├── KanbanView.test.jsx
│       ├── KanbanColumn.test.jsx
│       └── KanbanCard.test.jsx
└── hooks/
    └── useDragAndDrop.test.js
```

**Structure Decision**: Single SPA structure following existing `/src/components/` pattern. New `views/` subdirectory for view-specific components (Kanban now, Calendar/Focus later). Reuses existing TaskContext, taskService, and constants infrastructure.

## Complexity Tracking

> No constitution violations requiring justification. All features align with established patterns.

## Post-Design Constitution Re-Check

_Re-evaluated after Phase 1 design completion._

| Principle                   | Status  | Design Impact                                                                     |
| --------------------------- | ------- | --------------------------------------------------------------------------------- |
| I. Client-Side First        | ✅ PASS | Native HTML5 drag-drop (zero external dependencies); localStorage for preferences |
| II. AI-Augmented            | ✅ N/A  | No AI features in Kanban view                                                     |
| III. Performance Excellence | ✅ PASS | Windowed virtualization for 100+ cards; optimistic updates; <100ms target         |
| IV. Multi-User Experience   | ✅ PASS | Reuses existing TaskContext user filtering                                        |
| V. Data Integrity           | ✅ PASS | Optimistic updates with rollback on failure; existing taskService                 |
| VI. Responsive & Accessible | ✅ PASS | Roving tabindex keyboard nav; pointer events for touch; 320px+ breakpoints        |

**Post-Design Gate Status**: ✅ PASSED - Design aligns with all constitution principles

## Generated Artifacts

| Artifact   | Path                        | Purpose                             |
| ---------- | --------------------------- | ----------------------------------- |
| Research   | `research.md`               | Technology decisions and patterns   |
| Data Model | `data-model.md`             | UI state entities and relationships |
| Contracts  | `contracts/kanban-types.ts` | TypeScript interface definitions    |
| Quickstart | `quickstart.md`             | Implementation guide and checklist  |

## Next Steps

Run `/speckit.tasks` to generate implementation tasks based on this plan.
