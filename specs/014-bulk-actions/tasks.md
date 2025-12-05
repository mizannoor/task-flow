# Tasks: Bulk Actions

**Feature**: 014-bulk-actions  
**Input**: Design documents from `/specs/014-bulk-actions/`  
**Prerequisites**: plan.md ✅, spec.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅, research.md ✅

**Tests**: Not explicitly requested in specification. Tasks focus on implementation only.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Constants, shared utilities, and base infrastructure for bulk actions

- [x] T001 Add BULK_ACTIONS constants (MAX_SELECTION: 500, WARNING_THRESHOLD: 100) to `src/utils/constants.js`
- [x] T002 [P] Add bulk action keyboard shortcuts to KEYBOARD_SHORTCUTS array (selectAllTasks, bulkDelete) in `src/utils/constants.js`
- [x] T003 [P] Add bulk action i18n keys to `src/i18n/locales/en.js` (bulk.selected, bulk.delete._, bulk.status._, bulk.reassign._, bulk.tags._)
- [x] T004 [P] Add bulk action i18n keys to `src/i18n/locales/ms.js` (translations for all bulk.\* keys)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core service functions and context extensions that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create `src/services/bulkService.js` with bulkDeleteTasks function using Dexie transaction
- [x] T006 [P] Add bulkUpdateStatus function to `src/services/bulkService.js` with completedAt handling
- [x] T007 [P] Add bulkReassignTasks function to `src/services/bulkService.js`
- [x] T008 [P] Add bulkAddTags and bulkRemoveTags functions to `src/services/bulkService.js`
- [x] T009 [P] Add getBlockedTaskIds helper function to `src/services/bulkService.js` for dependency checking
- [x] T010 Add lastClickedTaskId state to reducer in `src/contexts/KeyboardShortcutContext.jsx`
- [x] T011 Add SET_LAST_CLICKED, SELECT_ALL, ADD_TO_SELECTION action types to `src/contexts/KeyboardShortcutContext.jsx`
- [x] T012 Implement selectAll action (with 500 limit enforcement) in `src/contexts/KeyboardShortcutContext.jsx`
- [x] T013 Implement addToSelection action in `src/contexts/KeyboardShortcutContext.jsx`
- [x] T014 Implement selectRange action with visible task array parameter in `src/contexts/KeyboardShortcutContext.jsx`
- [x] T015 Implement setLastClicked action in `src/contexts/KeyboardShortcutContext.jsx`
- [x] T016 Export new selection actions from `src/hooks/useKeyboardShortcuts.js`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Select Multiple Tasks (Priority: P1) 🎯 MVP

**Goal**: Enable checkbox-based multi-selection in List view with visual feedback

**Independent Test**: Click checkboxes on tasks, verify selection highlighting and count display; use Shift+click for range; press Escape to clear

### Implementation for User Story 1

- [x] T017 [US1] Add checkbox column header with Select All checkbox to table in `src/components/tasks/TaskList.jsx`
- [x] T018 [US1] Import and use selection state/actions from useKeyboardShortcuts in `src/components/tasks/TaskList.jsx`
- [x] T019 [US1] Add checkbox to each task row in `src/components/tasks/TaskRow.jsx`
- [x] T020 [US1] Implement onClick handler for checkbox with Shift+click range detection in `src/components/tasks/TaskRow.jsx`
- [x] T021 [US1] Add selected row highlighting styles (bg-blue-50 dark:bg-blue-900/30) to `src/components/tasks/TaskRow.jsx`
- [x] T022 [US1] Implement handleCheckboxClick with lastClicked tracking in `src/components/tasks/TaskList.jsx`
- [x] T023 [US1] Add effect to clear selections when filters change in `src/components/tasks/TaskList.jsx`
- [x] T024 [US1] Add selection count display above task list in `src/components/tasks/TaskList.jsx`
- [x] T024a [US1] Ensure selectedTaskIds persists across pagination page changes (store in context, not local state) in `src/components/tasks/TaskList.jsx` [FR-007]
- [x] T025 [US1] Add ARIA labels to checkboxes (aria-label for row checkbox, aria-checked) in `src/components/tasks/TaskRow.jsx`

**Checkpoint**: User Story 1 complete - users can select/deselect tasks with visual feedback

---

## Phase 4: User Story 6 - Bulk Action Bar UI (Priority: P1)

**Goal**: Display contextual action bar fixed to bottom when tasks are selected

