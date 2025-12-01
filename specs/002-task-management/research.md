# Research: Task Management System

**Feature**: 002-task-management
**Date**: December 1, 2025
**Status**: Complete

## Research Tasks

### 1. IndexedDB Schema Extension Pattern

**Question**: How to extend existing Dexie.js database with tasks table?

**Decision**: Use Dexie version upgrade pattern

**Rationale**:

- Existing `db.js` uses Dexie version 1 with `users` table
- Dexie supports additive schema changes via version increments
- Version 2 can add `tasks` table without affecting existing user data

**Implementation**:

```javascript
// Extend existing schema
db.version(2).stores({
  users: '&id, &identifier, identifierType, createdAt',
  tasks: '&id, userId, createdBy, status, priority, category, createdAt, deadline',
});
```

**Alternatives Considered**:

- Separate database for tasks: Rejected - violates data integrity principle, complicates user-task relationships
- Single version with all tables: Rejected - would require database reset, losing existing users

---

### 2. Task State Management Pattern

**Question**: How to manage task state across components?

**Decision**: TaskContext with useReducer pattern (matching AuthContext)

**Rationale**:

- Constitution mandates React Context API
- AuthContext already establishes useReducer pattern in codebase
- Provides centralized state with predictable updates
- Enables optimistic updates for <100ms perceived performance

**Implementation**:

```javascript
// TaskContext structure
{
  tasks: Task[],
  loading: boolean,
  error: Error | null,
  filters: FilterState,
  sort: SortState
}

// Actions: CREATE, UPDATE, DELETE, SET_TASKS, SET_FILTER, SET_SORT, etc.
```

**Alternatives Considered**:

- Redux/Zustand: Rejected - Constitution specifies React Context API
- Props drilling: Rejected - Too complex with filter/sort/task interactions
- Local component state: Rejected - Can't share state across TaskList, FilterBar, etc.

---

### 3. List View Performance for 1000+ Tasks

**Question**: How to render large task lists efficiently?

**Decision**: Client-side pagination with 25 items per page (default)

**Rationale**:

- SC-010 requires 1000+ tasks without degradation
- Pagination is simpler than virtualization for initial implementation
- 25 items fits most screens without scrolling
- Can upgrade to virtualization (react-window) in future if needed

**Implementation**:

- Paginate in TaskContext after filter/sort
- Page controls in TaskList component
- Persist page preference in localStorage

**Alternatives Considered**:

- Virtual scrolling (react-window): Rejected for MVP - adds complexity, pagination sufficient
- Infinite scroll: Rejected - harder to navigate to specific tasks
- No pagination (render all): Rejected - would fail SC-010 performance requirement

---

### 4. Filter State Persistence

**Question**: Where to store active filters and sort preferences?

**Decision**: In-memory (TaskContext) with localStorage for sort preference only

**Rationale**:

- Filters are session-specific, users often want fresh start
- Sort preference is more persistent user preference
- Keeps TaskContext as single source of truth
- User Story 6 requires sort persistence: "When they navigate away and return, the sort preference is preserved"

**Implementation**:

```javascript
// Sort persisted to localStorage
localStorage.setItem('taskflow_sort', JSON.stringify({ field: 'priority', order: 'desc' }));

// Filters reset on page load (in-memory only)
```

**Alternatives Considered**:

- Persist all filters to localStorage: Rejected - users often want fresh filter state
- URL query params: Rejected - client-side app, no need for shareable URLs
- IndexedDB for preferences: Rejected - overkill for simple sort preference

---

### 5. Debounced Search Implementation

**Question**: How to implement 300ms debounced search (SC-003)?

**Decision**: Custom useDebounce hook with AbortController pattern

**Rationale**:

- SC-003 requires 300ms debounce
- Custom hook is reusable and testable
- AbortController prevents race conditions on rapid typing

**Implementation**:

```javascript
function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

**Alternatives Considered**:

- lodash.debounce: Rejected - adds dependency for simple use case
- Inline setTimeout: Rejected - harder to test and reuse

---

### 6. Priority Color Scheme

**Question**: What colors for priority badges (FR-025)?

**Decision**: Tailwind color palette with semantic meaning

**Rationale**:

- PRD wireframes show color-coded priorities
- Tailwind provides accessible color palette
- Red → Orange → Yellow → Green maps to urgency intuitively

**Implementation**:
| Priority | Background | Text | Tailwind Classes |
|----------|------------|------|------------------|
| Urgent | Red-100 | Red-800 | `bg-red-100 text-red-800` |
| High | Orange-100 | Orange-800 | `bg-orange-100 text-orange-800` |
| Medium | Yellow-100 | Yellow-800 | `bg-yellow-100 text-yellow-800` |
| Low | Green-100 | Green-800 | `bg-green-100 text-green-800` |

**Alternatives Considered**:

- Custom CSS colors: Rejected - Tailwind already provides accessible palette
- Icons only: Rejected - color provides faster visual scanning

---

### 7. Status Badge Color Scheme

**Question**: What colors for status badges?

**Decision**: Blue/Yellow/Green semantic mapping

**Rationale**:

- Pending = waiting (blue/gray)
- In Progress = active/working (yellow/amber)
- Completed = done/success (green)

**Implementation**:
| Status | Background | Text | Tailwind Classes |
|--------|------------|------|------------------|
| Pending | Gray-100 | Gray-800 | `bg-gray-100 text-gray-800` |
| In Progress | Amber-100 | Amber-800 | `bg-amber-100 text-amber-800` |
| Completed | Green-100 | Green-800 | `bg-green-100 text-green-800` |

---

### 8. Form Validation Strategy

**Question**: How to validate task form inputs?

**Decision**: Extend existing validators.js with task-specific functions

**Rationale**:

- Existing validators.js establishes validation pattern
- Reusable validation functions for form and service layer
- Clear error messages per FR requirements

**Implementation**:

```javascript
// Add to validators.js
export function validateTaskName(name) {
  if (!name || !name.trim()) return 'Task name is required';
  if (name.length > 200) return 'Task name must be 200 characters or less';
  return null;
}

export function validateDescription(desc) {
  if (desc && desc.length > 5000) return 'Description must be 5000 characters or less';
  return null;
}
```

---

## Summary

All technical decisions are resolved. No NEEDS CLARIFICATION items remain.

| Decision            | Choice                          | Confidence |
| ------------------- | ------------------------------- | ---------- |
| Schema extension    | Dexie version 2                 | High       |
| State management    | TaskContext + useReducer        | High       |
| Large list handling | Pagination (25/page)            | High       |
| Filter persistence  | In-memory, sort to localStorage | High       |
| Search debounce     | Custom useDebounce hook         | High       |
| Priority colors     | Tailwind semantic palette       | High       |
| Status colors       | Gray/Amber/Green                | High       |
| Validation          | Extend validators.js            | High       |
