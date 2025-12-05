# Implementation Plan: Bulk Actions

**Branch**: `014-bulk-actions` | **Date**: December 5, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/014-bulk-actions/spec.md`

## Summary

Implement bulk operations for TaskFlow's List view enabling users to select multiple tasks via checkboxes and perform batch operations (delete, status change, reassign, tag management) through a fixed bottom action bar. Builds on existing KeyboardShortcutContext selection state.

## Technical Context

**Language/Version**: JavaScript ES2022+ (React 18)  
**Primary Dependencies**: React, Dexie.js, Tailwind CSS (all existing in project)  
**Storage**: IndexedDB via Dexie.js (existing)  
**Testing**: Manual testing (no test framework per project convention)  
**Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge)
**Project Type**: Single React web application  
**Performance Goals**: Selection toggle <16ms, bulk operation on 500 tasks <2s  
**Constraints**: Maximum 500 task selection, List view only, atomic transactions  
**Scale/Scope**: Support 10,000+ tasks in database, operate on up to 500 at once

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                         | Status  | Notes                                                              |
| --------------------------------- | ------- | ------------------------------------------------------------------ |
| **I. Client-Side First**          | ✅ PASS | All operations use IndexedDB via Dexie.js, no server required      |
| **II. AI-Augmented Intelligence** | ✅ N/A  | Feature does not involve AI                                        |
| **III. Performance Excellence**   | ✅ PASS | Target <100ms for local ops, uses memoization and efficient Set    |
| **IV. Multi-User Experience**     | ✅ PASS | Bulk reassign supports multi-user, selection per session           |
| **V. Data Integrity**             | ✅ PASS | Dexie transactions ensure atomic bulk operations                   |
| **VI. Responsive & Accessible**   | ✅ PASS | Fixed bottom bar adapts to mobile, keyboard shortcuts, ARIA labels |

**Technology Stack Compliance**: ✅ All technologies match constitution requirements (React, Tailwind, Dexie.js, React Context)

## Project Structure

### Documentation (this feature)

```text
specs/014-bulk-actions/
├── plan.md              # This file
├── research.md          # Phase 0 output - technical decisions
├── data-model.md        # Phase 1 output - state entities and relationships
├── quickstart.md        # Phase 1 output - implementation guide
├── contracts/
│   └── bulk-types.ts    # Phase 1 output - TypeScript interfaces
└── tasks.md             # Phase 2 output - implementation tasks
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── tasks/
│   │   ├── TaskList.jsx           # MODIFY - add checkbox column
│   │   ├── TaskRow.jsx            # MODIFY - add row checkbox, selection styling
│   │   ├── BulkActionBar.jsx      # NEW - fixed bottom action bar
│   │   ├── BulkDeleteConfirmModal.jsx    # NEW - delete confirmation
│   │   ├── BulkBlockedWarningModal.jsx   # NEW - blocked task warning
│   │   └── BulkTagModal.jsx       # NEW - tag add/remove modal
│   └── Dashboard.jsx              # MODIFY - integrate action bar
├── contexts/
│   └── KeyboardShortcutContext.jsx # MODIFY - extend selection state
├── services/
│   └── bulkService.js             # NEW - bulk database operations
├── hooks/
│   └── useKeyboardShortcuts.js    # MODIFY - expose new selection actions
├── utils/
│   └── constants.js               # MODIFY - add bulk action constants
└── i18n/
    └── locales/
        ├── en.ts                  # MODIFY - add bulk translations
        └── ms.ts                  # MODIFY - add bulk translations
```

**Structure Decision**: Single web application structure (existing). New components in `tasks/` folder following established patterns. New service file for bulk operations following existing service pattern.

## Complexity Tracking

> No constitution violations requiring justification. All implementations follow existing patterns and technology stack.