**Independent Test**: Select any task, verify action bar appears at bottom with selection count and action buttons

### Implementation for User Story 6

- [x] T026 [US6] Create `src/components/tasks/BulkActionBar.jsx` component skeleton with fixed bottom positioning
- [x] T027 [US6] Add selection count display with i18n in BulkActionBar
- [x] T028 [US6] Add Delete button with trash icon in BulkActionBar
- [x] T029 [US6] Add Change Status dropdown button in BulkActionBar
- [x] T030 [US6] Add Reassign dropdown button in BulkActionBar
- [x] T031 [US6] Add Manage Tags button in BulkActionBar
- [x] T032 [US6] Add Clear Selection button (X icon) in BulkActionBar
- [x] T033 [US6] Add appear/disappear CSS transition animation to BulkActionBar
- [x] T034 [US6] Add responsive mobile layout (stacked buttons on small screens) to BulkActionBar
- [x] T035 [US6] Add dark mode styling to BulkActionBar (dark:bg-gray-800 dark:border-gray-700)
- [x] T036 [US6] Add ARIA labels to all action buttons in BulkActionBar
- [x] T037 [US6] Integrate BulkActionBar into `src/components/Dashboard.jsx` (render when view is list)
- [x] T038 [US6] Pass selectedTaskIds.size and clearSelections to BulkActionBar from Dashboard

**Checkpoint**: User Story 6 complete - action bar appears with all buttons when tasks selected

---

## Phase 5: User Story 2 - Bulk Delete Tasks (Priority: P1)

**Goal**: Delete multiple selected tasks with confirmation dialog

**Independent Test**: Select 5 tasks, click Delete, confirm, verify all 5 removed with success toast

### Implementation for User Story 2

- [x] T039 [US2] Create `src/components/tasks/BulkDeleteConfirmModal.jsx` with task count display
- [x] T040 [US2] Add warning text about irreversible action in BulkDeleteConfirmModal
- [x] T041 [US2] Add Cancel and Delete buttons with loading state in BulkDeleteConfirmModal
- [x] T042 [US2] Add dark mode styling to BulkDeleteConfirmModal
- [x] T043 [US2] Add bulk delete handler state (showDeleteConfirm, isDeleting) in `src/components/Dashboard.jsx`
- [x] T044 [US2] Implement handleBulkDelete to show confirmation modal in Dashboard
- [x] T045 [US2] Implement confirmBulkDelete calling bulkDeleteTasks service in Dashboard
- [x] T046 [US2] Add refreshTasks call after successful bulk delete in Dashboard
- [x] T047 [US2] Add success toast notification with deleted count in Dashboard
- [x] T048 [US2] Clear selection after successful delete in Dashboard
- [x] T049 [US2] Wire onDelete prop from BulkActionBar to handleBulkDelete in Dashboard

**Checkpoint**: User Story 2 complete - bulk delete works with confirmation and cascade

---

## Phase 6: User Story 3 - Bulk Status Change (Priority: P1)

**Goal**: Change status of multiple tasks with blocked task warning

**Independent Test**: Select tasks, click Change Status → In Progress, verify all tasks updated; test blocked warning

### Implementation for User Story 3

- [x] T050 [US3] Create `src/components/tasks/BulkBlockedWarningModal.jsx` component
- [x] T051 [US3] Display list of blocked tasks with names in BulkBlockedWarningModal
- [x] T052 [US3] Add "Start Unblocked Only", "Start All Anyway", and "Cancel" buttons in BulkBlockedWarningModal
- [x] T053 [US3] Add StatusDropdown component inside BulkActionBar with Pending/In Progress/Completed options
- [x] T054 [US3] Implement handleBulkStatusChange in Dashboard that checks for blocked tasks first
- [x] T055 [US3] Call getBlockedTaskIds from bulkService when changing to in-progress in Dashboard
- [x] T056 [US3] Show BulkBlockedWarningModal when blocked tasks exist in Dashboard
- [x] T057 [US3] Implement executeBulkStatusChange (with optional skipBlocked flag) in Dashboard
- [x] T058 [US3] Add success toast with updated count after status change in Dashboard
- [x] T059 [US3] Clear selection and refresh tasks after status change in Dashboard
- [x] T060 [US3] Wire onStatusChange prop from BulkActionBar to handleBulkStatusChange in Dashboard

