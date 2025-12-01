/**
 * Kanban View Type Definitions
 * Feature: 003-kanban-view
 * 
 * These interfaces define the contracts for the Kanban View feature.
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

// =============================================================================
// Kanban View State Types
// =============================================================================

/** Column collapse state for persistence */
interface CollapsedColumnsState {
  pending: boolean;
  'in-progress': boolean;
  completed: boolean;
}

/** Main Kanban view UI state */
interface KanbanViewState {
  /** Which columns are currently collapsed */
  collapsedColumns: CollapsedColumnsState;
  /** Task ID shown in side panel (null = panel closed) */
  selectedTaskId: string | null;
  /** Card ID with keyboard focus */
  focusedCardId: string | null;
  /** Column with keyboard focus */
  focusedColumn: TaskStatus | null;
}

/** Drag operation state */
interface DragState {
  /** Whether a drag is in progress */
  isDragging: boolean;
  /** ID of task being dragged */
  draggedTaskId: string | null;
  /** Original column of dragged task */
  sourceColumn: TaskStatus | null;
  /** Column currently hovered over */
  targetColumn: TaskStatus | null;
  /** Position within target column (for visual feedback) */
  dropIndex: number | null;
}

/** Hover preview popup state */
interface HoverPreviewState {
  /** Whether preview is showing */
  isVisible: boolean;
  /** Task ID being previewed */
  taskId: string | null;
  /** Popup position relative to viewport */
  position: { x: number; y: number };
}

// =============================================================================
// Computed Types
// =============================================================================

/** Tasks grouped by status for column rendering */
interface TasksByStatus {
  pending: Task[];
  'in-progress': Task[];
  completed: Task[];
}

/** Task counts per column for badges */
interface ColumnCounts {
  pending: number;
  'in-progress': number;
  completed: number;
}

// =============================================================================
// Component Props Contracts
// =============================================================================

/** KanbanView component props */
interface KanbanViewProps {
  /** Callback when task edit is requested */
  onEditTask?: (task: Task) => void;
  /** Callback when task delete is requested */
  onDeleteTask?: (taskId: string) => void;
  /** Callback when create task is requested (from empty state) */
  onCreateTask?: () => void;
}

/** KanbanColumn component props */
interface KanbanColumnProps {
  /** Column status identifier */
  status: TaskStatus;
  /** Column display title */
  title: string;
  /** Tasks to display in this column (pre-sorted) */
  tasks: Task[];
  /** Whether column is collapsed */
  isCollapsed: boolean;
  /** Callback to toggle collapse state */
  onToggleCollapse: () => void;
  /** Callback when a card is clicked */
  onCardClick: (taskId: string) => void;
  /** Callback when drag starts on a card */
  onDragStart: (taskId: string, status: TaskStatus) => void;
  /** Callback when drag ends */
  onDragEnd: () => void;
  /** Callback when dragged card enters column */
  onDragEnter: (status: TaskStatus) => void;
  /** Callback when card is dropped in column */
  onDrop: (taskId: string, newStatus: TaskStatus) => void;
  /** Whether this column is the current drag target */
  isDragTarget: boolean;
  /** ID of currently dragged task (for styling) */
  draggedTaskId: string | null;
  /** ID of focused card for keyboard navigation */
  focusedCardId: string | null;
  /** Callback when card receives keyboard focus */
  onCardFocus: (taskId: string) => void;
}

/** KanbanCard component props */
interface KanbanCardProps {
  /** Task data to display */
  task: Task;
  /** Whether this card is being dragged */
  isDragging: boolean;
  /** Whether this card has keyboard focus */
  isFocused: boolean;
  /** Callback when card is clicked */
  onClick: () => void;
  /** Callback when drag starts */
  onDragStart: () => void;
  /** Callback when drag ends */
  onDragEnd: () => void;
  /** Callback when card receives focus */
  onFocus: () => void;
  /** Callback when Enter/Space pressed for status change */
  onKeyboardStatusChange: () => void;
}

