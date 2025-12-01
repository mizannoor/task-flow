# Research: Today's Focus View

**Feature**: 004-todays-focus-view  
**Date**: December 1, 2025  
**Phase**: 0 - Outline & Research

## Research Tasks

### 1. Task Selection Algorithm Design

**Context**: Need efficient algorithm to select top 10 tasks from potentially 10,000+ tasks using priority tiers.

**Decision**: Multi-tier filtering with stable sort

**Rationale**:

- Filter tasks by user assignment first (reduces dataset significantly)
- Apply tier classification in single pass: overdue > due today > in-progress > high priority
- Within each tier, sort by deadline (ascending, nulls last) then createdAt (ascending)
- Slice first 10 results
- Time complexity: O(n) filter + O(n log n) sort = O(n log n) overall

**Alternatives considered**:

- Priority queue (heap): More complex, no significant benefit for n ≤ 10,000
- Database-level query: IndexedDB doesn't support complex multi-field ordering

### 2. Date Comparison Best Practices

**Context**: Need reliable "today" detection across timezones for overdue/due-today classification.

**Decision**: Use local midnight boundaries

**Rationale**:

- `new Date().setHours(0,0,0,0)` gives start of today in user's local timezone
- Compare deadline dates normalized to midnight for date-only comparison
- Avoids timezone bugs from ISO string comparison
- Consistent with existing `getDeadlineStatus()` in KanbanCard.jsx

**Alternatives considered**:

- UTC normalization: Would show wrong "today" for users not in UTC
- Date-fns library: Adds dependency; native Date sufficient for this use case

### 3. Dynamic Progress Calculation Pattern

**Context**: Progress must be calculated dynamically without separate persistence.

**Decision**: Derive from TaskContext on each render

**Rationale**:

- Filter completed tasks where `completedAt` is today
- Count qualifying tasks (would appear in focus view if not completed)
- No localStorage/IndexedDB overhead
- Automatically accurate across status changes
- Memoize with `useMemo` keyed on tasks array reference

**Alternatives considered**:

- Separate progress state: Requires sync logic, potential staleness
- IndexedDB query: Slower than in-memory filter on context data

### 4. Keyboard Navigation Pattern

**Context**: Full keyboard accessibility required (Tab/Enter/Space).

**Decision**: Roving tabindex with action key handlers

**Rationale**:

- Single focusable container with `tabIndex={0}`
- Arrow keys navigate between cards (managed focus)
- Enter/Space triggers primary action (Start or Complete based on status)
- Tab moves to next interactive element (view switcher, etc.)
- Pattern matches existing KanbanCard keyboard handling

**Alternatives considered**:

- All cards in tab order: Too many tab stops with 10 cards
- Focus trap: Overly restrictive for simple list

### 5. Real-time Update Integration

**Context**: View must refresh when tasks change elsewhere (status, assignment, deadline edits).

**Decision**: React to TaskContext state changes

**Rationale**:

- TaskContext already triggers re-renders on task updates
- Selection hook recomputes via `useMemo` dependency on tasks array
- No additional subscription mechanism needed
- Consistent with KanbanView pattern

**Alternatives considered**:

- Custom event bus: Unnecessary complexity given Context already handles this
- Polling: Wasteful; Context provides push updates

### 6. Empty State Variations

**Context**: Different empty states needed for "no tasks at all" vs "all tasks completed".

**Decision**: Conditional rendering based on task counts

**Rationale**:

- Check `tasks.length === 0` → "No tasks yet" state
- Check `focusTasks.length === 0 && hasQualifyingTasks` → "All done!" completion state
- Completion state includes "Load More" button if more tasks exist beyond initial 10
- Follows EmptyState component pattern from existing codebase

**Alternatives considered**:

- Single generic empty state: Misses opportunity for motivational completion message

### 7. Component Reuse Strategy

**Context**: Leverage existing components vs. creating Focus-specific versions.

**Decision**: Create focused variants; reuse utilities

**Rationale**:

- FocusCard: New component (larger design, inline actions differ from KanbanCard)
- Priority badges: Reuse PRIORITY_COLORS constants
- Deadline status: Reuse `getDeadlineStatus()` logic (extract to utility if not already)
- Modal/Toast: Reuse existing ui components
- User avatar/initials: Reuse `getUserInitials()` pattern

**Alternatives considered**:

- Extend KanbanCard with props: Would bloat component with conditional logic

## Integration Points

| System            | Integration Type | Notes                                          |
| ----------------- | ---------------- | ---------------------------------------------- |
| TaskContext       | Consumer         | Read tasks, call updateTask for status changes |
| AuthContext       | Consumer         | Get currentUser for filtering                  |
| Router/Navigation | Peer             | Add Focus View option to view switcher         |
| localStorage      | None             | No persistence needed for this view            |

## Performance Considerations

| Concern                    | Mitigation                                         |
| -------------------------- | -------------------------------------------------- |
| Large task datasets (10k+) | Memoize selection with useMemo; filter before sort |
| Frequent re-renders        | React.memo on FocusCard; stable callback refs      |
| Progress calculation       | Derive in useMemo, not useEffect                   |
| Date comparisons           | Cache today's midnight boundary per render cycle   |

## Open Questions Resolved

All NEEDS CLARIFICATION items from spec have been resolved in Clarifications session:

- ✅ Progress calculation → Dynamic (this research confirms approach)
- ✅ Completion behavior → Load More button
- ✅ Keyboard navigation → Full support
- ✅ Same-tier sorting → Deadline then createdAt
- ✅ Real-time updates → Automatic via Context
