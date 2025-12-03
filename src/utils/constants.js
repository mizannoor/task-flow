/**
 * Authentication Constants
 * Validation patterns, error messages, and configuration values
 */

// Session storage key for localStorage
export const SESSION_KEY = 'taskflow_session';

// =============================================================================
// Theme Constants
// =============================================================================

// Theme storage key for localStorage
export const THEME_STORAGE_KEY = 'taskflow_theme';

// Theme modes
export const THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark',
};

// Default theme when no preference exists
export const DEFAULT_THEME = THEME_MODES.LIGHT;

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
  [PRIORITIES.URGENT]: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  [PRIORITIES.HIGH]: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
  [PRIORITIES.MEDIUM]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
  [PRIORITIES.LOW]: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
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
  [CATEGORIES.DEVELOPMENT]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  [CATEGORIES.FIX]: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
  [CATEGORIES.SUPPORT]: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
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
  [STATUSES.PENDING]: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
  [STATUSES.IN_PROGRESS]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  [STATUSES.COMPLETED]: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
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

// =============================================================================
// Timer Keyboard Shortcuts (for integration with keyboard shortcuts feature)
// =============================================================================

/**
 * Timer keyboard shortcut definitions
 * These will be merged with global shortcuts when keyboard shortcuts feature is enabled
 * Context: TASK_FOCUSED (requires a task to be focused)
 */
export const TIMER_KEYBOARD_SHORTCUTS = [
  {
    key: 't',
    modifiers: [],
    action: 'timerStart',
    context: 'task-focused',
    category: 'task-actions',
    description: 'Start timer on focused task',
    enabled: true,
    requiresInProgress: true, // Only works if task is in-progress
  },
  {
    key: 'p',
    modifiers: [],
    action: 'timerPause',
    context: 'task-focused',
    category: 'task-actions',
    description: 'Pause running timer',
    enabled: true,
    requiresRunningTimer: true, // Only works if timer is running
  },
  {
    key: 'r',
    modifiers: [],
    action: 'timerResume',
    context: 'task-focused',
    category: 'task-actions',
    description: 'Resume paused timer',
    enabled: true,
    requiresPausedTimer: true, // Only works if timer is paused
  },
  {
    key: 'x',
    modifiers: [],
    action: 'timerStop',
    context: 'task-focused',
    category: 'task-actions',
    description: 'Stop timer and save time',
    enabled: true,
    requiresActiveTimer: true, // Only works if timer is running or paused
  },
];
// Analytics Constants
// =============================================================================

// Date range options for analytics filtering
export const DATE_RANGES = {
  TODAY: 'today',
  THIS_WEEK: 'thisWeek',
  LAST_WEEK: 'lastWeek',
  THIS_MONTH: 'thisMonth',
  LAST_MONTH: 'lastMonth',
  LAST_30_DAYS: 'last30Days',
};

// Human-readable labels for date range options
export const PERIOD_LABELS = {
  [DATE_RANGES.TODAY]: 'Today',
  [DATE_RANGES.THIS_WEEK]: 'This Week',
  [DATE_RANGES.LAST_WEEK]: 'Last Week',
  [DATE_RANGES.THIS_MONTH]: 'This Month',
  [DATE_RANGES.LAST_MONTH]: 'Last Month',
  [DATE_RANGES.LAST_30_DAYS]: 'Last 30 Days',
};

// Chart colors for task categories (hex values for Recharts)
export const ANALYTICS_CATEGORY_COLORS = {
  [CATEGORIES.DEVELOPMENT]: '#3B82F6', // Blue-500
  [CATEGORIES.FIX]: '#EF4444', // Red-500
  [CATEGORIES.SUPPORT]: '#10B981', // Emerald-500
};

// Complexity level color ranges
export const COMPLEXITY_COLORS = {
  LOW: '#10B981', // Emerald-500 (1-3)
  MEDIUM: '#F59E0B', // Amber-500 (4-6)
  HIGH: '#EF4444', // Red-500 (7-10)
};

// localStorage key for analytics preferences
export const ANALYTICS_STORAGE_KEY = 'taskflow_analytics_preferences';

// Default analytics preferences
export const DEFAULT_ANALYTICS_PREFERENCES = {
  selectedDateRange: DATE_RANGES.THIS_WEEK,
};

// =============================================================================
// Team Analytics Constants
// =============================================================================

// Team Analytics storage key for session persistence
export const TEAM_ANALYTICS_STORAGE_KEY = 'taskflow_team_analytics_preferences';

