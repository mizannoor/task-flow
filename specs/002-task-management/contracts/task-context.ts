/**
 * Task Management Contracts
 * TypeScript interfaces defining the TaskContext API contract
 * 
 * Feature: 002-task-management
 * Date: December 1, 2025
 */

// =============================================================================
// Enums & Constants
// =============================================================================

export type Priority = 'urgent' | 'high' | 'medium' | 'low';
export type Category = 'development' | 'fix' | 'support';
export type Status = 'pending' | 'in-progress' | 'completed';
export type SortField = 'priority' | 'complexity' | 'estimatedDuration' | 'createdAt' | 'deadline' | 'taskName';
export type SortOrder = 'asc' | 'desc';

// =============================================================================
// Entity Interfaces
// =============================================================================

/**
 * Task entity as stored in IndexedDB
 */
export interface Task {
  // Identifiers
  id: string;                    // UUID v4
  userId: string;                // Assigned user (FK to users.id)
  createdBy: string;             // Creator user (FK to users.id)

  // Core properties
  taskName: string;              // Required, 1-200 chars
  description: string;           // Optional, max 5000 chars

  // Categorization
  complexity: number;            // 1-10, default: 5
  priority: Priority;            // default: 'medium'
  category: Category;            // default: 'development'
  tags: string[];                // Custom labels

  // Time tracking
  estimatedDuration: number;     // Minutes, default: 60
  actualDuration: number;        // Minutes, tracked time

  // Status & dates
  status: Status;                // default: 'pending'
  deadline: Date | null;         // Optional due date
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;      // Set when status → completed
}

/**
 * Input for creating a new task
 */
export interface CreateTaskInput {
  taskName: string;              // Required
  description?: string;
  complexity?: number;
  priority?: Priority;
  category?: Category;
  tags?: string[];
  estimatedDuration?: number;
  deadline?: Date | null;
  userId?: string;               // Defaults to current user
}

/**
 * Input for updating an existing task
 */
export interface UpdateTaskInput {
  taskName?: string;
  description?: string;
  complexity?: number;
  priority?: Priority;
  category?: Category;
  tags?: string[];
  estimatedDuration?: number;
  actualDuration?: number;
  deadline?: Date | null;
  userId?: string;
}

// =============================================================================
// Filter & Sort Interfaces
// =============================================================================

/**
 * Active filter state
 */
export interface TaskFilter {
  status: Status[];              // Empty = all statuses
  priority: Priority[];          // Empty = all priorities
  category: Category[];          // Empty = all categories
  searchQuery: string;           // Text search in name + description
  userId: string | null;         // null = all tasks, string = specific user
}

/**
 * Sort configuration
 */
export interface TaskSort {
  field: SortField;
  order: SortOrder;
}

// =============================================================================
// Context State & Actions
// =============================================================================

/**
 * TaskContext state shape
 */
export interface TaskContextState {
  tasks: Task[];
  loading: boolean;
  error: Error | null;
  filters: TaskFilter;
  sort: TaskSort;
}

/**
 * TaskContext action types
 */
export type TaskAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: Error | null }
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'SET_FILTERS'; payload: Partial<TaskFilter> }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'SET_SORT'; payload: TaskSort };

/**
 * TaskContext value (exposed to consumers)
 */
export interface TaskContextValue {
  // State
  tasks: Task[];                 // Filtered & sorted tasks
  allTasks: Task[];              // Unfiltered tasks
  loading: boolean;
  error: Error | null;
  filters: TaskFilter;
  sort: TaskSort;

  // CRUD Operations
  createTask: (input: CreateTaskInput) => Promise<Task>;
  updateTask: (id: string, input: UpdateTaskInput) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  getTaskById: (id: string) => Task | undefined;

  // Status Operations
  startTask: (id: string) => Promise<Task>;
  completeTask: (id: string) => Promise<Task>;
  reopenTask: (id: string) => Promise<Task>;

  // Filter Operations
  setFilter: (key: keyof TaskFilter, value: TaskFilter[typeof key]) => void;
  setFilters: (filters: Partial<TaskFilter>) => void;
  clearFilters: () => void;

  // Sort Operations
  setSort: (field: SortField, order?: SortOrder) => void;
  toggleSortOrder: () => void;

  // Utilities
  refreshTasks: () => Promise<void>;
}

// =============================================================================
// Service Layer Interfaces
// =============================================================================

/**
 * Task service operations (src/services/taskService.js)
 */
export interface TaskService {
  createTask: (input: CreateTaskInput & { userId: string; createdBy: string }) => Promise<Task>;
  getTaskById: (id: string) => Promise<Task | undefined>;
  getTasksByUser: (userId: string) => Promise<Task[]>;
  getAllTasks: () => Promise<Task[]>;
  updateTask: (id: string, updates: UpdateTaskInput) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
}

// =============================================================================
// Validation Interfaces
// =============================================================================

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

/**
 * Task validators (src/utils/validators.js)
 */
export interface TaskValidators {
  validateTaskName: (name: string) => string | null;
  validateDescription: (desc: string) => string | null;
  validateComplexity: (complexity: number) => string | null;
  validateEstimatedDuration: (duration: number) => string | null;
  validateTaskInput: (input: CreateTaskInput) => ValidationResult;
}

// =============================================================================
// Component Props Interfaces
// =============================================================================

/**
 * TaskForm props
 */
export interface TaskFormProps {
  task?: Task;                   // For edit mode
  onSubmit: (input: CreateTaskInput | UpdateTaskInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * TaskList props
 */
export interface TaskListProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onStatusChange: (taskId: string, action: 'start' | 'complete' | 'reopen') => void;
  onDelete: (taskId: string) => void;
  emptyMessage?: string;
}

/**
 * FilterBar props
 */
export interface FilterBarProps {
  filters: TaskFilter;
  sort: TaskSort;
  onFilterChange: (key: keyof TaskFilter, value: TaskFilter[typeof key]) => void;
  onSortChange: (field: SortField) => void;
  onClearFilters: () => void;
}
