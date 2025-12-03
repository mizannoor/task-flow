# Quickstart Guide: Team Analytics Dashboard

**Feature**: 009-team-analytics-dashboard  
**Created**: December 2, 2025

## Overview

This guide helps developers quickly understand and work on the Team Analytics Dashboard feature.

## Prerequisites

Before starting:

1. ✅ Feature 006-personal-analytics must be implemented (provides analytics patterns)
2. ✅ Recharts library installed and configured
3. ✅ IndexedDB with Users and Tasks tables populated

## Quick Architecture

```
Dashboard.jsx (VIEW_TYPES.TEAM_ANALYTICS)
    └── TeamDashboard.jsx
            ├── PeriodFilter.jsx (reused from personal)
            ├── TeamWorkloadChart.jsx
            ├── TeamCompletionChart.jsx
            ├── TeamLeaderboard.jsx
            ├── TeamVelocityChart.jsx
            └── TeamCategoryChart.jsx
                    │
                    ▼
            useTeamAnalytics.js (hook)
                    │
                    ▼
            analyticsService.js (calculations)
                    │
                    ▼
            IndexedDB (Tasks, Users)
```

## Key Files to Modify/Create

| File | Action | Purpose |
|------|--------|---------|
| `src/components/Dashboard.jsx` | MODIFY | Add Team Analytics view type |
| `src/components/analytics/TeamDashboard.jsx` | CREATE | Main container component |
| `src/components/analytics/TeamWorkloadChart.jsx` | CREATE | Horizontal bar chart |
| `src/components/analytics/TeamCompletionChart.jsx` | CREATE | Grouped bar chart |
| `src/components/analytics/TeamLeaderboard.jsx` | CREATE | Sortable ranked table |
| `src/components/analytics/TeamVelocityChart.jsx` | CREATE | Area chart with stacking |
| `src/components/analytics/TeamCategoryChart.jsx` | CREATE | Stacked bar chart |
| `src/hooks/useTeamAnalytics.js` | CREATE | Team-scoped analytics hook |
| `src/services/analyticsService.js` | MODIFY | Add team calculation functions |
| `src/utils/constants.js` | MODIFY | Add team analytics constants |

## Getting Started

### 1. Run the Application

```bash
npm run dev
```

### 2. Create Test Users and Tasks

Use the app UI or browser console:

```javascript
// Create multiple users via login (app auto-creates on first login)
// Then create tasks assigned to different users
```

### 3. Navigate to Team Analytics

- Open the app
- Click the view switcher in Dashboard
- Select "Team Analytics"

## Implementation Patterns

### Reusing Personal Analytics Patterns

```javascript
// analyticsService.js - Reuse existing functions
import { 
  calculateStreak, 
  calculateEstimationAccuracy 
} from './analyticsService';

// Calculate per-user metrics
function calculateLeaderboardEntry(userId, userTasks) {
  const streak = calculateStreak(userTasks);
  const accuracy = calculateEstimationAccuracy(userTasks);
  // ...
}
```

### Team-Scoped Data Access

```javascript
// useTeamAnalytics.js
import { useTasks } from './useTasks';
import { useAuth } from './useAuth';

export function useTeamAnalytics() {
  const { tasks } = useTasks(); // ALL tasks, not filtered
  const { currentUser, users } = useAuth();
  
  // Group tasks by userId for team metrics
  const tasksByUser = useMemo(() => {
    return tasks.reduce((acc, task) => {
      if (!acc[task.userId]) acc[task.userId] = [];
      acc[task.userId].push(task);
      return acc;
    }, {});
  }, [tasks]);
  
  // Calculate team metrics...
}
```

### Chart Component Pattern

```jsx
// TeamWorkloadChart.jsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function TeamWorkloadChart({ data }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
      <h3 className="text-lg font-semibold mb-4">Team Workload</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical">
          <XAxis type="number" />
          <YAxis dataKey="userName" type="category" width={100} />
          <Tooltip />
          <Bar dataKey="taskCount" fill="#3B82F6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

### Error Handling Pattern (FR-017)

```jsx
// MetricDisplay with fallback
function MetricWithFallback({ value, error }) {
  if (error) {
    return (
      <span className="text-gray-400 flex items-center gap-1">
        —
        <InfoTooltip message={error.errorMessage} />
      </span>
    );
  }
  return <span>{value}</span>;
}
```

## Testing

### Unit Tests

```bash
npm run test -- useTeamAnalytics
npm run test -- teamAnalyticsService
```

### Manual Testing Checklist

- [ ] Open Team Analytics with 3+ users
- [ ] Verify all users appear in workload chart
- [ ] Click leaderboard column headers to sort
- [ ] Change date filter and verify charts update
- [ ] Check mobile layout (resize to 320px)
- [ ] Verify current user highlighting in leaderboard

## Common Issues

### Issue: Charts not rendering

**Cause**: Recharts needs `ResponsiveContainer` with explicit height.

**Fix**:
```jsx
<ResponsiveContainer width="100%" height={300}>
  <BarChart ...>
```

### Issue: User not appearing in charts

**Cause**: Users with 0 tasks may be filtered out.

**Fix**: Include all users from `useAuth().users`, merge with task data:
```javascript
const allUsers = users.map(u => ({
  ...u,
  taskCount: tasksByUser[u.id]?.length || 0
}));
```

### Issue: Leaderboard not highlighting current user

**Cause**: Missing `isCurrentUser` flag in calculation.

**Fix**:
```javascript
entries.map(entry => ({
  ...entry,
  isCurrentUser: entry.userId === currentUser.id
}));
```

## Resources

- [Specification](./spec.md)
- [Data Model](./data-model.md)
- [Implementation Plan](./plan.md)
- [Personal Analytics (reference)](../006-personal-analytics/)
- [Recharts Documentation](https://recharts.org/en-US/)