/** KanbanCardPreview component props */
interface KanbanCardPreviewProps {
  /** Task data to display in preview */
  task: Task;
  /** Position to render preview */
  position: { x: number; y: number };
  /** Callback when preview should close */
  onClose: () => void;
}

/** TaskSidePanel component props */
interface TaskSidePanelProps {
  /** Task to display (null = panel closed) */
  task: Task | null;
  /** Whether panel is open */
  isOpen: boolean;
  /** Callback when panel close is requested */
  onClose: () => void;
  /** Callback when task edit is requested */
  onEdit: (task: Task) => void;
  /** Callback when task delete is requested */
  onDelete: (taskId: string) => void;
  /** Callback when status change is requested */
  onStatusChange: (taskId: string, newStatus: TaskStatus) => void;
}

// =============================================================================
// Hook Contracts
// =============================================================================

/** useDragAndDrop hook return type */
interface UseDragAndDropReturn {
  /** Current drag state */
  dragState: DragState;
  /** Start a drag operation */
  startDrag: (taskId: string, sourceColumn: TaskStatus) => void;
  /** Update target column during drag */
  updateTarget: (targetColumn: TaskStatus | null, dropIndex?: number) => void;
  /** End drag operation (success) */
  endDrag: () => void;
  /** Cancel drag operation (revert) */
  cancelDrag: () => void;
  /** Get drag handlers for a card element */
  getDragHandlers: (taskId: string, status: TaskStatus) => {
    draggable: boolean;
    onDragStart: (e: DragEvent) => void;
    onDragEnd: (e: DragEvent) => void;
  };
  /** Get drop handlers for a column element */
  getDropHandlers: (status: TaskStatus) => {
    onDragOver: (e: DragEvent) => void;
    onDragEnter: (e: DragEvent) => void;
    onDragLeave: (e: DragEvent) => void;
    onDrop: (e: DragEvent) => void;
  };
}

/** useKanbanKeyboard hook return type */
interface UseKanbanKeyboardReturn {
  /** Currently focused card ID */
  focusedCardId: string | null;
  /** Currently focused column */
  focusedColumn: TaskStatus | null;
  /** Set focus to a specific card */
  setFocus: (cardId: string, column: TaskStatus) => void;
  /** Clear focus (e.g., when leaving board) */
  clearFocus: () => void;
  /** Get keyboard handlers for the board container */
  getKeyboardHandlers: () => {
    onKeyDown: (e: KeyboardEvent) => void;
    tabIndex: number;
    role: string;
    'aria-label': string;
  };
}

// =============================================================================
// Action Types (for potential reducer pattern)
// =============================================================================

type KanbanAction =
  | { type: 'TOGGLE_COLUMN_COLLAPSE'; payload: TaskStatus }
  | { type: 'SELECT_TASK'; payload: string | null }
  | { type: 'SET_FOCUS'; payload: { cardId: string; column: TaskStatus } }
  | { type: 'CLEAR_FOCUS' }
  | { type: 'RESTORE_COLLAPSED_STATE'; payload: CollapsedColumnsState };

// =============================================================================
// Storage Types
// =============================================================================

/** localStorage schema for kanban preferences */
interface KanbanStorageSchema {
  /** Key: taskflow_kanban_columns */
  columns: CollapsedColumnsState;
}

// Export for potential TypeScript usage
export type {
  TaskStatus,
  TaskPriority,
  Task,
  CollapsedColumnsState,
  KanbanViewState,
  DragState,
  HoverPreviewState,
  TasksByStatus,
  ColumnCounts,
  KanbanViewProps,
  KanbanColumnProps,
  KanbanCardProps,
  KanbanCardPreviewProps,
  TaskSidePanelProps,
  UseDragAndDropReturn,
  UseKanbanKeyboardReturn,
  KanbanAction,
  KanbanStorageSchema,
};
