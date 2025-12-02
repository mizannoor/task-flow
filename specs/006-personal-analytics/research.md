# Research: Personal Analytics Dashboard

**Feature**: 006-personal-analytics  
**Date**: December 2, 2025  
**Status**: Complete

## Research Tasks

### 1. Recharts Integration for React Charts

**Context**: Need to implement responsive charts (PieChart, BarChart, LineChart) for analytics visualizations.

**Decision**: Use Recharts library with `ResponsiveContainer` wrapper for all chart components.

**Rationale**:

- Recharts is React-native, using declarative components that align with project patterns
- `ResponsiveContainer` automatically handles responsive sizing (width="100%" height={number})
- Built-in `Tooltip` component provides hover interactivity without custom code
- Accessibility features enabled by default in Recharts 3.0 (keyboard navigation, screen reader support)
- Integrates well with Tailwind CSS for surrounding layout

**Alternatives Considered**:

- Chart.js with react-chartjs-2: More configuration required, less React-idiomatic
- D3.js directly: Too low-level for simple chart needs, steep learning curve
- Tremor: Opinionated styling may conflict with existing Tailwind setup

**Implementation Pattern**:

```jsx
<ResponsiveContainer width="100%" height={300}>
  <PieChart>
    <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" />
    <Tooltip />
    <Legend />
  </PieChart>
</ResponsiveContainer>
```

### 2. Estimation Accuracy Calculation

**Context**: Need to implement variance-based accuracy formula per clarification: `100 - abs((actual - estimated) / estimated) * 100`.

**Decision**: Implement in `analyticsService.js` with edge case handling; aggregate across completed tasks only.

**Rationale**:

- Formula treats over/under-estimation symmetrically (both penalized equally)
- Cap result at 0-100% range to prevent negative accuracy
- Exclude tasks with `estimatedDuration === 0` to avoid division by zero
- Aggregate by summing actual and estimated separately, then calculate ratio

**Alternatives Considered**:

- Per-task accuracy averaged: Weights small tasks equally with large tasks
- Ratio-based (min/max): Less intuitive percentage interpretation

**Implementation Pattern**:

```javascript
function calculateEstimationAccuracy(tasks) {
  const validTasks = tasks.filter(
    (t) => t.status === 'completed' && t.estimatedDuration > 0 && t.actualDuration > 0
  );

  if (validTasks.length === 0) return null;

  const totalEstimated = validTasks.reduce((sum, t) => sum + t.estimatedDuration, 0);
  const totalActual = validTasks.reduce((sum, t) => sum + t.actualDuration, 0);

  const variance = Math.abs((totalActual - totalEstimated) / totalEstimated);
  const accuracy = Math.max(0, Math.min(100, (1 - variance) * 100));

  return Math.round(accuracy);
}
```

### 3. Completion Streak Calculation

**Context**: Need to calculate consecutive days with at least one task completed, using local timezone.

**Decision**: Iterate backward from today, checking for completions each day; track current and best streak.

**Rationale**:

- Use `completedAt` timestamp from tasks, converted to local date string for day boundary
- Start from today and count backward consecutive days with completions
- If today has no completions but yesterday does, streak continues (grace period until end of today)
- Store best streak in user preferences or derive from historical completedAt dates

**Alternatives Considered**:

- Store streak count in database: Requires schema change, harder to audit
- Use UTC dates: Confusing for users in different timezones

**Implementation Pattern**:

```javascript
function calculateStreak(tasks) {
  const completedTasks = tasks.filter((t) => t.status === 'completed' && t.completedAt);

  // Group by local date string
  const completionDays = new Set(
    completedTasks.map((t) => new Date(t.completedAt).toLocaleDateString())
  );

  let streak = 0;
  const today = new Date();

  // Check from today backward
  for (let i = 0; i <= 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = checkDate.toLocaleDateString();

    if (completionDays.has(dateStr)) {
      streak++;
    } else if (i > 0) {
      // Allow today to be incomplete (streak continues if yesterday had completion)
      break;
    }
  }

  return { current: streak, best: Math.max(streak, calculateBestStreak(completionDays)) };
}
```

### 4. Date Range Filtering with Preset Periods

**Context**: Dashboard needs preset time period filters (Today, This Week, Last Week, This Month, Last Month, Last 30 Days).

**Decision**: Create `dateUtils.js` with functions returning `{ start: Date, end: Date }` for each preset.

**Rationale**:

- Consistent date range calculation ensures accurate filtering across all metrics
- "This Week" uses Monday as week start (ISO standard)
- All ranges are inclusive of start and end dates
- Filter applied at service layer before aggregation

**Alternatives Considered**:

- Rolling periods only (Last 7 Days): Less intuitive for calendar-based planning
- Custom date picker: Adds complexity; preset covers 90% of use cases

**Implementation Pattern**:

```javascript
export const DATE_RANGES = {
  TODAY: 'today',
  THIS_WEEK: 'thisWeek',
  LAST_WEEK: 'lastWeek',
  THIS_MONTH: 'thisMonth',
  LAST_MONTH: 'lastMonth',
  LAST_30_DAYS: 'last30Days',
};

export function getDateRange(rangeKey) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (rangeKey) {
    case DATE_RANGES.TODAY:
      return { start: today, end: now };

    case DATE_RANGES.THIS_WEEK: {
      const dayOfWeek = today.getDay();
      const monday = new Date(today);
      monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      return { start: monday, end: now };
    }

    case DATE_RANGES.LAST_30_DAYS: {
      const start = new Date(today);
      start.setDate(today.getDate() - 29);
      return { start, end: now };
    }
    // ... other cases
  }
}
```