**Checkpoint**: User Story 3 complete - bulk status change with blocked warning works

---

## Phase 7: User Story 4 - Bulk Reassign Tasks (Priority: P2)

**Goal**: Reassign multiple tasks to another user via dropdown

**Independent Test**: Select tasks, click Reassign, select user, verify all tasks reassigned with success toast

### Implementation for User Story 4

- [x] T061 [US4] Add UserDropdown component inside BulkActionBar showing all users from AuthContext
- [x] T062 [US4] Implement handleBulkReassign in Dashboard calling bulkReassignTasks service
- [x] T063 [US4] Add success toast with count and target user name after reassign in Dashboard
- [x] T064 [US4] Clear selection and refresh tasks after reassign in Dashboard
- [x] T065 [US4] Wire onReassign prop from BulkActionBar to handleBulkReassign in Dashboard

**Checkpoint**: User Story 4 complete - bulk reassign to any user works

---

## Phase 8: User Story 5 - Bulk Tag Management (Priority: P2)

**Goal**: Add or remove tags from multiple tasks via modal

**Independent Test**: Select tasks, click Manage Tags → Add → enter "urgent", verify tag added to all

### Implementation for User Story 5

- [x] T066 [US5] Create `src/components/tasks/BulkTagModal.jsx` with mode prop (add/remove)
- [x] T067 [US5] Add tag input field for Add mode with comma-separated parsing, trimming, and empty-tag filtering in BulkTagModal
- [x] T068 [US5] Add tag multi-select list for Remove mode (populated from selected tasks) in BulkTagModal
- [x] T069 [US5] Add Confirm and Cancel buttons with loading state in BulkTagModal
- [x] T070 [US5] Compute availableTags from selected tasks for Remove mode in Dashboard
- [x] T071 [US5] Implement handleBulkAddTags calling bulkAddTags service in Dashboard
- [x] T072 [US5] Implement handleBulkRemoveTags calling bulkRemoveTags service in Dashboard
- [x] T073 [US5] Add success toast after tag operations in Dashboard
- [x] T074 [US5] Wire onManageTags prop from BulkActionBar to show BulkTagModal in Dashboard

**Checkpoint**: User Story 5 complete - add/remove tags in bulk works

---

## Phase 9: User Story 7 - Keyboard Shortcuts for Bulk Actions (Priority: P3)

**Goal**: Enable Ctrl+A to select all and Ctrl+Shift+D for bulk delete

**Independent Test**: Press Ctrl+A in List view, verify all visible tasks selected; press Ctrl+Shift+D with selection, verify delete confirmation

### Implementation for User Story 7

- [x] T075 [US7] Register selectAllTasks handler in `src/contexts/KeyboardShortcutContext.jsx`
- [x] T076 [US7] Register bulkDelete handler in `src/contexts/KeyboardShortcutContext.jsx`
- [x] T077 [US7] Pass visibleTaskIds ref to KeyboardShortcutProvider from Dashboard for selectAll
- [x] T078 [US7] Pass onBulkDelete callback to KeyboardShortcutProvider from Dashboard
- [x] T079 [US7] Add bulk action shortcuts to KeyboardShortcutsHelp component in `src/components/ui/KeyboardShortcutsHelp.jsx`
- [x] T080 [US7] Verify Escape key clears selection (existing closeOrClear handler) in KeyboardShortcutContext

**Checkpoint**: User Story 7 complete - keyboard shortcuts work for bulk operations

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases, accessibility, and final refinements

- [x] T081 [P] Add loading/disabled state to BulkActionBar buttons during operations
- [x] T082 [P] Add screen reader announcements for selection changes via announce() in `src/contexts/KeyboardShortcutContext.jsx`
- [x] T083 [P] Add screen reader announcements for bulk operation results in Dashboard
- [x] T084 [P] Add selection limit warning toast when approaching 500 tasks in TaskList
- [x] T085 [P] Add focus management - return focus to list after modal closes in Dashboard
- [x] T086 Verify selection clears on view change (list → kanban) in Dashboard
- [x] T087 Run quickstart.md validation - verify all documented flows work correctly
- [x] T088 Cross-browser testing (Chrome, Firefox, Safari, Edge) for bulk operations
- [x] T089 Verify Dexie transaction rollback behavior - simulate partial failure and confirm all-or-nothing semantics

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup) ─────────────────────────────────────────────────────────►
                                                                          │
