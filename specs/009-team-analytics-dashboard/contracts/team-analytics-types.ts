/**
 * Team Analytics Dashboard - Type Contracts
 * Feature: 009-team-analytics-dashboard
 * 
 * These type definitions serve as contracts between the analytics service,
 * hooks, and UI components. They document the expected data shapes.
 */

// =============================================================================
// Date Range Types (shared with Personal Analytics)
// =============================================================================

export type DateRangeKey =
  | 'today'
  | 'this-week'
  | 'last-week'
  | 'this-month'
  | 'last-month'
  | 'last-30-days'
  | 'custom';

export interface DateRange {
  start: Date;
  end: Date;
}

// =============================================================================
// Team Workload Types
// =============================================================================

export interface UserWorkload {
  userId: string;
  userName: string;
  userAvatar?: string;
  taskCount: number;
  percentage: number; // Percentage of total team tasks
}

export interface TeamWorkload {
  data: UserWorkload[];
  totalTasks: number;
  averagePerUser: number;
  maxTaskCount: number; // For chart scaling
}

// =============================================================================
// Team Completions Types
// =============================================================================

export interface UserCompletions {
  userId: string;
  userName: string;
  completedCount: number;
  percentage: number; // Percentage of team total completions
  previousPeriodCount?: number; // For comparison mode
  changePercent?: number; // Percent change from previous period
}

export interface TeamCompletions {
  data: UserCompletions[];
  totalCompleted: number;
  periodLabel: string;
  previousPeriodTotal?: number;
  comparisonEnabled: boolean;
}

// =============================================================================
// Leaderboard Types
// =============================================================================

export type LeaderboardSortField = 'completed' | 'accuracy' | 'streak';
export type SortOrder = 'asc' | 'desc';

export interface LeaderboardEntry {
  rank: number;
  rankBadge: '🥇' | '🥈' | '🥉' | null; // Only top 3 get badges
  userId: string;
  userName: string;
  userAvatar?: string;
  tasksCompleted: number;
  estimationAccuracy: number | null; // null if no tracked time data
  currentStreak: number;
  isCurrentUser: boolean; // For highlighting
}

export interface Leaderboard {
  entries: LeaderboardEntry[];
  sortedBy: LeaderboardSortField;
  sortOrder: SortOrder;
  totalUsers: number;
  currentUserRank: number | null;
}

// =============================================================================
// Team Velocity Types
// =============================================================================

export type VelocityAggregation = 'day' | 'week';

export interface VelocityDataPoint {
  date: string; // Formatted date for display
  fullDate: string; // ISO date for precise identification
  count: number; // Total completions
  breakdown?: Record<string, number>; // Per-user breakdown for stacked mode
}

export interface TeamVelocity {
  data: VelocityDataPoint[];
  totalInPeriod: number;
  aggregation: VelocityAggregation;
  showByUser: boolean;
  periodLabel: string;
}

// =============================================================================
// Team Category Distribution Types
// =============================================================================

export type TaskCategory = 'development' | 'fix' | 'support';

export interface CategoryCounts {
  development: number;
  fix: number;
  support: number;
}

export interface UserCategoryData {
  userId: string;
  userName: string;
  categories: CategoryCounts;
  totalTasks: number;
}

export interface TeamCategoryDistribution {
  data: UserCategoryData[];
  teamTotals: CategoryCounts;
  showTeamTotals: boolean;
}

// =============================================================================
// Error Handling Types (FR-017)
// =============================================================================

export interface MetricError {
  hasError: true;
  errorMessage: string;
  fallbackDisplay: '—' | 'N/A';
}

export type MetricResult<T> = T | MetricError;

export function isMetricError<T>(result: MetricResult<T>): result is MetricError {
  return (result as MetricError).hasError === true;
}

// =============================================================================
// Hook Return Types
// =============================================================================

export interface UseTeamAnalyticsReturn {
  // Data
  workload: MetricResult<TeamWorkload>;
  completions: MetricResult<TeamCompletions>;
  leaderboard: MetricResult<Leaderboard>;
  velocity: MetricResult<TeamVelocity>;
  categoryDistribution: MetricResult<TeamCategoryDistribution>;

  // Controls
  dateRangeKey: DateRangeKey;
  setDateRangeKey: (key: DateRangeKey) => void;
  customDateRange: DateRange | null;
  setCustomDateRange: (range: DateRange) => void;

  // Leaderboard controls
  leaderboardSortField: LeaderboardSortField;
  setLeaderboardSortField: (field: LeaderboardSortField) => void;
  leaderboardSortOrder: SortOrder;
  toggleLeaderboardSortOrder: () => void;

  // Velocity controls
  velocityAggregation: VelocityAggregation;
  setVelocityAggregation: (agg: VelocityAggregation) => void;
  velocityShowByUser: boolean;
  toggleVelocityShowByUser: () => void;

  // Completions controls
  completionsComparisonEnabled: boolean;
  toggleCompletionsComparison: () => void;

  // Category controls
  categoryShowTeamTotals: boolean;
  toggleCategoryTeamTotals: () => void;

  // State
  isLoading: boolean;
  isEmpty: boolean; // True if no users or no tasks
  userCount: number;
  taskCount: number;
}

// =============================================================================
// Component Props Types
// =============================================================================

export interface TeamWorkloadChartProps {
  data: TeamWorkload;
  onUserClick?: (userId: string) => void;
}

export interface TeamCompletionChartProps {
  data: TeamCompletions;
  comparisonEnabled: boolean;
  onToggleComparison: () => void;
}

export interface TeamLeaderboardProps {
  data: Leaderboard;
  onSort: (field: LeaderboardSortField) => void;
  onToggleSortOrder: () => void;
  currentUserId: string;
}

export interface TeamVelocityChartProps {
  data: TeamVelocity;
  aggregation: VelocityAggregation;
  onAggregationChange: (agg: VelocityAggregation) => void;
  showByUser: boolean;
  onToggleShowByUser: () => void;
}

export interface TeamCategoryChartProps {
  data: TeamCategoryDistribution;
  showTeamTotals: boolean;
  onToggleTeamTotals: () => void;
}

export interface TeamEmptyStateProps {
  type: 'no-users' | 'no-tasks' | 'no-completed' | 'no-data-in-range';
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}