// Default team analytics preferences
export const DEFAULT_TEAM_ANALYTICS_PREFERENCES = {
  selectedDateRange: DATE_RANGES.THIS_WEEK,
  leaderboardSortField: 'completed',
  leaderboardSortOrder: 'desc',
  velocityAggregation: 'day',
  velocityShowByUser: false,
  completionsComparisonEnabled: false,
  categoryShowTeamTotals: false,
};

// Leaderboard sort fields
export const LEADERBOARD_SORT_FIELDS = {
  COMPLETED: 'completed',
  ACCURACY: 'accuracy',
  STREAK: 'streak',
};

// Leaderboard sort field labels
export const LEADERBOARD_SORT_LABELS = {
  [LEADERBOARD_SORT_FIELDS.COMPLETED]: 'Tasks Completed',
  [LEADERBOARD_SORT_FIELDS.ACCURACY]: 'Estimation Accuracy',
  [LEADERBOARD_SORT_FIELDS.STREAK]: 'Current Streak',
};

// Rank badges for top 3 performers
export const RANK_BADGES = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
};

// Team analytics color palette (hex values for Recharts)
export const TEAM_CHART_COLORS = {
  // Primary colors for user bars/areas
  PRIMARY: '#3B82F6', // Blue-500
  SECONDARY: '#8B5CF6', // Violet-500
  TERTIARY: '#EC4899', // Pink-500

  // Category colors (consistent with personal analytics)
  DEVELOPMENT: '#3B82F6', // Blue-500
  FIX: '#EF4444', // Red-500
  SUPPORT: '#10B981', // Emerald-500

  // User palette for stacked charts (10 distinct colors)
  USER_PALETTE: [
    '#3B82F6', // Blue-500
    '#10B981', // Emerald-500
    '#F59E0B', // Amber-500
    '#EF4444', // Red-500
    '#8B5CF6', // Violet-500
    '#EC4899', // Pink-500
    '#06B6D4', // Cyan-500
    '#F97316', // Orange-500
    '#84CC16', // Lime-500
    '#6366F1', // Indigo-500
  ],

  // Comparison mode colors
  CURRENT_PERIOD: '#3B82F6', // Blue-500
  PREVIOUS_PERIOD: '#9CA3AF', // Gray-400
};

// Maximum users to display by default in leaderboard
export const LEADERBOARD_DEFAULT_LIMIT = 10;

// Team analytics empty state messages
export const TEAM_ANALYTICS_MESSAGES = {
  NO_USERS: 'No team members found',
  NO_TASKS: 'No tasks to analyze',
  NO_COMPLETED: 'No completed tasks in this period',
  NO_DATA_IN_RANGE: 'No data available for selected period',
  SINGLE_USER: 'Add more team members to see comparative analytics',
  INSUFFICIENT_DATA: 'More data accumulating as your team uses TaskFlow',
};

// =============================================================================
// Calendar View Constants
// =============================================================================

// Calendar view modes
export const CALENDAR_VIEW_MODES = {
  MONTH: 'month',
  WEEK: 'week',
  DAY: 'day',
};

// Calendar view mode labels
export const CALENDAR_VIEW_MODE_LABELS = {
  [CALENDAR_VIEW_MODES.MONTH]: 'Month',
  [CALENDAR_VIEW_MODES.WEEK]: 'Week',
  [CALENDAR_VIEW_MODES.DAY]: 'Day',
};

// Days of week (Sunday start)
export const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Full day names
export const DAYS_OF_WEEK_FULL = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

// Month names
export const MONTH_NAMES = [
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
];

// Short month names
export const MONTH_NAMES_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

// Calendar constants
export const CALENDAR_CONSTANTS = {
  // Grid dimensions
  DAYS_IN_WEEK: 7,
  WEEKS_IN_MONTH_GRID: 6,
  TOTAL_CELLS: 42, // 6 weeks × 7 days

  // Task display limits per cell
  MAX_VISIBLE_TASKS_MOBILE: 2,
  MAX_VISIBLE_TASKS_TABLET: 3,
  MAX_VISIBLE_TASKS_DESKTOP: 4,

  // Touch interaction
  LONG_PRESS_DURATION_MS: 500,

  // Drag-and-drop data transfer type
  DND_TYPE: 'application/taskflow-calendar-task',
};

// Calendar localStorage keys
export const CALENDAR_STORAGE_KEY = 'taskflow_calendar_preferences';

// Default calendar preferences
export const DEFAULT_CALENDAR_PREFERENCES = {
  viewMode: CALENDAR_VIEW_MODES.MONTH,
  sidebarOpen: false,
};

