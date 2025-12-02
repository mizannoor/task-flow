# Research: Calendar View Implementation

**Feature**: 007-calendar-view  
**Date**: December 2, 2025  
**Phase**: 0 - Outline & Research

## Research Tasks

### 1. Calendar Library vs Custom Implementation

**Context**: Calendar views require date calculations, grid layouts, and navigation. Need to decide build vs buy.

**Decision**: Custom implementation using native Date APIs

**Rationale**:

- Zero additional dependencies (aligns with Constitution I - Client-Side First)
- Full control over calendar behavior and visual styling
- Existing `dateUtils.js` already has date range utilities to extend
- Calendar layout is primarily CSS grid (Tailwind already available)
- Avoids bundle size increase from calendar libraries (FullCalendar ~200KB)

**Alternatives Considered**:

| Library            | Rejected Because                                    |
| ------------------ | --------------------------------------------------- |
| FullCalendar       | 200KB+ bundle, overkill for simple deadline display |
| react-big-calendar | 80KB+, complex API for our simple needs             |
| date-fns           | Would add dependency; native Date sufficient        |

### 2. Calendar Grid Layout Strategy

**Context**: Month view needs 6-row grid (weeks) × 7-column grid (days) with responsive sizing.

**Decision**: CSS Grid with Tailwind utilities

**Rationale**:

- Native CSS Grid handles calendar layout perfectly
- Tailwind already in project (`grid`, `grid-cols-7`)
- Responsive breakpoints adjust cell sizes naturally
- No additional dependencies needed

**Implementation Pattern**:

```css
/* Month grid - 7 columns (Sun-Sat), auto rows */
.calendar-grid {
  @apply grid grid-cols-7 gap-px bg-gray-200;
}

.calendar-cell {
  @apply bg-white min-h-24 p-1;
}

/* Responsive: smaller cells on mobile */
@media (max-width: 640px) {
  .calendar-cell {
    @apply min-h-16;
  }
}
```

### 3. Drag-and-Drop for Deadline Rescheduling

**Context**: FR-005 requires drag-and-drop to reschedule deadlines. Existing `useDragAndDrop.js` handles Kanban status changes.

**Decision**: Extend existing `useDragAndDrop` hook with calendar-specific drop targets

**Rationale**:

- Reuses proven drag-and-drop implementation (Constitution III - Performance)
- Hook already supports pointer events for touch devices
- Only need to add date-based drop zone identification
- Maintains consistent UX across Kanban and Calendar views

**Extension Pattern**:

```javascript
// Extend useDragAndDrop for calendar
// onDrop signature: (taskId, newDeadline: Date, oldDeadline: Date | null)
// Drop target identification via data-date attribute on CalendarCell
```

### 4. View Mode State Management

**Context**: FR-002 requires Month/Week/Day views; FR-018 requires persisted preference.

**Decision**: Custom `useCalendar` hook with localStorage persistence

**Rationale**:

- Aligns with existing pattern (Kanban column collapse in localStorage)
- Simple state: `{ viewMode, currentDate, selectedDate }`
- Instant load without IndexedDB async overhead

**State Shape**:

```typescript
interface CalendarState {
  viewMode: 'month' | 'week' | 'day';
  currentDate: Date; // The date being viewed (center of view)
  selectedDate: Date | null; // Currently selected date cell
}
```

**Persistence Key**: `taskflow_calendar_preferences`

### 5. Task Grouping by Date

**Context**: FR-001 requires displaying tasks on their deadline dates. Need efficient lookup.

**Decision**: Compute grouped tasks using useMemo with date-keyed Map

**Rationale**:

- Tasks already filtered by useTasks hook
- Date-keyed grouping enables O(1) lookup per cell
- useMemo ensures recomputation only when tasks change
- Handles null deadlines by excluding from calendar (shown in sidebar)

**Implementation Pattern**:

```javascript
const tasksByDate = useMemo(() => {
  const grouped = new Map(); // key: 'YYYY-MM-DD', value: Task[]
  tasks.forEach((task) => {
    if (task.deadline) {
      const dateKey = formatDateKey(task.deadline);
      if (!grouped.has(dateKey)) grouped.set(dateKey, []);
      grouped.get(dateKey).push(task);
    }
  });
  return grouped;
}, [tasks]);
```

