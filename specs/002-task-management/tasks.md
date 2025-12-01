# Tasks: Task Management System

**Input**: Design documents from `/specs/002-task-management/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Extend existing project with task management infrastructure

- [x] T001 Extend IndexedDB schema with tasks table in `src/services/db.js`
- [x] T002 [P] Add task constants (priorities, categories, statuses, defaults) to `src/utils/constants.js`
- [x] T003 [P] Add task validation functions to `src/utils/validators.js`
- [x] T004 [P] Create date/duration formatters in `src/utils/formatters.js`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core services and context that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create task service with CRUD operations in `src/services/taskService.js`
- [x] T006 Create TaskContext with useReducer pattern in `src/contexts/TaskContext.jsx`
- [x] T007 Create useTasks hook in `src/hooks/useTasks.js`
- [x] T008 [P] Create useDebounce hook in `src/hooks/useDebounce.js`
- [x] T009 [P] Create Badge component (priority/status) in `src/components/ui/Badge.jsx`
- [x] T010 [P] Create Modal component in `src/components/ui/Modal.jsx`
- [x] T011 [P] Create EmptyState component in `src/components/ui/EmptyState.jsx`
- [x] T012 [P] Create ConfirmDialog component in `src/components/ui/ConfirmDialog.jsx`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Create a New Task (Priority: P1) 🎯 MVP

**Goal**: Users can create tasks with all required and optional fields via a form/modal

**Independent Test**: Click "New Task", fill in task name and optional fields, submit → Task saved and appears in list

### Implementation for User Story 1

- [x] T013 [US1] Create TaskForm component with all task fields in `src/components/tasks/TaskForm.jsx`
- [x] T014 [US1] Create TaskModal wrapper component in `src/components/tasks/TaskModal.jsx`
- [x] T015 [US1] Add createTask action to TaskContext with validation in `src/contexts/TaskContext.jsx`
- [x] T016 [US1] Add "New Task" button to Dashboard in `src/components/Dashboard.jsx`
- [x] T017 [US1] Integrate TaskModal with Dashboard (open/close state) in `src/components/Dashboard.jsx`

**Checkpoint**: Users can create tasks with full form validation

---

## Phase 4: User Story 2 - View Tasks in List Format (Priority: P1)

**Goal**: Display all tasks in a sortable table with status badges and priority colors

**Independent Test**: Create several tasks → Navigate to list view → All tasks visible with correct columns

### Implementation for User Story 2

- [x] T018 [P] [US2] Create TaskRow component for table display in `src/components/tasks/TaskRow.jsx`
- [x] T019 [US2] Create TaskList container with table structure in `src/components/tasks/TaskList.jsx`
- [x] T020 [US2] Add pagination to TaskList (25 items per page) in `src/components/tasks/TaskList.jsx`
- [x] T021 [US2] Integrate TaskList with Dashboard in `src/components/Dashboard.jsx`
- [x] T022 [US2] Add empty state when no tasks exist in `src/components/tasks/TaskList.jsx`

**Checkpoint**: Users can view all their tasks in a paginated table

---

## Phase 5: User Story 3 - Edit an Existing Task (Priority: P1)

**Goal**: Users can click a task, edit any field, and save changes

**Independent Test**: Click task → Edit form opens with current values → Modify fields → Save → Changes persisted

### Implementation for User Story 3

- [x] T023 [US3] Add edit mode to TaskForm (pre-fill values) in `src/components/tasks/TaskForm.jsx`
- [x] T024 [US3] Add updateTask action to TaskContext in `src/contexts/TaskContext.jsx`
- [x] T025 [US3] Add edit button/click handler to TaskRow in `src/components/tasks/TaskRow.jsx`
- [x] T026 [US3] Wire edit modal open/close in Dashboard in `src/components/Dashboard.jsx`

**Checkpoint**: Users can edit any task property and see changes reflected immediately

---

## Phase 6: User Story 4 - Change Task Status (Priority: P1)

**Goal**: Users can transition tasks through Pending → In Progress → Completed workflow

**Independent Test**: Create task (Pending) → Click Start (In Progress) → Click Complete (Completed) → Re-open (Pending)

### Implementation for User Story 4

- [x] T027 [P] [US4] Create TaskActions component with status buttons in `src/components/tasks/TaskActions.jsx`
- [x] T028 [US4] Add startTask, completeTask, reopenTask actions to TaskContext in `src/contexts/TaskContext.jsx`
- [x] T029 [US4] Integrate TaskActions into TaskRow in `src/components/tasks/TaskRow.jsx`
- [x] T030 [US4] Add re-open confirmation dialog for completed tasks in `src/components/tasks/TaskActions.jsx`

**Checkpoint**: Full task lifecycle workflow functional - MVP Complete! 🎉

---

## Phase 7: User Story 5 - Delete a Task (Priority: P2)

**Goal**: Users can permanently delete tasks with confirmation

**Independent Test**: Click delete on task → Confirm in dialog → Task removed from list and database

### Implementation for User Story 5

- [x] T031 [US5] Add deleteTask action to TaskContext in `src/contexts/TaskContext.jsx`
- [x] T032 [US5] Add delete button to TaskActions in `src/components/tasks/TaskActions.jsx`
- [x] T033 [US5] Wire delete confirmation dialog in TaskRow in `src/components/tasks/TaskRow.jsx`

**Checkpoint**: Users can delete tasks with confirmation protection

---

## Phase 8: User Story 6 - Sort Tasks (Priority: P2)

**Goal**: Users can sort task list by clicking column headers

**Independent Test**: Create tasks with different priorities → Click Priority header → List reorders (Urgent first)

### Implementation for User Story 6

- [x] T034 [P] [US6] Create SortSelect dropdown component in `src/components/tasks/SortSelect.jsx`
- [x] T035 [US6] Add sort state and setSort action to TaskContext in `src/contexts/TaskContext.jsx`
- [x] T036 [US6] Add sortable column headers to TaskList in `src/components/tasks/TaskList.jsx`
- [x] T037 [US6] Persist sort preference to localStorage in `src/contexts/TaskContext.jsx`
- [x] T038 [US6] Implement priority numeric mapping for correct sort order in `src/contexts/TaskContext.jsx`

**Checkpoint**: Users can sort tasks by any field with persistent preference

---

## Phase 9: User Story 7 - Filter Tasks (Priority: P2)

**Goal**: Users can filter by status, priority, and category

**Independent Test**: Create tasks with various properties → Apply status filter → Only matching tasks shown

### Implementation for User Story 7

- [x] T039 [P] [US7] Create FilterBar container component in `src/components/tasks/FilterBar.jsx`
- [x] T040 [US7] Add filter state and setFilter actions to TaskContext in `src/contexts/TaskContext.jsx`
- [x] T041 [US7] Add multi-select dropdowns for status/priority/category to FilterBar in `src/components/tasks/FilterBar.jsx`
- [x] T042 [US7] Add active filter badges with remove buttons to FilterBar in `src/components/tasks/FilterBar.jsx`
- [x] T043 [US7] Add "Clear All" filters button in `src/components/tasks/FilterBar.jsx`
- [x] T044 [US7] Integrate FilterBar with Dashboard in `src/components/Dashboard.jsx`

**Checkpoint**: Users can filter tasks by multiple criteria simultaneously

---

## Phase 10: User Story 8 - Search Tasks (Priority: P2)

**Goal**: Users can search tasks by name or description with 300ms debounce

**Independent Test**: Type "auth" in search → Results filtered after 300ms → Clear search → All tasks shown

### Implementation for User Story 8

- [x] T045 [US8] Create SearchInput component with debounce in `src/components/tasks/SearchInput.jsx`
- [x] T046 [US8] Add search filter logic to TaskContext (name + description) in `src/contexts/TaskContext.jsx`
- [x] T047 [US8] Add search input to FilterBar in `src/components/tasks/FilterBar.jsx`
- [x] T048 [US8] Add "No results" empty state for search in `src/components/tasks/TaskList.jsx`

**Checkpoint**: Users can search tasks with performant debounced input

---

## Phase 11: User Story 9 - Reassign Task to Another User (Priority: P3)

**Goal**: Users can change task assignment to any user in the system

**Independent Test**: Edit task → Change "Assigned To" to different user → Save → Task appears in new user's list

### Implementation for User Story 9

- [x] T049 [US9] Add user selector dropdown to TaskForm in `src/components/tasks/TaskForm.jsx`
- [x] T050 [US9] Add getAllUsers call to TaskContext for user list in `src/contexts/TaskContext.jsx`
- [x] T051 [US9] Add "My Tasks" / "All Tasks" filter toggle to FilterBar in `src/components/tasks/FilterBar.jsx`

**Checkpoint**: Team leads can reassign tasks between users

---

## Phase 12: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T052 [P] Add keyboard navigation support (Tab, Enter, Escape) across task components
- [x] T053 [P] Add loading states to TaskList and TaskForm
- [x] T054 [P] Add error boundary and error toast notifications
- [x] T055 Ensure responsive design works on 320px+ screens in all task components
- [x] T056 [P] Add aria-labels and accessibility attributes to all interactive elements
- [x] T057 Run quickstart.md validation - verify all acceptance criteria pass

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup) ─────────────────────────────────────────────┐
                                                              │
Phase 2 (Foundational) ◄──────────────────────────────────────┘
    │
    ├───► Phase 3 (US1: Create Task) ◄─── MVP Start
    │         │
    ├───► Phase 4 (US2: View List)
    │         │
    ├───► Phase 5 (US3: Edit Task)
    │         │
    ├───► Phase 6 (US4: Status Change) ◄─── MVP Complete
    │         │
    ├───► Phase 7 (US5: Delete)
    │         │
    ├───► Phase 8 (US6: Sort)
    │         │
    ├───► Phase 9 (US7: Filter)
    │         │
    ├───► Phase 10 (US8: Search)
    │         │
    └───► Phase 11 (US9: Reassign)
              │
Phase 12 (Polish) ◄───────────────────────────────────────────┘
```

