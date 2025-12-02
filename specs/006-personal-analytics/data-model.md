# Data Model: Personal Analytics Dashboard

**Feature**: 006-personal-analytics  
**Date**: December 2, 2025  
**Status**: Complete

## Entity Overview

The Personal Analytics Dashboard is a **read-only** feature that derives all data from the existing Task entity. No schema changes are required.

## Source Entity: Task (Existing)

The dashboard reads from existing Task fields in IndexedDB:

| Field               | Type         | Used For                                        |
| ------------------- | ------------ | ----------------------------------------------- |
| `id`                | string       | Unique task identifier                          |
| `userId`            | string       | Filter tasks to current user                    |
| `status`            | string       | Task summary counts, completion tracking        |
| `category`          | string       | Category distribution chart                     |
| `complexity`        | number (1-10)| Complexity distribution chart, average          |
| `estimatedDuration` | number       | Estimation accuracy calculation                 |
| `actualDuration`    | number       | Estimation accuracy, time tracked summary       |
| `completedAt`       | Date \| null | Streak calculation, velocity trend, date filter |
| `createdAt`         | Date         | Date range filtering (for pending tasks)        |

## Derived Data Structures

### TaskSummary

Aggregated counts of tasks by status. Not filtered by date range.

```typescript
interface TaskSummary {
  total: number;       // All tasks assigned to user
  completed: number;   // status === 'completed'
  inProgress: number;  // status === 'in-progress'
  pending: number;     // status === 'pending'
}
```

### EstimationAccuracy

Accuracy metrics derived from completed tasks with time data.

```typescript
interface EstimationAccuracy {
  percentage: number | null;  // 0-100, null if insufficient data
  totalEstimated: number;     // Sum of estimatedDuration (minutes)
  totalActual: number;        // Sum of actualDuration (minutes)
  taskCount: number;          // Number of tasks in calculation
  trend: 'improving' | 'declining' | 'stable' | null;  // Compared to previous period
}
```

**Calculation Formula** (from clarification):
```
accuracy = 100 - abs((totalActual - totalEstimated) / totalEstimated) * 100
```
Capped to 0-100 range.

### StreakData

Completion streak information derived from completedAt timestamps.

```typescript
interface StreakData {
  current: number;     // Consecutive days with completions (including today)
  best: number;        // Highest streak ever achieved
  lastCompletionDate: string | null;  // ISO date string of most recent completion
}
```

**Calculation Rules**:
- Uses local timezone for day boundaries
- Today without completion continues streak if yesterday had completion
- Streak resets to 0 if gap > 1 day

### CategoryDistribution

Task counts grouped by category for pie chart.

```typescript
interface CategoryDistribution {
  data: Array<{
    category: 'development' | 'fix' | 'support';
    count: number;
    percentage: number;  // Rounded to 1 decimal
  }>;
  total: number;
}
```

### ComplexityDistribution

Task counts grouped by complexity level for bar chart.

```typescript
interface ComplexityDistribution {
  data: Array<{
    level: number;  // 1-10
    count: number;
  }>;
  average: number;  // Mean complexity, rounded to 1 decimal
  total: number;
}
```

### VelocityTrend

Daily completion counts for line chart.

```typescript
interface VelocityTrend {
  data: Array<{
    date: string;    // Formatted date label (e.g., "Dec 2")
    count: number;   // Completions on this day (0 if none)
  }>;
  periodTotal: number;       // Total completions in period
  previousPeriodTotal: number | null;  // For comparison
  changePercent: number | null;        // Percentage change from previous
}
```

### TimeTrackedSummary

Aggregated time tracking data for the selected period.

```typescript
interface TimeTrackedSummary {
  totalMinutes: number;     // Sum of actualDuration in period
  formattedTotal: string;   // Human-readable (e.g., "12h 45m")
  dailyAverage: number;     // Average minutes per day in period
  taskCount: number;        // Tasks with tracked time in period
}
```

## Filter State

### DateRange

User-selected time period filter persisted to localStorage.

```typescript
type DateRangeKey = 
  | 'today'
  | 'thisWeek'      // Default
  | 'lastWeek'
  | 'thisMonth'
  | 'lastMonth'
  | 'last30Days';

interface DateRange {
  key: DateRangeKey;
  start: Date;
  end: Date;
}
```

### AnalyticsPreferences

User preferences stored in localStorage.

```typescript
interface AnalyticsPreferences {
  selectedDateRange: DateRangeKey;  // Default: 'thisWeek'
}
```

**Storage Key**: `taskflow_analytics_preferences`

## Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         IndexedDB (Tasks)                           │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    TaskContext (React Context)                       │
│                    tasks: Task[], loading, error                     │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  useAnalytics Hook                                   │
│                                                                      │
│  1. Filter tasks by userId (currentUser)                            │
│  2. Apply dateRange filter where applicable                          │
│  3. Call analyticsService functions                                  │
│  4. Memoize results with useMemo                                     │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  Analytics Components                                │
│                                                                      │
│  StatCards ← summary                                                 │
│  EstimationAccuracy ← accuracy                                       │
│  StreakDisplay ← streak                                              │
│  CategoryChart ← categoryDistribution                                │
│  ComplexityChart ← complexityDistribution                            │
│  VelocityChart ← velocity                                            │
│  TimeTrackedSummary ← timeTracked                                    │
└─────────────────────────────────────────────────────────────────────┘
```

## Aggregated Analytics Object

The `useAnalytics` hook returns a single object with all derived data:

```typescript
interface AnalyticsData {
  // Not filtered by date (lifetime stats)
  summary: TaskSummary;
  streak: StreakData;
  
  // Filtered by selected date range
  accuracy: EstimationAccuracy;
  categoryDistribution: CategoryDistribution;
  complexityDistribution: ComplexityDistribution;
  velocity: VelocityTrend;
  timeTracked: TimeTrackedSummary;
  
  // Meta
  dateRange: DateRange;
  isLoading: boolean;
  isEmpty: boolean;  // True if user has no tasks at all
}
```

## Constants

### Category Colors (for charts)

```typescript
const CATEGORY_COLORS = {
  development: '#3B82F6',  // Blue
  fix: '#EF4444',          // Red
  support: '#10B981',      // Green
};
```

### Complexity Colors (for bar chart gradient)

```typescript
const COMPLEXITY_COLORS = {
  low: '#10B981',      // Green (1-3)
  medium: '#F59E0B',   // Amber (4-6)
  high: '#EF4444',     // Red (7-10)
};
```

### Period Labels

```typescript
const PERIOD_LABELS = {
  today: 'Today',
  thisWeek: 'This Week',
  lastWeek: 'Last Week',
  thisMonth: 'This Month',
  lastMonth: 'Last Month',
  last30Days: 'Last 30 Days',
};
```
