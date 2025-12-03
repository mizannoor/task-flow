# Tasks: Multilanguage Support (i18n)

**Feature**: 012-i18n-support  
**Input**: Design documents from `/specs/012-i18n-support/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/translation-keys.md ✅, quickstart.md ✅

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., [US1], [US2])
- Exact file paths included in descriptions

## Path Conventions

Based on plan.md structure:
- **i18n infrastructure**: `src/i18n/`
- **React Context**: `src/contexts/`
- **Components**: `src/components/`
- **Hooks**: `src/hooks/`
- **Constants**: `src/utils/constants.js`

---

## Phase 1: Setup

**Purpose**: Create i18n infrastructure and translation files

- [ ] T001 [P] Add i18n constants to `src/utils/constants.js` (LANGUAGE_STORAGE_KEY, SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE)
- [ ] T002 [P] Create TypeScript types in `src/i18n/types.ts` (SupportedLanguage, TranslationParams, TranslationFunction, LanguageContextValue)
- [ ] T003 [P] Create i18n utility functions in `src/i18n/utils.ts` (detectLanguage, interpolate, getNestedValue, isValidLanguage)
- [ ] T004 [P] Create English translation file `src/i18n/locales/en.ts` with all translation keys from contracts/translation-keys.md
- [ ] T005 [P] Create Malay translation file `src/i18n/locales/ms.ts` with all translation keys from contracts/translation-keys.md
- [ ] T006 Create barrel file `src/i18n/index.ts` exporting translations, SUPPORTED_LANGUAGES array, types, and utils

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core i18n infrastructure that MUST be complete before components can be translated

**⚠️ CRITICAL**: No component migration can begin until this phase is complete

- [ ] T007 Create LanguageContext in `src/contexts/LanguageContext.jsx` with language state, setLanguage, and t() function
- [ ] T008 Create useTranslation hook in `src/hooks/useTranslation.js` that consumes LanguageContext
- [ ] T009 Create useTranslatedLabels hook in `src/hooks/useTranslatedLabels.js` for PRIORITY_LABELS, STATUS_LABELS, CATEGORY_LABELS helpers
- [ ] T010 Wrap App with LanguageProvider in `src/main.jsx`
- [ ] T011 Create LanguageSelector dropdown component in `src/components/ui/LanguageSelector.jsx`

**Checkpoint**: Foundation ready - component translations can now begin

---

## Phase 3: User Story 1 - View Application in Preferred Language (Priority: P1) 🎯 MVP

**Goal**: Users see the app in their preferred language based on browser detection or saved preference

**Independent Test**: Open app with browser set to Malay → all text displays in Malay; set to French → falls back to English

### Implementation for User Story 1

- [ ] T012 [US1] Update `src/components/auth/LoginForm.jsx` - replace hardcoded text with t() calls
- [ ] T013 [US1] Update `src/components/auth/UserSwitcher.jsx` - replace hardcoded text with t() calls
- [ ] T014 [US1] Update `src/App.jsx` - replace hardcoded text (Loading, Storage Error messages) with t() calls
- [ ] T015 [P] [US1] Update `src/components/ui/EmptyState.jsx` - replace hardcoded text with t() calls
- [ ] T016 [P] [US1] Update `src/components/ui/Modal.jsx` - replace hardcoded ARIA labels with t() calls
- [ ] T017 [P] [US1] Update `src/components/ui/Toast.jsx` - replace hardcoded ARIA labels with t() calls
- [ ] T018 [P] [US1] Update `src/components/ui/Badge.jsx` - ensure translated labels work correctly
- [ ] T019 [US1] Update `src/components/Dashboard.jsx` header section - replace hardcoded text with t() calls

**Checkpoint**: User Story 1 complete - app displays text in detected/saved language

---

## Phase 4: User Story 2 - Change Language via Dropdown (Priority: P1)

**Goal**: Users can manually switch language using dropdown; UI updates immediately without reload

**Independent Test**: Click language dropdown → select "Bahasa Melayu" → all visible text changes to Malay instantly

### Implementation for User Story 2

- [ ] T020 [US2] Add LanguageSelector to Dashboard header in `src/components/Dashboard.jsx` (near ThemeToggle)
- [ ] T021 [US2] Add toast notification on language change showing "Language changed to {language}"
- [ ] T022 [US2] Update LanguageSelector with proper ARIA labels and keyboard navigation in `src/components/ui/LanguageSelector.jsx`

**Checkpoint**: User Story 2 complete - users can switch language via dropdown

---

## Phase 5: User Story 3 - Language Preference Persistence (Priority: P2)

**Goal**: Selected language persists across browser sessions via localStorage

**Independent Test**: Select Malay → close browser → reopen → app displays in Malay

### Implementation for User Story 3

- [ ] T023 [US3] Implement localStorage persistence in LanguageContext (save on setLanguage, load on init)
- [ ] T024 [US3] Add graceful degradation when localStorage unavailable in `src/contexts/LanguageContext.jsx`
- [ ] T025 [US3] Verify language detection priority order: localStorage → browser language → English fallback

**Checkpoint**: User Story 3 complete - language preference persists

---

## Phase 6: User Story 4 - Dynamic Content Translation (Priority: P2)

**Goal**: System messages (toasts, errors, validation) display in selected language

**Independent Test**: With Malay selected → create task → success toast appears in Malay; submit invalid form → validation errors in Malay

### Implementation for User Story 4

- [ ] T026 [P] [US4] Update `src/components/tasks/TaskForm.jsx` - replace validation error messages with t() calls
- [ ] T027 [P] [US4] Update `src/components/tasks/TaskModal.jsx` - replace hardcoded text with t() calls
- [ ] T028 [P] [US4] Update `src/components/tasks/TaskList.jsx` - replace hardcoded text with t() calls
- [ ] T029 [P] [US4] Update `src/components/tasks/TaskRow.jsx` - replace hardcoded text with t() calls
- [ ] T030 [P] [US4] Update `src/components/tasks/TaskDetail.jsx` - replace hardcoded text with t() calls
- [ ] T031 [P] [US4] Update `src/components/tasks/TaskActions.jsx` - replace hardcoded text with t() calls
- [ ] T032 [P] [US4] Update `src/components/tasks/FilterBar.jsx` - replace filter labels with t() calls
- [ ] T033 [P] [US4] Update `src/components/tasks/SortSelect.jsx` - replace sort labels with t() calls
- [ ] T034 [P] [US4] Update `src/components/tasks/SearchInput.jsx` - replace placeholder with t() calls
- [ ] T035 [P] [US4] Update `src/components/tasks/TaskTimer.jsx` - replace timer labels with t() calls
- [ ] T036 [P] [US4] Update `src/components/tasks/ManualTimeEntry.jsx` - replace form labels with t() calls
- [ ] T037 [P] [US4] Update `src/components/tasks/LongSessionModal.jsx` - replace hardcoded text with t() calls
- [ ] T038 [P] [US4] Update `src/components/tasks/TimerRecoveryModal.jsx` - replace hardcoded text with t() calls
- [ ] T039 [P] [US4] Update `src/components/tasks/AISuggestionPanel.jsx` - replace AI text with t() calls
- [ ] T040 [P] [US4] Update `src/components/ui/ConfirmDialog.jsx` - replace button labels with t() calls
- [ ] T041 [US4] Update toast notifications in `src/components/Dashboard.jsx` - use t() for all toast messages
- [ ] T042 [US4] Update `src/components/ui/Pagination.jsx` - replace pagination labels with t() calls

**Checkpoint**: User Story 4 complete - all dynamic content displays in selected language

---

## Phase 7: User Story 5 - Consistent Language Across All Views (Priority: P3)

**Goal**: All views (Kanban, Focus, Calendar, Analytics) consistently display in selected language

**Independent Test**: With Malay selected → navigate to Kanban → column headers in Malay; navigate to Statistics → chart labels in Malay

### Implementation for User Story 5

#### Kanban View
- [ ] T043 [P] [US5] Update `src/components/views/KanbanView.jsx` - replace column headers and labels with t() calls

#### Focus View
- [ ] T044 [P] [US5] Update `src/components/views/FocusView.jsx` - replace tier labels and headings with t() calls

#### Calendar View
- [ ] T045 [P] [US5] Update `src/components/views/CalendarView.jsx` - replace calendar labels with t() calls

#### Analytics Views
- [ ] T046 [P] [US5] Update `src/components/analytics/PersonalDashboard.jsx` - replace analytics labels with t() calls
- [ ] T047 [P] [US5] Update `src/components/analytics/TeamDashboard.jsx` - replace team analytics labels with t() calls

#### Settings & Help
- [ ] T048 [P] [US5] Update `src/components/ui/ThemeToggle.jsx` - replace tooltip text with t() calls
- [ ] T049 [P] [US5] Update `src/components/ui/KeyboardShortcutsHelp.jsx` - replace shortcut descriptions with t() calls

#### View Navigation
- [ ] T050 [US5] Update view switcher buttons in `src/components/Dashboard.jsx` - replace view names with t() calls

**Checkpoint**: User Story 5 complete - all views display consistently in selected language

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup, validation, and documentation

- [ ] T051 [P] Verify all translation keys exist in both en.ts and ms.ts (no missing keys)
- [ ] T052 [P] Test fallback behavior - add console warnings for missing keys in development mode
- [ ] T053 [P] Add LanguageSelector aria-labels for accessibility
- [ ] T054 [P] Update keyboard shortcuts descriptions in `src/utils/constants.js` to use translation keys
- [ ] T055 Run quickstart.md validation - verify all documented patterns work correctly
- [ ] T056 Code cleanup - remove any remaining hardcoded strings, ensure consistent t() usage patterns

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
    ├── Phase 3 (US1 - Preferred Language) ───────►
    │
    ├── Phase 4 (US2 - Language Dropdown) ────────► (can start with US1)
    │
    ├── Phase 5 (US3 - Persistence) ──────────────► (after US2)
    │
    ├── Phase 6 (US4 - Dynamic Content) ──────────► (after US1)
    │
    └── Phase 7 (US5 - All Views) ────────────────► (after US1)
                                                    │
Phase 8 (Polish) ◄──────────────────────────────────┘
```

