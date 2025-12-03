# Tasks: AI-Powered Task Analysis

**Input**: Design documents from `/specs/008-ai-task-analysis/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ai-types.ts ✅

**Tests**: Not explicitly requested in spec - excluding test tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add AI-related constants and configuration

- [x] T001 Add AI_CONFIG constants (MODEL, ENDPOINT, TIMEOUT_MS, MAX_DESCRIPTION_LENGTH) in src/utils/constants.js
- [x] T002 [P] Add AI_DEFAULTS constants (COMPLEXITY, PRIORITY, CATEGORY, TAGS, ESTIMATED_DURATION, reasoning messages) in src/utils/constants.js
- [x] T003 [P] Add AI_ERROR_MESSAGES constants (NOT_CONFIGURED, OFFLINE, TIMEOUT, RATE_LIMIT, GENERIC) in src/utils/constants.js
- [x] T004 [P] Create SparkleIcon component (SVG) for AI indicator in src/components/ui/SparkleIcon.jsx

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core AI service that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create aiService.js with isConfigured() method that checks VITE_GEMINI_API_KEY in src/services/aiService.js
- [x] T006 Implement getDefaults(reason) method returning FallbackDefaults object in src/services/aiService.js
- [x] T007 Implement truncateDescription(description, maxLength=2000) helper function in src/services/aiService.js
- [x] T008 Implement buildPrompt(taskName, description) method with TASK_ANALYSIS_PROMPT template in src/services/aiService.js
- [x] T009 Implement parseResponse(data) method with JSON extraction and field validation in src/services/aiService.js
- [x] T010 Implement analyzeTask(taskName, description) method with fetch, AbortController timeout, and error handling in src/services/aiService.js
- [x] T011 Create useAISuggestions hook skeleton with state (suggestions, isLoading, error, isConfigured) in src/hooks/useAISuggestions.js
- [x] T012 Implement analyzeTask action in useAISuggestions that calls aiService.analyzeTask in src/hooks/useAISuggestions.js
- [x] T013 Implement dismiss action to clear suggestions state in src/hooks/useAISuggestions.js

**Checkpoint**: Foundation ready - AI service and hook are functional, user story implementation can now begin

---

## Phase 3: User Story 1 - Get AI Suggestions for a New Task (Priority: P1) 🎯 MVP

**Goal**: Users can click "Get AI Suggestions" to receive intelligent property suggestions for complexity, priority, category, tags, and duration

**Independent Test**: Create a new task, enter name and description, click "Get AI Suggestions," verify all fields are populated with values and reasoning is displayed

### Implementation for User Story 1

- [x] T014 [US1] Create AISuggestionPanel component skeleton with props interface in src/components/tasks/AISuggestionPanel.jsx
- [x] T015 [US1] Implement loading state UI in AISuggestionPanel showing "Analyzing task..." spinner in src/components/tasks/AISuggestionPanel.jsx
- [x] T016 [US1] Implement suggestions display section showing complexity, priority, category, tags, duration values in src/components/tasks/AISuggestionPanel.jsx
- [x] T017 [US1] Implement reasoning display section (expandable) in AISuggestionPanel in src/components/tasks/AISuggestionPanel.jsx
- [x] T018 [US1] Implement "Accept All Suggestions" button with onAcceptAll callback in src/components/tasks/AISuggestionPanel.jsx
- [x] T019 [US1] Add acceptAll action to useAISuggestions that returns all suggestion values in src/hooks/useAISuggestions.js
- [x] T020 [US1] Add "Get AI Suggestions" button to TaskForm component in src/components/tasks/TaskForm.jsx
- [x] T021 [US1] Integrate useAISuggestions hook into TaskForm in src/components/tasks/TaskForm.jsx
- [x] T022 [US1] Wire "Get AI Suggestions" button to call analyzeTask(taskName, description) in src/components/tasks/TaskForm.jsx
- [x] T023 [US1] Render AISuggestionPanel below task name/description fields in TaskForm in src/components/tasks/TaskForm.jsx
- [x] T024 [US1] Implement acceptAll handler to populate all form fields from suggestions in src/components/tasks/TaskForm.jsx
- [x] T025 [US1] Add aiSuggestedFields state (Set) to track which fields have AI values in src/components/tasks/TaskForm.jsx
- [x] T026 [US1] Render SparkleIcon next to form field labels when field is in aiSuggestedFields in src/components/tasks/TaskForm.jsx

**Checkpoint**: User Story 1 complete - users can get AI suggestions and accept all at once with visual indicators

---

## Phase 4: User Story 2 - Selectively Accept or Modify AI Suggestions (Priority: P1)

**Goal**: Users can accept individual suggestions, modify values, and use "Accept Remaining" for a hybrid approach

**Independent Test**: Get AI suggestions, accept some fields individually, manually modify others, verify task saves with mixed values

### Implementation for User Story 2

- [x] T027 [US2] Add individual "Accept" buttons next to each suggestion field in AISuggestionPanel in src/components/tasks/AISuggestionPanel.jsx
- [x] T028 [US2] Implement onAcceptField callback for individual field acceptance in AISuggestionPanel in src/components/tasks/AISuggestionPanel.jsx
- [x] T029 [US2] Add acceptSuggestion(field) action to useAISuggestions hook in src/hooks/useAISuggestions.js
- [x] T030 [US2] Implement individual field accept handler in TaskForm that updates single form field in src/components/tasks/TaskForm.jsx
- [x] T031 [US2] Clear field from aiSuggestedFields when user manually modifies a field in src/components/tasks/TaskForm.jsx
- [x] T032 [US2] Implement "Accept Remaining" button that only applies to non-modified fields in AISuggestionPanel in src/components/tasks/AISuggestionPanel.jsx
- [x] T033 [US2] Implement acceptRemaining handler that skips already-modified fields in src/components/tasks/TaskForm.jsx
- [x] T034 [US2] Add "Dismiss All" button to AISuggestionPanel in src/components/tasks/AISuggestionPanel.jsx
- [x] T035 [US2] Implement dismiss handler to clear suggestions and reset form to defaults in src/components/tasks/TaskForm.jsx

**Checkpoint**: User Story 2 complete - users have full control over accepting/rejecting individual AI suggestions

---

## Phase 5: User Story 3 - Graceful Offline Fallback (Priority: P1)

**Goal**: When AI is unavailable (offline, timeout, error), system provides sensible defaults without blocking task creation

**Independent Test**: Disable network, click "Get AI Suggestions," verify defaults are applied with appropriate notification message

### Implementation for User Story 3

- [x] T036 [US3] Add navigator.onLine check at start of analyzeTask in aiService in src/services/aiService.js
- [x] T037 [US3] Implement AbortController with 10-second timeout in analyzeTask in src/services/aiService.js
- [x] T038 [US3] Handle HTTP 429 (rate limit) with specific error message in analyzeTask in src/services/aiService.js
- [x] T039 [US3] Handle HTTP 401/403 (invalid key) with specific fallback reason in analyzeTask in src/services/aiService.js
- [x] T040 [US3] Handle AbortError (timeout) with specific fallback reason in analyzeTask in src/services/aiService.js
- [x] T041 [US3] Handle network errors with generic fallback in analyzeTask in src/services/aiService.js
- [x] T042 [US3] Add error state display in AISuggestionPanel showing notification message in src/components/tasks/AISuggestionPanel.jsx
- [x] T043 [US3] Display defaults with "AI analysis unavailable - using default values" notification in src/components/tasks/AISuggestionPanel.jsx
- [x] T044 [US3] Ensure defaults do NOT show SparkleIcon (isAISuggested=false) in src/components/tasks/TaskForm.jsx
- [x] T045 [US3] Add "Retry AI Analysis" button when error occurred in AISuggestionPanel in src/components/tasks/AISuggestionPanel.jsx

**Checkpoint**: User Story 3 complete - AI failures never block task creation, graceful fallback works

---

## Phase 6: User Story 4 - View AI Reasoning and Learn (Priority: P2)

**Goal**: Users can expand a "Reasoning" section to understand why AI suggested specific values

**Independent Test**: Get AI suggestions, click "Show Reasoning," verify explanation text is displayed and can be hidden

### Implementation for User Story 4

- [x] T046 [US4] Add expandable/collapsible reasoning section with toggle button in AISuggestionPanel in src/components/tasks/AISuggestionPanel.jsx
- [x] T047 [US4] Add local state for reasoning visibility (expanded/collapsed) in AISuggestionPanel in src/components/tasks/AISuggestionPanel.jsx
- [x] T048 [US4] Display reasoning text from suggestions.reasoning when expanded in src/components/tasks/AISuggestionPanel.jsx
- [x] T049 [US4] Style reasoning section with appropriate visual treatment (indented, muted text) in src/components/tasks/AISuggestionPanel.jsx
- [x] T050 [US4] Display fallback reasoning "Using default values due to AI unavailability" when defaults used in src/components/tasks/AISuggestionPanel.jsx

**Checkpoint**: User Story 4 complete - users can view and understand AI reasoning

---

## Phase 7: User Story 5 - Re-analyze Task After Editing Description (Priority: P2)

**Goal**: Users can re-analyze after modifying task name or description to get updated suggestions

**Independent Test**: Get suggestions, modify description, click "Re-analyze," verify suggestions update to reflect changes

### Implementation for User Story 5

- [x] T051 [US5] Track lastAnalyzedInput (taskName, description) in useAISuggestions hook state in src/hooks/useAISuggestions.js
- [x] T052 [US5] Store lastAnalyzedInput after successful analyzeTask call in src/hooks/useAISuggestions.js
- [x] T053 [US5] Add hasInputChanged computed value comparing current input to lastAnalyzedInput in src/components/tasks/TaskForm.jsx
- [x] T054 [US5] Pass showReanalyze prop to AISuggestionPanel based on hasInputChanged in src/components/tasks/TaskForm.jsx
- [x] T055 [US5] Show "Re-analyze" button when showReanalyze is true in AISuggestionPanel in src/components/tasks/AISuggestionPanel.jsx
- [x] T056 [US5] Add reanalyze action to useAISuggestions that calls analyzeTask with current values in src/hooks/useAISuggestions.js
- [x] T057 [US5] Implement re-analysis loading state showing "Re-analyzing..." with existing suggestions visible in src/components/tasks/AISuggestionPanel.jsx
- [x] T058 [US5] Highlight changed values after re-analysis completes (visual diff) in src/components/tasks/AISuggestionPanel.jsx

**Checkpoint**: User Story 5 complete - users can re-analyze when task details change

---

## Phase 8: User Story 6 - Manual Task Creation Without AI (Priority: P3)

**Goal**: AI feature is optional - users can create tasks manually without any AI interaction

**Independent Test**: Create a task by manually entering all fields, never click AI button, verify task saves correctly

### Implementation for User Story 6

- [x] T059 [US6] Ensure "Get AI Suggestions" button does not block form submission in src/components/tasks/TaskForm.jsx
- [x] T060 [US6] Verify form validation works independently of AI suggestions in src/components/tasks/TaskForm.jsx
- [x] T061 [US6] Handle disabled state for "Get AI Suggestions" when API key missing with tooltip "AI not configured" in src/components/tasks/TaskForm.jsx
- [x] T062 [US6] Ensure task saves correctly with manual values when no AI suggestions requested in src/components/tasks/TaskForm.jsx

**Checkpoint**: User Story 6 complete - manual task creation works independently of AI feature

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases, accessibility, and final refinements

- [x] T063 [P] Add request debouncing to prevent rapid multiple AI requests in src/hooks/useAISuggestions.js
- [x] T064 [P] Add keyboard accessibility to AISuggestionPanel buttons (focus, Enter/Space activation) in src/components/tasks/AISuggestionPanel.jsx
- [x] T065 [P] Add aria-labels and screen reader support to AI suggestion UI in src/components/tasks/AISuggestionPanel.jsx
- [x] T066 [P] Handle malformed JSON response by parsing valid fields and defaulting invalid ones in src/services/aiService.js
- [x] T067 Add responsive styling for AISuggestionPanel on mobile breakpoints in src/components/tasks/AISuggestionPanel.jsx
- [x] T068 Run quickstart.md validation to verify integration guide accuracy

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - US1 and US2 are both P1 priority but US2 builds on US1 acceptance mechanics
  - US3 is P1 but can be done in parallel with US1/US2 (focuses on error handling)
  - US4, US5 are P2 - can start after Foundational, builds on US1 UI
  - US6 is P3 - mostly verification that existing flow still works
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

| Story | Priority | Dependencies              | Can Parallel With |
| ----- | -------- | ------------------------- | ----------------- |
| US1   | P1       | Foundational              | -                 |
| US2   | P1       | US1 (acceptance UI)       | US3               |
| US3   | P1       | Foundational              | US1, US2          |
| US4   | P2       | US1 (suggestions display) | US5, US6          |
| US5   | P2       | US1 (suggestions state)   | US4, US6          |
| US6   | P3       | Foundational              | US4, US5          |

### Within Each User Story

- Service code before hook code
- Hook code before component code
- Component skeleton before implementation details
- Core functionality before edge cases

### Parallel Opportunities

- All Setup tasks T001-T004 can run in parallel (different sections of constants.js, separate file for SparkleIcon)
- Foundational tasks T005-T010 (aiService) are sequential; T011-T013 (hook) can start after T010
- Within US3: T036-T041 (service error handling) can be done in parallel
- All Polish tasks T063-T067 can run in parallel (different files/concerns)

---

## Parallel Example: Setup Phase

```bash
# All can run in parallel - different files/sections:
T001: Add AI_CONFIG constants in src/utils/constants.js
T002: Add AI_DEFAULTS constants in src/utils/constants.js
T003: Add AI_ERROR_MESSAGES constants in src/utils/constants.js
T004: Create SparkleIcon component in src/components/ui/SparkleIcon.jsx
```

## Parallel Example: User Story 3 Error Handling

```bash
# All error handling implementations are independent:
T036: navigator.onLine check
T037: AbortController timeout
T038: HTTP 429 handling
T039: HTTP 401/403 handling
T040: AbortError handling
T041: Network error handling
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T013)
3. Complete Phase 3: User Story 1 (T014-T026)
4. **STOP and VALIDATE**: Test "Get AI Suggestions" → "Accept All" flow
5. Deploy/demo if ready - basic AI suggestions work!

### Incremental Delivery

1. **MVP**: Setup + Foundational + US1 = Users can get and accept AI suggestions
2. **+US2**: Add selective acceptance = Hybrid mode works
3. **+US3**: Add offline fallback = Robust error handling
4. **+US4**: Add reasoning display = Transparency for users
5. **+US5**: Add re-analysis = Dynamic updates
6. **+US6**: Verify manual mode = Complete feature
7. **Polish**: Edge cases and accessibility

### Task Count Summary

| Phase        | Tasks  | Priority     |
| ------------ | ------ | ------------ |
| Setup        | 4      | -            |
| Foundational | 9      | CRITICAL     |
| US1 (P1)     | 13     | MVP          |
| US2 (P1)     | 9      | Core         |
| US3 (P1)     | 10     | Core         |
| US4 (P2)     | 5      | Enhancement  |
| US5 (P2)     | 8      | Enhancement  |
| US6 (P3)     | 4      | Verification |
| Polish       | 6      | Final        |
| **Total**    | **68** |              |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- No tests included (not requested in spec) - add via `/speckit.tasks --with-tests` if needed
