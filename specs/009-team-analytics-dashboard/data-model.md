# Data Model: Team Analytics Dashboard

**Feature**: 009-team-analytics-dashboard  
**Created**: December 2, 2025  
**Status**: Draft

## Overview

Team Analytics aggregates task and user data from IndexedDB to compute team-wide productivity metrics. All calculations are derived from existing Task and User entities—no schema changes required.

## Source Entities

### Task (existing)

```typescript
interface Task {
  id: string;
  userId: string; // Assignee - used for grouping
  createdBy: string; // Creator - different from assignee
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  category: 'development' | 'fix' | 'support';
  complexity: number; // 1-10
  estimatedDuration: number; // minutes
  actualDuration: number; // minutes (tracked time)
  createdAt: Date;
  completedAt: Date | null;
  deadline: Date | null;
  tags: string[];
}
```

### User (existing)

```typescript
interface User {
  id: string;
  identifier: string; // email/username/phone
  displayName: string;
  createdAt: Date;
  preferences: {
    theme: 'light' | 'dark';
    defaultView: string;
  };
}
```

## Derived Team Metrics

### TeamWorkload

Aggregates task counts per user for workload distribution chart.

```typescript
interface TeamWorkload {
  data: UserWorkload[];
  totalTasks: number;
  averagePerUser: number;
}

interface UserWorkload {
  userId: string;
  userName: string;
  taskCount: number;
  percentage: number; // % of total team tasks
}
```

**Calculation**:

```javascript
// Group tasks by userId, count each group
tasks.reduce((acc, task) => {
  acc[task.userId] = (acc[task.userId] || 0) + 1;
  return acc;
}, {});
```

### TeamCompletions

Aggregates completed task counts per user for comparison chart.

```typescript
interface TeamCompletions {
  data: UserCompletions[];
  totalCompleted: number;
  periodLabel: string;
}

interface UserCompletions {
  userId: string;
  userName: string;
  completedCount: number;
  percentage: number;
  previousPeriodCount?: number; // For comparison mode
}
```

**Calculation**:

```javascript
// Filter completed tasks in date range, group by userId
tasks
  .filter((t) => t.status === 'completed' && isInDateRange(t.completedAt))
  .reduce((acc, task) => {
    acc[task.userId] = (acc[task.userId] || 0) + 1;
    return acc;
  }, {});
```

### Leaderboard

Ranked list of user performance metrics.

```typescript
interface Leaderboard {
  entries: LeaderboardEntry[];
  sortedBy: 'completed' | 'accuracy' | 'streak';
  sortOrder: 'asc' | 'desc';
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  userAvatar?: string;
  tasksCompleted: number;
  estimationAccuracy: number | null; // percentage or null if no data
  currentStreak: number;
  isCurrentUser: boolean;
}
```

**Ranking Logic**:

1. Sort by selected metric (descending by default)
2. Tie-breaker: estimation accuracy (higher wins)
3. If still tied: alphabetical by userName

**Rank Badges**:

- Rank 1: 🥇
- Rank 2: 🥈
- Rank 3: 🥉
- Rank 4+: numeric

### TeamVelocity

Team-wide completion trend over time.

```typescript
interface TeamVelocity {
  data: VelocityDataPoint[];
  totalInPeriod: number;
  aggregation: 'day' | 'week';
  byUser?: Map<string, VelocityDataPoint[]>; // For stacked mode
}

interface VelocityDataPoint {
  date: string; // ISO date string or formatted
  count: number; // Completions on this date
  breakdown?: {
    // For stacked area chart
    [userId: string]: number;
  };
}
```

**Calculation**:

```javascript
// Group completed tasks by completedAt date, aggregate by day/week
const byDate = tasks
  .filter((t) => t.status === 'completed' && t.completedAt)
  .reduce((acc, task) => {
    const dateKey = formatDate(task.completedAt, aggregation);
    acc[dateKey] = (acc[dateKey] || 0) + 1;
    return acc;
  }, {});
```

### TeamCategoryDistribution

Category breakdown per user.

```typescript
interface TeamCategoryDistribution {
  data: UserCategoryData[];
  teamTotals: CategoryCounts;
}

interface UserCategoryData {
  userId: string;
  userName: string;
  categories: CategoryCounts;
  totalTasks: number;
}

interface CategoryCounts {
  development: number;
  fix: number;
  support: number;
}
```

**Calculation**:

```javascript
// Group tasks by userId, then by category within each user
const byUserCategory = tasks.reduce((acc, task) => {
  if (!acc[task.userId]) {
    acc[task.userId] = { development: 0, fix: 0, support: 0 };
  }
  acc[task.userId][task.category]++;
  return acc;
}, {});
```

## Date Range Filtering

All team metrics support date range filtering using the same presets as Personal Analytics:

```typescript
type DateRangeKey =
  | 'today'
  | 'this-week'
  | 'last-week'
  | 'this-month'
  | 'last-month'
  | 'last-30-days'
  | 'custom';

interface DateRange {
  start: Date;
  end: Date;
}
```

**Filter Application**:

- **Workload**: Filter by `createdAt` within date range
- **Completions**: Filter by `completedAt` within date range
- **Leaderboard**: Filter completed tasks by `completedAt` for counts
- **Velocity**: Filter by `completedAt` within date range
- **Category**: Filter by `createdAt` within date range

## Error Handling

Per FR-017, calculation failures should return error states:

```typescript
interface MetricError {
  hasError: true;
  errorMessage: string;
  fallbackDisplay: '—' | 'N/A';
}

type MetricResult<T> = T | MetricError;
```

**Example**:

```javascript
function calculateEstimationAccuracy(tasks) {
  try {
    // ... calculation logic
    return { percentage: 87, ... };
  } catch (error) {
    return {
      hasError: true,
      errorMessage: 'Unable to calculate accuracy',
      fallbackDisplay: '—'
    };
  }
}
```

## Performance Considerations

1. **Memoization**: All calculations wrapped in `useMemo` with appropriate dependencies
2. **Lazy Loading**: Team data loaded on-demand when Team Analytics tab is opened
3. **Pagination**: Leaderboard paginated at 10 users, expandable to full list
4. **Sampling**: Velocity chart limited to 90 data points max (daily) or 52 (weekly)

## Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                    IndexedDB (Source)                        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐           ┌─────────┐                          │
│  │  Users  │◄──────────│  Tasks  │                          │
│  │         │  userId   │         │                          │
│  └─────────┘           └─────────┘                          │
└─────────────────────────────────────────────────────────────┘
          │                     │
          ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│              useTeamAnalytics Hook (Derived)                 │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ TeamWorkload │  │ Completions  │  │ Leaderboard  │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │ TeamVelocity │  │TeamCategory  │                         │
│  └──────────────┘  └──────────────┘                         │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                TeamDashboard (UI Components)                 │
├─────────────────────────────────────────────────────────────┤
│  ┌────────────────┐  ┌────────────────┐                     │
│  │WorkloadChart   │  │CompletionChart │                     │
│  └────────────────┘  └────────────────┘                     │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐   │
│  │  Leaderboard   │  │ VelocityChart  │  │CategoryChart │   │
│  └────────────────┘  └────────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────┘
```
