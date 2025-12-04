# Tasks: Task Dependencies

**Input**: Design documents from `/specs/013-task-dependencies/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: Not explicitly requested in the specification - test tasks omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure) ✅

**Purpose**: Database schema and core utilities required for all dependency features

- [x] T001 Update IndexedDB schema to v5 with dependencies table in src/services/db.js
- [x] T002 [P] Add dependency constants (error codes, limits, labels) in src/utils/constants.js
- [x] T003 [P] Create DependencyError class and error codes in src/services/dependencyService.js
- [x] T004 [P] Create circular dependency detection utility (DFS algorithm) in src/utils/dependencyUtils.js

---

## Phase 2: Foundational (Blocking Prerequisites) ✅

**Purpose**: Core service layer that MUST be complete before ANY user story UI can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Implement createDependency function with all validations in src/services/dependencyService.js
- [x] T006 [P] Implement deleteDependency function in src/services/dependencyService.js
- [x] T007 [P] Implement getDependenciesForTask function in src/services/dependencyService.js
- [x] T008 [P] Implement getTasksBlockedBy function in src/services/dependencyService.js
- [x] T009 [P] Implement getAllDependencies function in src/services/dependencyService.js
- [x] T010 [P] Implement getDependencyCount function in src/services/dependencyService.js
- [x] T011 [P] Implement wouldCreateCycle function in src/services/dependencyService.js
- [x] T012 Implement deleteDependenciesForTask for cascade delete in src/services/dependencyService.js
- [x] T013 Modify deleteTask to cascade delete dependencies in src/services/taskService.js
- [x] T014 Create useDependencies hook with state management in src/hooks/useDependencies.js
- [x] T015 Add computed dependency info (isBlocked, blockedBy, blocks) to useDependencies hook

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Add a Dependency to a Task (Priority: P1) 🎯 MVP ✅

**Goal**: Users can search for and add blocking tasks as dependencies

**Independent Test**: Create two tasks, open one's dependency settings, add the other as a dependency, verify relationship is saved and displayed

### Implementation for User Story 1

- [x] T016 [P] [US1] Create DependencySelector component with task search in src/components/tasks/DependencySelector.jsx
- [x] T017 [P] [US1] Create DependencyBadge component for visual indicator in src/components/tasks/DependencyBadge.jsx
- [x] T018 [US1] Add "Manage Dependencies" section to TaskForm in src/components/tasks/TaskForm.jsx
- [x] T019 [US1] Integrate DependencySelector into TaskForm for adding dependencies
- [x] T020 [US1] Show "Blocked By" list in TaskForm when editing a task with dependencies
- [x] T021 [US1] Add dependency badge indicator to TaskRow in src/components/tasks/TaskRow.jsx

**Checkpoint**: User Story 1 complete - users can add dependencies and see visual indicators

---

## Phase 4: User Story 2 - View Dependency Status and Blockers (Priority: P1) ✅

**Goal**: Users can see detailed dependency information in task details

**Independent Test**: Create tasks with dependencies, view task details, verify blocked-by and blocks sections display correctly with status

### Implementation for User Story 2

- [x] T022 [P] [US2] Create DependencyList component showing tasks with status in src/components/tasks/DependencyList.jsx
- [x] T023 [US2] Add "Blocked By" section with DependencyList to TaskDetail in src/components/tasks/TaskDetail.jsx
- [x] T024 [US2] Add "Blocks" section showing downstream tasks to TaskDetail
- [x] T025 [US2] Show satisfied/unsatisfied status for each dependency (checkmark for completed blockers)
- [x] T026 [US2] Update blocked indicator when blocking task status changes (auto-recalculate)

**Checkpoint**: User Story 2 complete - full dependency visibility in task details

---

## Phase 5: User Story 3 - Remove a Dependency (Priority: P1) ✅

**Goal**: Users can remove dependencies and unblock tasks

**Independent Test**: Create task with dependency, remove the dependency, verify blocked indicator disappears and task can be started

### Implementation for User Story 3

- [x] T027 [US3] Add remove button to each dependency item in DependencyList
- [x] T028 [US3] Implement removeDependency action in useDependencies hook
- [x] T029 [US3] Add confirmation dialog before removing dependency
- [x] T030 [US3] Update blocked status after dependency removal (recalculate isBlocked)
- [x] T031 [US3] Ensure persistence - removed dependency stays removed after refresh

**Checkpoint**: User Story 3 complete - full CRUD for dependencies (add, view, remove)

---

## Phase 6: User Story 4 - Prevent Starting Blocked Tasks (Priority: P2)

**Goal**: Warn users when starting a blocked task and allow override

**Independent Test**: Create blocked task, click Start, verify warning appears with blocker list, can dismiss or override

### Implementation for User Story 4

- [ ] T032 [P] [US4] Create BlockedTaskWarningModal component in src/components/tasks/BlockedTaskWarningModal.jsx
- [ ] T033 [US4] Modify TaskActions to check isBlocked before starting task in src/components/tasks/TaskActions.jsx
- [ ] T034 [US4] Show BlockedTaskWarningModal when starting blocked task
- [ ] T035 [US4] Display list of blocking tasks with status in warning modal
- [ ] T036 [US4] Add "Start Anyway" override option with confirmation
- [ ] T037 [US4] Disable/style Start button for blocked tasks (visual indicator)

**Checkpoint**: User Story 4 complete - soft blocking with override implemented

---

## Phase 7: User Story 5 - Prevent Circular Dependencies (Priority: P2)

**Goal**: Detect and prevent circular dependency creation with clear error messaging

**Independent Test**: Create A→B→C chain, try to add C→A dependency, verify error with path shown

### Implementation for User Story 5

- [ ] T038 [US5] Integrate wouldCreateCycle check into createDependency validation
- [ ] T039 [US5] Filter DependencySelector results to exclude circular-causing tasks
- [ ] T040 [US5] Show clear error message with cycle path when circular detected
- [ ] T041 [US5] Add visual indicator (disabled/unavailable) for tasks that would create cycles in selector

**Checkpoint**: User Story 5 complete - circular dependencies prevented with user-friendly errors

---

## Phase 8: User Story 6 - Filter Tasks by Dependency Status (Priority: P3)

**Goal**: Filter task list to show blocked or blocking tasks

**Independent Test**: Create tasks with various dependency states, apply filters, verify correct tasks shown

### Implementation for User Story 6

- [ ] T042 [P] [US6] Add dependencyStatus filter option to DEFAULT_FILTERS in src/utils/constants.js
- [ ] T043 [US6] Add dependency filter dropdown to FilterBar in src/components/tasks/FilterBar.jsx
- [ ] T044 [US6] Implement dependency filter logic in filterTasks function in src/contexts/TaskContext.jsx
- [ ] T045 [US6] Show dependency filter badge in active filters display
- [ ] T046 [US6] Handle empty state when no tasks match dependency filter

**Checkpoint**: User Story 6 complete - dependency filtering integrated with existing filter system

---

## Phase 9: User Story 7 - View Dependency Chain Visualization (Priority: P3)

**Goal**: Visual representation of upstream and downstream dependency chains

**Independent Test**: Create chain of dependent tasks, open visualization, verify hierarchy is displayed correctly

### Implementation for User Story 7

- [ ] T047 [P] [US7] Create DependencyChain component for tree visualization in src/components/tasks/DependencyChain.jsx
- [ ] T048 [US7] Implement upstream dependency traversal (recursive blockedBy)
- [ ] T049 [US7] Implement downstream dependency traversal (recursive blocks)
- [ ] T050 [US7] Add status indicators to each task in the chain visualization
- [ ] T051 [US7] Add click-to-navigate functionality for tasks in visualization
- [ ] T052 [US7] Add "View Dependency Chain" button to TaskDetail
- [ ] T053 [US7] Handle empty state (no dependencies) in visualization

**Checkpoint**: User Story 7 complete - full dependency chain visualization available

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T054 [P] Add keyboard navigation support to DependencySelector
- [ ] T055 [P] Add loading states to dependency operations
- [ ] T056 [P] Add error handling and toast notifications for dependency errors
- [ ] T057 [P] Ensure dark mode styling for all dependency components
- [ ] T058 [P] Add aria labels and screen reader support to dependency UI
- [ ] T059 Run quickstart.md validation - test all dependency features end-to-end
- [ ] T060 Code cleanup and JSDoc comments for dependency service and hook

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-9)**: All depend on Foundational phase completion
  - User stories can then proceed in priority order (P1 → P2 → P3)
  - P1 stories (US1, US2, US3) should complete before P2/P3
- **Polish (Phase 10)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - Core add dependency functionality
- **User Story 2 (P1)**: Can start after Foundational - May reuse DependencyBadge from US1
- **User Story 3 (P1)**: Can start after Foundational - Uses DependencyList from US2
- **User Story 4 (P2)**: Depends on US1-3 being complete (needs isBlocked calculation)
- **User Story 5 (P2)**: Can start after Foundational - Enhances US1 with validation
- **User Story 6 (P3)**: Can start after Foundational - Independent filter feature
- **User Story 7 (P3)**: Depends on US2 (uses DependencyList patterns)

### Within Each User Story

- Components marked [P] can run in parallel
- Core components before integration tasks
- Story complete before moving to next priority

### Parallel Opportunities Per Phase

**Phase 1 (Setup)**:

```
T001 (db schema) → then all of T002, T003, T004 in parallel
```

**Phase 2 (Foundational)**:

```
T005 first (core createDependency)
Then T006, T007, T008, T009, T010, T011 in parallel
Then T012 (depends on T006-T011)
Then T013 (depends on T012)
Then T014, T015 (hook depends on service)
```

**Phase 3 (US1)**:

```
T016, T017 in parallel
Then T018-T021 sequentially (integration)
```

---

## Implementation Strategy

### MVP First (P1 Stories: US1 + US2 + US3)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T015)
3. Complete Phase 3: User Story 1 - Add Dependencies (T016-T021)
4. Complete Phase 4: User Story 2 - View Dependencies (T022-T026)
5. Complete Phase 5: User Story 3 - Remove Dependencies (T027-T031)
6. **STOP and VALIDATE**: Test all P1 stories independently
7. Deploy/demo if ready - MVP complete!

### Incremental Delivery After MVP

8. Add Phase 6: User Story 4 - Start Warning (P2)
9. Add Phase 7: User Story 5 - Circular Prevention (P2)
10. Add Phase 8: User Story 6 - Filtering (P3)
11. Add Phase 9: User Story 7 - Visualization (P3)
12. Complete Phase 10: Polish

---

## Notes

- **Total Tasks**: 60
- **P1 Tasks** (MVP): 31 tasks (T001-T031)
- **P2 Tasks**: 10 tasks (T032-T041)
- **P3 Tasks**: 12 tasks (T042-T053)
- **Polish Tasks**: 7 tasks (T054-T060)
- All dependency data is computed at runtime - no stored isBlocked field
- Max 10 dependencies per task enforced in createDependency
- Soft blocking with override (P2) - users warned but can proceed
- Circular detection uses DFS algorithm from research.md
