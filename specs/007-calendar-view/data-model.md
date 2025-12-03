# Data Model: Calendar View

**Feature**: 007-calendar-view  
**Date**: December 2, 2025  
**Source**: spec.md Key Entities + research.md decisions

## Entity Definitions

### Calendar State

Runtime state for calendar view navigation and selection (not persisted to IndexedDB).

| Field          | Type         | Required | Default   | Description                    |
| -------------- | ------------ | -------- | --------- | ------------------------------ |
| `viewMode`     | enum         | Yes      | `'month'` | Current view: month/week/day   |
| `currentDate`  | Date         | Yes      | Today     | Center date of current view    |
| `selectedDate` | Date \| null | No       | `null`    | Currently focused date cell    |
| `sidebarOpen`  | boolean      | Yes      | `false`   | Unscheduled sidebar visibility |

### Calendar Preferences (Persisted)

User preferences stored in localStorage under key `taskflow_calendar_preferences`.

| Field         | Type    | Stored | Default   | Description                   |
| ------------- | ------- | ------ | --------- | ----------------------------- |
| `viewMode`    | enum    | Yes    | `'month'` | Last selected view mode       |
| `sidebarOpen` | boolean | Yes    | `false`   | Last sidebar visibility state |

### View Mode Enum

```typescript
type CalendarViewMode = 'month' | 'week' | 'day';
```

### Tasks by Date Map

Runtime computed structure for efficient calendar rendering.

```typescript
type TasksByDate = Map<string, Task[]>;
// Key format: 'YYYY-MM-DD' (ISO date string without time)
// Value: Array of tasks with deadline on that date
```

## Existing Entity Usage

### Task (from 002-task-management)

Calendar view uses existing Task entity with focus on `deadline` field:

| Field      | Type       | Calendar Usage                               |
| ---------- | ---------- | -------------------------------------------- |
| `id`       | string     | Task identification                          |
| `taskName` | string     | Display on calendar indicator                |
| `priority` | enum       | Color coding (urgent=red, high=orange, etc.) |
| `status`   | enum       | Completed tasks get muted styling            |
| `deadline` | Date\|null | **Primary field** - positions task on date   |
| `userId`   | string     | Filter by assigned user                      |

### Deadline Field Details

- **Type**: `Date | null`
- **Storage**: ISO timestamp in IndexedDB
- **Display**: User's local timezone
- **Null handling**: Tasks with `null` deadline appear in Unscheduled Sidebar

## Component Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CalendarView                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐  │
│  │  useCalendar()  │    │   useTasks()    │    │ useDragAndDrop()│  │
│  │                 │    │   (existing)    │    │   (extended)    │  │
│  │  - viewMode     │    │                 │    │                 │  │
│  │  - currentDate  │    │  - tasks[]      │    │  - dragState    │  │
│  │  - selectedDate │    │  - filters      │    │  - onDrop()     │  │
│  │  - sidebarOpen  │    │  - updateTask() │    │                 │  │
│  └────────┬────────┘    └────────┬────────┘    └────────┬────────┘  │
│           │                      │                      │           │
│           ▼                      ▼                      ▼           │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    tasksByDate (useMemo)                     │   │
│  │         Map<'YYYY-MM-DD', Task[]> grouped by deadline        │   │
│  └─────────────────────────────────────────────────────────────┘   │
│           │                      │                      │           │
│     ┌─────┴─────┐          ┌─────┴─────┐          ┌─────┴─────┐     │
│     ▼           ▼          ▼           ▼          ▼           ▼     │
│  CalendarGrid  CalendarWeekView  CalendarDayView  UnscheduledSidebar │
│     │                                                    │          │
│     ▼                                                    ▼          │
│  CalendarCell                                     Unscheduled Tasks │
│     │                                             (deadline=null)   │
│     ▼                                                               │
│  CalendarTaskIndicator                                              │
└─────────────────────────────────────────────────────────────────────┘
```

## Date Calculations

### Month View Grid

Generates 42 cells (6 weeks × 7 days) for consistent grid height.

```typescript
interface MonthGridData {
  year: number;
  month: number; // 0-indexed
  startDate: Date; // First cell (may be previous month)
  endDate: Date; // Last cell (may be next month)
  days: CalendarDay[];
}

interface CalendarDay {
  date: Date;
  dateKey: string; // 'YYYY-MM-DD'
  isCurrentMonth: boolean;
  isToday: boolean;
  tasks: Task[];
}
```

### Week View Grid

Generates 7 cells for the week containing currentDate.

```typescript
interface WeekGridData {
  weekStart: Date; // Sunday
  weekEnd: Date; // Saturday
  days: CalendarDay[];
}
```

### Day View

Single day display with all tasks due on that date.

```typescript
interface DayViewData {
  date: Date;
  dateKey: string;
  isToday: boolean;
  tasks: Task[];
}
```

## Task Display Rules

### Priority Colors

| Priority | Color Class     | Hex     |
| -------- | --------------- | ------- |
| urgent   | `bg-red-500`    | #EF4444 |
| high     | `bg-orange-500` | #F97316 |
| medium   | `bg-yellow-500` | #EAB308 |
| low      | `bg-gray-400`   | #9CA3AF |

### Status Styling

| Status      | Styling                         |
| ----------- | ------------------------------- |
| pending     | Normal opacity, solid text      |
| in-progress | Normal opacity, solid text      |
| completed   | 50% opacity, strikethrough text |

### Overdue Styling

| Condition                    | Styling                    |
| ---------------------------- | -------------------------- |
| Past deadline, not completed | Red border/badge indicator |
| Past deadline, completed     | Standard completed styling |

## Validation Rules

### Deadline Update (Drag-and-Drop)

When a task is dropped on a new date:

1. New deadline must be a valid Date object
2. Task must have `status !== 'completed'` OR allow rescheduling completed tasks
3. Update triggers `taskService.updateTask(id, { deadline: newDate })`
4. IndexedDB persistence via existing TaskContext flow

### Sidebar to Calendar Drag

When a task from Unscheduled Sidebar is dropped on calendar:

1. Task must have `deadline === null` (in sidebar)
2. Drop target must be a valid date cell
3. Sets `deadline` to the target date
4. Task moves from sidebar to calendar display
