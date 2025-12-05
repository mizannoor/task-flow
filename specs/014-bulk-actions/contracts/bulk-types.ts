/**
 * Bulk Actions Type Definitions
 * Feature: 014-bulk-actions
 *
 * These interfaces define the contracts for the Bulk Actions feature.
 * They serve as documentation and can be used for TypeScript migration.
 */

// =============================================================================
// Existing Types (from TaskContext - for reference)
// =============================================================================

/** Task status values matching STATUSES constant */
type TaskStatus = 'pending' | 'in-progress' | 'completed';

/** Task entity from existing data model */
interface Task {
  id: string;
  userId: string;
  createdBy: string;
  taskName: string;
  description: string;
  complexity: number;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  category: 'development' | 'fix' | 'support';
  tags: string[];
  estimatedDuration: number;
  actualDuration: number;
  status: TaskStatus;
  deadline: Date | null;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
}

// =============================================================================
// Selection State Types
// =============================================================================

/**
 * Extended selection state for bulk operations
 * Extends existing KeyboardShortcutContext state
 */
interface SelectionState {
  /** Set of selected task IDs */
  selectedTaskIds: Set<string>;

  /** Last clicked task ID for shift+click range selection anchor */
  lastClickedTaskId: string | null;

  /** Whether "Select All" checkbox is checked */
  isSelectAllActive: boolean;
}

/**
 * Selection context actions (additions to KeyboardShortcutContext)
 */
interface SelectionActions {
  /** Toggle selection state of a single task */
  toggleTaskSelection: (taskId: string) => void;

  /** Clear all selections */
  clearSelections: () => void;

  /** Select all provided task IDs (up to MAX_SELECTION limit) */
  selectAll: (taskIds: string[]) => void;

  /** Add multiple task IDs to selection */
  addToSelection: (taskIds: string[]) => void;

  /** Remove multiple task IDs from selection */
  removeFromSelection: (taskIds: string[]) => void;

  /** Select range of tasks between two IDs based on visible order */
  selectRange: (fromId: string, toId: string, visibleTasks: Task[]) => void;

  /** Set the last clicked task ID (anchor for range selection) */
  setLastClicked: (taskId: string | null) => void;

  /** Check if a task is selected */
  isTaskSelected: (taskId: string) => boolean;
}

// =============================================================================
// Bulk Operation Types
// =============================================================================

/** Types of bulk operations */
type BulkOperationType = 'delete' | 'status' | 'reassign' | 'addTags' | 'removeTags';

/**
 * Result returned from bulk service operations
 */
interface BulkOperationResult {
  /** Whether the operation completed successfully */
  success: boolean;

  /** Type of operation that was performed */
  operationType: BulkOperationType;

  /** Number of tasks that were modified */
  affectedCount: number;

  /** Number of tasks that were skipped (e.g., blocked tasks not started) */
  skippedCount: number;

  /** IDs of tasks that were skipped */
  skippedTaskIds: string[];

  /** Error message if operation failed */
  error: string | null;
}

/**
 * State for tracking in-progress bulk operations
 */
interface BulkOperationState {
  /** Whether a bulk operation is currently in progress */
  isProcessing: boolean;

  /** Type of operation being performed */
  operationType: BulkOperationType | null;

  /** Total number of tasks being operated on */
  totalCount: number;

  /** Number of tasks processed so far (for progress indicator) */
  processedCount: number;

  /** Error message if operation failed */
  error: string | null;
}

// =============================================================================
// Bulk Service Function Signatures
// =============================================================================

/**
 * Bulk service interface
 */
interface BulkService {
  /**
   * Delete multiple tasks and their dependencies
   * @param taskIds - Array of task IDs to delete
   * @returns Promise resolving to operation result
   */
  bulkDeleteTasks: (taskIds: string[]) => Promise<BulkOperationResult>;

  /**
   * Update status for multiple tasks
   * @param taskIds - Array of task IDs to update
   * @param status - New status to apply
   * @param options - Optional settings (force to skip blocked check)
   * @returns Promise resolving to operation result
   */
  bulkUpdateStatus: (
    taskIds: string[],
    status: TaskStatus,
    options?: { force?: boolean; skipBlocked?: boolean }
  ) => Promise<BulkOperationResult>;

  /**
   * Reassign multiple tasks to a different user
   * @param taskIds - Array of task IDs to reassign
   * @param newUserId - ID of user to assign tasks to
   * @returns Promise resolving to operation result
   */
  bulkReassignTasks: (
    taskIds: string[],
    newUserId: string
  ) => Promise<BulkOperationResult>;

