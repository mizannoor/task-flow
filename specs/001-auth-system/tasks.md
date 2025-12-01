# Tasks: Authentication System

**Input**: Design documents from `/specs/001-auth-system/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓

**Tests**: Tests are NOT explicitly requested in the feature specification. Test tasks omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root (per plan.md)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, dependencies, and basic structure

- [x] T001 Create project structure: `src/components/auth/`, `src/contexts/`, `src/services/`, `src/hooks/`, `src/utils/`
- [x] T002 Migrate existing CRA project to Vite: update `package.json`, replace `react-scripts` with `vite`, create `vite.config.js`, update `index.html`
- [x] T003 [P] Install dependencies: `dexie`, `uuid`, `tailwindcss`, `postcss`, `autoprefixer`
- [x] T004 [P] Configure Tailwind CSS in `tailwind.config.js` and `src/styles/globals.css`
- [x] T005 [P] Configure ESLint and Prettier for code quality
- [x] T005a [P] Migrate test files from `src/` to `tests/` folder structure (move `App.test.js`, `setupTests.js`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Create constants file with validation patterns and messages in `src/utils/constants.js`
- [x] T007 [P] Implement identifier validation functions in `src/utils/validators.js` (email, username, phone patterns)
- [x] T008 [P] Implement display name derivation function in `src/utils/validators.js`
- [x] T009 Setup IndexedDB database with Dexie.js schema (users table) in `src/services/db.js`
- [x] T010 [P] Implement session service (get/save/clear session in localStorage) in `src/services/sessionService.js`
- [x] T011 Create AuthContext with initial state, reducer, and AuthProvider component using useReducer in `src/contexts/AuthContext.jsx`
- [x] T013 [P] Create useAuth hook re-export in `src/hooks/useAuth.js`
- [x] T014 Implement IndexedDB availability check function in `src/services/db.js`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - First-Time User Registration (Priority: P1) 🎯 MVP

**Goal**: New users can enter an identifier and automatically get an account created with immediate login

**Independent Test**: Open app in fresh browser, enter new email address, verify account created and logged in to dashboard

### Implementation for User Story 1

- [x] T015 [US1] Implement `createUser` function in `src/services/db.js` (create user record in IndexedDB)
- [x] T016 [US1] Implement `getUserByIdentifier` function in `src/services/db.js` (lookup user by identifier)
- [x] T017 [US1] Implement `login` action in AuthContext that validates, creates/fetches user, creates session in `src/contexts/AuthContext.jsx`
- [x] T018 [US1] Create LoginForm component with identifier input and submit button in `src/components/auth/LoginForm.jsx`
- [x] T019 [US1] Add validation error display to LoginForm with clear error messages in `src/components/auth/LoginForm.jsx`
- [x] T020 [US1] Implement form submission handler calling `login` action in `src/components/auth/LoginForm.jsx`
- [x] T021 [US1] Style LoginForm with Tailwind CSS (responsive, centered, accessible) in `src/components/auth/LoginForm.jsx`
- [x] T022 [US1] Create basic App shell with conditional rendering (login vs dashboard) in `src/App.jsx`
- [x] T022a [US1] Implement route protection: redirect unauthenticated users to login form (FR-017) in `src/App.jsx`
- [x] T022b [US1] Implement authenticated redirect: redirect logged-in users away from login to dashboard (FR-018) in `src/App.jsx`

**Checkpoint**: User Story 1 complete - new users can register and login

---

## Phase 4: User Story 2 - Returning User Login (Priority: P1)

**Goal**: Existing users with sessions auto-redirect to dashboard; users without sessions can login with existing identifier

**Independent Test**: Login, close browser, reopen - verify session persists. Enter existing identifier - verify login works.

### Implementation for User Story 2

- [x] T023 [US2] Implement session restoration on app load (check localStorage, fetch user) in `src/contexts/AuthContext.jsx`
- [x] T024 [US2] Implement `getAllUsers` function in `src/services/db.js` (fetch all users from IndexedDB)
- [x] T025 [US2] Add loading state UI while checking session persistence in `src/App.jsx`
- [x] T026 [US2] Implement redirect logic: authenticated users skip login form in `src/App.jsx`
- [x] T027 [US2] Handle existing user login (identifier found → login, not create) in `src/contexts/AuthContext.jsx`
- [x] T028 [US2] Add multi-tab sync via storage event listener: implement "last login wins" behavior, sync state on tab focus in `src/contexts/AuthContext.jsx`

**Checkpoint**: User Stories 1 AND 2 complete - full login/registration flow works

---

## Phase 5: User Story 3 - Quick User Switching (Priority: P2)

**Goal**: Users can switch between accounts via dropdown without logging out

**Independent Test**: Create multiple users, switch between them via dropdown, verify task context updates

### Implementation for User Story 3

- [x] T029 [US3] Create UserSwitcher dropdown component structure in `src/components/auth/UserSwitcher.jsx`
- [x] T030 [US3] Implement dropdown open/close state and outside click handling in `src/components/auth/UserSwitcher.jsx`
- [x] T031 [US3] Display all users from AuthContext in dropdown list in `src/components/auth/UserSwitcher.jsx`
- [x] T032 [US3] Highlight currently active user in dropdown in `src/components/auth/UserSwitcher.jsx`
- [x] T033 [US3] Implement `switchUser` action in AuthContext (update session, update state) in `src/contexts/AuthContext.jsx`
- [x] T034 [US3] Connect dropdown item clicks to `switchUser` action in `src/components/auth/UserSwitcher.jsx`
- [x] T035 [US3] Add keyboard navigation (Arrow keys, Escape, Enter) to dropdown in `src/components/auth/UserSwitcher.jsx`
- [x] T036 [US3] Add ARIA attributes for accessibility (role, aria-expanded) in `src/components/auth/UserSwitcher.jsx`
- [x] T037 [US3] Style UserSwitcher with Tailwind CSS in `src/components/auth/UserSwitcher.jsx`
- [x] T038 [US3] Integrate UserSwitcher into App header in `src/App.jsx`

**Checkpoint**: User Story 3 complete - user switching works

---

## Phase 6: User Story 4 - Add Another Account (Priority: P2)

**Goal**: Users can add additional accounts from the user switcher dropdown

**Independent Test**: Open dropdown, click "Add Another Account", enter new identifier, verify new account appears in list

### Implementation for User Story 4

- [x] T039 [US4] Add "Add Another Account" button to UserSwitcher dropdown in `src/components/auth/UserSwitcher.jsx`
- [x] T040 [US4] Implement state to show inline login form or modal for adding account in `src/components/auth/UserSwitcher.jsx`
- [x] T041 [US4] Implement `addAccount` action (reuses login logic) in `src/contexts/AuthContext.jsx`
- [x] T042 [US4] Handle adding account with existing identifier (switch to that account, no duplicate) in `src/contexts/AuthContext.jsx`
- [x] T043 [US4] Update users list after adding new account in `src/contexts/AuthContext.jsx`

**Checkpoint**: User Story 4 complete - adding accounts works

---

## Phase 7: User Story 5 - Logout (Priority: P3)

**Goal**: Users can completely log out, clearing session but preserving data

**Independent Test**: Login, click logout, verify session cleared, verify data intact on re-login

### Implementation for User Story 5

- [x] T044 [US5] Add "Logout" button to UserSwitcher dropdown (separated with divider) in `src/components/auth/UserSwitcher.jsx`
- [x] T045 [US5] Implement `logout` action in AuthContext (clear session, update state) in `src/contexts/AuthContext.jsx`
- [x] T046 [US5] Connect logout button to `logout` action in `src/components/auth/UserSwitcher.jsx`
- [x] T047 [US5] Redirect to login form after logout in `src/App.jsx`
- [x] T048 [US5] Verify user data preserved in IndexedDB after logout (no data deletion) in `src/contexts/AuthContext.jsx`

**Checkpoint**: User Story 5 complete - logout works

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Error handling, edge cases, and final validation

- [x] T049 [P] Implement IndexedDB unavailable error UI (show message when storage blocked) in `src/App.jsx`
- [x] T050 [P] Handle corrupted session data (clear and show login) in `src/contexts/AuthContext.jsx`
- [x] T051 [P] Add scrollable dropdown with search/filter for 100+ users scenario in `src/components/auth/UserSwitcher.jsx`
- [x] T051a [P] Create Toast notification component for user feedback (deleted user removal, errors) in `src/components/ui/Toast.jsx`
- [x] T052 [P] Add `clearError` action to AuthContext in `src/contexts/AuthContext.jsx`
- [x] T053 Run quickstart.md validation - verify all code examples work
- [x] T054 Performance validation: verify <100ms login, <500ms user switch

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - US1 (P1): Can start after Phase 2
  - US2 (P1): Can start after Phase 2, minor dependency on US1 login flow
  - US3 (P2): Can start after Phase 2
  - US4 (P2): Depends on US3 (UserSwitcher component)
  - US5 (P3): Depends on US3 (UserSwitcher component)
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational - Uses login logic from US1
- **User Story 3 (P2)**: Can start after Foundational - No dependencies on US1/US2
- **User Story 4 (P2)**: Depends on US3 (UserSwitcher must exist)
- **User Story 5 (P3)**: Depends on US3 (UserSwitcher must exist)

### Parallel Opportunities

Within each phase, tasks marked [P] can run in parallel:

- **Phase 1**: T003, T004, T005, T005a in parallel
- **Phase 2**: T007+T008+T010+T013 in parallel (different files)
- **Phase 3**: T015+T016 in parallel (both db functions)
- **Phase 8**: T049+T050+T051+T051a+T052 in parallel (different concerns)

---

## Parallel Example: Phase 2 (Foundational)

```bash
# Launch in parallel (different files):
Task: T007 - "Implement identifier validation functions in src/utils/validators.js"
Task: T008 - "Implement display name derivation function in src/utils/validators.js"  # Same file, but different function
Task: T010 - "Implement session service in src/services/sessionService.js"
Task: T013 - "Create useAuth hook re-export in src/hooks/useAuth.js"

# Then sequential (depends on above):
Task: T009 - "Setup IndexedDB database with Dexie.js schema in src/services/db.js"
Task: T011 - "Create AuthContext with state, reducer, and AuthProvider"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (First-Time Registration)
4. **STOP and VALIDATE**: Test registration flow independently
5. Deploy/demo if ready - users can already register and use the app!

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy (MVP: Registration works!)
3. Add User Story 2 → Test independently → Deploy (Session persistence!)
4. Add User Story 3 → Test independently → Deploy (User switching!)
5. Add User Story 4 → Test independently → Deploy (Multiple accounts!)
6. Add User Story 5 → Test independently → Deploy (Logout!)
7. Polish → Final validation → Production ready

### Suggested MVP Scope

**Minimum Viable Product**: User Stories 1 + 2 (Registration + Returning User Login)

This delivers:

- Users can create accounts
- Users can login
- Sessions persist across browser restarts
- Core authentication functionality complete

User Stories 3-5 (switching, adding accounts, logout) can be added incrementally.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All file paths are relative to repository root
