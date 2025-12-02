/**
 * Calendar View Type Definitions
 * Feature: 007-calendar-view
 * Date: December 2, 2025
 *
 * These interfaces define the contract for Calendar View components.
 * Implementation uses JavaScript but these types serve as documentation
 * and can be used with JSDoc annotations.
 */

// ============================================================================
// View Mode Types
// ============================================================================

/**
 * Calendar view display modes
 */
export type CalendarViewMode = 'month' | 'week' | 'day';

// ============================================================================
// Calendar State Types
// ============================================================================

/**
 * Runtime state for calendar view
 */
export interface CalendarState {
  /** Current view mode */
  viewMode: CalendarViewMode;
  /** Center date of current view (navigated to) */
  currentDate: Date;
  /** Currently selected/focused date cell */
  selectedDate: Date | null;
  /** Whether unscheduled sidebar is expanded */
  sidebarOpen: boolean;
}

/**
 * Persisted calendar preferences (localStorage)
 */
export interface CalendarPreferences {
  /** Last selected view mode */
  viewMode: CalendarViewMode;
  /** Last sidebar visibility state */
  sidebarOpen: boolean;
}

// ============================================================================
// Calendar Data Types
// ============================================================================

/**
 * Single day in the calendar grid
 */
export interface CalendarDay {
  /** The date this cell represents */
  date: Date;
  /** ISO date string key for task lookup (YYYY-MM-DD) */
  dateKey: string;
  /** Whether this date is in the currently displayed month */
  isCurrentMonth: boolean;
  /** Whether this date is today */
  isToday: boolean;
  /** Tasks due on this date */
  tasks: Task[];
}

/**
 * Month view grid data
 */
export interface MonthGridData {
  /** Year being displayed */
  year: number;
  /** Month being displayed (0-indexed) */
  month: number;
  /** First date in grid (may be previous month) */
  startDate: Date;
  /** Last date in grid (may be next month) */
  endDate: Date;
  /** Array of 42 days (6 weeks × 7 days) */
  days: CalendarDay[];
}

/**
 * Week view grid data
 */
export interface WeekGridData {
  /** First day of week (Sunday) */
  weekStart: Date;
  /** Last day of week (Saturday) */
  weekEnd: Date;
  /** Array of 7 days */
  days: CalendarDay[];
}

/**
 * Day view data
 */
export interface DayViewData {
  /** The date being displayed */
  date: Date;
  /** ISO date string key */
  dateKey: string;
  /** Whether this is today */
  isToday: boolean;
  /** All tasks due on this date */
  tasks: Task[];
}

// ============================================================================
// Task Reference (from 002-task-management)
// ============================================================================

/**
 * Task entity (reference - defined in task-context.ts)
 * Only fields relevant to Calendar View listed
 */
export interface Task {
  id: string;
  taskName: string;
  description?: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
  deadline: Date | null;
  userId: string;
  createdAt: Date;
  completedAt?: Date | null;
}

// ============================================================================
// Hook Return Types
// ============================================================================

/**
 * Return type for useCalendar hook
 */
export interface UseCalendarReturn {
  /** Current calendar state */
  state: CalendarState;
  /** Navigate to previous period (month/week/day) */
  goToPrevious: () => void;
  /** Navigate to next period (month/week/day) */
  goToNext: () => void;
  /** Navigate to today */
  goToToday: () => void;
  /** Change view mode */
  setViewMode: (mode: CalendarViewMode) => void;
  /** Select a specific date */
  selectDate: (date: Date | null) => void;
  /** Toggle sidebar visibility */
  toggleSidebar: () => void;
  /** Set sidebar visibility */
  setSidebarOpen: (open: boolean) => void;
  /** Get month grid data for current view */
  getMonthGrid: () => MonthGridData;
  /** Get week grid data for current view */
  getWeekGrid: () => WeekGridData;
  /** Get day view data for current view */
  getDayView: () => DayViewData;
}

// ============================================================================
// Component Props Types
// ============================================================================

/**
 * CalendarView component props
 */
export interface CalendarViewProps {
  /** Optional initial view mode override */
  initialViewMode?: CalendarViewMode;
  /** Optional initial date to display */
  initialDate?: Date;
}

/**
 * CalendarHeader component props
 */
