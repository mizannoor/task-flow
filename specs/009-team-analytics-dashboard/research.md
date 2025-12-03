# Research: Team Analytics Dashboard

**Feature**: 009-team-analytics-dashboard  
**Created**: December 2, 2025  
**Status**: Complete

## Research Summary

Team Analytics builds directly on the proven architecture of Personal Analytics (006). No significant research was required as the patterns are established.

## Key Findings

### 1. Recharts Capabilities (Verified)

The existing Recharts setup supports all required chart types:

| Chart Type     | Recharts Component                 | Used In          |
| -------------- | ---------------------------------- | ---------------- |
| Horizontal Bar | `<BarChart layout="vertical">`     | Team Workload    |
| Grouped Bar    | `<BarChart>` with multiple `<Bar>` | Team Completions |
| Area Chart     | `<AreaChart>`                      | Team Velocity    |
| Stacked Bar    | `<BarChart>` with `stackId`        | Category by User |
| Table          | Custom component (not Recharts)    | Leaderboard      |

### 2. Data Access Patterns (Verified)

Current architecture supports team analytics:

```javascript
// TaskContext provides all tasks
const { tasks } = useTasks(); // Returns ALL tasks in system

// AuthContext provides user list
const { users, currentUser } = useAuth();

// Group tasks by userId for team aggregation
const tasksByUser = tasks.reduce((acc, task) => {
  acc[task.userId] = [...(acc[task.userId] || []), task];
  return acc;
}, {});
```

### 3. Performance Considerations

Based on Personal Analytics performance:

- 1,000 tasks: <100ms calculation time
- 10,000 tasks: ~500ms calculation time (acceptable)
- 50 users: Minimal overhead for user iteration

**Recommendations**:

- Use `useMemo` for all calculations
- Limit velocity chart to 90 data points
- Paginate leaderboard at 10 users (expandable)

### 4. Reusable Components

From Personal Analytics:

- `PeriodFilter.jsx` - Fully reusable for date range selection
- `AnalyticsEmptyState.jsx` - Pattern for empty states
- `dateUtils.js` - All date range utilities
- `formatters.js` - Duration and percentage formatters

### 5. Accessibility Patterns

Recharts 3.x provides:

- Keyboard navigation for chart elements
- Screen reader support via ARIA
- Focus indicators

Custom requirements:

- Leaderboard table needs proper `<th>` headers
- Current user row needs `aria-current="true"`
- Sort buttons need `aria-sort` attribute

## Decisions Made

| Decision              | Choice                      | Rationale                                 |
| --------------------- | --------------------------- | ----------------------------------------- |
| Chart library         | Recharts (existing)         | Already installed, proven patterns        |
| State management      | React Context + useMemo     | Consistent with Personal Analytics        |
| Date filtering        | Reuse PeriodFilter          | Code reuse, consistent UX                 |
| Leaderboard component | Custom table (not Recharts) | Better control over sorting, highlighting |
| Error handling        | Silent fallback with "—"    | Per clarification session                 |

## Open Questions (Resolved)

1. ~~Team definition~~ → All users in system (no team entity)
2. ~~Leaderboard opt-out~~ → Mandatory visibility (per clarification)
3. ~~Error display~~ → Silent fallback with info tooltip (per clarification)
4. ~~Feature naming~~ → "Team Analytics" (per clarification)

## References

- [Personal Analytics Spec](../006-personal-analytics/spec.md)
- [Personal Analytics Implementation](../../src/components/analytics/)
- [Recharts Documentation](https://recharts.org/en-US/)
- [PRD Team Statistics Section](../../docs/PRD.md#652-team-statistics)
