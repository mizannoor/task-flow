# Quickstart: Calendar View Implementation

**Feature**: 007-calendar-view  
**Date**: December 2, 2025  
**Estimated Time**: 3-4 days

## Prerequisites

- [ ] TaskFlow development environment set up
- [ ] `npm install` completed
- [ ] Existing task data in IndexedDB (or seed data)
- [ ] Familiarity with existing view implementations (KanbanView, FocusView)

## Quick Start Steps

### 1. Branch Setup

```bash
# Already on branch (created by speckit)
git branch  # Should show: * 007-calendar-view

# Verify existing files
ls src/components/views/  # Should see KanbanView.jsx, FocusView.jsx, etc.
```

### 2. Create Core Files

Create the following files in order:

```bash
# Core hook
touch src/hooks/useCalendar.js

# View components
touch src/components/views/CalendarView.jsx
touch src/components/views/CalendarHeader.jsx
touch src/components/views/CalendarGrid.jsx
touch src/components/views/CalendarCell.jsx
touch src/components/views/CalendarTaskIndicator.jsx
touch src/components/views/CalendarWeekView.jsx
touch src/components/views/CalendarDayView.jsx
touch src/components/views/UnscheduledSidebar.jsx
```

### 3. Implement useCalendar Hook

Start with the core state management hook:

```javascript
// src/hooks/useCalendar.js
import { useState, useCallback, useMemo } from 'react';

const STORAGE_KEY = 'taskflow_calendar_preferences';
const DAYS_IN_WEEK = 7;
const WEEKS_IN_MONTH_GRID = 6;

// Load persisted preferences
function loadPreferences() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

// Save preferences to localStorage
function savePreferences(prefs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

export function useCalendar(initialDate = new Date()) {
  const prefs = loadPreferences();

  const [viewMode, setViewModeState] = useState(prefs?.viewMode || 'month');
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [selectedDate, setSelectedDate] = useState(null);
  const [sidebarOpen, setSidebarOpenState] = useState(prefs?.sidebarOpen || false);

  // Persist preferences when changed
  const setViewMode = useCallback(
    (mode) => {
      setViewModeState(mode);
      savePreferences({ viewMode: mode, sidebarOpen });
    },
    [sidebarOpen]
  );

  const setSidebarOpen = useCallback(
    (open) => {
      setSidebarOpenState(open);
      savePreferences({ viewMode, sidebarOpen: open });
    },
    [viewMode]
  );

  // Navigation functions
  const goToPrevious = useCallback(() => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (viewMode === 'month') newDate.setMonth(prev.getMonth() - 1);
      else if (viewMode === 'week') newDate.setDate(prev.getDate() - 7);
      else newDate.setDate(prev.getDate() - 1);
      return newDate;
    });
  }, [viewMode]);

  const goToNext = useCallback(() => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (viewMode === 'month') newDate.setMonth(prev.getMonth() + 1);
      else if (viewMode === 'week') newDate.setDate(prev.getDate() + 7);
      else newDate.setDate(prev.getDate() + 1);
      return newDate;
    });
  }, [viewMode]);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  // Generate month grid (42 days)
  const getMonthGrid = useCallback(() => {
    // Implementation: generate 6 weeks × 7 days grid
    // See data-model.md for MonthGridData structure
  }, [currentDate]);

  return {
    state: { viewMode, currentDate, selectedDate, sidebarOpen },
    setViewMode,
    goToPrevious,
    goToNext,
    goToToday,
    selectDate: setSelectedDate,
    toggleSidebar: () => setSidebarOpen(!sidebarOpen),
    setSidebarOpen,
    getMonthGrid,
  };
}
```

### 4. Implement CalendarView Container