export interface CalendarHeaderProps {
  /** Current view mode */
  viewMode: CalendarViewMode;
  /** Current date being displayed */
  currentDate: Date;
  /** Callback when view mode changes */
  onViewModeChange: (mode: CalendarViewMode) => void;
  /** Callback for previous navigation */
  onPrevious: () => void;
  /** Callback for next navigation */
  onNext: () => void;
  /** Callback for today navigation */
  onToday: () => void;
  /** Whether sidebar is open */
  sidebarOpen: boolean;
  /** Callback to toggle sidebar */
  onToggleSidebar: () => void;
  /** Count of unscheduled tasks */
  unscheduledCount: number;
}

/**
 * CalendarGrid component props (Month view)
 */
export interface CalendarGridProps {
  /** Grid data for the month */
  gridData: MonthGridData;
  /** Tasks grouped by date key */
  tasksByDate: Map<string, Task[]>;
  /** Currently selected date */
  selectedDate: Date | null;
  /** Callback when date is selected */
  onDateSelect: (date: Date) => void;
  /** Callback when task is clicked */
  onTaskClick: (task: Task) => void;
  /** Callback when task is dropped on date */
  onTaskDrop: (taskId: string, newDate: Date) => void;
}

/**
 * CalendarCell component props
 */
export interface CalendarCellProps {
  /** Day data for this cell */
  day: CalendarDay;
  /** Whether this cell is selected */
  isSelected: boolean;
  /** Callback when cell is clicked */
  onClick: () => void;
  /** Callback when task is clicked */
  onTaskClick: (task: Task) => void;
  /** Callback when task is dropped */
  onDrop: (taskId: string) => void;
  /** Whether currently in a drag operation */
  isDragTarget: boolean;
}

/**
 * CalendarTaskIndicator component props
 */
export interface CalendarTaskIndicatorProps {
  /** Task to display */
  task: Task;
  /** Callback when indicator is clicked */
  onClick: () => void;
  /** Whether task is being dragged */
  isDragging: boolean;
  /** Whether to show compact view (in cells) or full view (in day) */
  compact: boolean;
}

/**
 * UnscheduledSidebar component props
 */
export interface UnscheduledSidebarProps {
  /** Tasks without deadlines */
  tasks: Task[];
  /** Whether sidebar is expanded */
  isOpen: boolean;
  /** Callback to toggle sidebar */
  onToggle: () => void;
  /** Callback when task is clicked */
  onTaskClick: (task: Task) => void;
}

/**
 * TaskOverflowPopover component props
 */
export interface TaskOverflowPopoverProps {
  /** All tasks for the date */
  tasks: Task[];
  /** Date being displayed */
  date: Date;
  /** Whether popover is open */
  isOpen: boolean;
  /** Callback to close popover */
  onClose: () => void;
  /** Callback when task is clicked */
  onTaskClick: (task: Task) => void;
  /** Anchor element for positioning */
  anchorEl: HTMLElement | null;
}

// ============================================================================
// Drag and Drop Types
// ============================================================================

/**
 * Calendar-specific drag state extension
 */
export interface CalendarDragState {
  /** Whether a drag is in progress */
  isDragging: boolean;
  /** ID of task being dragged */
  draggedTaskId: string | null;
  /** Source: date key or 'unscheduled' */
  source: string | null;
  /** Target date key being hovered */
  targetDateKey: string | null;
}

/**
 * Drop handler for calendar
 */
export type CalendarDropHandler = (
  taskId: string,
  newDeadline: Date,
  oldDeadline: Date | null
) => void;

// ============================================================================
// Constants
// ============================================================================

/**
 * Calendar-specific constants
 */
export const CALENDAR_CONSTANTS = {
  /** Maximum tasks shown in cell before overflow */
  MAX_VISIBLE_TASKS_MOBILE: 3,
  MAX_VISIBLE_TASKS_DESKTOP: 5,
  /** Days in week (starting Sunday) */
  DAYS_OF_WEEK: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const,
  /** Full day names */
  DAYS_OF_WEEK_FULL: [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ] as const,
  /** Month names */
  MONTHS: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ] as const,
  /** LocalStorage key for preferences */
  STORAGE_KEY: 'taskflow_calendar_preferences',
  /** Long press duration for touch drag (ms) */
  LONG_PRESS_DURATION: 500,
} as const;
