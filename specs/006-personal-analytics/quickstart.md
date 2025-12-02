# Quickstart: Personal Analytics Dashboard

**Feature**: 006-personal-analytics  
**Date**: December 2, 2025

## Overview

This guide provides the essential information to start implementing the Personal Analytics Dashboard for TaskFlow.

## Prerequisites

- Existing TaskFlow codebase with:
  - React 18+ with Context API
  - Dexie.js for IndexedDB (Task schema already includes all required fields)
  - Tailwind CSS for styling
  - Time tracking feature (005-time-tracking) implemented
- Familiarity with existing `TaskContext.jsx` and `useTasks.js` patterns

## Quick Start Steps

### 1. Install Recharts

```bash
npm install recharts
```

### 2. Add Analytics Constants

Add to `src/utils/constants.js`:

```javascript
// =============================================================================
// Analytics Constants
// =============================================================================

export const DATE_RANGES = {
  TODAY: 'today',
  THIS_WEEK: 'thisWeek',
  LAST_WEEK: 'lastWeek',
  THIS_MONTH: 'thisMonth',
  LAST_MONTH: 'lastMonth',
  LAST_30_DAYS: 'last30Days',
};

export const PERIOD_LABELS = {
  [DATE_RANGES.TODAY]: 'Today',
  [DATE_RANGES.THIS_WEEK]: 'This Week',
  [DATE_RANGES.LAST_WEEK]: 'Last Week',
  [DATE_RANGES.THIS_MONTH]: 'This Month',
  [DATE_RANGES.LAST_MONTH]: 'Last Month',
  [DATE_RANGES.LAST_30_DAYS]: 'Last 30 Days',
};

export const CATEGORY_COLORS = {
  development: '#3B82F6',
  fix: '#EF4444',
  support: '#10B981',
};

export const ANALYTICS_STORAGE_KEY = 'taskflow_analytics_preferences';

export const DEFAULT_ANALYTICS_PREFERENCES = {
  selectedDateRange: DATE_RANGES.THIS_WEEK,
};
```

### 3. Create Date Utilities

Create `src/utils/dateUtils.js`:

```javascript
import { DATE_RANGES } from './constants';

/**
 * Get start and end dates for a preset date range
 */
export function getDateRange(rangeKey) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (rangeKey) {
    case DATE_RANGES.TODAY:
      return { key: rangeKey, start: today, end: now };

    case DATE_RANGES.THIS_WEEK: {
      const dayOfWeek = today.getDay();
      const monday = new Date(today);
      monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      return { key: rangeKey, start: monday, end: now };
    }

    case DATE_RANGES.LAST_WEEK: {
      const dayOfWeek = today.getDay();
      const thisMonday = new Date(today);
      thisMonday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      const lastMonday = new Date(thisMonday);
      lastMonday.setDate(thisMonday.getDate() - 7);
      const lastSunday = new Date(thisMonday);
      lastSunday.setDate(thisMonday.getDate() - 1);
      lastSunday.setHours(23, 59, 59, 999);
      return { key: rangeKey, start: lastMonday, end: lastSunday };
    }

    case DATE_RANGES.THIS_MONTH: {
      const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return { key: rangeKey, start: firstOfMonth, end: now };
    }

    case DATE_RANGES.LAST_MONTH: {
      const firstOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      lastOfLastMonth.setHours(23, 59, 59, 999);
      return { key: rangeKey, start: firstOfLastMonth, end: lastOfLastMonth };
    }

    case DATE_RANGES.LAST_30_DAYS: {
      const start = new Date(today);
      start.setDate(today.getDate() - 29);
      return { key: rangeKey, start, end: now };
    }

    default:
      return getDateRange(DATE_RANGES.THIS_WEEK);
  }
}

/**
 * Check if a date falls within a range
 */
export function isDateInRange(date, { start, end }) {
  const d = new Date(date);
  return d >= start && d <= end;
}

/**
 * Format date for chart axis labels
 */
export function formatChartDate(date) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
```

### 4. Create Analytics Service

Create `src/services/analyticsService.js`:

