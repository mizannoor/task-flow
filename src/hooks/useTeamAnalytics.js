/**
 * useTeamAnalytics Hook
 * Provides reactive team analytics data derived from all tasks and users
 * Subscribes to TaskContext and AuthContext, memoizes calculations
 */

import { useMemo, useState, useEffect, useCallback } from 'react';
import { useTasks } from './useTasks';
import { useAuth } from './useAuth';
import * as analyticsService from '../services/analyticsService';
import { getDateRange, getPreviousDateRange } from '../utils/dateUtils';
import {
  DATE_RANGES,
  TEAM_ANALYTICS_STORAGE_KEY,
  DEFAULT_TEAM_ANALYTICS_PREFERENCES,
  LEADERBOARD_SORT_FIELDS,
} from '../utils/constants';

/**
 * Load team analytics preferences from localStorage
 * @returns {object} - Preferences object
 */
function loadPreferences() {
  try {
    const saved = localStorage.getItem(TEAM_ANALYTICS_STORAGE_KEY);
    if (saved) {
      const prefs = JSON.parse(saved);
      return {
        ...DEFAULT_TEAM_ANALYTICS_PREFERENCES,
        ...prefs,
      };
    }
  } catch (e) {
    console.warn('Failed to load team analytics preferences:', e);
  }
  return DEFAULT_TEAM_ANALYTICS_PREFERENCES;
}

/**
 * Save team analytics preferences to localStorage
 * @param {object} prefs - Preferences to save
 */
