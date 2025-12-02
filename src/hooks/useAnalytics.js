/**
 * useAnalytics Hook
 * Provides reactive analytics data derived from tasks
 * Subscribes to TaskContext and memoizes calculations
 */

import { useMemo, useState, useEffect, useCallback } from 'react';
import { useTasks } from './useTasks';
import { useAuth } from './useAuth';
import * as analyticsService from '../services/analyticsService';
import { getDateRange, isDateInRange } from '../utils/dateUtils';
import {
  DATE_RANGES,
  ANALYTICS_STORAGE_KEY,
  DEFAULT_ANALYTICS_PREFERENCES,
} from '../utils/constants';

/**
 * Load analytics preferences from localStorage
 * @returns {object} - Preferences object
 */
function loadPreferences() {
  try {
    const saved = localStorage.getItem(ANALYTICS_STORAGE_KEY);
    if (saved) {
      const prefs = JSON.parse(saved);
      return {
        ...DEFAULT_ANALYTICS_PREFERENCES,
        ...prefs,
      };
    }
  } catch (e) {
    console.warn('Failed to load analytics preferences:', e);
  }
  return DEFAULT_ANALYTICS_PREFERENCES;
}

/**
 * Save analytics preferences to localStorage
 * @param {object} prefs - Preferences to save
 */
function savePreferences(prefs) {
  try {
    localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(prefs));
  } catch (e) {
    console.warn('Failed to save analytics preferences:', e);
  }
}

/**
 * Custom hook for analytics data
 * @returns {object} - Analytics data and controls
 */
export function useAnalytics() {
  const { tasks, loading } = useTasks();
  const { currentUser } = useAuth();

  // Load saved date range preference
  const [dateRangeKey, setDateRangeKey] = useState(() => {
    return loadPreferences().selectedDateRange;
  });

  // Velocity aggregation toggle (day/week)
  const [velocityAggregation, setVelocityAggregation] = useState('day');

  // Persist date range preference when it changes
  useEffect(() => {
    savePreferences({ selectedDateRange: dateRangeKey });
  }, [dateRangeKey]);

  // Filter tasks for current user only
  const userTasks = useMemo(() => {
    if (!currentUser?.id) return [];
    return tasks.filter((t) => t.userId === currentUser.id);
  }, [tasks, currentUser?.id]);

  // Get the resolved date range
  const dateRange = useMemo(() => getDateRange(dateRangeKey), [dateRangeKey]);

  // Filter tasks by date range (using completedAt for completed, createdAt for others)
  const filteredTasks = useMemo(() => {
    return userTasks.filter((t) => {
      // For completed tasks, use completedAt
      if (t.status === 'completed' && t.completedAt) {
        return isDateInRange(t.completedAt, dateRange);
      }
      // For other tasks, use createdAt
      return isDateInRange(t.createdAt, dateRange);
    });
  }, [userTasks, dateRange]);

  // Calculate all analytics metrics
  const summary = useMemo(
    () => analyticsService.calculateTaskSummary(userTasks),
    [userTasks]
  );

  const streak = useMemo(
    () => analyticsService.calculateStreak(userTasks),
    [userTasks]
  );

  const accuracy = useMemo(
    () => analyticsService.calculateEstimationAccuracy(filteredTasks),
    [filteredTasks]
  );

  const categoryDistribution = useMemo(
    () => analyticsService.calculateCategoryDistribution(filteredTasks),
    [filteredTasks]
  );

  const complexityDistribution = useMemo(
    () => analyticsService.calculateComplexityDistribution(filteredTasks),
    [filteredTasks]
  );

  const velocity = useMemo(
    () => analyticsService.calculateVelocity(filteredTasks, dateRange, velocityAggregation),
    [filteredTasks, dateRange, velocityAggregation]
  );

  const timeTracked = useMemo(
    () => analyticsService.calculateTimeTracked(filteredTasks, dateRange),
    [filteredTasks, dateRange]
  );

  // Handler to change date range
  const handleDateRangeChange = useCallback((newRange) => {
    if (Object.values(DATE_RANGES).includes(newRange)) {
      setDateRangeKey(newRange);
    }
  }, []);

  // Handler to toggle velocity aggregation
  const toggleVelocityAggregation = useCallback(() => {
    setVelocityAggregation((prev) => (prev === 'day' ? 'week' : 'day'));
  }, []);

  return {
    // Lifetime stats (not filtered by date)
    summary,
    streak,

    // Date-filtered metrics
    accuracy,
    categoryDistribution,
    complexityDistribution,
    velocity,
    timeTracked,

    // State and controls
    dateRange,
    dateRangeKey,
    setDateRangeKey: handleDateRangeChange,
    velocityAggregation,
    toggleVelocityAggregation,

    // Meta
    isLoading: loading,
    isEmpty: userTasks.length === 0,
    filteredCount: filteredTasks.length,
  };
}

export default useAnalytics;