// Calendar priority colors (solid backgrounds for indicators)
export const CALENDAR_PRIORITY_COLORS = {
  [PRIORITIES.URGENT]: 'bg-red-500',
  [PRIORITIES.HIGH]: 'bg-orange-500',
  [PRIORITIES.MEDIUM]: 'bg-yellow-500',
  [PRIORITIES.LOW]: 'bg-gray-400',
};

// Calendar priority border colors (for hover/focus states)
export const CALENDAR_PRIORITY_BORDER_COLORS = {
  [PRIORITIES.URGENT]: 'border-red-500',
  [PRIORITIES.HIGH]: 'border-orange-500',
  [PRIORITIES.MEDIUM]: 'border-yellow-500',
  [PRIORITIES.LOW]: 'border-gray-400',
};

// =============================================================================
// AI Service Constants
// =============================================================================

// AI Service Configuration
export const AI_CONFIG = {
  MODEL: 'gemini-2.0-flash',
  ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
  MAX_TOKENS: 1024,
  TEMPERATURE: 0.7,
  TIMEOUT_MS: 10000,
  MAX_DESCRIPTION_LENGTH: 2000,
};

// AI Suggestion Defaults (used when AI is unavailable)
export const AI_DEFAULTS = {
  COMPLEXITY: 5,
  PRIORITY: PRIORITIES.MEDIUM,
  CATEGORY: CATEGORIES.DEVELOPMENT,
  TAGS: [],
  ESTIMATED_DURATION: 60,
  REASONING_DEFAULT: 'Using default values due to AI unavailability',
  REASONING_OFFLINE: 'AI analysis unavailable - using default values',
  REASONING_TIMEOUT: 'AI analysis timed out - using default values',
};

// AI Error Messages
export const AI_ERROR_MESSAGES = {
  NOT_CONFIGURED: 'AI not configured',
  OFFLINE: 'AI analysis unavailable - using default values',
  TIMEOUT: 'AI analysis timed out - using default values',
  RATE_LIMIT: 'AI temporarily unavailable - please try again in a moment',
  GENERIC: 'AI analysis unavailable - using default values',
};

// AI Analysis Prompt Template
export const AI_ANALYSIS_PROMPT = `You are a task analysis assistant. Analyze the following task and provide structured suggestions.

Task Name: {taskName}
Description: {description}

Respond with a JSON object containing EXACTLY these fields:
{
  "complexity": <number 1-10>,
  "priority": <"urgent" | "high" | "medium" | "low">,
  "category": <"development" | "fix" | "support">,
  "tags": <array of 2-5 strings>,
  "estimatedDuration": <number in minutes>,
  "reasoning": <string explaining your analysis>
}

Guidelines:
- Complexity: 1=trivial, 5=moderate, 10=extremely complex
- Priority: urgent=blocking, high=important, medium=standard, low=backlog
- Category: development=new features, fix=bugs, support=maintenance
- Duration: Realistic minutes based on complexity
- Tags: 2-5 relevant keywords

Respond ONLY with the JSON object. No markdown, no explanation, no code blocks.`;

// =============================================================================
// Keyboard Shortcuts Constants
// =============================================================================

// Shortcut contexts - where shortcuts are active
export const SHORTCUT_CONTEXTS = {
  GLOBAL: 'global',
  VIEW_LIST: 'view-list',
  VIEW_KANBAN: 'view-kanban',
  VIEW_CALENDAR: 'view-calendar',
  VIEW_FOCUS: 'view-focus',
  TASK_FOCUSED: 'task-focused',
  MODAL_OPEN: 'modal-open',
};

// Shortcut categories for help overlay grouping
export const SHORTCUT_CATEGORIES = {
  GLOBAL: 'global',
  NAVIGATION: 'navigation',
  TASK_ACTIONS: 'task-actions',
  SELECTION: 'selection',
};

// Shortcut category labels for display
export const SHORTCUT_CATEGORY_LABELS = {
  [SHORTCUT_CATEGORIES.GLOBAL]: 'Global',
  [SHORTCUT_CATEGORIES.NAVIGATION]: 'Navigation',
  [SHORTCUT_CATEGORIES.TASK_ACTIONS]: 'Task Actions',
  [SHORTCUT_CATEGORIES.SELECTION]: 'Selection',
};

