/**
 * Analytics Service
 * Pure calculation functions for analytics data
 * All functions are stateless and derive data from task arrays
 */

import { STATUSES, CATEGORIES } from '../utils/constants';
import { formatDuration } from '../utils/formatters';
import { toLocalDateString, formatChartDate, getDateArray, getDaysInRange } from '../utils/dateUtils';

// =============================================================================
// Task Summary
// =============================================================================

/**
 * Calculate task summary counts by status
 * @param {Array} tasks - Array of task objects
 * @returns {{ total: number, completed: number, inProgress: number, pending: number }}
 */
export function calculateTaskSummary(tasks) {
  return {
    total: tasks.length,
    completed: tasks.filter((t) => t.status === STATUSES.COMPLETED).length,
    inProgress: tasks.filter((t) => t.status === STATUSES.IN_PROGRESS).length,
    pending: tasks.filter((t) => t.status === STATUSES.PENDING).length,
  };
}

// =============================================================================
// Estimation Accuracy
// =============================================================================

/**
 * Calculate estimation accuracy using variance-based formula
 * Formula: 100 - abs((actual - estimated) / estimated) * 100
 * @param {Array} tasks - Array of task objects (should be filtered by date range)
 * @returns {{ percentage: number | null, totalEstimated: number, totalActual: number, taskCount: number, trend: string | null }}
 */
export function calculateEstimationAccuracy(tasks) {
  // Filter to completed tasks with valid time data
  const validTasks = tasks.filter(
    (t) =>
      t.status === STATUSES.COMPLETED &&
      t.estimatedDuration > 0 &&
      t.actualDuration > 0
  );

  if (validTasks.length === 0) {
    return {
      percentage: null,
      totalEstimated: 0,
      totalActual: 0,
      taskCount: 0,
      trend: null,
    };
  }

  const totalEstimated = validTasks.reduce((sum, t) => sum + t.estimatedDuration, 0);
  const totalActual = validTasks.reduce((sum, t) => sum + t.actualDuration, 0);

  // Calculate variance-based accuracy
  const variance = Math.abs((totalActual - totalEstimated) / totalEstimated);
  const percentage = Math.max(0, Math.min(100, Math.round((1 - variance) * 100)));

  return {
    percentage,
    totalEstimated,
    totalActual,
    taskCount: validTasks.length,
    trend: null, // Could be extended to compare with previous period
  };
}

// =============================================================================
// Completion Streak
// =============================================================================

/**
 * Calculate completion streak (consecutive days with at least one task completed)
 * Uses local timezone for day boundaries
 * @param {Array} tasks - Array of task objects (all user tasks, not filtered by date)
 * @returns {{ current: number, best: number, lastCompletionDate: string | null }}
 */
