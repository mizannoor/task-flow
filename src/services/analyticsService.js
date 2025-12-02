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