```javascript
/**
 * Calculate task summary counts
 */
export function calculateTaskSummary(tasks) {
  return {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    inProgress: tasks.filter((t) => t.status === 'in-progress').length,
    pending: tasks.filter((t) => t.status === 'pending').length,
  };
}

/**
 * Calculate estimation accuracy (variance-based formula)
 */
export function calculateEstimationAccuracy(tasks) {
  const validTasks = tasks.filter(
    (t) => t.status === 'completed' && t.estimatedDuration > 0 && t.actualDuration > 0
  );

  if (validTasks.length === 0) {
    return { percentage: null, totalEstimated: 0, totalActual: 0, taskCount: 0, trend: null };
  }

  const totalEstimated = validTasks.reduce((sum, t) => sum + t.estimatedDuration, 0);
  const totalActual = validTasks.reduce((sum, t) => sum + t.actualDuration, 0);

  const variance = Math.abs((totalActual - totalEstimated) / totalEstimated);
  const percentage = Math.max(0, Math.min(100, Math.round((1 - variance) * 100)));

  return {
    percentage,
    totalEstimated,
    totalActual,
    taskCount: validTasks.length,
    trend: null, // Implement comparison logic if needed
  };
}

/**
 * Calculate completion streak
 */
export function calculateStreak(tasks) {
  const completedTasks = tasks.filter((t) => t.status === 'completed' && t.completedAt);

  if (completedTasks.length === 0) {
    return { current: 0, best: 0, lastCompletionDate: null };
  }

  // Group by local date string
  const completionDays = new Set(
    completedTasks.map((t) => new Date(t.completedAt).toLocaleDateString())
  );

  // Calculate current streak
  let current = 0;
  const today = new Date();

  for (let i = 0; i <= 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = checkDate.toLocaleDateString();

    if (completionDays.has(dateStr)) {
      current++;
    } else if (i > 0) {
      break;
    }
  }

  // Calculate best streak (simplified - iterates all completion days)
  const sortedDates = Array.from(completionDays).sort();
  let best = 1;
  let tempStreak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i - 1]);
    const curr = new Date(sortedDates[i]);
    const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      tempStreak++;
      best = Math.max(best, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  const lastCompletionDate = sortedDates[sortedDates.length - 1] || null;

  return { current, best: Math.max(current, best), lastCompletionDate };
}

/**
 * Calculate category distribution
 */
export function calculateCategoryDistribution(tasks) {
  const counts = { development: 0, fix: 0, support: 0 };

  tasks.forEach((t) => {
    if (counts.hasOwnProperty(t.category)) {
      counts[t.category]++;
    }
  });

  const total = tasks.length;
  const data = Object.entries(counts).map(([category, count]) => ({
    category,
    count,
    percentage: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
  }));

  return { data, total };
}

/**
 * Calculate complexity distribution
 */
export function calculateComplexityDistribution(tasks) {
  const counts = Array.from({ length: 10 }, (_, i) => ({ level: i + 1, count: 0 }));
  let totalComplexity = 0;

  tasks.forEach((t) => {
    if (t.complexity >= 1 && t.complexity <= 10) {
      counts[t.complexity - 1].count++;
      totalComplexity += t.complexity;
    }
  });

  const average = tasks.length > 0 ? Math.round((totalComplexity / tasks.length) * 10) / 10 : 0;

  return { data: counts, average, total: tasks.length };
}
```

### 5. Create useAnalytics Hook

Create `src/hooks/useAnalytics.js`:

```javascript
import { useMemo, useState, useEffect } from 'react';
import { useTasks } from './useTasks';
import { useAuth } from './useAuth';
import * as analyticsService from '../services/analyticsService';
import { getDateRange, isDateInRange } from '../utils/dateUtils';
import {
  DATE_RANGES,
  ANALYTICS_STORAGE_KEY,
  DEFAULT_ANALYTICS_PREFERENCES,
} from '../utils/constants';

export function useAnalytics() {
  const { tasks, loading } = useTasks();
  const { currentUser } = useAuth();

  // Load saved preferences
  const [dateRangeKey, setDateRangeKey] = useState(() => {
    try {
      const saved = localStorage.getItem(ANALYTICS_STORAGE_KEY);
      if (saved) {
        const prefs = JSON.parse(saved);
        return prefs.selectedDateRange || DEFAULT_ANALYTICS_PREFERENCES.selectedDateRange;
      }
    } catch (e) {}
    return DEFAULT_ANALYTICS_PREFERENCES.selectedDateRange;
  });

  // Persist preferences
  useEffect(() => {
    localStorage.setItem(
      ANALYTICS_STORAGE_KEY,
      JSON.stringify({ selectedDateRange: dateRangeKey })
    );
  }, [dateRangeKey]);

  // Filter tasks for current user
  const userTasks = useMemo(
    () => tasks.filter((t) => t.userId === currentUser?.id),
    [tasks, currentUser?.id]
  );

  // Get date range
  const dateRange = useMemo(() => getDateRange(dateRangeKey), [dateRangeKey]);

  // Filter tasks by date range (using completedAt or createdAt)
  const filteredTasks = useMemo(
    () =>
      userTasks.filter((t) => {
        const taskDate = t.completedAt || t.createdAt;
        return isDateInRange(taskDate, dateRange);
      }),
    [userTasks, dateRange]
  );

  // Calculate all analytics
  const analytics = useMemo(
    () => ({
      summary: analyticsService.calculateTaskSummary(userTasks),
      streak: analyticsService.calculateStreak(userTasks),
      accuracy: analyticsService.calculateEstimationAccuracy(filteredTasks),
      categoryDistribution: analyticsService.calculateCategoryDistribution(filteredTasks),
      complexityDistribution: analyticsService.calculateComplexityDistribution(filteredTasks),
      velocity: null, // Implement calculateVelocity
      timeTracked: null, // Implement calculateTimeTracked
      dateRange,
      isLoading: loading,
      isEmpty: userTasks.length === 0,
    }),
    [userTasks, filteredTasks, dateRange, loading]
  );

  return {
    ...analytics,
    dateRangeKey,
    setDateRangeKey,
  };
}
```