```javascript
// src/components/views/CalendarView.jsx
import { useMemo } from 'react';
import { useTasks } from '../../hooks/useTasks';
import { useCalendar } from '../../hooks/useCalendar';
import { CalendarHeader } from './CalendarHeader';
import { CalendarGrid } from './CalendarGrid';
import { UnscheduledSidebar } from './UnscheduledSidebar';
import { TaskSidePanel } from './TaskSidePanel';

export function CalendarView() {
  const { tasks, updateTask } = useTasks();
  const calendar = useCalendar();

  // Group tasks by deadline date
  const tasksByDate = useMemo(() => {
    const grouped = new Map();
    tasks.forEach((task) => {
      if (task.deadline) {
        const key = formatDateKey(task.deadline);
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key).push(task);
      }
    });
    return grouped;
  }, [tasks]);

  // Tasks without deadlines (for sidebar)
  const unscheduledTasks = useMemo(() => tasks.filter((t) => !t.deadline), [tasks]);

  // Handle deadline update from drag-drop
  const handleTaskDrop = (taskId, newDate) => {
    updateTask(taskId, { deadline: newDate });
  };

  return (
    <div className="flex h-full">
      {/* Main Calendar Area */}
      <div className="flex-1 flex flex-col">
        <CalendarHeader {...calendar} unscheduledCount={unscheduledTasks.length} />
        <CalendarGrid
          gridData={calendar.getMonthGrid()}
          tasksByDate={tasksByDate}
          onTaskDrop={handleTaskDrop}
        />
      </div>

      {/* Unscheduled Sidebar */}
      <UnscheduledSidebar
        tasks={unscheduledTasks}
        isOpen={calendar.state.sidebarOpen}
        onToggle={calendar.toggleSidebar}
      />
    </div>
  );
}

function formatDateKey(date) {
  return date.toISOString().split('T')[0];
}
```

### 5. Update View Index

```javascript
// src/components/views/index.js - ADD these exports
export { CalendarView } from './CalendarView';
export { CalendarHeader } from './CalendarHeader';
export { CalendarGrid } from './CalendarGrid';
// ... other calendar exports
```

### 6. Add Route/Navigation

Update the main navigation to include Calendar view (follow existing pattern from Kanban/Focus views).

### 7. Test Basic Rendering

```bash
npm run dev
# Navigate to Calendar view
# Verify: Month grid displays
# Verify: Tasks appear on deadline dates
# Verify: Navigation works (prev/next month)
```

## Implementation Order

Follow this order for incremental development:

1. **useCalendar hook** - State management foundation
2. **CalendarView + CalendarHeader** - Container and navigation
3. **CalendarGrid + CalendarCell** - Month view rendering
4. **CalendarTaskIndicator** - Task display on calendar
5. **UnscheduledSidebar** - Tasks without deadlines
6. **Drag-and-drop** - Extend useDragAndDrop for calendar
7. **TaskSidePanel integration** - Task detail panel
8. **CalendarWeekView** - Week view mode
9. **CalendarDayView** - Day view mode
10. **Keyboard navigation** - Accessibility
11. **Mobile touch** - Touch drag-and-drop

## Key Files to Reference

| File                                     | Purpose                              |
| ---------------------------------------- | ------------------------------------ |
| `src/components/views/KanbanView.jsx`    | Pattern for view component structure |
| `src/hooks/useDragAndDrop.js`            | Drag-drop implementation to extend   |
| `src/components/views/TaskSidePanel.jsx` | Reuse for task details               |
| `src/utils/dateUtils.js`                 | Date utilities to extend             |
| `src/utils/constants.js`                 | Add calendar constants               |

## Verification Checklist

After implementation, verify against spec requirements:

- [ ] FR-001: Tasks display on deadline dates
- [ ] FR-002: Month/Week/Day view modes work
- [ ] FR-003: Navigation controls work
- [ ] FR-004: Today is highlighted
- [ ] FR-005: Drag-drop rescheduling works
- [ ] FR-006: Deadline updates on drop
- [ ] FR-007: Priority color coding visible
- [ ] FR-008: Unscheduled sidebar works
- [ ] FR-009: Sidebar drag to calendar works
- [ ] FR-010: "+N more" overflow works
- [ ] FR-011: Changes persist to IndexedDB
- [ ] FR-012: Task side panel opens on click
- [ ] FR-013: Keyboard navigation works
- [ ] FR-014: Filters work with calendar
- [ ] FR-015: Mobile responsive (320px+)
- [ ] FR-016: Overdue tasks highlighted
- [ ] FR-017: Completed tasks muted
- [ ] FR-018: View preference persists
- [ ] FR-019: Day names in header
- [ ] FR-020: "Today" button works

## Common Issues

### Tasks not appearing on calendar

- Check that `task.deadline` is a valid Date object
- Verify `formatDateKey()` produces correct 'YYYY-MM-DD' format
- Ensure task is within the displayed month range

### Drag-drop not working

- Verify `data-date` attribute on CalendarCell elements
- Check useDragAndDrop hook is properly extended
- Test that drop handler receives correct parameters

### Performance issues with many tasks

- Implement virtualization for week/day views with 100+ tasks
- Use `useMemo` for tasksByDate grouping
- Avoid re-rendering entire grid on task selection