### User Story Dependencies

| Story          | Depends On      | Can Parallelize With |
| -------------- | --------------- | -------------------- |
| US1 (Create)   | Phase 2         | -                    |
| US2 (View)     | Phase 2         | US1                  |
| US3 (Edit)     | US1 (TaskForm)  | US4                  |
| US4 (Status)   | Phase 2         | US3, US5             |
| US5 (Delete)   | Phase 2         | US4, US6             |
| US6 (Sort)     | US2 (TaskList)  | US5, US7             |
| US7 (Filter)   | US2 (TaskList)  | US6, US8             |
| US8 (Search)   | US7 (FilterBar) | -                    |
| US9 (Reassign) | US1, US7        | -                    |

### Within Each User Story

1. Context actions before components that use them
2. Core components before integration
3. Story complete before moving to next priority

### Parallel Opportunities

**Phase 2 (Foundational)**: T008, T009, T010, T011, T012 can all run in parallel

**After Phase 2 completes**:

- US1 and US2 can start simultaneously (both only need Phase 2)
- US3 and US4 can run in parallel (different concerns)
- US5, US6, US7 can run in parallel after US2 completes
- All Polish tasks (T052-T056) can run in parallel

---

## Summary

| Metric                     | Value                          |
| -------------------------- | ------------------------------ |
| **Total Tasks**            | 57                             |
| **Setup Tasks**            | 4                              |
| **Foundational Tasks**     | 8                              |
| **User Story Tasks**       | 39                             |
| **Polish Tasks**           | 6                              |
| **Parallel Opportunities** | 18 tasks marked [P]            |
| **MVP Scope**              | Phases 1-6 (US1-US4): 30 tasks |

### Suggested MVP

Complete Phases 1-6 for a fully functional task management system:

- Create tasks ✅
- View task list ✅
- Edit tasks ✅
- Status workflow (Pending → In Progress → Completed) ✅

Post-MVP enhancements: Delete, Sort, Filter, Search, Reassign
