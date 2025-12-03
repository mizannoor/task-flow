# Tasks: Keyboard Shortcuts

**Input**: Design documents from `/specs/010-keyboard-shortcuts/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and core keyboard shortcut infrastructure

- [x] T001 Add shortcut constants (contexts, categories, definitions) to src/utils/constants.js
- [x] T002 [P] Create platform detection utilities in src/utils/platformUtils.js
- [x] T003 [P] Update IndexedDB schema to version 4 with shortcutUsage table in src/services/db.js
- [x] T004 Create shortcut analytics service in src/services/shortcutService.js

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core keyboard shortcut context and hook infrastructure that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create KeyboardShortcutContext provider in src/contexts/KeyboardShortcutContext.jsx
- [x] T006 Create useKeyboardShortcuts hook in src/hooks/useKeyboardShortcuts.js
- [x] T007 Add input field detection utility (isInputElement) to src/utils/platformUtils.js
- [x] T008 Add shortcut matching utility (matchShortcut) to src/utils/platformUtils.js
- [x] T009 Add screen reader announcer div to src/components/Dashboard.jsx
- [x] T010 Wrap DashboardContent with KeyboardShortcutProvider in src/components/Dashboard.jsx

**Checkpoint**: Foundation ready - shortcut infrastructure is in place, user story implementation can begin

---

## Phase 3: User Story 1 - Quick Task Creation (Priority: P1) 🎯 MVP

**Goal**: Enable `Ctrl+N` to open task creation modal from anywhere in the application

**Independent Test**: Press `Ctrl+N` from any view → task creation modal opens with name field focused

### Implementation for User Story 1

- [x] T011 [US1] Register 'createTask' action handler in KeyboardShortcutContext to open task modal
- [x] T012 [US1] Add Ctrl+N shortcut handler with preventDefault in useKeyboardShortcuts hook
- [x] T013 [US1] Implement modal state check to ignore Ctrl+N when modal already open in src/contexts/KeyboardShortcutContext.jsx
- [x] T014 [US1] Add auto-focus to task name input when modal opens via shortcut in src/components/tasks/TaskModal.jsx
- [x] T015 [US1] Record shortcut usage for 'ctrl+n' via shortcutService in src/contexts/KeyboardShortcutContext.jsx

**Checkpoint**: User Story 1 complete - users can create tasks via `Ctrl+N` from any view

---

## Phase 4: User Story 2 - View Switching (Priority: P2)

**Goal**: Enable number keys `1-4` to switch between List, Kanban, Calendar, and Focus views

**Independent Test**: Press `1`, `2`, `3`, `4` from any view → application switches to corresponding view

### Implementation for User Story 2

- [x] T016 [US2] Register view switching action handlers (switchToList, switchToKanban, switchToCalendar, switchToFocus) in KeyboardShortcutContext
- [x] T017 [US2] Add number key (1-4) shortcut handlers in useKeyboardShortcuts hook
- [x] T018 [US2] Implement input field detection to disable number shortcuts when typing in src/hooks/useKeyboardShortcuts.js
- [x] T019 [US2] Add same-view check to prevent unnecessary re-renders in src/contexts/KeyboardShortcutContext.jsx
- [x] T020 [US2] Record shortcut usage for view switching via shortcutService

**Checkpoint**: User Story 2 complete - users can switch views with number keys

---

## Phase 5: User Story 3 - Task Navigation (Priority: P3)

**Goal**: Enable arrow keys to navigate between tasks in List view

**Independent Test**: In List view with tasks, press `↑`/`↓` → focus moves between task rows

### Implementation for User Story 3

- [x] T021 [US3] Create useListKeyboard hook for List view navigation in src/hooks/useListKeyboard.js
- [x] T022 [US3] Add focusedTaskId state management to KeyboardShortcutContext
- [x] T023 [US3] Implement arrow key navigation logic in useListKeyboard hook
- [x] T024 [US3] Add task row tabindex and focus styling in src/components/tasks/TaskList.jsx
- [x] T025 [US3] Register task refs for focus management in TaskList component
- [x] T026 [US3] Integrate useListKeyboard with useKanbanKeyboard: share focusedTaskId state via context, align Space/Enter handlers, ensure arrow navigation passes focus between hooks in src/hooks/useKanbanKeyboard.js
- [x] T027 [US3] Record shortcut usage for navigation arrows via shortcutService

**Checkpoint**: User Story 3 complete - users can navigate tasks with arrow keys

---

## Phase 6: User Story 4 - Task Actions (Priority: P4)

**Goal**: Enable single-key shortcuts `E`, `D`, `C`, `S` for task actions when a task is focused

**Independent Test**: Focus a task, press `E` → edit dialog opens; press `S` → task starts

### Implementation for User Story 4

- [x] T028 [US4] Register task action handlers (editTask, deleteTask, completeTask, startTask) in KeyboardShortcutContext
- [x] T029 [US4] Add single-key shortcut handlers (E, D, C, S) in useKeyboardShortcuts hook
- [x] T030 [US4] Implement task-focused context check to only allow actions when task has focus
- [x] T031 [US4] Add status validation (prevent completing already-completed tasks) in action handlers
- [x] T032 [US4] Wire action handlers to existing task mutation functions (useTasks hook) in src/components/Dashboard.jsx
- [x] T033 [US4] Add toast notifications for task action feedback in src/components/Dashboard.jsx
- [x] T034 [US4] Record shortcut usage for task actions via shortcutService

**Checkpoint**: User Story 4 complete - users can edit/delete/complete/start tasks via keyboard

---

## Phase 7: User Story 5 - Task Selection (Priority: P5)

**Goal**: Enable `Space` key to toggle task selection for bulk operations

**Independent Test**: Focus a task, press `Space` → checkbox toggles; press `Escape` → all deselected

### Implementation for User Story 5

- [x] T035 [US5] Register toggleSelect action handler in KeyboardShortcutContext
- [x] T036 [US5] Add Space key shortcut handler in useKeyboardShortcuts hook
- [x] T037 [US5] Implement selection state toggle in useListKeyboard and useKanbanKeyboard hooks
- [x] T038 [US5] Add Escape key handler to clear all selections in src/hooks/useKeyboardShortcuts.js
- [x] T039 [US5] Record shortcut usage for selection via shortcutService

**Checkpoint**: User Story 5 complete - users can select/deselect tasks via keyboard

---

## Phase 8: User Story 6 - Search Focus (Priority: P6)

**Goal**: Enable `Ctrl+F` to focus the search bar from anywhere

**Independent Test**: Press `Ctrl+F` → search bar receives focus; if text present, it's selected

### Implementation for User Story 6

- [x] T040 [US6] Add searchRef prop to KeyboardShortcutProvider in src/contexts/KeyboardShortcutContext.jsx
- [x] T041 [US6] Register focusSearch action handler in KeyboardShortcutContext
- [x] T042 [US6] Add Ctrl+F shortcut handler with preventDefault in useKeyboardShortcuts hook
- [x] T043 [US6] Implement text selection when search already has content in focusSearch handler
- [x] T044 [US6] Add ref to search input component in src/components/Dashboard.jsx
- [x] T045 [US6] Block Ctrl+F when modal is open in src/hooks/useKeyboardShortcuts.js
- [x] T046 [US6] Record shortcut usage for search focus via shortcutService

**Checkpoint**: User Story 6 complete - users can focus search via `Ctrl+F`

---

## Phase 9: User Story 7 - Help Overlay (Priority: P7)

**Goal**: Enable `Ctrl+/` to show keyboard shortcuts help overlay

**Independent Test**: Press `Ctrl+/` → modal shows all shortcuts grouped by category

### Implementation for User Story 7

- [x] T047 [US7] Create KeyboardShortcutsHelp component in src/components/ui/KeyboardShortcutsHelp.jsx
- [x] T048 [US7] Implement shortcut grouping by category in KeyboardShortcutsHelp component
- [x] T049 [US7] Add formatShortcut display function (handles ⌘ vs Ctrl) in src/utils/platformUtils.js
- [x] T050 [US7] Style help overlay with Tailwind CSS in src/components/ui/KeyboardShortcutsHelp.jsx
- [x] T051 [US7] Add Ctrl+/ shortcut handler to toggle help overlay in useKeyboardShortcuts hook
- [x] T052 [US7] Register showHelp and closeHelp action handlers in KeyboardShortcutContext
- [x] T053 [US7] Add KeyboardShortcutsHelp modal to Dashboard component in src/components/Dashboard.jsx
- [x] T054 [US7] Record shortcut usage for help overlay via shortcutService

**Checkpoint**: User Story 7 complete - users can discover shortcuts via `Ctrl+/`

---

## Phase 10: User Story 8 - Escape Key Handling (Priority: P8)

**Goal**: Enable `Escape` to consistently close modals, clear selections, and exit focused states

**Independent Test**: With modal open, press `Escape` → modal closes; with selection, press `Escape` → cleared

### Implementation for User Story 8

- [x] T055 [US8] Register closeOrClear action handler with priority logic in KeyboardShortcutContext
- [x] T056 [US8] Add Escape key handler in useKeyboardShortcuts hook
- [x] T057 [US8] Implement priority handling: modal > selection > search > focus in closeOrClear handler
- [x] T058 [US8] Wire Escape to existing modal close handlers in src/components/Dashboard.jsx
- [x] T059 [US8] Clear search text and blur on Escape when search is focused
- [x] T060 [US8] Record shortcut usage for escape via shortcutService

**Checkpoint**: User Story 8 complete - Escape provides consistent cancel/exit behavior

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T061 [P] Add shortcut hints to tooltips in TaskList action buttons in src/components/tasks/TaskList.jsx
- [x] T062 [P] Add shortcut hints to view switcher buttons in src/components/Dashboard.jsx
- [x] T063 [P] Add shortcut hints to Create Task button in src/components/Dashboard.jsx
- [x] T070 [P] Add toast notifications for view switching confirmation (FR-010) in src/components/Dashboard.jsx
- [x] T064 [P] Implement screen reader announcements for shortcut actions in src/contexts/KeyboardShortcutContext.jsx
- [x] T065 [P] Add ARIA labels to focusable task elements in src/components/tasks/TaskList.jsx
- [x] T066 [P] Add visible focus indicators (ring styles) to all focusable elements
- [ ] T067 Cross-browser testing (Chrome, Firefox, Safari, Edge) for all shortcuts
- [ ] T068 macOS testing for Cmd modifier key behavior
- [ ] T069 Run quickstart.md validation to verify implementation matches guide

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-10)**: All depend on Foundational phase completion
  - Stories can proceed in priority order (P1 → P8)
  - Some stories can be parallelized (see below)
- **Polish (Phase 11)**: Depends on core user stories (US1-US8) being complete

### User Story Dependencies

| Story                 | Can Start After | Notes                                       |
| --------------------- | --------------- | ------------------------------------------- |
| US1 (Task Creation)   | Foundational    | First MVP, no story dependencies            |
| US2 (View Switching)  | Foundational    | Independent of US1                          |
| US3 (Task Navigation) | Foundational    | Independent, adds focus management          |
| US4 (Task Actions)    | US3             | Requires focus management from US3          |
| US5 (Selection)       | US3             | Requires focus management from US3          |
| US6 (Search Focus)    | Foundational    | Independent of other stories                |
| US7 (Help Overlay)    | Foundational    | Independent, but best after shortcuts exist |
| US8 (Escape)          | US1, US5        | Needs modals and selection to test fully    |

### Parallel Opportunities

**Phase 1 (Setup)** - All tasks can run in parallel:

```
T001 (constants) | T002 (platformUtils) | T003 (db schema) | T004 (shortcutService)
```

**After Foundational** - These user stories can run in parallel:

```
US1 (Task Creation) | US2 (View Switching) | US6 (Search Focus) | US7 (Help Overlay)
```

**After US3 (Navigation)** - These can run in parallel:

```
US4 (Task Actions) | US5 (Selection)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (Ctrl+N task creation)
4. **STOP and VALIDATE**: Test Ctrl+N from all views
5. Deploy/demo if ready - MVP delivers immediate value