Phase 2 (Foundational) ──────────────────────────────────────────────────►
                                                                          │
    ┌─────────────────────────────────────────────────────────────────────┘
    │
    ├── Phase 3 (US1 - Selection) ────────────────────────────────────────►
    │                                                                      │
    ├── Phase 4 (US6 - Action Bar UI) ───────────────────────────────────►
    │         (can start in parallel with US1, both P1)                    │
    │                                                                      │
    └────────────────────────────┬─────────────────────────────────────────┘
                                 │ (US1 + US6 must be done before P1 actions)
                                 │
    ┌────────────────────────────┴─────────────────────────────────────────┐
    │                                                                       │
    ├── Phase 5 (US2 - Bulk Delete) ──────────────────────────────────────►
    │                                                                       │
    ├── Phase 6 (US3 - Bulk Status Change) ───────────────────────────────►
    │         (can run in parallel with US2, both P1)                       │
    │                                                                       │
    └───────────────────────────────────────────────────────────────────────┘
                                 │
    ┌────────────────────────────┴─────────────────────────────────────────┐
    │                                                                       │
    ├── Phase 7 (US4 - Bulk Reassign) ────────────────────────────────────►
    │                                                                       │
    ├── Phase 8 (US5 - Bulk Tags) ────────────────────────────────────────►
    │         (can run in parallel, both P2)                                │
    │                                                                       │
    └───────────────────────────────────────────────────────────────────────┘
                                 │
Phase 9 (US7 - Keyboard Shortcuts, P3) ───────────────────────────────────►
                                 │
Phase 10 (Polish) ────────────────────────────────────────────────────────►
```

### Parallel Execution Opportunities

**Within Phase 1 (Setup)**:

- T002, T003, T004 can all run in parallel

**Within Phase 2 (Foundational)**:

- T006, T007, T008, T009 can run in parallel (independent service functions)
- After T010: T011-T016 depend on state changes but some can parallel

**Within Phase 3-4 (US1 + US6)**:

- US1 (Selection) and US6 (Action Bar) can be developed in parallel by different developers
- Both must complete before action handler phases

**Within Phase 5-6 (US2 + US3)**:

- Bulk Delete (US2) and Bulk Status (US3) can run in parallel
- Both use BulkActionBar which is already complete

**Within Phase 7-8 (US4 + US5)**:

- Bulk Reassign (US4) and Bulk Tags (US5) can run in parallel
- Both are P2 priority and independent

---

## Implementation Strategy

### MVP Scope (Recommended First Delivery)

Complete Phases 1-6 (through User Story 3 - Bulk Status Change):

- Users can select multiple tasks ✓
- Action bar appears with selection count ✓
- Bulk delete with confirmation ✓
- Bulk status change with blocked warning ✓

This delivers the highest-value functionality covering 80%+ of bulk operation use cases.

### Incremental Delivery

1. **Sprint 1**: Phases 1-4 (Selection + Action Bar UI)
2. **Sprint 2**: Phases 5-6 (Delete + Status Change)
3. **Sprint 3**: Phases 7-8 (Reassign + Tags)
4. **Sprint 4**: Phases 9-10 (Keyboard Shortcuts + Polish)

---

## Summary

| Phase | User Story       | Priority | Task Count | Key Deliverable                    |
| ----- | ---------------- | -------- | ---------- | ---------------------------------- |
| 1     | Setup            | -        | 4          | Constants, i18n keys               |
| 2     | Foundational     | -        | 12         | bulkService, context extensions    |
| 3     | US1 - Selection  | P1       | 10         | Checkbox selection, highlighting   |
| 4     | US6 - Action Bar | P1       | 13         | Fixed bottom bar with buttons      |
| 5     | US2 - Delete     | P1       | 11         | Bulk delete with confirmation      |
| 6     | US3 - Status     | P1       | 11         | Status change with blocked warning |
| 7     | US4 - Reassign   | P2       | 5          | User reassignment                  |
| 8     | US5 - Tags       | P2       | 9          | Add/remove tags modal              |
| 9     | US7 - Keyboard   | P3       | 6          | Ctrl+A, Ctrl+Shift+D               |
| 10    | Polish           | -        | 9          | Accessibility, edge cases          |

**Total Tasks**: 90
**Parallel Opportunities**: 12 marked [P], plus cross-phase parallelization
**MVP Tasks** (through US3): 61 tasks
