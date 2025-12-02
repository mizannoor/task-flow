/**
 * Authentication Constants
 * Validation patterns, error messages, and configuration values
 */

// Session storage key for localStorage
export const SESSION_KEY = 'taskflow_session';

// Validation patterns for identifier types
export const PATTERNS = {
  // Valid email format: x@y.z
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  // Username: 3-30 alphanumeric + underscore characters
  USERNAME: /^[a-zA-Z0-9_]{3,30}$/,
  // Phone: 10-15 digits with optional + prefix
  PHONE: /^\+?[0-9]{10,15}$/,
};

// Identifier constraints
export const IDENTIFIER_LIMITS = {
  MIN_LENGTH: 3,
  MAX_LENGTH: 254,
};

// Display name constraints
export const DISPLAY_NAME_LIMITS = {
  MIN_LENGTH: 1,
  MAX_LENGTH: 100,
};

// Error messages for validation failures
export const ERROR_MESSAGES = {
  IDENTIFIER_REQUIRED: 'Please enter an identifier',
  IDENTIFIER_TOO_SHORT: `Identifier must be at least ${IDENTIFIER_LIMITS.MIN_LENGTH} characters`,
  IDENTIFIER_TOO_LONG: `Identifier must be at most ${IDENTIFIER_LIMITS.MAX_LENGTH} characters`,
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_USERNAME: 'Username must be 3-30 alphanumeric characters or underscores',
  INVALID_PHONE: 'Phone number must be 10-15 digits (optional + prefix)',
  STORAGE_UNAVAILABLE: 'Local storage is not available. Please enable it in your browser settings.',
  SESSION_CORRUPTED: 'Your session data is corrupted. Please log in again.',
  USER_NOT_FOUND: 'User not found. Please check your identifier.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
};

// Auth error codes
export const AUTH_ERROR_CODES = {
  INVALID_IDENTIFIER: 'INVALID_IDENTIFIER',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  STORAGE_UNAVAILABLE: 'STORAGE_UNAVAILABLE',
  SESSION_CORRUPTED: 'SESSION_CORRUPTED',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};

// Auth action types for reducer
export const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  SWITCH_USER: 'SWITCH_USER',
  SET_USERS: 'SET_USERS',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_LOADING: 'SET_LOADING',
  SYNC_SESSION: 'SYNC_SESSION',
};

// Identifier types
export const IDENTIFIER_TYPES = {
  EMAIL: 'email',
  USERNAME: 'username',
  PHONE: 'phone',
};

// =============================================================================
// Task Management Constants
// =============================================================================