### 5. Real-Time Dashboard Updates

**Context**: Dashboard statistics should update when task data changes without manual refresh.

**Decision**: Use existing `TaskContext` subscription; derive analytics in `useAnalytics` hook with `useMemo`.

**Rationale**:

- TaskContext already triggers re-renders on task CRUD operations
- `useMemo` with tasks dependency prevents unnecessary recalculations
- No additional event system or WebSocket needed for real-time feel
- Memoization handles performance for 1,000+ tasks

**Alternatives Considered**:

- Separate AnalyticsContext: Adds complexity, duplicates task state
- Polling IndexedDB: Unnecessary overhead, doesn't integrate with React lifecycle

**Implementation Pattern**:

```javascript
function useAnalytics(dateRange = DATE_RANGES.THIS_WEEK) {
  const { tasks } = useTasks();
  const { currentUser } = useAuth();

  const userTasks = useMemo(
    () => tasks.filter((t) => t.userId === currentUser?.id),
    [tasks, currentUser?.id]
  );

  const filteredTasks = useMemo(
    () => filterTasksByDateRange(userTasks, dateRange),
    [userTasks, dateRange]
  );

  const stats = useMemo(
    () => ({
      summary: calculateTaskSummary(userTasks), // Not filtered by date
      accuracy: calculateEstimationAccuracy(filteredTasks),
      streak: calculateStreak(userTasks), // Uses all historical data
      categoryDistribution: calculateCategoryDistribution(filteredTasks),
      complexityDistribution: calculateComplexityDistribution(filteredTasks),
      velocity: calculateVelocity(filteredTasks, dateRange),
      timeTracked: calculateTimeTracked(filteredTasks),
    }),
    [userTasks, filteredTasks, dateRange]
  );

  return stats;
}
```

### 6. Empty State Handling

**Context**: Dashboard needs meaningful empty states when user has no tasks or insufficient data for metrics.

**Decision**: Return `null` from calculation functions when data insufficient; components render specific empty states.

**Rationale**:

- Different metrics have different "empty" conditions (e.g., accuracy needs completed tasks with time tracking)
- Component-level empty states allow metric-specific messaging and CTAs
- Consistent pattern: `null` = no data, `0` = calculated zero value

**Alternatives Considered**:

- Global empty state: Hides partial data availability
- Show "N/A" text: Less actionable than specific guidance

**Implementation Pattern**:

```jsx
function EstimationAccuracy({ accuracy }) {
  if (accuracy === null) {
    return (
      <EmptyState
        icon={<ClockIcon />}
        title="No accuracy data yet"
        description="Complete tasks with time tracking to see your estimation accuracy."
        action={{ label: 'Start tracking time', href: '/tasks' }}
      />
    );
  }

  return <AccuracyChart accuracy={accuracy} />;
}
```

### 7. Velocity Trend Data Structure

**Context**: Velocity chart needs daily/weekly completion counts over the selected date range.

**Decision**: Generate array of `{ date: string, count: number }` objects for each day in range.

**Rationale**:

- Recharts expects array of data points with consistent keys
- Include days with zero completions to show gaps in productivity
- Date string format allows XAxis labeling without Date object serialization

**Alternatives Considered**:

- Sparse data (only days with completions): Misleading chart visualization
- Timestamp-based: More complex XAxis formatting

**Implementation Pattern**:

```javascript
function calculateVelocity(tasks, dateRange) {
  const { start, end } = getDateRange(dateRange);
  const completedTasks = tasks.filter((t) => t.status === 'completed' && t.completedAt);

  // Create map of date -> count
  const countByDate = new Map();
  completedTasks.forEach((task) => {
    const dateStr = new Date(task.completedAt).toLocaleDateString();
    countByDate.set(dateStr, (countByDate.get(dateStr) || 0) + 1);
  });

  // Generate all dates in range with counts (including zeros)
  const data = [];
  const current = new Date(start);
  while (current <= end) {
    const dateStr = current.toLocaleDateString();
    data.push({
      date: formatDate(current, { short: true }), // "Dec 2"
      count: countByDate.get(dateStr) || 0,
    });
    current.setDate(current.getDate() + 1);
  }

  return data;
}
```

## Technology Decisions Summary

| Area                 | Decision                                   | Confidence |
| -------------------- | ------------------------------------------ | ---------- |
| Chart Library        | Recharts with ResponsiveContainer          | High       |
| Accuracy Formula     | Variance-based with aggregated totals      | High       |
| Streak Calculation   | Local timezone, backward iteration         | High       |
| Date Range Filtering | Preset periods via dateUtils.js            | High       |
| Real-Time Updates    | TaskContext subscription + useMemo         | High       |
| Empty States         | Null return + component-level empty states | High       |
| Velocity Data        | Full date range with zero-filled gaps      | High       |

## Dependencies

- **Existing**: Dexie.js, React Context (TaskContext), Tailwind CSS, existing Task schema
- **New**: Recharts (npm install recharts)

## Risks & Mitigations

| Risk                              | Likelihood | Impact | Mitigation                                         |
| --------------------------------- | ---------- | ------ | -------------------------------------------------- |
| Recharts bundle size impact       | Medium     | Low    | Tree-shaking imports; only import used chart types |
| Performance with 10,000+ tasks    | Low        | Medium | Memoization; consider virtualization if needed     |
| Timezone inconsistencies          | Low        | Medium | Use toLocaleDateString consistently                |
| Chart responsiveness on mobile    | Low        | Low    | Test ResponsiveContainer at 320px breakpoint       |
| User confusion with empty metrics | Medium     | Low    | Clear empty states with actionable guidance        |