// Keyboard shortcut definitions
export const KEYBOARD_SHORTCUTS = [
  // Global shortcuts (work from anywhere)
  {
    key: 'n',
    modifiers: ['alt'],
    action: 'createTask',
    context: SHORTCUT_CONTEXTS.GLOBAL,
    category: SHORTCUT_CATEGORIES.GLOBAL,
    description: 'Create new task',
    enabled: true,
  },
  {
    key: 'f',
    modifiers: ['ctrl'],
    action: 'focusSearch',
    context: SHORTCUT_CONTEXTS.GLOBAL,
    category: SHORTCUT_CATEGORIES.GLOBAL,
    description: 'Focus search bar',
    enabled: true,
  },
  {
    key: '/',
    modifiers: ['ctrl'],
    action: 'showHelp',
    context: SHORTCUT_CONTEXTS.GLOBAL,
    category: SHORTCUT_CATEGORIES.GLOBAL,
    description: 'Show keyboard shortcuts',
    enabled: true,
  },
  {
    key: 'Escape',
    modifiers: [],
    action: 'closeOrClear',
    context: SHORTCUT_CONTEXTS.GLOBAL,
    category: SHORTCUT_CATEGORIES.GLOBAL,
    description: 'Close modal or clear selection',
    enabled: true,
  },

  // Theme shortcuts
  {
    key: 'd',
    modifiers: ['ctrl', 'alt'],
    action: 'switchToDark',
    context: SHORTCUT_CONTEXTS.GLOBAL,
    category: SHORTCUT_CATEGORIES.GLOBAL,
    description: 'Switch to dark mode',
    enabled: true,
  },
  {
    key: 'l',
    modifiers: ['ctrl', 'alt'],
    action: 'switchToLight',
    context: SHORTCUT_CONTEXTS.GLOBAL,
    category: SHORTCUT_CATEGORIES.GLOBAL,
    description: 'Switch to light mode',
    enabled: true,
  },

  // Navigation shortcuts (view switching)
  {
    key: '1',
    modifiers: [],
    action: 'switchToList',
    context: SHORTCUT_CONTEXTS.GLOBAL,
    category: SHORTCUT_CATEGORIES.NAVIGATION,
    description: 'Switch to List view',
    enabled: true,
  },
  {
    key: '2',
    modifiers: [],
    action: 'switchToKanban',
    context: SHORTCUT_CONTEXTS.GLOBAL,
    category: SHORTCUT_CATEGORIES.NAVIGATION,
    description: 'Switch to Kanban view',
    enabled: true,
  },
  {
    key: '3',
    modifiers: [],
    action: 'switchToCalendar',
    context: SHORTCUT_CONTEXTS.GLOBAL,
    category: SHORTCUT_CATEGORIES.NAVIGATION,
    description: 'Switch to Calendar view',
    enabled: true,
  },
  {
    key: '4',
    modifiers: [],
    action: 'switchToFocus',
    context: SHORTCUT_CONTEXTS.GLOBAL,
    category: SHORTCUT_CATEGORIES.NAVIGATION,
    description: 'Switch to Focus view',
    enabled: true,
  },
  {
    key: 'ArrowUp',
    modifiers: [],
    action: 'navigatePrev',
    context: SHORTCUT_CONTEXTS.TASK_FOCUSED,
    category: SHORTCUT_CATEGORIES.NAVIGATION,
    description: 'Previous task',
    enabled: true,
  },
  {
    key: 'ArrowDown',
    modifiers: [],
    action: 'navigateNext',
    context: SHORTCUT_CONTEXTS.TASK_FOCUSED,
    category: SHORTCUT_CATEGORIES.NAVIGATION,
    description: 'Next task',
    enabled: true,
  },

  // Task action shortcuts (require focused task)
  {
    key: 'e',
    modifiers: [],
    action: 'editTask',
    context: SHORTCUT_CONTEXTS.TASK_FOCUSED,
    category: SHORTCUT_CATEGORIES.TASK_ACTIONS,
    description: 'Edit task',
    enabled: true,
  },
  {
    key: 'd',
    modifiers: [],
    action: 'deleteTask',
    context: SHORTCUT_CONTEXTS.TASK_FOCUSED,
    category: SHORTCUT_CATEGORIES.TASK_ACTIONS,
    description: 'Delete task',
    enabled: true,
  },
  {
    key: 'c',
    modifiers: [],
    action: 'completeTask',
    context: SHORTCUT_CONTEXTS.TASK_FOCUSED,
    category: SHORTCUT_CATEGORIES.TASK_ACTIONS,
    description: 'Complete task',
    enabled: true,
  },
  {
    key: 's',
    modifiers: [],
    action: 'startTask',
    context: SHORTCUT_CONTEXTS.TASK_FOCUSED,
    category: SHORTCUT_CATEGORIES.TASK_ACTIONS,
    description: 'Start task',
    enabled: true,
  },

  // Selection shortcuts
  {
    key: ' ',
    modifiers: [],
    action: 'toggleSelect',
    context: SHORTCUT_CONTEXTS.TASK_FOCUSED,
    category: SHORTCUT_CATEGORIES.SELECTION,
    description: 'Toggle task selection',
    enabled: true,
  },
];
