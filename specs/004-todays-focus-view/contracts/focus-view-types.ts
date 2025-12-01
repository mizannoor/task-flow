/**
 * Focus View Type Definitions
 * Feature: 004-todays-focus-view
 * 
 * These interfaces define the contracts for the Today's Focus View feature.
 * They serve as documentation and can be used for TypeScript migration.
 */

// =============================================================================
// Existing Types (from TaskContext - for reference)
// =============================================================================

/** Task status values matching STATUSES constant */
type TaskStatus = 'pending' | 'in-progress' | 'completed';

/** Task priority values matching PRIORITIES constant */
type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';

/** Task entity from existing data model */
interface Task {
  id: string;
  userId: string;
  createdBy: string;
  taskName: string;
  description: string;
  complexity: number;
  priority: TaskPriority;
  category: string;
  tags: string[];
  estimatedDuration: number;
  actualDuration: number;
  status: TaskStatus;
  deadline: Date | null;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
}

/** User entity from AuthContext */
interface User {
  id: string;
  identifier: string;
  displayName: string;
}

// =============================================================================
// Focus View Constants
// =============================================================================

/** Selection tier values (lower = higher priority) */
type SelectionTier = 1 | 2 | 3 | 4;

/** Tier labels for display/debugging */
const TIER_LABELS: Record<SelectionTier, string> = {
  1: 'Overdue',
  2: 'Due Today',
  3: 'In Progress',
  4: 'High Priority',
};

/** Maximum tasks to display in Focus View */
const FOCUS_VIEW_MAX_TASKS = 10;

/** Priorities that qualify for Tier 4 */
const HIGH_PRIORITY_VALUES: TaskPriority[] = ['urgent', 'high'];

// =============================================================================
// Focus View State Types
// =============================================================================

/** Extended task with selection metadata */
interface FocusTask extends Task {
  /** Priority tier that qualified this task (1-4) */
  selectionTier: SelectionTier;
  /** Human-readable tier name */
  tierLabel: string;
}

/** Focus View UI state */
interface FocusViewState {
  /** Task ID with expanded details (null = all collapsed) */
  expandedTaskId: string | null;
  /** Index of keyboard-focused card (0-9) */
  focusedIndex: number;
  /** Whether "Load More" button is visible after completion */
  showLoadMore: boolean;
}

/** Daily progress statistics (computed) */
interface DailyProgress {
  /** Today's date (for cache invalidation) */
  date: Date;
  /** Count of tasks completed with today's completedAt */
  completedToday: number;
  /** Total tasks that qualified for focus view today */
  totalQualifying: number;
  /** Tasks still in focus view (not completed) */
  remainingTasks: number;
  /** Whether more qualifying tasks exist beyond the limit */
  hasMoreTasks: boolean;
  /** Completion percentage (0-100) */
  completionPercentage: number;
}

// =============================================================================
// Hook Types
// =============================================================================

/** Return type of useFocusTasks hook */
interface UseFocusTasksResult {
  /** Selected tasks for display (max 10) */
  focusTasks: FocusTask[];
  /** Daily progress statistics */
  progress: DailyProgress;
  /** Whether additional qualifying tasks exist */
  hasMore: boolean;
  /** Load next batch of tasks (replaces current 10) */
  loadMore: () => void;
  /** Loading state */
  loading: boolean;
  /** Error state */
  error: string | null;
}

/** Input parameters for selection algorithm */
interface SelectionInput {
  /** All tasks from TaskContext */
  tasks: Task[];
  /** Current user ID for filtering */
  currentUserId: string;
  /** Number of tasks to select */
  limit: number;
  /** Offset for "Load More" functionality */
  offset: number;
}

// =============================================================================
// Component Props Types
// =============================================================================

/** FocusView component props */
interface FocusViewProps {
  /** Callback when task edit is requested (opens TaskModal) */
  onEditTask?: (task: Task) => void;
  /** Callback when task delete is requested */
  onDeleteTask?: (taskId: string) => void;
  /** Callback when create task is requested (from empty state) */
  onCreateTask?: () => void;
}

/** FocusCard component props */
interface FocusCardProps {
  /** Task data to display */
  task: FocusTask;
  /** Whether this card's details are expanded */
  isExpanded: boolean;
  /** Whether this card has keyboard focus */
  isFocused: boolean;
  /** Callback when card is clicked (toggle expand) */
  onClick: (taskId: string) => void;
  /** Callback for "Start" action (pending tasks) */
  onStart: (taskId: string) => void;
  /** Callback for "Complete" action (in-progress tasks) */
  onComplete: (taskId: string) => void;
  /** Callback when card receives focus */
  onFocus: () => void;
  /** Callback when card receives keyboard event */
  onKeyDown: (event: React.KeyboardEvent) => void;
}

/** FocusProgress component props */
interface FocusProgressProps {
  /** Progress statistics */
  progress: DailyProgress;
}

/** FocusEmptyState component props */
interface FocusEmptyStateProps {
  /** Type of empty state to display */
  type: 'no-tasks' | 'all-done';
  /** Whether more tasks can be loaded */
  hasMoreTasks: boolean;
  /** Callback for "Create Task" button */
  onCreateTask?: () => void;
  /** Callback for "Load More" button */
  onLoadMore?: () => void;
}

// =============================================================================
// Action Types
// =============================================================================

/** Actions available on a focus task */
type FocusTaskAction = 'start' | 'complete' | 'expand' | 'collapse';

/** Keyboard actions */
type KeyboardAction =
  | 'next'      // Arrow Down / Tab
  | 'previous'  // Arrow Up / Shift+Tab
  | 'activate'  // Enter / Space
  | 'escape';   // Escape (collapse)

/** Map of key codes to actions */
const KEYBOARD_MAP: Record<string, KeyboardAction> = {
  'ArrowDown': 'next',
  'ArrowUp': 'previous',
  'Enter': 'activate',
  ' ': 'activate',
  'Escape': 'escape',
};

// =============================================================================
// Utility Types
// =============================================================================

/** Date range for "today" calculations */
interface TodayRange {
  /** Start of today (midnight) */
  start: Date;
  /** End of today (23:59:59.999) */
  end: Date;
}

/** Task classification result */
interface TaskClassification {
  /** Assigned tier (1-4) or null if doesn't qualify */
  tier: SelectionTier | null;
  /** Reason for classification */
  reason: string;
}

// =============================================================================
// Export all types (for TypeScript usage)
// =============================================================================

export type {
  Task,
  TaskStatus,
  TaskPriority,
  User,
  SelectionTier,
  FocusTask,
  FocusViewState,
  DailyProgress,
  UseFocusTasksResult,
  SelectionInput,
  FocusViewProps,
  FocusCardProps,
  FocusProgressProps,
  FocusEmptyStateProps,
  FocusTaskAction,
  KeyboardAction,
  TodayRange,
  TaskClassification,
};

export {
  TIER_LABELS,
  FOCUS_VIEW_MAX_TASKS,
  HIGH_PRIORITY_VALUES,
  KEYBOARD_MAP,
};
