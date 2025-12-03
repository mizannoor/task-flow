# Feature Specification: Keyboard Shortcuts

**Feature Branch**: `010-keyboard-shortcuts`  
**Created**: December 3, 2025  
**Status**: Draft  
**Input**: User description: "Keyboard shortcuts for power users enabling quick task creation, navigation between views, task list navigation, task actions, and contextual shortcuts"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Quick Task Creation with Keyboard (Priority: P1)

As a power user, I want to create a new task by pressing `Ctrl + N` from anywhere in the application, so I can quickly capture tasks without reaching for the mouse or navigating to the task creation UI.

**Why this priority**: Task creation is the most frequent action in the application. Enabling keyboard-based task creation provides immediate productivity gains for power users who prefer keyboard-centric workflows.

**Independent Test**: Can be fully tested by pressing `Ctrl + N` from any view and verifying the task creation dialog opens, delivering immediate value for rapid task capture.

**Acceptance Scenarios**:

1. **Given** I am logged in and viewing any screen, **When** I press `Ctrl + N`, **Then** the task creation modal opens with the task name field focused
2. **Given** the task creation modal is open, **When** I press `Escape`, **Then** the modal closes without creating a task
3. **Given** I am typing in a text input field (e.g., search), **When** I press `Ctrl + N`, **Then** the shortcut still works and opens the task creation modal
4. **Given** I am already in the task creation modal, **When** I press `Ctrl + N` again, **Then** nothing happens (shortcut is ignored to prevent duplicate modals)

---

### User Story 2 - View Switching with Number Keys (Priority: P2)

As a power user, I want to switch between different views (List, Kanban, Calendar, Focus) using number keys `1`, `2`, `3`, `4`, so I can quickly navigate to my preferred view without clicking.

**Why this priority**: View switching is a common action. Enabling single-key navigation significantly speeds up workflow transitions for users who frequently switch between views.

**Independent Test**: Can be fully tested by pressing number keys `1-4` and verifying the application switches to the corresponding view.

**Acceptance Scenarios**:

1. **Given** I am viewing the Kanban board, **When** I press `1`, **Then** the application switches to List view
2. **Given** I am viewing the List view, **When** I press `2`, **Then** the application switches to Kanban view
3. **Given** I am viewing any view, **When** I press `3`, **Then** the application switches to Calendar view
4. **Given** I am viewing any view, **When** I press `4`, **Then** the application switches to Today's Focus view
5. **Given** I am typing in a text input or the search bar, **When** I press a number key, **Then** the character is typed (shortcuts are disabled when typing)
6. **Given** I am already on the view corresponding to the key pressed, **When** I press that number key, **Then** nothing changes (no unnecessary re-render)

---

### User Story 3 - Task Navigation with Arrow Keys (Priority: P3)

As a user working with task lists, I want to navigate between tasks using arrow keys (`↑` / `↓`), so I can quickly move through my tasks without using the mouse.

**Why this priority**: Arrow key navigation is essential for keyboard-centric task management. It enables users to browse and select tasks efficiently in list-based views.

**Independent Test**: Can be fully tested by using arrow keys in the List view to navigate between task rows and verifying focus moves correctly.

**Acceptance Scenarios**:

1. **Given** I am in List view with tasks displayed and a task is focused, **When** I press `↓`, **Then** focus moves to the next task in the list
2. **Given** I am in List view with a task focused, **When** I press `↑`, **Then** focus moves to the previous task in the list
3. **Given** I am focused on the first task in the list, **When** I press `↑`, **Then** focus remains on the first task (no wrap-around)
4. **Given** I am focused on the last task in the list, **When** I press `↓`, **Then** focus remains on the last task (no wrap-around)
5. **Given** I am in Kanban view with a card focused, **When** I press arrow keys, **Then** I can navigate between cards within and across columns (using existing Kanban keyboard navigation)

---

### User Story 4 - Task Actions with Single Keys (Priority: P4)

As a user with a task focused, I want to perform common actions using single-key shortcuts (`E` to edit, `D` to delete, `C` to complete, `S` to start), so I can manage tasks quickly without context menus.

**Why this priority**: Single-key task actions eliminate the need for mouse clicks or menu navigation, significantly speeding up task management for users who process many tasks.

**Independent Test**: Can be fully tested by focusing a task and pressing action keys to verify the corresponding action executes correctly.

**Acceptance Scenarios**:

1. **Given** a task is focused in List or Kanban view, **When** I press `E`, **Then** the task edit dialog opens with task details pre-filled
2. **Given** a task is focused, **When** I press `D`, **Then** a deletion confirmation dialog appears
3. **Given** a pending task is focused, **When** I press `S`, **Then** the task status changes to "In Progress" with visual confirmation
4. **Given** an in-progress task is focused, **When** I press `C`, **Then** the task status changes to "Completed" with visual confirmation
5. **Given** a completed task is focused, **When** I press `C`, **Then** nothing happens (cannot complete an already completed task)
6. **Given** I am typing in an input field, **When** I press any single-key shortcut, **Then** the character is typed (shortcuts are disabled when typing)