### User Story Dependencies

| Story | Depends On | Can Parallel With |
|-------|-----------|-------------------|
| US1 (Preferred Language) | Phase 2 complete | US2 |
| US2 (Language Dropdown) | Phase 2 complete | US1 |
| US3 (Persistence) | US2 (dropdown exists) | US4, US5 |
| US4 (Dynamic Content) | US1 (core translations work) | US3, US5 |
| US5 (All Views) | US1 (core translations work) | US3, US4 |

### Parallel Opportunities

**Phase 1** (all can run in parallel):
- T001, T002, T003 - Different files, no dependencies
- T004, T005 - Translation files can be written simultaneously

**Phase 6** (most tasks parallelizable):
- T026-T042 - Different component files, all depend only on useTranslation hook

**Phase 7** (all view updates parallelizable):
- T043-T050 - Different view files, no cross-dependencies

---

## Parallel Example: Phase 6

```bash
# These 14 component updates can ALL run in parallel:
Task T026: TaskForm.jsx
Task T027: TaskModal.jsx
Task T028: TaskList.jsx
Task T029: TaskRow.jsx
Task T030: TaskDetail.jsx
Task T031: TaskActions.jsx
Task T032: FilterBar.jsx
Task T033: SortSelect.jsx
Task T034: SearchInput.jsx
Task T035: TaskTimer.jsx
Task T036: ManualTimeEntry.jsx
Task T037: LongSessionModal.jsx
Task T038: TimerRecoveryModal.jsx
Task T039: AISuggestionPanel.jsx
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup (i18n infrastructure)
2. Complete Phase 2: Foundational (Context, hooks, selector)
3. Complete Phase 3: User Story 1 (core components translated)
4. Complete Phase 4: User Story 2 (language dropdown working)
5. **STOP and VALIDATE**: Switch languages, verify core UI works
6. Deploy/demo as MVP

### Incremental Delivery

1. Setup + Foundational → Infrastructure ready
2. Add US1 + US2 → Core i18n working → **MVP!**
3. Add US3 → Persistence works → Deploy
4. Add US4 → All dynamic content translated → Deploy
5. Add US5 → All views consistent → Deploy
6. Polish → Production ready

### Single Developer Strategy

1. T001-T006 (Setup) - ~1 hour
2. T007-T011 (Foundational) - ~2 hours
3. T012-T019 (US1) - ~2 hours
4. T020-T022 (US2) - ~1 hour
5. **Checkpoint: MVP complete** (~6 hours)
6. T023-T025 (US3) - ~30 min
7. T026-T042 (US4) - ~3 hours
8. T043-T050 (US5) - ~2 hours
9. T051-T056 (Polish) - ~1 hour
10. **Total estimate: ~15 hours**

---

## Notes

- **[P]** tasks can be done in any order within their phase
- **[Story]** label tracks which user story each task belongs to
- All translation keys are documented in `contracts/translation-keys.md`
- Use `useTranslation` hook in functional components
- Use `useTranslatedLabels` hook for constant label mappings
- Test with browser language set to `ms` or `ms-MY` to verify Malay detection
- Console warnings appear in dev mode for missing translation keys
- Commit after each logical group of tasks
