# Tasks: Theme Mode (Dark/Light)

**Input**: Design documents from `/specs/011-theme-mode/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/theme-types.ts ✅, quickstart.md ✅

**Tests**: No tests explicitly requested in specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Configure Tailwind dark mode and add theme constants

- [ ] T001 [P] Enable darkMode: 'class' in tailwind.config.js
- [ ] T002 [P] Add THEME_STORAGE_KEY, THEME_MODES, DEFAULT_THEME constants to src/utils/constants.js
- [ ] T003 [P] Add theme keyboard shortcuts to KEYBOARD_SHORTCUTS array in src/utils/constants.js

**Checkpoint**: Tailwind configured for dark mode, constants ready for use

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core theme infrastructure that MUST be complete before user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Create theme utilities (getSystemTheme, isValidTheme, getStoredTheme, setStoredTheme, applyThemeClass, getInitialTheme) in src/utils/themeUtils.js
- [ ] T005 Create ThemeContext with ThemeProvider and useTheme hook in src/contexts/ThemeContext.jsx
- [ ] T006 Add CSS transition for smooth theme switching in src/styles/globals.css

**Checkpoint**: Foundation ready - theme context available, user story implementation can begin

---

## Phase 3: User Story 1 - Toggle Theme via Header Control (Priority: P1) 🎯 MVP

**Goal**: Users can switch themes using a visible toggle button in the header (top-right)

**Independent Test**: Click theme toggle in header, verify all UI elements switch between light/dark immediately

### Implementation for User Story 1

- [ ] T007 [US1] Create ThemeToggle component with sun/moon icons in src/components/ui/ThemeToggle.jsx
- [ ] T008 [US1] Wrap App with ThemeProvider in src/App.jsx or src/main.jsx
- [ ] T009 [US1] Add ThemeToggle to header (top-right, next to UserSwitcher) in src/components/Dashboard.jsx
- [ ] T010 [US1] Add keyboard accessibility (Enter/Space activation, focus ring) to ThemeToggle component
- [ ] T011 [US1] Add tooltip with shortcut hint (Ctrl+Alt+D/L) to ThemeToggle in src/components/ui/ThemeToggle.jsx

**Checkpoint**: User Story 1 complete - theme toggle works in header, icons update to show current mode

---

## Phase 4: User Story 2 - Theme Persistence Across Sessions (Priority: P1)

**Goal**: Theme preference saved to localStorage and restored on app load

**Independent Test**: Select dark mode, close browser, reopen app - dark mode should be active automatically

### Implementation for User Story 2

- [ ] T012 [US2] Verify ThemeContext reads from localStorage on initialization in src/contexts/ThemeContext.jsx
- [ ] T013 [US2] Verify ThemeContext saves to localStorage on theme change in src/contexts/ThemeContext.jsx
- [ ] T014 [US2] Add fallback handling when localStorage is unavailable in src/utils/themeUtils.js
- [ ] T015 [US2] Prevent flash of wrong theme by applying theme class early in index.html

**Checkpoint**: User Story 2 complete - theme persists across browser sessions

---

## Phase 5: User Story 3 - Keyboard Shortcuts for Theme Switching (Priority: P2)

**Goal**: Power users can switch themes with Ctrl+Alt+D (dark) and Ctrl+Alt+L (light)

**Independent Test**: Press Ctrl+Alt+D anywhere in app, verify switch to dark mode. Press Ctrl+Alt+L, verify switch to light mode.

### Implementation for User Story 3

- [ ] T016 [US3] Register switchToDark and switchToLight handlers in KeyboardShortcutContext in src/contexts/KeyboardShortcutContext.jsx
- [ ] T017 [US3] Connect theme handlers to ThemeContext setTheme function in src/components/Dashboard.jsx
- [ ] T018 [US3] Verify theme shortcuts appear in keyboard shortcuts help overlay (Ctrl+/)
- [ ] T019 [US3] Add screen reader announcement for theme changes in src/contexts/ThemeContext.jsx

**Checkpoint**: User Story 3 complete - keyboard shortcuts work for theme switching

---

## Phase 6: User Story 4 - Comprehensive Element Theming (Priority: P1)

**Goal**: All UI elements properly themed with WCAG AA contrast in both modes

**Independent Test**: Switch to dark mode, navigate all views, verify every element is readable

### Core Layout Theming

- [ ] T020 [P] [US4] Add dark mode classes to main layout (body, main container) in src/App.jsx
- [ ] T021 [P] [US4] Add dark mode classes to header in src/components/Dashboard.jsx
- [ ] T022 [P] [US4] Add dark mode classes to sidebar/navigation elements in src/components/Dashboard.jsx

### Form Element Theming

- [ ] T023 [P] [US4] Add dark mode classes to input fields in all form components
- [ ] T024 [P] [US4] Add dark mode classes to select dropdowns in all form components
- [ ] T025 [P] [US4] Add dark mode classes to textarea elements in all form components
- [ ] T026 [P] [US4] Add dark mode classes to checkbox/radio elements in all form components

### Button Theming

- [ ] T027 [P] [US4] Add dark mode classes to primary buttons across components
- [ ] T028 [P] [US4] Add dark mode classes to secondary buttons across components
- [ ] T029 [P] [US4] Add dark mode classes to destructive/danger buttons across components
- [ ] T030 [P] [US4] Add dark mode classes to ghost/link buttons across components

### Card and Modal Theming

- [ ] T031 [P] [US4] Add dark mode classes to card components in src/components/tasks/TaskCard.jsx
- [ ] T032 [P] [US4] Add dark mode classes to modal/dialog components in src/components/ui/Modal.jsx
- [ ] T033 [P] [US4] Add dark mode classes to TaskModal in src/components/tasks/TaskModal.jsx
- [ ] T034 [P] [US4] Add dark mode classes to ConfirmDialog in src/components/ui/ConfirmDialog.jsx
- [ ] T035 [P] [US4] Add dark mode classes to dropdown menus

### View-Specific Theming

- [ ] T036 [P] [US4] Add dark mode classes to TaskList view in src/components/tasks/TaskList.jsx
- [ ] T037 [P] [US4] Add dark mode classes to KanbanView in src/components/views/KanbanView.jsx
- [ ] T038 [P] [US4] Add dark mode classes to CalendarView in src/components/views/CalendarView.jsx
- [ ] T039 [P] [US4] Add dark mode classes to FocusView in src/components/views/FocusView.jsx

### Priority Badge Theming

- [ ] T040 [US4] Update priority badge colors for dark mode (use data-model.md palette) in src/components/tasks/TaskCard.jsx
- [ ] T041 [US4] Ensure priority badges maintain distinct colors in dark mode in src/components/ui/PriorityBadge.jsx (if exists)

### Analytics and Charts Theming

- [ ] T042 [US4] Create chartColors object in ThemeContext for Recharts in src/contexts/ThemeContext.jsx
- [ ] T043 [P] [US4] Add dark mode classes to PersonalDashboard in src/components/analytics/PersonalDashboard.jsx
- [ ] T044 [P] [US4] Add dark mode classes to TeamDashboard in src/components/analytics/TeamDashboard.jsx
- [ ] T045 [US4] Pass theme-appropriate colors to Recharts components in analytics views

### Additional UI Elements

- [ ] T046 [P] [US4] Add dark mode classes to Toast notifications in src/components/ui/Toast.jsx
- [ ] T047 [P] [US4] Add dark mode classes to KeyboardShortcutsHelp overlay in src/components/ui/KeyboardShortcutsHelp.jsx
- [ ] T048 [P] [US4] Add dark mode classes to timer components in src/components/tasks/TaskTimer.jsx
- [ ] T049 [P] [US4] Add dark mode classes to UserSwitcher in src/components/auth/UserSwitcher.jsx
- [ ] T050 [P] [US4] Add dark mode classes to LoginForm in src/components/auth/LoginForm.jsx

### CSS Customizations

- [ ] T051 [US4] Add dark mode styles for custom scrollbars in src/styles/globals.css
- [ ] T052 [US4] Add dark mode styles for calendar grid in src/styles/globals.css
- [ ] T053 [US4] Add dark mode styles for Kanban columns in src/styles/globals.css

**Checkpoint**: User Story 4 complete - all elements properly themed, WCAG AA contrast met

---

## Phase 7: User Story 5 - System Theme Detection (Priority: P3)

**Goal**: First-time users see theme matching their OS preference

**Independent Test**: Clear localStorage, set OS to dark mode, open app - should start in dark mode

### Implementation for User Story 5

- [ ] T054 [US5] Verify getSystemTheme() uses prefers-color-scheme in src/utils/themeUtils.js
- [ ] T055 [US5] Verify getInitialTheme() prioritizes stored > system > default in src/utils/themeUtils.js
- [ ] T056 [US5] Track isSystemDefault state in ThemeContext for potential UI indication

**Checkpoint**: User Story 5 complete - OS theme detection works for first-time users

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements affecting multiple user stories

- [ ] T057 [P] Add print styles to force light theme in src/styles/globals.css
- [ ] T058 [P] Add prefers-reduced-motion support for theme transitions in src/styles/globals.css
- [ ] T059 Verify all text meets WCAG AA contrast (4.5:1 normal, 3:1 large) in dark mode
- [ ] T060 Test rapid theme toggle clicks for visual glitches
- [ ] T061 Cross-browser testing (Chrome, Firefox, Safari, Edge) for theme functionality
- [ ] T062 Run quickstart.md validation to verify implementation matches guide

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - US1 (Toggle) and US2 (Persistence) can run in parallel
  - US3 (Shortcuts) can start after Toggle
  - US4 (Element Theming) can start after Toggle
  - US5 (OS Detection) can run anytime after Foundational
- **Polish (Phase 8)**: Depends on US4 (Element Theming) completion

### User Story Dependencies

| Story | Can Start After | Notes |
|-------|-----------------|-------|
| US1 (Toggle) | Foundational | MVP - enables theme switching |
| US2 (Persistence) | Foundational | Independent, enhances US1 |
| US3 (Shortcuts) | Foundational | Integrates with keyboard system |
| US4 (Element Theming) | US1 (Toggle) | Requires toggle to test theming |
| US5 (OS Detection) | Foundational | Independent feature |

### Parallel Opportunities

**Phase 1 (Setup)** - All tasks can run in parallel:
```
T001 (tailwind config) | T002 (constants) | T003 (shortcuts)
```

**Phase 6 (Element Theming)** - Most tasks can run in parallel:
```
T020-T022 (layout) | T023-T026 (forms) | T027-T030 (buttons) | T031-T035 (cards/modals)
T036-T039 (views) | T043-T044 (analytics) | T046-T050 (UI elements)
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (Toggle)
4. Complete Phase 4: User Story 2 (Persistence)
5. **STOP and VALIDATE**: Toggle works, theme persists
6. Start Phase 6: User Story 4 (Element Theming) - most effort

### Incremental Delivery

1. Setup + Foundational → Infrastructure ready
2. Add US1 (Toggle) → Basic theme switching works
3. Add US2 (Persistence) → Preference saves
4. Add US3 (Shortcuts) → Power user feature
5. Add US4 (Theming) → Full visual polish
6. Add US5 (OS Detection) → First-time experience
7. Polish → Final quality pass

---

## Notes

- All tasks follow checklist format: `- [ ] [ID] [P?] [Story?] Description with file path`
- [P] tasks can run in parallel (different files, no dependencies)
- [Story] label maps task to specific user story for traceability
- US4 (Element Theming) contains most tasks - this is the visual work
- Use `dark:` Tailwind prefix for all theming (e.g., `dark:bg-slate-900`)
- Verify contrast ratios per data-model.md color palette
- Commit after each logical group of tasks
