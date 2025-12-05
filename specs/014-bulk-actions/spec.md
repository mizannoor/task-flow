# Feature Specification: Bulk Actions

**Feature Branch**: `014-bulk-actions`  
**Created**: December 5, 2025  
**Status**: Draft  
**Input**: User description: "Implement bulk actions for multi-select task operations including bulk delete, bulk status change, bulk reassign, and bulk tag management as described in PRD Phase 4"

---

## Overview

Bulk Actions enables users to perform operations on multiple tasks simultaneously, significantly improving efficiency when managing large task lists. Users can select multiple tasks via checkboxes or keyboard shortcuts and apply actions like delete, status change, reassign, or tag management to all selected tasks at once.

---

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Select Multiple Tasks (Priority: P1)

As a user, I want to select multiple tasks at once so that I can perform bulk operations on them efficiently.

**Why this priority**: Selection is the foundation for all bulk operations. Without multi-select capability, no other bulk action can function. This is the core MVP requirement.

**Independent Test**: User can click checkboxes on multiple tasks in List view, see a selection count indicator, and clear all selections. Delivers immediate value by enabling visual task grouping.

**Acceptance Scenarios**:

1. **Given** I am viewing tasks in List view, **When** I click a task's checkbox, **Then** that task becomes selected with visual highlighting
2. **Given** I have one task selected, **When** I click another task's checkbox, **Then** both tasks are now selected and selection count shows "2 selected"
3. **Given** I have multiple tasks selected, **When** I click the "Select All" checkbox in the header, **Then** all visible tasks become selected
4. **Given** I have tasks selected, **When** I click "Clear Selection" or press Escape, **Then** all tasks are deselected
5. **Given** I am in List view, **When** I hold Shift and click a second task, **Then** all tasks between the first and second click are selected (range selection)
6. **Given** I am viewing tasks, **When** I press Space on a focused task, **Then** that task's selection toggles (using existing keyboard shortcut infrastructure)

---

### User Story 2 - Bulk Delete Tasks (Priority: P1)

As a user, I want to delete multiple tasks at once so that I can quickly clean up completed or obsolete work items.

**Why this priority**: Bulk delete is the most common bulk operation and provides immediate, tangible time savings. Essential for task list maintenance.

**Independent Test**: Select 5 tasks, click "Delete Selected", confirm in dialog, verify all 5 tasks are removed and success notification appears.

**Acceptance Scenarios**:

1. **Given** I have 3 tasks selected, **When** I click "Delete Selected" in the bulk action bar, **Then** a confirmation dialog appears showing "Delete 3 tasks?"
2. **Given** I see the delete confirmation dialog, **When** I click "Delete", **Then** all selected tasks are permanently removed and a success notification shows "3 tasks deleted"
3. **Given** I see the delete confirmation dialog, **When** I click "Cancel", **Then** no tasks are deleted and selection remains intact
4. **Given** I have tasks selected including tasks with dependencies, **When** I delete them, **Then** the system handles cascade deletion of related dependencies

---

### User Story 3 - Bulk Status Change (Priority: P1)

As a user, I want to change the status of multiple tasks at once so that I can efficiently update task progress.

**Why this priority**: Status changes are the second most frequent task operation. Bulk status change dramatically speeds up workflow management.

**Independent Test**: Select 4 pending tasks, click "Change Status" → "In Progress", verify all 4 tasks now show "In Progress" status.

**Acceptance Scenarios**:

1. **Given** I have 4 tasks selected, **When** I click "Change Status" in the bulk action bar, **Then** a dropdown appears with options: "Pending", "In Progress", "Completed"
2. **Given** I see the status dropdown with 4 tasks selected, **When** I click "In Progress", **Then** all 4 tasks update to "In Progress" and notification shows "4 tasks updated"
3. **Given** I have tasks in mixed statuses selected, **When** I change status to "Completed", **Then** all selected tasks become "Completed" with completedAt timestamp set
4. **Given** I have completed tasks selected, **When** I change status to "Pending", **Then** tasks are reopened with completedAt cleared

---

### User Story 4 - Bulk Reassign Tasks (Priority: P2)

As a team lead, I want to reassign multiple tasks to another team member so that I can efficiently redistribute workload.

**Why this priority**: Important for team management but less frequent than delete/status operations. Primarily used by team leads.

**Independent Test**: Select 3 tasks, click "Reassign", choose user from dropdown, verify all 3 tasks now assigned to new user.

**Acceptance Scenarios**:

1. **Given** I have 3 tasks selected, **When** I click "Reassign" in the bulk action bar, **Then** a user selection dropdown appears listing all available users
2. **Given** I see the user dropdown, **When** I select a user, **Then** all selected tasks are reassigned to that user and notification shows "3 tasks reassigned to [User Name]"
3. **Given** tasks are assigned to various users, **When** I bulk reassign them, **Then** all tasks update to the new assignee regardless of previous assignment
4. **Given** I try to reassign tasks to myself, **When** I select my own name, **Then** the reassignment completes normally (self-assignment allowed)