  /**
   * Add tags to multiple tasks
   * @param taskIds - Array of task IDs to modify
   * @param tags - Array of tags to add
   * @returns Promise resolving to operation result
   */
  bulkAddTags: (
    taskIds: string[],
    tags: string[]
  ) => Promise<BulkOperationResult>;

  /**
   * Remove tags from multiple tasks
   * @param taskIds - Array of task IDs to modify
   * @param tags - Array of tags to remove
   * @returns Promise resolving to operation result
   */
  bulkRemoveTags: (
    taskIds: string[],
    tags: string[]
  ) => Promise<BulkOperationResult>;

  /**
   * Get blocked status for multiple tasks
   * @param taskIds - Array of task IDs to check
   * @returns Promise resolving to map of taskId -> isBlocked
   */
  getBlockedStatus: (taskIds: string[]) => Promise<Map<string, boolean>>;
}

// =============================================================================
// Component Props Types
// =============================================================================

/**
 * Props for BulkActionBar component
 */
interface BulkActionBarProps {
  /** Number of selected tasks */
  selectionCount: number;

  /** Callback when delete action is clicked */
  onDelete: () => void;

  /** Callback when status change is selected */
  onStatusChange: (status: TaskStatus) => void;

  /** Callback when reassign user is selected */
  onReassign: (userId: string) => void;

  /** Callback when add tags is confirmed */
  onAddTags: (tags: string[]) => void;

  /** Callback when remove tags is confirmed */
  onRemoveTags: (tags: string[]) => void;

  /** Callback when clear selection is clicked */
  onClearSelection: () => void;

  /** Whether a bulk operation is in progress */
  isProcessing?: boolean;

  /** List of all users for reassign dropdown */
  users: Array<{ id: string; displayName: string }>;

  /** Tags present in selected tasks (for remove dropdown) */
  availableTags: string[];
}

/**
 * Props for BulkDeleteConfirmModal component
 */
interface BulkDeleteConfirmModalProps {
  /** Whether the modal is open */
  isOpen: boolean;

  /** Number of tasks to be deleted */
  taskCount: number;

  /** Callback when delete is confirmed */
  onConfirm: () => void;

  /** Callback when modal is cancelled/closed */
  onCancel: () => void;

  /** Whether delete operation is in progress */
  isDeleting?: boolean;
}

/**
 * Props for BulkBlockedWarningModal component
 */
interface BulkBlockedWarningModalProps {
  /** Whether the modal is open */
  isOpen: boolean;

  /** List of blocked tasks with their blocking info */
  blockedTasks: Array<{
    id: string;
    taskName: string;
    blockedByCount: number;
  }>;

  /** Total tasks being operated on */
  totalCount: number;

  /** Callback when "Start Unblocked Only" is selected */
  onSkipBlocked: () => void;

  /** Callback when "Start All Anyway" is selected */
  onForceStart: () => void;

  /** Callback when modal is cancelled/closed */
  onCancel: () => void;
}

/**
 * Props for BulkTagModal component
 */
interface BulkTagModalProps {
  /** Whether the modal is open */
  isOpen: boolean;

  /** Mode: adding or removing tags */
  mode: 'add' | 'remove';

  /** Tags available for removal (only used in 'remove' mode) */
  availableTags: string[];

  /** Callback when tags are confirmed */
  onConfirm: (tags: string[]) => void;

  /** Callback when modal is cancelled/closed */
  onCancel: () => void;
}

// =============================================================================
// Constants
// =============================================================================

/** Maximum number of tasks that can be selected at once */
const MAX_SELECTION_SIZE = 500;

/** Warning threshold for large selections */
const SELECTION_WARNING_THRESHOLD = 100;

/** Keyboard shortcuts for bulk actions */
interface BulkKeyboardShortcuts {
  selectAll: 'ctrl+a' | 'meta+a';
  bulkDelete: 'ctrl+shift+d' | 'meta+shift+d';
  clearSelection: 'escape';
}

export type {
  Task,
  TaskStatus,
  SelectionState,
  SelectionActions,
  BulkOperationType,
  BulkOperationResult,
  BulkOperationState,
  BulkService,
  BulkActionBarProps,
  BulkDeleteConfirmModalProps,
  BulkBlockedWarningModalProps,
  BulkTagModalProps,
  BulkKeyboardShortcuts,
};

export { MAX_SELECTION_SIZE, SELECTION_WARNING_THRESHOLD };