---

### User Story 5 - Task Selection with Space Key (Priority: P5)

As a user managing multiple tasks, I want to toggle task selection using the `Space` key, so I can select multiple tasks for bulk operations without using checkboxes.

**Why this priority**: Multi-selection is important for bulk operations like bulk delete or status change, enhancing productivity for users managing many tasks at once.

**Independent Test**: Can be fully tested by navigating to tasks and pressing `Space` to verify selection toggles on/off.

**Acceptance Scenarios**:

1. **Given** a task is focused and not selected, **When** I press `Space`, **Then** the task becomes selected (checkbox checked) and remains focused
2. **Given** a task is focused and already selected, **When** I press `Space`, **Then** the task becomes deselected (checkbox unchecked)
3. **Given** multiple tasks are selected, **When** I press `Escape`, **Then** all selections are cleared
4. **Given** I am in Kanban view with a card focused, **When** I press `Space`, **Then** the card's selection state toggles

---

### User Story 6 - Search Focus with Keyboard (Priority: P6)

As a user wanting to find tasks quickly, I want to press `Ctrl + F` to focus the search bar, so I can start typing my search query immediately without clicking.

**Why this priority**: Quick access to search is a standard expectation in productivity applications. This shortcut aligns with common software conventions.

**Independent Test**: Can be fully tested by pressing `Ctrl + F` and verifying the search input receives focus.

**Acceptance Scenarios**:

1. **Given** I am on any view, **When** I press `Ctrl + F`, **Then** the search bar receives focus and I can start typing
2. **Given** the search bar is already focused with text, **When** I press `Ctrl + F`, **Then** all text in the search bar is selected for easy replacement
3. **Given** a modal dialog is open, **When** I press `Ctrl + F`, **Then** the shortcut is ignored (focus stays in modal context)

---

### User Story 7 - Keyboard Shortcuts Help Overlay (Priority: P7)

As a new or occasional user, I want to press `Ctrl + /` to see a help overlay showing all available keyboard shortcuts, so I can learn and remember the shortcuts without leaving the application.

**Why this priority**: A discoverable help overlay is essential for user education and adoption of keyboard shortcuts. Without it, many users won't discover or remember the shortcuts.

**Independent Test**: Can be fully tested by pressing `Ctrl + /` and verifying a help modal appears with all shortcuts listed.

**Acceptance Scenarios**:

1. **Given** I am on any view, **When** I press `Ctrl + /`, **Then** a modal overlay appears showing all available keyboard shortcuts organized by category
2. **Given** the help overlay is open, **When** I press `Escape` or `Ctrl + /` again, **Then** the overlay closes
3. **Given** the help overlay is open, **When** I click outside the overlay, **Then** the overlay closes
4. **Given** I am viewing the shortcuts help, **Then** I see shortcuts grouped into categories: Global, Navigation, Task Actions, and Selection

---

### User Story 8 - Close Modals and Clear State with Escape (Priority: P8)

As a user, I want to press `Escape` to close any open modal, clear active selections, or exit focused states, so I have a consistent way to "cancel" or "exit" any state.

**Why this priority**: Escape is a universal "cancel" key that users expect to work. Consistent behavior builds user confidence and reduces friction.

**Independent Test**: Can be fully tested by opening various modals/states and pressing `Escape` to verify they close/clear.

**Acceptance Scenarios**:

1. **Given** a modal dialog is open (create, edit, delete confirmation), **When** I press `Escape`, **Then** the modal closes without saving changes
2. **Given** one or more tasks are selected, **When** I press `Escape`, **Then** all selections are cleared
3. **Given** the search bar is focused with search text, **When** I press `Escape`, **Then** the search text is cleared and focus returns to the main content
4. **Given** a dropdown menu is open, **When** I press `Escape`, **Then** the dropdown closes
5. **Given** the keyboard shortcuts help overlay is open, **When** I press `Escape`, **Then** the overlay closes

---

### Edge Cases

