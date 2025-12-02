/**
 * Analytics Type Definitions
 * Feature: 006-personal-analytics
 * Date: December 2, 2025
 * 
 * These types define the data structures used by the Personal Analytics Dashboard.
 * All data is derived from existing Task entities - no schema changes required.
 */

// =============================================================================
// Date Range Types
// =============================================================================

/**
 * Available preset date range options
 */
export type DateRangeKey =
  | 'today'
  | 'thisWeek'
  | 'lastWeek'
  | 'thisMonth'
  | 'lastMonth'
  | 'last30Days';

/**
 * Resolved date range with start and end dates
 */
export interface DateRange {
  key: DateRangeKey;
  start: Date;
  end: Date;
}

// =============================================================================
// Task Summary Types
// =============================================================================

/**
 * Aggregated task counts by status (not filtered by date)
 */
export interface TaskSummary {
  /** Total tasks assigned to user */
  total: number;
  /** Tasks with status 'completed' */
  completed: number;
  /** Tasks with status 'in-progress' */
  inProgress: number;
  /** Tasks with status 'pending' */
  pending: number;
}

// =============================================================================
// Estimation Accuracy Types
// =============================================================================

/**
 * Trend direction for estimation accuracy
 */
export type AccuracyTrend = 'improving' | 'declining' | 'stable';

/**
 * Estimation accuracy metrics from completed tasks with time data
 */
export interface EstimationAccuracy {
  /** Accuracy percentage (0-100), null if insufficient data */
  percentage: number | null;
  /** Sum of estimatedDuration in minutes */
  totalEstimated: number;
  /** Sum of actualDuration in minutes */
  totalActual: number;
  /** Number of tasks included in calculation */
  taskCount: number;
  /** Comparison to previous period, null if no historical data */
  trend: AccuracyTrend | null;
}

// =============================================================================
// Streak Types
// =============================================================================

/**
 * Completion streak information
 */
export interface StreakData {
  /** Consecutive days with at least one completion (including today) */
  current: number;
  /** Highest streak ever achieved */
  best: number;
  /** ISO date string of most recent completion, null if never completed */
  lastCompletionDate: string | null;
}

// =============================================================================
// Distribution Types
// =============================================================================

/**
 * Task category options (matches existing Task schema)
 */
export type TaskCategory = 'development' | 'fix' | 'support';

/**
 * Single data point for category distribution pie chart
 */
export interface CategoryDataPoint {
  category: TaskCategory;
  count: number;
  /** Percentage of total, rounded to 1 decimal */
  percentage: number;
}

/**
 * Category distribution for pie chart
 */
export interface CategoryDistribution {
  data: CategoryDataPoint[];
  total: number;
}

/**
 * Single data point for complexity distribution bar chart
 */
export interface ComplexityDataPoint {
  /** Complexity level (1-10) */
  level: number;
  count: number;
}

/**
 * Complexity distribution for bar chart
 */
export interface ComplexityDistribution {
  data: ComplexityDataPoint[];
  /** Mean complexity, rounded to 1 decimal */
  average: number;
  total: number;
}

// =============================================================================
// Velocity Types
// =============================================================================

/**
 * Single data point for velocity trend line chart
 */
export interface VelocityDataPoint {
  /** Formatted date label (e.g., "Dec 2") */
  date: string;
  /** Number of completions on this day */
  count: number;
}

/**
 * Velocity trend data for line chart
 */
export interface VelocityTrend {
  data: VelocityDataPoint[];
  /** Total completions in selected period */
  periodTotal: number;
  /** Total completions in previous equivalent period, null if N/A */
  previousPeriodTotal: number | null;
  /** Percentage change from previous period, null if N/A */
  changePercent: number | null;
}

// =============================================================================
// Time Tracking Types
// =============================================================================

/**
 * Aggregated time tracking summary
 */
export interface TimeTrackedSummary {
  /** Sum of actualDuration in period (minutes) */
  totalMinutes: number;
  /** Human-readable format (e.g., "12h 45m") */
  formattedTotal: string;
  /** Average minutes per day in period */
  dailyAverage: number;
  /** Number of tasks with tracked time in period */
  taskCount: number;
}

// =============================================================================
// Aggregated Analytics Types
// =============================================================================

/**
 * Complete analytics data returned by useAnalytics hook
 */
export interface AnalyticsData {
  // Lifetime stats (not filtered by date)
  summary: TaskSummary;
  streak: StreakData;
  
  // Date-filtered metrics
  accuracy: EstimationAccuracy;
  categoryDistribution: CategoryDistribution;
  complexityDistribution: ComplexityDistribution;
  velocity: VelocityTrend;
  timeTracked: TimeTrackedSummary;
  
  // Meta information
  dateRange: DateRange;
  isLoading: boolean;
  /** True if user has no tasks at all */
  isEmpty: boolean;
}

// =============================================================================
// Preferences Types
// =============================================================================

/**
 * User analytics preferences (persisted to localStorage)
 */
export interface AnalyticsPreferences {
  selectedDateRange: DateRangeKey;
}

// =============================================================================
// Chart Color Constants
// =============================================================================

/**
 * Color palette for category pie chart
 */
export const CATEGORY_COLORS: Record<TaskCategory, string> = {
  development: '#3B82F6',  // Blue-500
  fix: '#EF4444',          // Red-500
  support: '#10B981',      // Emerald-500
};

/**
 * Color palette for complexity levels
 */
export const COMPLEXITY_COLORS = {
  low: '#10B981',      // Emerald-500 (1-3)
  medium: '#F59E0B',   // Amber-500 (4-6)
  high: '#EF4444',     // Red-500 (7-10)
} as const;

/**
 * Get complexity color based on level
 */
export function getComplexityColor(level: number): string {
  if (level <= 3) return COMPLEXITY_COLORS.low;
  if (level <= 6) return COMPLEXITY_COLORS.medium;
  return COMPLEXITY_COLORS.high;
}

// =============================================================================
// Period Labels
// =============================================================================

/**
 * Human-readable labels for date range options
 */
export const PERIOD_LABELS: Record<DateRangeKey, string> = {
  today: 'Today',
  thisWeek: 'This Week',
  lastWeek: 'Last Week',
  thisMonth: 'This Month',
  lastMonth: 'Last Month',
  last30Days: 'Last 30 Days',
};

// =============================================================================
// Storage Keys
// =============================================================================

/**
 * localStorage key for analytics preferences
 */
export const ANALYTICS_STORAGE_KEY = 'taskflow_analytics_preferences';

/**
 * Default analytics preferences
 */
export const DEFAULT_ANALYTICS_PREFERENCES: AnalyticsPreferences = {
  selectedDateRange: 'thisWeek',
};
