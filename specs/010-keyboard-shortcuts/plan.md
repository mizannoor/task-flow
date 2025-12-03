# Implementation Plan: Keyboard Shortcuts

**Branch**: `010-keyboard-shortcuts` | **Date**: December 3, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/010-keyboard-shortcuts/spec.md`

## Summary

Implement comprehensive keyboard shortcuts for power users, enabling rapid task creation (`Ctrl+N`), view switching (`1-4`), task navigation (arrow keys), task actions (`E/D/C/S`), selection (`Space`), search focus (`Ctrl+F`), and a help overlay (`Ctrl+/`). The implementation will create a centralized `useKeyboardShortcuts` hook that integrates with existing view components, extends the Kanban keyboard navigation, and tracks shortcut usage in IndexedDB for personal analytics.

## Technical Context

**Language/Version**: JavaScript ES2022+ (React 18+)  
**Primary Dependencies**: React, Dexie.js (IndexedDB), Tailwind CSS  
**Storage**: IndexedDB via Dexie.js for shortcut usage analytics  
**Testing**: Jest + React Testing Library  
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge)  
**Project Type**: Single web application (client-side only)  
**Performance Goals**: <100ms shortcut response time, <500ms help overlay load  
**Constraints**: Offline-capable, client-side only, WCAG 2.1 AA compliance  
**Scale/Scope**: Support all existing views (List, Kanban, Calendar, Focus)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                     | Status  | Notes                                                                             |
| ----------------------------- | ------- | --------------------------------------------------------------------------------- |
| I. Client-Side First          | ✅ PASS | All shortcuts handled in browser, usage stored in IndexedDB                       |
| II. AI-Augmented Intelligence | ✅ N/A  | Feature does not involve AI                                                       |
| III. Performance Excellence   | ✅ PASS | Shortcuts execute <100ms, memoized handlers                                       |
| IV. Multi-User Experience     | ✅ PASS | Shortcuts work across all users, usage tracked per-user                           |
| V. Data Integrity             | ✅ PASS | Usage events persisted to IndexedDB with validation                               |
| VI. Responsive & Accessible   | ✅ PASS | Keyboard navigation is core accessibility feature, screen reader support included |

**Result**: All gates passed. Proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/010-keyboard-shortcuts/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── keyboard-context.ts  # TypeScript interface definitions
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── Dashboard.jsx           # UPDATE: Add keyboard shortcut provider wrapper
│   ├── ui/
│   │   ├── Modal.jsx           # EXISTING: Used for shortcuts help overlay
│   │   └── KeyboardShortcutsHelp.jsx  # NEW: Help overlay component
│   └── views/
│       ├── KanbanView.jsx      # UPDATE: Integrate with global shortcuts
│       └── ...                 # Other views receive shortcut support
├── contexts/
│   └── KeyboardShortcutContext.jsx  # NEW: Global shortcut state management
├── hooks/
│   ├── useKeyboardShortcuts.js      # NEW: Main keyboard shortcut hook
│   ├── useKanbanKeyboard.js         # UPDATE: Extend for global integration
│   └── useListKeyboard.js           # NEW: List view keyboard navigation
├── services/
│   ├── db.js                   # UPDATE: Add shortcut usage table
│   └── shortcutService.js      # NEW: Shortcut analytics service
└── utils/
    ├── constants.js            # UPDATE: Add shortcut definitions
    └── platformUtils.js        # NEW: Platform detection (Ctrl vs Cmd)

tests/
├── hooks/
│   └── useKeyboardShortcuts.test.js  # NEW: Shortcut hook tests
└── components/
    └── KeyboardShortcutsHelp.test.js # NEW: Help overlay tests
```

**Structure Decision**: Single project structure following existing patterns. New files integrate with existing component/hook/service layers. Keyboard context wraps the application at Dashboard level.

## Complexity Tracking

> No constitution violations requiring justification.

---

## Post-Design Constitution Re-Check

_Re-evaluated after Phase 1 design completion._

| Principle                     | Status  | Design Verification                                                                                                                           |
| ----------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| I. Client-Side First          | ✅ PASS | All shortcuts handled via document event listeners; usage stored in IndexedDB (`shortcutUsage` table); no server calls                        |
| II. AI-Augmented Intelligence | ✅ N/A  | No AI components in this feature                                                                                                              |
| III. Performance Excellence   | ✅ PASS | Event handlers use `useCallback` memoization; shortcut matching is O(n) with small constant array (~15 shortcuts); no DOM queries in hot path |
| IV. Multi-User Experience     | ✅ PASS | Shortcuts work for all users; usage analytics keyed by `userId`; context clears on user switch                                                |
| V. Data Integrity             | ✅ PASS | `ShortcutUsage` has compound index `[userId+shortcutKey+date]` for upsert; daily aggregation prevents unbounded growth; 90-day retention      |
| VI. Responsive & Accessible   | ✅ PASS | ARIA live region for screen reader announcements; help overlay is keyboard-navigable; focus indicators maintained                             |

**Post-Design Result**: All gates passed. Design aligns with Constitution principles.

---

## Generated Artifacts

| Artifact   | Path                                                         | Status      |
| ---------- | ------------------------------------------------------------ | ----------- |
| Research   | `specs/010-keyboard-shortcuts/research.md`                   | ✅ Complete |
| Data Model | `specs/010-keyboard-shortcuts/data-model.md`                 | ✅ Complete |
| Contracts  | `specs/010-keyboard-shortcuts/contracts/keyboard-context.ts` | ✅ Complete |
| Quickstart | `specs/010-keyboard-shortcuts/quickstart.md`                 | ✅ Complete |
| Tasks      | `specs/010-keyboard-shortcuts/tasks.md`                      | ✅ Complete |