- What happens when a user presses a shortcut while a network request is in progress (e.g., AI analysis)? Shortcuts work independently; the shortcut action queues after the current operation.
- How does the system handle shortcuts when multiple modals/overlays are stacked? Only the topmost modal responds to `Escape`; other global shortcuts are blocked.
- What happens when shortcuts conflict with browser shortcuts (e.g., `Ctrl + N` opens new browser window)? The application intercepts and prevents default browser behavior for registered shortcuts.
- How does the system handle shortcuts when focus is in a rich text editor or contenteditable area? Single-key shortcuts are disabled; modifier shortcuts (Ctrl + key) still work.
- What happens when a user with screen reader uses the application? All keyboard shortcuts are announced to screen readers, and shortcuts don't interfere with screen reader navigation modes.
- How should the system behave on macOS where Command is used instead of Control? The system uses `Cmd` instead of `Ctrl` on macOS for all modifier-based shortcuts.
- What happens when a user rapidly chains shortcuts while holding a modifier key? Each shortcut triggers independently as keys are pressed, allowing rapid workflow chaining.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST provide global keyboard shortcuts that work from any view: `Ctrl + N` (create task), `Ctrl + F` (focus search), `Ctrl + /` (show help), `Escape` (close/clear)
- **FR-002**: System MUST provide view-switching shortcuts using number keys `1` (List), `2` (Kanban), `3` (Calendar), `4` (Focus) when not typing in an input field
- **FR-003**: System MUST provide task navigation using `↑` and `↓` arrow keys to move focus between tasks in list-based views
- **FR-004**: System MUST provide task action shortcuts when a task is focused: `E` (edit), `D` (delete), `C` (complete), `S` (start)
- **FR-005**: System MUST provide task selection toggle using `Space` key when a task is focused
- **FR-006**: System MUST display a keyboard shortcuts help overlay when user presses `Ctrl + /`, showing all shortcuts organized by category
- **FR-007**: System MUST disable single-key shortcuts (letters, numbers, space) when focus is in a text input, textarea, or contenteditable element
- **FR-008**: System MUST prevent default browser behavior for registered shortcuts (e.g., prevent `Ctrl + N` from opening new browser window)
- **FR-009**: System MUST support platform-specific modifier keys: `Ctrl` on Windows/Linux, `Cmd` on macOS
- **FR-010**: System MUST provide visual feedback when a shortcut action is executed (e.g., toast notification for task completion)
- **FR-011**: System MUST integrate with existing Kanban keyboard navigation for arrow key and space key behaviors in Kanban view
- **FR-012**: System MUST ignore shortcuts when a modal dialog is open, except for `Escape` to close the modal
- **FR-013**: System MUST announce shortcut actions to screen readers for accessibility
- **FR-014**: System MUST show shortcut hints in tooltips and menus where applicable (e.g., "Create Task (Ctrl+N)")
- **FR-015**: System MUST track keyboard shortcut usage locally in IndexedDB for personal analytics, recording which shortcuts are used and their frequency

### Key Entities

- **Shortcut Definition**: Represents a keyboard shortcut binding including the key combination, action to execute, context where it's active, and whether it requires a modifier key.
- **Shortcut Context**: Represents the state/scope where a shortcut is valid: Global (always active), View-specific (active in certain views), or Task-focused (active when a task has focus).
- **Shortcut Category**: Grouping of related shortcuts for display in the help overlay: Global, Navigation, Task Actions, Selection.
- **Shortcut Usage Event**: Records a single use of a keyboard shortcut including shortcut key, timestamp, and context (view) for personal analytics.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can create a new task using keyboard shortcuts within 2 seconds (from shortcut press to form ready for input)
- **SC-002**: Users can switch between all four views using number keys in under 1 second per switch
- **SC-003**: 80% of power users report increased productivity when using keyboard shortcuts (measured via in-app survey) — _Note: Requires future integration with 006-personal-analytics to display shortcut usage stats; FR-015 provides underlying data_
- **SC-004**: Task navigation and selection via keyboard works correctly 100% of the time with no focus loss or unexpected behavior
- **SC-005**: Keyboard shortcuts help overlay loads in under 500ms and displays all shortcuts accurately
- **SC-006**: All keyboard shortcuts work correctly across Chrome, Firefox, Safari, and Edge browsers
- **SC-007**: Shortcuts do not interfere with screen reader navigation (WCAG 2.1 Level AA compliance)

## Assumptions

- Users have standard QWERTY keyboards; no special keyboard layouts are considered for initial release
- The application already has a modal system and toast notification system that shortcuts can integrate with
- Existing Kanban keyboard navigation (useKanbanKeyboard hook) will be extended rather than replaced
- macOS detection for Command vs Control can be done via standard browser APIs (navigator.platform or navigator.userAgentData)
- The search bar component exists and can receive programmatic focus
- Task selection state is already managed in the existing task management system

## Clarifications

### Session 2025-12-03

- Q: When a user holds down a modifier key and presses multiple shortcut keys in rapid succession, how should the system behave? → A: Each shortcut triggers independently as keys are pressed (rapid chaining allowed)
- Q: Should the application track keyboard shortcut usage analytics? → A: Track usage locally in IndexedDB for personal analytics only (privacy-preserving)