---

### User Story 5 - Bulk Tag Management (Priority: P2)

As a user, I want to add or remove tags from multiple tasks at once so that I can organize my work efficiently.

**Why this priority**: Tag management is useful for organization but used less frequently than core operations. Enhances categorization workflow.

**Independent Test**: Select 5 tasks, click "Add Tags", enter "urgent", verify all 5 tasks now have the "urgent" tag.

**Acceptance Scenarios**:

1. **Given** I have tasks selected, **When** I click "Manage Tags", **Then** I see options for "Add Tags" and "Remove Tags"
2. **Given** I choose "Add Tags", **When** I enter a new tag "review" and confirm, **Then** the tag is added to all selected tasks (without removing existing tags)
3. **Given** I choose "Remove Tags", **When** I select an existing tag from the list of tags present in selected tasks, **Then** that tag is removed from all selected tasks that have it
4. **Given** selected tasks have different existing tags, **When** I add a tag, **Then** only the new tag is added without affecting other tags

---

### User Story 6 - Bulk Action Bar UI (Priority: P1)

As a user, I want to see a contextual action bar when tasks are selected so that I can easily access bulk operations.

**Why this priority**: The action bar is the primary interface for all bulk operations. Essential for discoverability and usability of bulk features.

**Independent Test**: Select any task, verify a floating action bar appears with action buttons and selection count.

**Acceptance Scenarios**:

1. **Given** no tasks are selected, **When** I view the task list, **Then** no bulk action bar is visible
2. **Given** I select one or more tasks, **When** the selection changes, **Then** a bulk action bar appears fixed to the bottom of the viewport showing selection count and action buttons
3. **Given** the bulk action bar is visible, **When** I view it, **Then** I see buttons for: Delete, Change Status, Reassign, Manage Tags, and Clear Selection
4. **Given** I am on mobile viewport, **When** I have tasks selected, **Then** the bulk action bar adapts to mobile-friendly layout (stacked or drawer)
5. **Given** I clear all selections, **When** selection count reaches zero, **Then** the bulk action bar disappears with smooth animation

---

### User Story 7 - Keyboard Shortcuts for Bulk Actions (Priority: P3)

As a power user, I want to use keyboard shortcuts to perform bulk actions so that I can work faster without reaching for the mouse.

**Why this priority**: Power user enhancement. Builds on existing keyboard shortcut infrastructure but not essential for MVP.

**Independent Test**: Select tasks using Space key, press Ctrl+Shift+D to bulk delete, verify confirmation appears.

**Acceptance Scenarios**:

1. **Given** I have tasks selected, **When** I press Ctrl+A, **Then** all visible tasks become selected
2. **Given** I have tasks selected, **When** I press Ctrl+Shift+D, **Then** bulk delete confirmation appears
3. **Given** I have tasks selected, **When** I press Escape, **Then** all selections are cleared
4. **Given** I view the keyboard shortcuts help (Ctrl+/), **When** I look for bulk actions, **Then** I see the bulk action shortcuts listed

---

### Edge Cases

- What happens when user selects tasks and then applies a filter that hides some selected tasks?
  - Selected tasks that become hidden due to filtering should be automatically deselected
- How does the system handle bulk operations when some tasks fail (e.g., network error mid-operation)?
  - System should use a transaction-like approach: all succeed or all fail with clear error message
- What happens if user selects more than 100 tasks?
  - Allow selection of up to 500 tasks; show warning at 100+ tasks about potential processing time
- What happens when selecting tasks across different users (as admin/team lead)?
  - Bulk operations apply to all selected tasks regardless of assignee
- What happens if a bulk status change creates invalid states (e.g., starting a blocked task)?
  - Show warning listing blocked tasks and allow "Skip blocked" or "Force start anyway" options

---

## Requirements _(mandatory)_

### Functional Requirements

#### Selection

- **FR-001**: System MUST provide checkbox selection for each task row in List view
- **FR-002**: System MUST support "Select All" checkbox in table header to select all visible tasks
- **FR-003**: System MUST support Shift+Click for range selection between two tasks
- **FR-004**: System MUST display visual highlighting on selected tasks (distinct background color)
- **FR-005**: System MUST display selection count (e.g., "5 tasks selected") when tasks are selected
- **FR-006**: System MUST support clearing all selections via "Clear Selection" button or Escape key
- **FR-007**: System MUST persist selection state when navigating between List view pages (pagination)
- **FR-008**: System MUST automatically deselect tasks that become hidden due to filter changes
- **FR-009**: System MUST limit selection to maximum 500 tasks to prevent performance issues

#### Bulk Action Bar