### 6. Create Dashboard Component

Create `src/components/analytics/PersonalDashboard.jsx`:

```jsx
import { useAnalytics } from '../../hooks/useAnalytics';
import StatCards from './StatCards';
import EstimationAccuracy from './EstimationAccuracy';
import StreakDisplay from './StreakDisplay';
import CategoryChart from './CategoryChart';
import ComplexityChart from './ComplexityChart';
import PeriodFilter from './PeriodFilter';
import AnalyticsEmptyState from './AnalyticsEmptyState';

export default function PersonalDashboard() {
  const {
    summary,
    streak,
    accuracy,
    categoryDistribution,
    complexityDistribution,
    dateRangeKey,
    setDateRangeKey,
    isLoading,
    isEmpty,
  } = useAnalytics();

  if (isLoading) {
    return <div className="animate-pulse">Loading analytics...</div>;
  }

  if (isEmpty) {
    return <AnalyticsEmptyState />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">📊 My Statistics</h1>
        <PeriodFilter value={dateRangeKey} onChange={setDateRangeKey} />
      </div>

      <StatCards summary={summary} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EstimationAccuracy accuracy={accuracy} />
        <StreakDisplay streak={streak} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryChart data={categoryDistribution} />
        <ComplexityChart data={complexityDistribution} />
      </div>
    </div>
  );
}
```

### 7. Add Navigation Link

Modify `src/components/Dashboard.jsx` to add analytics navigation:

```jsx
// Add to navigation/sidebar
<NavLink to="/analytics" icon={<ChartBarIcon />}>
  My Statistics
</NavLink>
```

## Key Files Summary

| File                                               | Purpose                               |
| -------------------------------------------------- | ------------------------------------- |
| `src/hooks/useAnalytics.js`                        | Main hook for analytics data          |
| `src/services/analyticsService.js`                 | Pure calculation functions            |
| `src/utils/dateUtils.js`                           | Date range utilities                  |
| `src/utils/constants.js`                           | Analytics constants (add to existing) |
| `src/components/analytics/PersonalDashboard.jsx`   | Main dashboard container              |
| `src/components/analytics/StatCards.jsx`           | Task summary cards                    |
| `src/components/analytics/EstimationAccuracy.jsx`  | Accuracy display + chart              |
| `src/components/analytics/StreakDisplay.jsx`       | Streak counter                        |
| `src/components/analytics/CategoryChart.jsx`       | Pie chart (Recharts)                  |
| `src/components/analytics/ComplexityChart.jsx`     | Bar chart (Recharts)                  |
| `src/components/analytics/PeriodFilter.jsx`        | Date range dropdown                   |
| `src/components/analytics/AnalyticsEmptyState.jsx` | Empty state component                 |

## Testing

Run the dashboard by:

1. Ensure you have tasks with various statuses, categories, and complexities
2. Complete some tasks with time tracking to see accuracy metrics
3. Complete tasks on consecutive days to see streak data
4. Navigate to `/analytics` or click "My Statistics" in navigation

## Next Steps

After implementing the basic dashboard:

1. Add velocity trend line chart
2. Add time tracked summary card
3. Implement period comparison (vs previous period)
4. Add mobile-responsive chart sizing
5. Write unit tests for `analyticsService.js`