### Incremental Delivery

1. Setup + Foundational → Infrastructure ready
2. Add US1 (Ctrl+N) → **MVP deployed**
3. Add US2 (1-4 view switching) → View navigation complete
4. Add US3 (arrows) + US4 (E/D/C/S) + US5 (Space) → Full task keyboard control
5. Add US6 (Ctrl+F) + US7 (Ctrl+/) + US8 (Escape) → Complete shortcut system
6. Polish phase → Production ready

### Task Count Summary

| Phase        | Task Count | Parallelizable |
| ------------ | ---------- | -------------- |
| Setup        | 4          | 3              |
| Foundational | 6          | 0              |
| US1          | 5          | 0              |
| US2          | 5          | 0              |
| US3          | 7          | 0              |
| US4          | 7          | 0              |
| US5          | 5          | 0              |
| US6          | 7          | 0              |
| US7          | 8          | 0              |
| US8          | 6          | 0              |
| Polish       | 10         | 7              |
| **Total**    | **70**     | **10**         |

---

## Notes

- [P] tasks = different files, no dependencies between them
- [US#] label maps task to specific user story for traceability
- Each user story should be independently testable after completion
- Commit after each task or logical group
- Test shortcuts after each story phase before proceeding
- Focus management (US3) is prerequisite for task actions (US4) and selection (US5)