function savePreferences(prefs) {
  try {
    localStorage.setItem(TEAM_ANALYTICS_STORAGE_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.warn('Failed to save team analytics preferences:', e);
  }
}

/**
 * Custom hook for team analytics data
 * Aggregates metrics across all users
 * @returns {object} - Team analytics data and controls
 */
export function useTeamAnalytics() {
  const { tasks, loading: tasksLoading } = useTasks();
  const { currentUser, users, loading: usersLoading } = useAuth();

  // Load saved preferences
  const [preferences, setPreferences] = useState(loadPreferences);

  // Extract state from preferences
  const dateRangeKey = preferences.selectedDateRange;
  const leaderboardSortField = preferences.leaderboardSortField;
  const leaderboardSortOrder = preferences.leaderboardSortOrder;
  const velocityAggregation = preferences.velocityAggregation;
  const velocityShowByUser = preferences.velocityShowByUser;
  const completionsComparisonEnabled = preferences.completionsComparisonEnabled;
  const categoryShowTeamTotals = preferences.categoryShowTeamTotals;

  // Update preference helper
  const updatePreference = useCallback((key, value) => {
    setPreferences((prev) => {
      const updated = { ...prev, [key]: value };
      savePreferences(updated);
      return updated;
    });
  }, []);

  // Get the resolved date range
  const dateRange = useMemo(() => getDateRange(dateRangeKey), [dateRangeKey]);

  // Get previous date range for comparison
  const previousDateRange = useMemo(() => {
    if (!completionsComparisonEnabled) return null;
    return getPreviousDateRange(dateRangeKey);
  }, [dateRangeKey, completionsComparisonEnabled]);

  // Filter tasks within date range (for date-sensitive metrics)
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // For completed tasks, use completedAt
      if (t.status === 'completed' && t.completedAt) {
        const completedDate = new Date(t.completedAt);
        return completedDate >= dateRange.start && completedDate <= dateRange.end;
      }
      // For other tasks, use createdAt
      const createdDate = new Date(t.createdAt);
      return createdDate >= dateRange.start && createdDate <= dateRange.end;
    });
  }, [tasks, dateRange]);

  // ==========================================================================
  // Team Metrics Calculations (memoized)
  // ==========================================================================

  // Team Workload Distribution
  const workload = useMemo(() => {
    try {
      return analyticsService.calculateTeamWorkload(filteredTasks, users);
    } catch (error) {
      console.error('Error calculating team workload:', error);
      return { hasError: true, errorMessage: 'Unable to calculate workload', fallbackDisplay: '—' };
    }
  }, [filteredTasks, users]);

  // Team Completions
  const completions = useMemo(() => {
    try {
      return analyticsService.calculateTeamCompletions(
        tasks, // Use all tasks for completion calculation
        users,
        dateRange,
        previousDateRange
      );
    } catch (error) {
      console.error('Error calculating team completions:', error);
      return { hasError: true, errorMessage: 'Unable to calculate completions', fallbackDisplay: '—' };
    }
  }, [tasks, users, dateRange, previousDateRange]);

  // Team Leaderboard
  const leaderboard = useMemo(() => {
    try {
      return analyticsService.calculateLeaderboard(
        tasks, // Use all tasks for accurate rankings
        users,
        currentUser?.id,
        leaderboardSortField,
        leaderboardSortOrder
      );
    } catch (error) {
      console.error('Error calculating leaderboard:', error);
      return { hasError: true, errorMessage: 'Unable to calculate leaderboard', fallbackDisplay: '—' };
    }
  }, [tasks, users, currentUser?.id, leaderboardSortField, leaderboardSortOrder]);

  // Team Velocity
  const velocity = useMemo(() => {
    try {
      return analyticsService.calculateTeamVelocity(
        tasks,
        users,
        dateRange,
        velocityAggregation,
        velocityShowByUser
      );
    } catch (error) {
      console.error('Error calculating team velocity:', error);
      return { hasError: true, errorMessage: 'Unable to calculate velocity', fallbackDisplay: '—' };
    }
  }, [tasks, users, dateRange, velocityAggregation, velocityShowByUser]);

  // Team Category Distribution
  const categoryDistribution = useMemo(() => {
    try {
      return analyticsService.calculateTeamCategoryDistribution(filteredTasks, users);
    } catch (error) {
      console.error('Error calculating category distribution:', error);
      return { hasError: true, errorMessage: 'Unable to calculate categories', fallbackDisplay: '—' };
    }
  }, [filteredTasks, users]);

  // ==========================================================================
  // Control Handlers
  // ==========================================================================

  const setDateRangeKey = useCallback(
    (newRange) => {
      if (Object.values(DATE_RANGES).includes(newRange)) {
        updatePreference('selectedDateRange', newRange);
      }
    },
    [updatePreference]
  );

  const setLeaderboardSortField = useCallback(
    (field) => {
      if (Object.values(LEADERBOARD_SORT_FIELDS).includes(field)) {
        updatePreference('leaderboardSortField', field);
      }
    },
    [updatePreference]
  );

  const toggleLeaderboardSortOrder = useCallback(() => {
    updatePreference('leaderboardSortOrder', leaderboardSortOrder === 'desc' ? 'asc' : 'desc');
  }, [leaderboardSortOrder, updatePreference]);

  const setVelocityAggregation = useCallback(
    (agg) => {
      if (agg === 'day' || agg === 'week') {
        updatePreference('velocityAggregation', agg);
      }
    },
    [updatePreference]
  );

  const toggleVelocityShowByUser = useCallback(() => {
    updatePreference('velocityShowByUser', !velocityShowByUser);
  }, [velocityShowByUser, updatePreference]);

  const toggleCompletionsComparison = useCallback(() => {
    updatePreference('completionsComparisonEnabled', !completionsComparisonEnabled);
  }, [completionsComparisonEnabled, updatePreference]);

  const toggleCategoryTeamTotals = useCallback(() => {
    updatePreference('categoryShowTeamTotals', !categoryShowTeamTotals);
  }, [categoryShowTeamTotals, updatePreference]);

  // ==========================================================================
  // Computed State
  // ==========================================================================

  const isLoading = tasksLoading || usersLoading;
  const isEmpty = users.length === 0 || tasks.length === 0;
  const isSingleUser = users.length === 1;
  const hasNoCompletedTasks = !completions.hasError && completions.totalCompleted === 0;

  return {
    // Data
    workload,
    completions,
    leaderboard,
    velocity,
    categoryDistribution,

    // Date Range Controls
    dateRangeKey,
    setDateRangeKey,
    dateRange,

    // Leaderboard Controls
    leaderboardSortField,
    setLeaderboardSortField,
    leaderboardSortOrder,
    toggleLeaderboardSortOrder,

    // Velocity Controls
    velocityAggregation,
    setVelocityAggregation,
    velocityShowByUser,
    toggleVelocityShowByUser,

    // Completions Controls
    completionsComparisonEnabled,
    toggleCompletionsComparison,

    // Category Controls
    categoryShowTeamTotals,
    toggleCategoryTeamTotals,

    // Meta/State
    isLoading,
    isEmpty,
    isSingleUser,
    hasNoCompletedTasks,
    userCount: users.length,
    taskCount: tasks.length,
    filteredTaskCount: filteredTasks.length,
    users, // Expose users for chart legends
  };
}

export default useTeamAnalytics;