### 6. Unscheduled Sidebar Implementation

**Context**: FR-008 requires right sidebar for tasks without deadlines, collapsed by default.

**Decision**: Collapsible panel component with localStorage persistence for collapse state

**Rationale**:

- Similar pattern to Kanban column collapse (proven approach)
- Filter tasks where `deadline === null`
- Support drag from sidebar to calendar to set deadline
- Collapse state persisted in `taskflow_calendar_preferences`

### 7. Mobile Touch Drag-and-Drop

**Context**: FR-015 requires touch-friendly drag-and-drop on 320px+ devices.

**Decision**: Long-press (500ms) to initiate drag, visual feedback during drag

**Rationale**:

- Existing `useDragAndDrop` hook supports pointer events
- Long-press distinguishes drag from scroll on touch devices
- Consistent with mobile calendar app patterns (Google Calendar, Apple Calendar)

**Touch Behavior**:

| Gesture            | Action                                   |
| ------------------ | ---------------------------------------- |
| Tap                | Select task / open side panel            |
| Long-press (500ms) | Initiate drag operation                  |
| Drag               | Visual feedback, update target highlight |
| Release            | Drop and update deadline                 |

### 8. Overflow Handling (+N more)

**Context**: FR-010 requires "+N more" indicator when date has >5 tasks.

**Decision**: Show max 3-5 tasks in cell (responsive), popover for overflow

**Rationale**:

- Cell height varies by screen size (3 on mobile, 5 on desktop)
- Popover shows full task list on click
- Consistent with Google Calendar's overflow pattern

**Implementation**:

```jsx
// CalendarCell.jsx
const MAX_VISIBLE = isMobile ? 3 : 5;
const visibleTasks = tasks.slice(0, MAX_VISIBLE);
const overflowCount = tasks.length - MAX_VISIBLE;
// Render "+N more" button that opens popover
```

### 9. Keyboard Navigation

**Context**: FR-013 requires arrow key navigation between dates.

**Decision**: Roving tabindex with focus on date cells

**Rationale**:

- Consistent with Kanban keyboard navigation pattern
- Arrow keys move between dates in current view
- Enter key opens task list for selected date
- Tab enters/exits calendar grid

**Key Bindings**:

| Key    | Month View          | Week View           | Day View           |
| ------ | ------------------- | ------------------- | ------------------ |
| ← →    | Previous/next day   | Previous/next day   | N/A                |
| ↑ ↓    | Previous/next week  | Previous/next task  | Previous/next task |
| Enter  | View tasks on date  | Open task panel     | Open task panel    |
| Escape | Close popover/panel | Close panel         | Close panel        |
| Tab    | Enter/exit calendar | Enter/exit calendar | Enter/exit view    |

### 10. Today Indicator and Navigation

**Context**: FR-004 (today highlight) and FR-020 ("Today" button).

**Decision**: Visual highlight + quick navigation button

**Rationale**:

- Today cell gets distinct background/border styling
- "Today" button in header resets currentDate to today
- Standard calendar UX pattern

## Research Summary

| Topic               | Decision                               | Dependency Added |
| ------------------- | -------------------------------------- | ---------------- |
| Calendar library    | Custom (native Date + CSS Grid)        | None             |
| Grid layout         | CSS Grid with Tailwind                 | None             |
| Drag-and-drop       | Extend existing useDragAndDrop         | None             |
| View state          | Custom useCalendar hook + localStorage | None             |
| Task grouping       | useMemo with date-keyed Map            | None             |
| Unscheduled sidebar | Collapsible panel component            | None             |
| Touch drag          | Long-press initiation (existing hook)  | None             |
| Overflow handling   | "+N more" with popover                 | None             |
| Keyboard navigation | Roving tabindex pattern                | None             |
| Today navigation    | Header button + visual highlight       | None             |

**Total New Dependencies**: 0 (aligns with Constitution I - Client-Side First)
