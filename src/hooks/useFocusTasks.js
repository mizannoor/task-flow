/**
 * useFocusTasks Hook
 * Selection algorithm and progress calculation for Today's Focus View
 */

import { useMemo, useState, useCallback } from 'react';
import { useTasks } from './useTasks';
import { useAuth } from './useAuth';
import {
  FOCUS_VIEW_MAX_TASKS,
  FOCUS_VIEW_TIERS,
  FOCUS_TIER_LABELS,
  STATUSES,
  HIGH_PRIORITY_VALUES,
} from '../utils/constants';

// =============================================================================
// Date Utilities
// =============================================================================

/**
 * Get today's date at midnight (local timezone)
 * @returns {Date} - Today's date at 00:00:00.000
 */
function getTodayMidnight() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/**
 * Get a date normalized to midnight (local timezone)
 * @param {Date|string|null} date - The date to normalize
 * @returns {Date|null} - Date at midnight or null
 */
function getDateAtMidnight(date) {
  if (!date) return null;
  const d = date instanceof Date ? new Date(date) : new Date(date);
  if (isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Check if a date is today
 * @param {Date|null} date - The date to check (already at midnight)
 * @param {Date} today - Today's date at midnight
 * @returns {boolean}
 */
function isToday(date, today) {
  if (!date) return false;
  return date.getTime() === today.getTime();
}

/**
 * Check if a date falls within today (for completedAt comparison)
 * @param {Date|string|null} date - The date to check
 * @param {Date} today - Today's date at midnight
 * @returns {boolean}
 */
function isCompletedToday(date, today) {
  if (!date) return false;
  const dateAtMidnight = getDateAtMidnight(date);
  if (!dateAtMidnight) return false;
  return dateAtMidnight.getTime() === today.getTime();
}

// =============================================================================
// Task Classification
// =============================================================================

/**
 * Classify a task into a selection tier
 * @param {object} task - The task to classify
 * @param {Date} today - Today's date at midnight
 * @returns {number|null} - Tier number (1-4) or null if doesn't qualify
 */
function classifyTask(task, today) {
  // Never include completed tasks
  if (task.status === STATUSES.COMPLETED) {
    return null;
  }

  const deadlineDay = getDateAtMidnight(task.deadline);

  // Tier 1: Overdue (deadline < today)
  if (deadlineDay && deadlineDay < today) {
    return FOCUS_VIEW_TIERS.OVERDUE;
  }

  // Tier 2: Due Today (deadline === today)
  if (deadlineDay && deadlineDay.getTime() === today.getTime()) {
    return FOCUS_VIEW_TIERS.DUE_TODAY;
  }

  // Tier 3: In Progress (any status in-progress, not already in tier 1-2)
  if (task.status === STATUSES.IN_PROGRESS) {
    return FOCUS_VIEW_TIERS.IN_PROGRESS;
  }

  // Tier 4: High/Urgent Priority (pending only, not already in tier 1-3)
  if (task.status === STATUSES.PENDING && HIGH_PRIORITY_VALUES.includes(task.priority)) {
    return FOCUS_VIEW_TIERS.HIGH_PRIORITY;
  }

  // Does not qualify for Focus View
  return null;
}

/**
 * Get tier label for a tier number
 * @param {number|null} tier - Tier number
 * @returns {string} - Human-readable label
 */
function getTierLabel(tier) {
  return FOCUS_TIER_LABELS[tier] || 'Unknown';
}

// =============================================================================
// Task Selection Algorithm
// =============================================================================

/**
 * Select and sort focus tasks using the priority algorithm
 * @param {object[]} tasks - All tasks from TaskContext
 * @param {string} userId - Current user ID
 * @param {Date} today - Today's date at midnight
 * @param {number} limit - Maximum tasks to return
 * @param {number} offset - Offset for pagination
 * @returns {object} - { focusTasks, allQualifying, hasMore }
 */
function selectFocusTasks(tasks, userId, today, limit = FOCUS_VIEW_MAX_TASKS, offset = 0) {
  // Step 1: Filter to current user's tasks
  const userTasks = tasks.filter(task => task.userId === userId);

  // Step 2: Classify each task and filter out non-qualifying
  const classified = userTasks
    .map(task => {
      const tier = classifyTask(task, today);
      if (tier === null) return null;
      return {
        ...task,
        selectionTier: tier,
        tierLabel: getTierLabel(tier),
      };
    })
    .filter(Boolean);

  // Step 3: Sort by tier, then deadline (nulls last), then createdAt (oldest first)
  const sorted = classified.sort((a, b) => {
    // Primary: tier (lower tier = higher priority)
    if (a.selectionTier !== b.selectionTier) {
      return a.selectionTier - b.selectionTier;
    }

    // Secondary: deadline (earliest first, nulls last)
    const aDeadline = getDateAtMidnight(a.deadline);
    const bDeadline = getDateAtMidnight(b.deadline);

    if (aDeadline && bDeadline) {
      const diff = aDeadline.getTime() - bDeadline.getTime();
      if (diff !== 0) return diff;
    } else if (aDeadline && !bDeadline) {
      return -1; // a has deadline, b doesn't -> a first
    } else if (!aDeadline && bDeadline) {
      return 1; // b has deadline, a doesn't -> b first
    }

    // Tertiary: createdAt (oldest first)
    const aCreated = new Date(a.createdAt).getTime();
    const bCreated = new Date(b.createdAt).getTime();
    return aCreated - bCreated;
  });

  // Step 4: Slice for pagination
  const focusTasks = sorted.slice(offset, offset + limit);
  const hasMore = sorted.length > offset + limit;

  return {
    focusTasks,
    allQualifying: sorted,
    hasMore,
  };
}

// =============================================================================
// Progress Calculation
// =============================================================================

/**
 * Calculate daily progress statistics
 * @param {object[]} tasks - All tasks from TaskContext
 * @param {string} userId - Current user ID
 * @param {Date} today - Today's date at midnight
 * @returns {object} - DailyProgress object
 */
function calculateDailyProgress(tasks, userId, today) {
  // Filter to current user's tasks
  const userTasks = tasks.filter(task => task.userId === userId);

  // Count tasks completed today
  const completedToday = userTasks.filter(task =>
    task.status === STATUSES.COMPLETED &&
    isCompletedToday(task.completedAt, today)
  ).length;

  // Count total qualifying tasks (would qualify if not completed)
  // This includes tasks that:
  // 1. Are currently in focus view (not completed, qualify for a tier)
  // 2. Were completed today (were qualifying before completion)
  const currentlyQualifying = userTasks.filter(task => {
    const tier = classifyTask(task, today);
    return tier !== null;
  }).length;

  // For total qualifying, we add completed today to currently qualifying
  // because they were part of today's focus before completion
  const totalQualifying = currentlyQualifying + completedToday;

  // Remaining is just currently qualifying
  const remainingTasks = currentlyQualifying;

  // Calculate completion percentage
  const completionPercentage = totalQualifying > 0
    ? Math.round((completedToday / totalQualifying) * 100)
    : 0;

  return {
    date: today,
    completedToday,
    totalQualifying,
    remainingTasks,
    completionPercentage,
  };
}

// =============================================================================
// Hook Export
// =============================================================================

/**
 * useFocusTasks - Custom hook for Today's Focus View
 * Provides task selection, progress tracking, and load more functionality
 * @returns {object} - { focusTasks, progress, hasMore, loadMore, loading, error }
 */
export function useFocusTasks() {
  const { tasks, loading, error } = useTasks();
  const { currentUser } = useAuth();
  const [offset, setOffset] = useState(0);

  // Memoize today's midnight to avoid recalculation
  const today = useMemo(() => getTodayMidnight(), []);

  // Memoize selection and progress calculation
  const result = useMemo(() => {
    if (!currentUser) {
      return {
        focusTasks: [],
        progress: null,
        hasMore: false,
      };
    }

    const { focusTasks, hasMore } = selectFocusTasks(
      tasks,
      currentUser.id,
      today,
      FOCUS_VIEW_MAX_TASKS,
      offset
    );

    const progress = calculateDailyProgress(tasks, currentUser.id, today);

    return {
      focusTasks,
      progress: {
        ...progress,
        hasMoreTasks: hasMore,
      },
      hasMore,
    };
  }, [tasks, currentUser, today, offset]);

  // Load more handler - resets to show next batch
  const loadMore = useCallback(() => {
    setOffset(prev => prev + FOCUS_VIEW_MAX_TASKS);
  }, []);

  // Reset offset when tasks change significantly
  // (This could be enhanced to detect when to reset)

  return {
    focusTasks: result.focusTasks,
    progress: result.progress,
    hasMore: result.hasMore,
    loadMore,
    loading,
    error,
  };
}

export default useFocusTasks;