// Task priorities
export const PRIORITIES = {
  URGENT: 'urgent',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

// Priority display labels
export const PRIORITY_LABELS = {
  [PRIORITIES.URGENT]: 'Urgent',
  [PRIORITIES.HIGH]: 'High',
  [PRIORITIES.MEDIUM]: 'Medium',
  [PRIORITIES.LOW]: 'Low',
};

// Priority numeric values for sorting (higher = more urgent)
export const PRIORITY_ORDER = {
  [PRIORITIES.URGENT]: 4,
  [PRIORITIES.HIGH]: 3,
  [PRIORITIES.MEDIUM]: 2,
  [PRIORITIES.LOW]: 1,
};

// Priority colors (Tailwind classes)
export const PRIORITY_COLORS = {
  [PRIORITIES.URGENT]: 'bg-red-100 text-red-800',
  [PRIORITIES.HIGH]: 'bg-orange-100 text-orange-800',
  [PRIORITIES.MEDIUM]: 'bg-yellow-100 text-yellow-800',
  [PRIORITIES.LOW]: 'bg-green-100 text-green-800',
};

// Task categories
export const CATEGORIES = {
  DEVELOPMENT: 'development',
  FIX: 'fix',
  SUPPORT: 'support',
};

// Category display labels
export const CATEGORY_LABELS = {
  [CATEGORIES.DEVELOPMENT]: 'Development',
  [CATEGORIES.FIX]: 'Fix',
  [CATEGORIES.SUPPORT]: 'Support',
};

// Category colors (Tailwind classes)
export const CATEGORY_COLORS = {
  [CATEGORIES.DEVELOPMENT]: 'bg-blue-100 text-blue-800',
  [CATEGORIES.FIX]: 'bg-purple-100 text-purple-800',
  [CATEGORIES.SUPPORT]: 'bg-gray-100 text-gray-800',
};

// Task statuses
export const STATUSES = {
  PENDING: 'pending',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
};

// Status display labels
export const STATUS_LABELS = {
  [STATUSES.PENDING]: 'Pending',
  [STATUSES.IN_PROGRESS]: 'In Progress',
  [STATUSES.COMPLETED]: 'Completed',
};

// Status colors (Tailwind classes)
export const STATUS_COLORS = {
  [STATUSES.PENDING]: 'bg-slate-100 text-slate-800',
  [STATUSES.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
  [STATUSES.COMPLETED]: 'bg-green-100 text-green-800',
};

// Default task values
export const TASK_DEFAULTS = {
  COMPLEXITY: 5,
  PRIORITY: PRIORITIES.MEDIUM,
  CATEGORY: CATEGORIES.DEVELOPMENT,
  ESTIMATED_DURATION: 60,
  STATUS: STATUSES.PENDING,
};

// Task field constraints
export const TASK_LIMITS = {
  NAME_MIN_LENGTH: 1,
  NAME_MAX_LENGTH: 200,
  DESCRIPTION_MAX_LENGTH: 5000,
  COMPLEXITY_MIN: 1,
  COMPLEXITY_MAX: 10,
  DURATION_MIN: 1,
  DURATION_MAX: 99999,
};

// Task error messages
export const TASK_ERROR_MESSAGES = {
  NAME_REQUIRED: 'Task name is required',
  NAME_TOO_SHORT: 'Task name must be at least 1 character',
  NAME_TOO_LONG: 'Task name must be at most 200 characters',
  DESCRIPTION_TOO_LONG: 'Description must be at most 5000 characters',
  INVALID_COMPLEXITY: 'Complexity must be between 1 and 10',
  INVALID_DURATION: 'Duration must be between 1 and 99999 minutes',
  INVALID_PRIORITY: 'Invalid priority value',
  INVALID_CATEGORY: 'Invalid category value',
  INVALID_STATUS: 'Invalid status value',
  DEADLINE_INVALID: 'Invalid deadline date',
};

// Sort fields for tasks
export const SORT_FIELDS = {
  PRIORITY: 'priority',
  COMPLEXITY: 'complexity',
  ESTIMATED_DURATION: 'estimatedDuration',
  CREATED_AT: 'createdAt',
  DEADLINE: 'deadline',
  TASK_NAME: 'taskName',
};

// Sort field labels
export const SORT_FIELD_LABELS = {
  [SORT_FIELDS.PRIORITY]: 'Priority',
  [SORT_FIELDS.COMPLEXITY]: 'Complexity',
  [SORT_FIELDS.ESTIMATED_DURATION]: 'Duration',
  [SORT_FIELDS.CREATED_AT]: 'Created',
  [SORT_FIELDS.DEADLINE]: 'Deadline',
  [SORT_FIELDS.TASK_NAME]: 'Name',
};

// Sort orders
export const SORT_ORDERS = {
  ASC: 'asc',
  DESC: 'desc',
};

// Default sort configuration
export const DEFAULT_SORT = {
  field: SORT_FIELDS.PRIORITY,
  order: SORT_ORDERS.DESC,
};

// Default filter configuration
export const DEFAULT_FILTERS = {
  status: [],
  priority: [],
  category: [],
  searchQuery: '',
  userId: null,
};

// Pagination defaults
export const PAGINATION_DEFAULTS = {
  PAGE_SIZE: 25,
  INITIAL_PAGE: 1,
};

// Local storage keys for task preferences
export const TASK_STORAGE_KEYS = {
  SORT_PREFERENCE: 'taskflow_sort',
};

// =============================================================================
// Kanban View Constants
// =============================================================================

// Kanban storage key for localStorage
export const KANBAN_STORAGE_KEY = 'taskflow_kanban_columns';

// Kanban column configuration
export const KANBAN_COLUMNS = [
  { id: STATUSES.PENDING, title: 'Pending', status: STATUSES.PENDING },
  { id: STATUSES.IN_PROGRESS, title: 'In Progress', status: STATUSES.IN_PROGRESS },
  { id: STATUSES.COMPLETED, title: 'Completed', status: STATUSES.COMPLETED },
];

// Default collapsed columns state
export const DEFAULT_COLLAPSED_COLUMNS = {
  [STATUSES.PENDING]: false,
  [STATUSES.IN_PROGRESS]: false,
  [STATUSES.COMPLETED]: false,
};

// Kanban drag-and-drop data transfer type
export const KANBAN_DND_TYPE = 'application/taskflow-kanban-card';

// Kanban hover preview delay (milliseconds)
export const KANBAN_PREVIEW_DELAY = 500;

// Kanban column width constraints
export const KANBAN_COLUMN_WIDTH = {
  EXPANDED: 320,
  COLLAPSED: 48,
};

// Kanban card height estimate (for virtualization)
export const KANBAN_CARD_HEIGHT = 120;

// =============================================================================
// Focus View Constants
// =============================================================================

// Maximum tasks to display in Focus View
export const FOCUS_VIEW_MAX_TASKS = 10;

// Focus View selection tiers (lower = higher priority)
export const FOCUS_VIEW_TIERS = {
  OVERDUE: 1,
  DUE_TODAY: 2,
  IN_PROGRESS: 3,
  HIGH_PRIORITY: 4,
};

// Focus View tier labels for display
export const FOCUS_TIER_LABELS = {
  [FOCUS_VIEW_TIERS.OVERDUE]: 'Overdue',
  [FOCUS_VIEW_TIERS.DUE_TODAY]: 'Due Today',
  [FOCUS_VIEW_TIERS.IN_PROGRESS]: 'In Progress',
  [FOCUS_VIEW_TIERS.HIGH_PRIORITY]: 'High Priority',
};

// Focus View tier colors (Tailwind classes)
export const FOCUS_TIER_COLORS = {
  [FOCUS_VIEW_TIERS.OVERDUE]: 'bg-red-100 text-red-800 border-red-200',
  [FOCUS_VIEW_TIERS.DUE_TODAY]: 'bg-amber-100 text-amber-800 border-amber-200',
  [FOCUS_VIEW_TIERS.IN_PROGRESS]: 'bg-blue-100 text-blue-800 border-blue-200',
  [FOCUS_VIEW_TIERS.HIGH_PRIORITY]: 'bg-purple-100 text-purple-800 border-purple-200',
};

// Priorities that qualify for Tier 4 (High Priority)
export const HIGH_PRIORITY_VALUES = [PRIORITIES.URGENT, PRIORITIES.HIGH];

// =============================================================================
// Time Tracking Constants
// =============================================================================

// Timer status states
export const TIMER_STATUS = {
  IDLE: 'idle',
  RUNNING: 'running',
  PAUSED: 'paused',
};

// Timer configuration constants
export const TIMER_CONSTANTS = {
  // Update interval for timer display in milliseconds
  DISPLAY_INTERVAL_MS: 1000,
  // Threshold for long session warning in minutes (4 hours)
  LONG_SESSION_THRESHOLD_MINUTES: 240,
  // Maximum manual time entry in hours
  MAX_MANUAL_HOURS: 999,
  // Maximum manual time entry in minutes (for single field)
  MAX_MANUAL_MINUTES: 59,
  // Storage key for timer state backup
  TIMER_STATE_KEY: 'taskflow_timer_state',
};

// Timer error messages
export const TIMER_ERROR_MESSAGES = {
  TASK_NOT_IN_PROGRESS: 'Timer can only be started on tasks that are in progress',
  NO_ACTIVE_TIMER: 'No active timer to stop or pause',
  TIMER_ALREADY_RUNNING: 'Timer is already running on this task',
  INVALID_MANUAL_TIME: 'Please enter a valid time (hours and minutes must be non-negative)',
  MANUAL_TIME_REQUIRED: 'Please enter at least 1 minute',
  MANUAL_HOURS_EXCEEDED: 'Hours cannot exceed 999',
  MANUAL_MINUTES_EXCEEDED: 'Minutes cannot exceed 59',
};