- **FR-010**: System MUST display a contextual bulk action bar when one or more tasks are selected
- **FR-011**: Bulk action bar MUST show current selection count
- **FR-012**: Bulk action bar MUST include buttons for: Delete, Change Status, Reassign, Manage Tags, Clear Selection
- **FR-013**: Bulk action bar MUST be responsive and adapt to mobile viewports
- **FR-014**: Bulk action bar MUST animate smoothly when appearing/disappearing
- **FR-015**: Bulk action bar MUST be fixed to the bottom of the viewport (sticky bottom position), remaining visible while scrolling

#### Bulk Delete

- **FR-016**: System MUST show confirmation dialog before bulk delete with task count
- **FR-017**: Confirmation dialog MUST clearly state the action is irreversible
- **FR-018**: System MUST delete all selected tasks in a single operation upon confirmation
- **FR-019**: System MUST cascade delete any task dependencies when bulk deleting
- **FR-020**: System MUST show success notification with count of deleted tasks

#### Bulk Status Change

- **FR-021**: System MUST provide dropdown with status options: Pending, In Progress, Completed
- **FR-022**: System MUST update all selected tasks to chosen status
- **FR-023**: System MUST set/clear completedAt timestamp appropriately when changing to/from Completed
- **FR-024**: System MUST warn when bulk starting tasks that are blocked by dependencies (soft warning with override)
- **FR-025**: System MUST show success notification with count of updated tasks

#### Bulk Reassign

- **FR-026**: System MUST provide user selection dropdown showing all users in the system
- **FR-027**: System MUST update assignee for all selected tasks to chosen user
- **FR-028**: System MUST allow self-reassignment (assigning to current user)
- **FR-029**: System MUST show success notification with count of reassigned tasks and target user name

#### Bulk Tag Management

- **FR-030**: System MUST provide "Add Tags" option to add tags without removing existing ones
- **FR-031**: System MUST provide "Remove Tags" option with list of tags present in selected tasks
- **FR-032**: System MUST support adding multiple tags at once (comma-separated entry)
- **FR-033**: Tag additions MUST be additive (not replace existing tags)
- **FR-034**: System MUST show success notification with count of modified tasks

#### Accessibility & i18n

- **FR-035**: All bulk action controls MUST have appropriate ARIA labels
- **FR-036**: All bulk action text MUST support internationalization (EN and MS languages)
- **FR-037**: Bulk actions MUST be operable via keyboard alone
- **FR-038**: Screen readers MUST announce selection changes and bulk action results

---

### Key Entities

- **Selection State**: Represents the current set of selected task IDs, maintained in component state. Attributes: selectedTaskIds (array), selectionCount (computed), lastSelectedId (for shift-click range selection)

- **Bulk Operation Result**: Represents the outcome of a bulk action. Attributes: operationType (delete/status/reassign/tags), successCount, failedCount, failedTaskIds (if any), timestamp

---

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can select and delete 10 tasks in under 10 seconds (compared to 60+ seconds individually)
- **SC-002**: Bulk status change for 20 tasks completes in under 2 seconds
- **SC-003**: 90% of users can discover and use bulk delete on first attempt without documentation
- **SC-004**: Selection of 500 tasks and performing bulk operation completes without browser freeze or visible lag
- **SC-005**: All bulk operations provide clear feedback (selection count, confirmation dialogs, success notifications)
- **SC-006**: Bulk actions are accessible via keyboard navigation without mouse dependency
- **SC-007**: Mobile users can perform bulk actions with touch-friendly interface elements

---

## Assumptions

- Selection state is ephemeral (per-session) and not persisted to database
- Bulk operations are atomic within IndexedDB transactions - partial completion states are avoided
- Users understand standard selection patterns (checkbox, Shift+click for range)
- Existing keyboard shortcut infrastructure (010-keyboard-shortcuts) is available for integration
- Task dependencies feature (013-task-dependencies) is available for cascade delete handling
- Toast notification system is available for success/error feedback
- i18n infrastructure (012-i18n-support) is available for translating bulk action labels

---

## Clarifications

### Session 2025-12-05

- Q: Where should the bulk action bar appear when tasks are selected? → A: Fixed bottom bar (sticky to viewport bottom)

---

## Out of Scope

- **Bulk Edit Other Properties**: Editing complexity, priority, or category in bulk (future enhancement)
- **Undo Bulk Delete**: Ability to recover bulk-deleted tasks (would require soft-delete implementation)
- **Bulk Operations in Other Views**: Bulk selection in Kanban, Calendar, or Focus views (List view only for MVP)
- **Scheduled Bulk Actions**: Ability to schedule bulk operations for later execution
- **Bulk Import/Export**: Importing or exporting tasks in bulk (separate feature in PRD)
- **Cross-View Selection**: Selecting tasks that span multiple filtered views