export function calculateStreak(tasks) {
  const completedTasks = tasks.filter(
    (t) => t.status === STATUSES.COMPLETED && t.completedAt
  );

  if (completedTasks.length === 0) {
    return { current: 0, best: 0, lastCompletionDate: null };
  }

  // Group completions by local date
  const completionDays = new Set(
    completedTasks.map((t) => toLocalDateString(t.completedAt))
  );

  // Calculate current streak (backward from today)
  let currentStreak = 0;
  const today = new Date();
  const todayStr = toLocalDateString(today);

  // Check if today has a completion
  if (completionDays.has(todayStr)) {
    currentStreak = 1;
  }

  // Count consecutive days backward
  const checkDate = new Date(today);
  checkDate.setDate(checkDate.getDate() - 1); // Start from yesterday

  while (completionDays.has(toLocalDateString(checkDate))) {
    currentStreak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // If today has no completion but yesterday does, include grace period
  if (currentStreak === 0) {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (completionDays.has(toLocalDateString(yesterday))) {
      // Start counting from yesterday
      currentStreak = 1;
      const checkFromYesterday = new Date(yesterday);
      checkFromYesterday.setDate(checkFromYesterday.getDate() - 1);
      while (completionDays.has(toLocalDateString(checkFromYesterday))) {
        currentStreak++;
        checkFromYesterday.setDate(checkFromYesterday.getDate() - 1);
      }
    }
  }

  // Calculate best streak (iterate through all completion days)
  const sortedDates = Array.from(completionDays).sort();
  let bestStreak = 1;
  let tempStreak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1]);
    const currDate = new Date(sortedDates[i]);
    const diffDays = Math.round((currDate - prevDate) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      tempStreak++;
      bestStreak = Math.max(bestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  // Ensure best is at least current
  bestStreak = Math.max(bestStreak, currentStreak);

  // Get last completion date
  const lastCompletionDate = sortedDates[sortedDates.length - 1] || null;

  return { current: currentStreak, best: bestStreak, lastCompletionDate };
}

// =============================================================================
// Category Distribution
// =============================================================================

/**
 * Calculate task distribution by category
 * @param {Array} tasks - Array of task objects
 * @returns {{ data: Array<{ category: string, count: number, percentage: number }>, total: number }}
 */
export function calculateCategoryDistribution(tasks) {
  const counts = {
    [CATEGORIES.DEVELOPMENT]: 0,
    [CATEGORIES.FIX]: 0,
    [CATEGORIES.SUPPORT]: 0,
  };

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

// =============================================================================
// Complexity Distribution
// =============================================================================

/**
 * Calculate task distribution by complexity level (1-10)
 * @param {Array} tasks - Array of task objects
 * @returns {{ data: Array<{ level: number, count: number }>, average: number, total: number }}
 */
export function calculateComplexityDistribution(tasks) {
  // Initialize counts for levels 1-10
  const counts = Array.from({ length: 10 }, (_, i) => ({
    level: i + 1,
    count: 0,
  }));

  let totalComplexity = 0;
  let validCount = 0;

  tasks.forEach((t) => {
    const complexity = Number(t.complexity);
    if (complexity >= 1 && complexity <= 10) {
      counts[complexity - 1].count++;
      totalComplexity += complexity;
      validCount++;
    }
  });

  const average = validCount > 0 ? Math.round((totalComplexity / validCount) * 10) / 10 : 0;

  return { data: counts, average, total: tasks.length };
}

// =============================================================================
// Velocity Trend
// =============================================================================

/**
 * Calculate velocity trend (tasks completed per day)
 * @param {Array} tasks - Array of task objects (should be filtered by date range)
 * @param {{ start: Date, end: Date }} dateRange - The date range for the trend
 * @param {'day' | 'week'} aggregation - Aggregation level
 * @returns {{ data: Array<{ date: string, count: number }>, periodTotal: number, previousPeriodTotal: number | null, changePercent: number | null }}
 */
export function calculateVelocity(tasks, dateRange, aggregation = 'day') {
  const completedTasks = tasks.filter(
    (t) => t.status === STATUSES.COMPLETED && t.completedAt
  );

  // Count completions by date
  const countByDate = new Map();
  completedTasks.forEach((task) => {
    const dateStr = toLocalDateString(task.completedAt);
    countByDate.set(dateStr, (countByDate.get(dateStr) || 0) + 1);
  });

  // Generate data points for all dates in range
  const dates = getDateArray(dateRange);
  let data = [];

  if (aggregation === 'day') {
    data = dates.map((date) => {
      const dateStr = toLocalDateString(date);
      return {
        date: formatChartDate(date),
        fullDate: dateStr,
        count: countByDate.get(dateStr) || 0,
      };
    });
  } else {
    // Weekly aggregation
    const weeklyData = new Map();
    dates.forEach((date) => {
      const weekStart = getWeekStartDate(date);
      const weekKey = toLocalDateString(weekStart);
      const dateStr = toLocalDateString(date);
      const count = countByDate.get(dateStr) || 0;
      weeklyData.set(weekKey, (weeklyData.get(weekKey) || 0) + count);
    });

    data = Array.from(weeklyData.entries()).map(([weekKey, count]) => ({
      date: formatChartDate(new Date(weekKey)),
      fullDate: weekKey,
      count,
    }));
  }

  const periodTotal = completedTasks.length;

  return {
    data,
    periodTotal,
    previousPeriodTotal: null, // Could be extended to calculate previous period
    changePercent: null,
  };
}

/**
 * Get the Monday of the week for a given date
 * @param {Date} date - The date
 * @returns {Date} - Monday of that week
 */
function getWeekStartDate(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

// =============================================================================
// Time Tracked Summary
// =============================================================================

/**
 * Calculate total time tracked in a period
 * @param {Array} tasks - Array of task objects (should be filtered by date range)
 * @param {{ start: Date, end: Date }} dateRange - The date range
 * @returns {{ totalMinutes: number, formattedTotal: string, dailyAverage: number, taskCount: number }}
 */
export function calculateTimeTracked(tasks, dateRange) {
  // Only count tasks with tracked time
  const trackedTasks = tasks.filter(
    (t) => t.actualDuration > 0 && t.status === STATUSES.COMPLETED
  );

  const totalMinutes = trackedTasks.reduce((sum, t) => sum + (t.actualDuration || 0), 0);
  const formattedTotal = formatDuration(totalMinutes, { short: true });

  // Calculate daily average
  const daysInRange = getDaysInRange(dateRange);
  const dailyAverage = daysInRange > 0 ? Math.round(totalMinutes / daysInRange) : 0;

  return {
    totalMinutes,
    formattedTotal,
    dailyAverage,
    taskCount: trackedTasks.length,
  };
}

// =============================================================================
// Helper: Get Complexity Color
// =============================================================================

/**
 * Get color for complexity level
 * @param {number} level - Complexity level (1-10)
 * @returns {string} - Hex color code
 */
export function getComplexityColor(level) {
  if (level <= 3) return '#10B981'; // Emerald-500 (low)
  if (level <= 6) return '#F59E0B'; // Amber-500 (medium)
  return '#EF4444'; // Red-500 (high)
}

// =============================================================================
// Team Analytics: Team Workload Distribution
// =============================================================================

/**
 * Calculate team workload distribution (tasks per user)
 * @param {Array} tasks - Array of all task objects
 * @param {Array} users - Array of all user objects
 * @returns {{ data: Array<{ userId: string, userName: string, taskCount: number, percentage: number }>, totalTasks: number, averagePerUser: number, maxTaskCount: number }}
 */
export function calculateTeamWorkload(tasks, users) {
  // Create a map of userId to task count
  const taskCountByUser = tasks.reduce((acc, task) => {
    acc[task.userId] = (acc[task.userId] || 0) + 1;
    return acc;
  }, {});

  const totalTasks = tasks.length;
  const userCount = users.length || 1;

  // Build data array including all users (even those with 0 tasks)
  const data = users.map((user) => {
    const taskCount = taskCountByUser[user.id] || 0;
    return {
      userId: user.id,
      userName: user.displayName || user.identifier,
      taskCount,
      percentage: totalTasks > 0 ? Math.round((taskCount / totalTasks) * 1000) / 10 : 0,
    };
  });

  // Sort by task count descending
  data.sort((a, b) => b.taskCount - a.taskCount);

  const maxTaskCount = data.length > 0 ? Math.max(...data.map((d) => d.taskCount)) : 0;

  return {
    data,
    totalTasks,
    averagePerUser: userCount > 0 ? Math.round((totalTasks / userCount) * 10) / 10 : 0,
    maxTaskCount,
  };
}

// =============================================================================
// Team Analytics: Team Completions
// =============================================================================

/**
 * Calculate team completions (completed tasks per user in date range)
 * @param {Array} tasks - Array of all task objects
 * @param {Array} users - Array of all user objects
 * @param {{ start: Date, end: Date }} dateRange - Current date range
 * @param {{ start: Date, end: Date } | null} previousDateRange - Previous period for comparison
 * @returns {{ data: Array, totalCompleted: number, previousPeriodTotal: number | null }}
 */
export function calculateTeamCompletions(tasks, users, dateRange, previousDateRange = null) {
  // Filter completed tasks in current date range
  const completedInRange = tasks.filter(
    (t) =>
      t.status === STATUSES.COMPLETED &&
      t.completedAt &&
      isDateInRange(t.completedAt, dateRange)
  );

  // Count completions by user for current period
  const currentCountByUser = completedInRange.reduce((acc, task) => {
    acc[task.userId] = (acc[task.userId] || 0) + 1;
    return acc;
  }, {});

  // Calculate previous period counts if comparison enabled
  let previousCountByUser = {};
  let previousPeriodTotal = null;

  if (previousDateRange) {
    const completedInPreviousRange = tasks.filter(
      (t) =>
        t.status === STATUSES.COMPLETED &&
        t.completedAt &&
        isDateInRange(t.completedAt, previousDateRange)
    );

    previousCountByUser = completedInPreviousRange.reduce((acc, task) => {
      acc[task.userId] = (acc[task.userId] || 0) + 1;
      return acc;
    }, {});

    previousPeriodTotal = completedInPreviousRange.length;
  }

  const totalCompleted = completedInRange.length;

  // Build data array including all users
  const data = users.map((user) => {
    const completedCount = currentCountByUser[user.id] || 0;
    const previousPeriodCount = previousDateRange ? (previousCountByUser[user.id] || 0) : undefined;

    let changePercent = undefined;
    if (previousPeriodCount !== undefined && previousPeriodCount > 0) {
      changePercent = Math.round(((completedCount - previousPeriodCount) / previousPeriodCount) * 100);
    }

    return {
      userId: user.id,
      userName: user.displayName || user.identifier,
      completedCount,
      percentage: totalCompleted > 0 ? Math.round((completedCount / totalCompleted) * 1000) / 10 : 0,
      previousPeriodCount,
      changePercent,
    };
  });

  // Sort by completion count descending
  data.sort((a, b) => b.completedCount - a.completedCount);

  return {
    data,
    totalCompleted,
    previousPeriodTotal,
  };
}

/**
 * Helper to check if a date is within a range
 * @param {Date|string} date - Date to check
 * @param {{ start: Date, end: Date }} range - Date range
 * @returns {boolean}
 */
function isDateInRange(date, range) {
  const d = new Date(date);
  return d >= range.start && d <= range.end;
}

// =============================================================================
// Team Analytics: Leaderboard
// =============================================================================

/**
 * Calculate team leaderboard with rankings
 * @param {Array} tasks - Array of all task objects
 * @param {Array} users - Array of all user objects
 * @param {string} currentUserId - Current user's ID for highlighting
 * @param {'completed' | 'accuracy' | 'streak'} sortField - Field to sort by
 * @param {'asc' | 'desc'} sortOrder - Sort order
 * @returns {{ entries: Array<LeaderboardEntry>, totalUsers: number, currentUserRank: number | null }}
 */
export function calculateLeaderboard(tasks, users, currentUserId, sortField = 'completed', sortOrder = 'desc') {
  // Group tasks by user
  const tasksByUser = tasks.reduce((acc, task) => {
    if (!acc[task.userId]) acc[task.userId] = [];
    acc[task.userId].push(task);
    return acc;
  }, {});

  // Calculate metrics for each user
  const entries = users.map((user) => {
    const userTasks = tasksByUser[user.id] || [];
    const completedTasks = userTasks.filter((t) => t.status === STATUSES.COMPLETED);

    // Calculate estimation accuracy for this user
    const accuracyResult = calculateEstimationAccuracy(userTasks);

    // Calculate streak for this user
    const streakResult = calculateStreak(userTasks);

    return {
      userId: user.id,
      userName: user.displayName || user.identifier,
      tasksCompleted: completedTasks.length,
      estimationAccuracy: accuracyResult.percentage,
      currentStreak: streakResult.current,
      isCurrentUser: user.id === currentUserId,
    };
  });

  // Sort entries based on sortField and sortOrder
  entries.sort((a, b) => {
    let aVal, bVal;

    switch (sortField) {
      case 'accuracy':
        // Null values go last
        aVal = a.estimationAccuracy ?? -1;
        bVal = b.estimationAccuracy ?? -1;
        break;
      case 'streak':
        aVal = a.currentStreak;
        bVal = b.currentStreak;
        break;
      case 'completed':
      default:
        aVal = a.tasksCompleted;
        bVal = b.tasksCompleted;
        break;
    }

    let result = bVal - aVal; // Default descending

    // Tie-breaker: estimation accuracy (higher wins)
    if (result === 0 && sortField !== 'accuracy') {
      const accA = a.estimationAccuracy ?? -1;
      const accB = b.estimationAccuracy ?? -1;
      result = accB - accA;
    }

    // Second tie-breaker: alphabetical by name
    if (result === 0) {
      result = a.userName.localeCompare(b.userName);
    }

    return sortOrder === 'asc' ? -result : result;
  });

  // Assign ranks (accounting for ties)
  let currentRank = 1;
  entries.forEach((entry, index) => {
    if (index > 0) {
      const prev = entries[index - 1];
      const isTie =
        entry.tasksCompleted === prev.tasksCompleted &&
        entry.estimationAccuracy === prev.estimationAccuracy;
      if (!isTie) {
        currentRank = index + 1;
      }
    }
    entry.rank = currentRank;
    entry.rankBadge = currentRank <= 3 ? ['🥇', '🥈', '🥉'][currentRank - 1] : null;
  });

  // Find current user's rank
  const currentUserEntry = entries.find((e) => e.isCurrentUser);
  const currentUserRank = currentUserEntry?.rank ?? null;

  return {
    entries,
    totalUsers: users.length,
    currentUserRank,
  };
}

// =============================================================================
// Team Analytics: Team Velocity
// =============================================================================

/**
 * Calculate team velocity (aggregate completions over time)
 * @param {Array} tasks - Array of all task objects
 * @param {Array} users - Array of all user objects
 * @param {{ start: Date, end: Date }} dateRange - Date range
 * @param {'day' | 'week'} aggregation - Aggregation level
 * @param {boolean} showByUser - Whether to include per-user breakdown
 * @returns {{ data: Array, totalInPeriod: number, insufficientData: boolean }}
 */
export function calculateTeamVelocity(tasks, users, dateRange, aggregation = 'day', showByUser = false) {
  const completedTasks = tasks.filter(
    (t) =>
      t.status === STATUSES.COMPLETED &&
      t.completedAt &&
      isDateInRange(t.completedAt, dateRange)
  );

  // Count completions by date
  const countByDate = new Map();
  const countByDateAndUser = new Map();

  completedTasks.forEach((task) => {
    const dateStr = toLocalDateString(task.completedAt);
    countByDate.set(dateStr, (countByDate.get(dateStr) || 0) + 1);

    if (showByUser) {
      const key = `${dateStr}:${task.userId}`;
      countByDateAndUser.set(key, (countByDateAndUser.get(key) || 0) + 1);
    }
  });

  // Generate data points for all dates in range
  const dates = getDateArray(dateRange);
  let data = [];

  if (aggregation === 'day') {
    data = dates.map((date) => {
      const dateStr = toLocalDateString(date);
      const point = {
        date: formatChartDate(date),
        fullDate: dateStr,
        count: countByDate.get(dateStr) || 0,
      };

      if (showByUser) {
        point.breakdown = {};
        users.forEach((user) => {
          const key = `${dateStr}:${user.id}`;
          point.breakdown[user.id] = countByDateAndUser.get(key) || 0;
        });
      }

      return point;
    });
  } else {
    // Weekly aggregation
    const weeklyData = new Map();
    const weeklyByUser = new Map();

    dates.forEach((date) => {
      const weekStart = getWeekStartDate(date);
      const weekKey = toLocalDateString(weekStart);
      const dateStr = toLocalDateString(date);

      const count = countByDate.get(dateStr) || 0;
      weeklyData.set(weekKey, (weeklyData.get(weekKey) || 0) + count);

      if (showByUser) {
        users.forEach((user) => {
          const userKey = `${dateStr}:${user.id}`;
          const weekUserKey = `${weekKey}:${user.id}`;
          const userCount = countByDateAndUser.get(userKey) || 0;
          weeklyByUser.set(weekUserKey, (weeklyByUser.get(weekUserKey) || 0) + userCount);
        });
      }
    });

    data = Array.from(weeklyData.entries()).map(([weekKey, count]) => {
      const point = {
        date: formatChartDate(new Date(weekKey)),
        fullDate: weekKey,
        count,
      };

      if (showByUser) {
        point.breakdown = {};
        users.forEach((user) => {
          const key = `${weekKey}:${user.id}`;
          point.breakdown[user.id] = weeklyByUser.get(key) || 0;
        });
      }

      return point;
    });
  }

  // Check if we have insufficient data (less than 7 days of data)
  const daysWithData = data.filter((d) => d.count > 0).length;
  const insufficientData = daysWithData < 7;

  return {
    data,
    totalInPeriod: completedTasks.length,
    insufficientData,
    userNames: showByUser
      ? users.reduce((acc, u) => {
        acc[u.id] = u.displayName || u.identifier;
        return acc;
      }, {})
      : null,
  };
}

// =============================================================================
// Team Analytics: Category Distribution by User
// =============================================================================

/**
 * Calculate category distribution per user
 * @param {Array} tasks - Array of all task objects
 * @param {Array} users - Array of all user objects
 * @returns {{ data: Array, teamTotals: { development: number, fix: number, support: number } }}
 */
export function calculateTeamCategoryDistribution(tasks, users) {
  // Initialize team totals
  const teamTotals = {
    [CATEGORIES.DEVELOPMENT]: 0,
    [CATEGORIES.FIX]: 0,
    [CATEGORIES.SUPPORT]: 0,
  };

  // Group tasks by user and category
  const categoryByUser = {};

  tasks.forEach((task) => {
    if (!categoryByUser[task.userId]) {
      categoryByUser[task.userId] = {
        [CATEGORIES.DEVELOPMENT]: 0,
        [CATEGORIES.FIX]: 0,
        [CATEGORIES.SUPPORT]: 0,
      };
    }

    if (CATEGORIES[task.category?.toUpperCase()]) {
      categoryByUser[task.userId][task.category]++;
      teamTotals[task.category]++;
    }
  });

  // Build data array including all users
  const data = users.map((user) => {
    const categories = categoryByUser[user.id] || {
      [CATEGORIES.DEVELOPMENT]: 0,
      [CATEGORIES.FIX]: 0,
      [CATEGORIES.SUPPORT]: 0,
    };

    const totalTasks =
      categories[CATEGORIES.DEVELOPMENT] +
      categories[CATEGORIES.FIX] +
      categories[CATEGORIES.SUPPORT];

    return {
      userId: user.id,
      userName: user.displayName || user.identifier,
      categories,
      totalTasks,
      // Calculate percentages for each category
      percentages: {
        [CATEGORIES.DEVELOPMENT]:
          totalTasks > 0
            ? Math.round((categories[CATEGORIES.DEVELOPMENT] / totalTasks) * 1000) / 10
            : 0,
        [CATEGORIES.FIX]:
          totalTasks > 0
            ? Math.round((categories[CATEGORIES.FIX] / totalTasks) * 1000) / 10
            : 0,
        [CATEGORIES.SUPPORT]:
          totalTasks > 0
            ? Math.round((categories[CATEGORIES.SUPPORT] / totalTasks) * 1000) / 10
            : 0,
      },
    };
  });

  // Sort by total tasks descending
  data.sort((a, b) => b.totalTasks - a.totalTasks);

  return {
    data,
    teamTotals,
  };
}
