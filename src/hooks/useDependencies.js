/**
 * useDependencies Hook
 * Provides dependency management functionality to React components
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useTasks } from './useTasks';
import * as dependencyService from '../services/dependencyService';
import {
  getDependencyInfo,
  buildDependencyMap,
  getUpstreamDependencies,
  getDownstreamDependencies,
  formatCyclePath,
} from '../utils/dependencyUtils';
import { STATUSES } from '../utils/constants';

/**
 * Hook for managing task dependencies
 * @param {string} [taskId] - Optional task ID for task-specific dependency info
 * @returns {object} - Dependencies state and actions
 */
export function useDependencies(taskId = null) {
  const { currentUser } = useAuth();
  const { tasks } = useTasks();

  // State
  const [dependencies, setDependencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load all dependencies on mount
  useEffect(() => {
    loadDependencies();
  }, []);

  /**
   * Load all dependencies from IndexedDB
   */
  const loadDependencies = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const allDeps = await dependencyService.getAllDependencies();
      setDependencies(allDeps);
    } catch (err) {
      console.error('Failed to load dependencies:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refresh dependencies from database
   */
  const refresh = useCallback(async () => {
    await loadDependencies();
  }, [loadDependencies]);

  /**
   * Clear current error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Computed: Build dependency map for all tasks
  const dependencyMap = useMemo(() => {
    return buildDependencyMap(dependencies, tasks);
  }, [dependencies, tasks]);

  // Computed: Current task's dependency info (if taskId provided)
  const currentTaskInfo = useMemo(() => {
    if (!taskId) {
      return {
        isBlocked: false,
        blockedBy: [],
        blockedByIds: [],
        blocks: [],
        blocksIds: [],
        dependencyStatus: null,
        dependencyCount: 0,
      };
    }

    return getDependencyInfo(taskId, dependencies, tasks);
  }, [taskId, dependencies, tasks]);

  // Destructure current task info for convenience
  const {
    isBlocked,
    blockedBy,
    blockedByIds,
    blocks,
    blocksIds,
    dependencyStatus,
    dependencyCount,
  } = currentTaskInfo;

  /**
   * Add a new dependency
   * @param {string} blockingTaskId - Task that will block the current task
   * @returns {Promise<object>} - Created dependency
   */
  const addDependency = useCallback(
    async (blockingTaskId) => {
      if (!taskId) {
        throw new Error('No task ID provided to useDependencies');
      }

      setLoading(true);
      setError(null);

      try {
        const dep = await dependencyService.createDependency({
          dependentTaskId: taskId,
          blockingTaskId,
          createdBy: currentUser?.id,
        });

        // Update local state
        setDependencies((prev) => [...prev, dep]);

        return dep;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [taskId, currentUser]
  );

  /**
   * Remove a dependency
   * @param {string} dependencyId - ID of the dependency to remove
   * @returns {Promise<void>}
   */
  const removeDependency = useCallback(async (dependencyId) => {
    setLoading(true);
    setError(null);

    try {
      await dependencyService.deleteDependency(dependencyId);

      // Update local state
      setDependencies((prev) => prev.filter((d) => d.id !== dependencyId));
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Check if a dependency can be added (pre-validation)
   * @param {string} blockingTaskId - Proposed blocking task
   * @returns {Promise<{ valid: boolean, reason?: string, message?: string, path?: string[] }>}
   */
  const canAddDependency = useCallback(
    async (blockingTaskId) => {
      if (!taskId) {
        return { valid: false, reason: 'no_task', message: 'No task ID provided' };
      }

      // Self-reference check
      if (taskId === blockingTaskId) {
        return { valid: false, reason: 'self', message: 'A task cannot depend on itself' };
      }

      // Duplicate check
      const exists = dependencies.some(
        (d) => d.dependentTaskId === taskId && d.blockingTaskId === blockingTaskId
      );
      if (exists) {
        return { valid: false, reason: 'duplicate', message: 'This dependency already exists' };
      }

      // Limit check
      const count = dependencies.filter((d) => d.dependentTaskId === taskId).length;
      if (count >= 10) {
        return {
          valid: false,
          reason: 'limit',
          message: 'Maximum of 10 dependencies per task reached',
        };
      }

      // Circular check
      const cycleCheck = await dependencyService.wouldCreateCycle(taskId, blockingTaskId);
      if (cycleCheck.wouldCycle) {
        return {
          valid: false,
          reason: 'circular',
          message: 'This would create a circular dependency',
          path: cycleCheck.path,
        };
      }

      return { valid: true };
    },
    [taskId, dependencies]
  );

  /**
   * Get list of tasks that can be added as dependencies
   * Filters out: self, already-dependencies, tasks that would create cycles
   * @returns {Promise<object[]>} - Array of eligible tasks
   */
  const getAvailableTasks = useCallback(async () => {
    if (!taskId) {
      return [];
    }

    // Start with all tasks except self
    const available = tasks.filter((t) => t.id !== taskId);

    // Filter out tasks that are already dependencies
    const existingBlockerIds = dependencies
      .filter((d) => d.dependentTaskId === taskId)
      .map((d) => d.blockingTaskId);

    const filtered = available.filter((t) => !existingBlockerIds.includes(t.id));

    // Check circular dependencies for remaining tasks
    const result = [];
    for (const task of filtered) {
      const cycleCheck = await dependencyService.wouldCreateCycle(taskId, task.id);
      if (!cycleCheck.wouldCycle) {
        result.push(task);
      }
    }

    return result;
  }, [taskId, tasks, dependencies]);

  /**
   * Get tasks that can be added as dependencies (sync version using cached data)
   * Less accurate but doesn't require async call
   * @returns {object[]} - Array of potentially eligible tasks
   */
  const getAvailableTasksSync = useMemo(() => {
    if (!taskId) {
      return [];
    }

    // Start with all tasks except self
    const available = tasks.filter((t) => t.id !== taskId);

    // Filter out tasks that are already dependencies
    const existingBlockerIds = dependencies
      .filter((d) => d.dependentTaskId === taskId)
      .map((d) => d.blockingTaskId);

    return available.filter((t) => !existingBlockerIds.includes(t.id));
  }, [taskId, tasks, dependencies]);

  /**
   * Get dependency info for any task
   * @param {string} targetTaskId - The task ID to get info for
   * @returns {object} - Dependency info
   */
  const getDependencyInfoForTask = useCallback(
    (targetTaskId) => {
      return dependencyMap[targetTaskId] || {
        isBlocked: false,
        blockedBy: [],
        blockedByIds: [],
        blocks: [],
        blocksIds: [],
        dependencyStatus: null,
        dependencyCount: 0,
      };
    },
    [dependencyMap]
  );

  /**
   * Get upstream dependency chain for current task
   * @returns {Array} - Array of upstream tasks with depth info
   */
  const getUpstreamChain = useCallback(() => {
    if (!taskId) return [];
    return getUpstreamDependencies(taskId, dependencies, tasks);
  }, [taskId, dependencies, tasks]);

  /**
   * Get downstream dependency chain for current task
   * @returns {Array} - Array of downstream tasks with depth info
   */
  const getDownstreamChain = useCallback(() => {
    if (!taskId) return [];
    return getDownstreamDependencies(taskId, dependencies, tasks);
  }, [taskId, dependencies, tasks]);

  /**
   * Format a cycle path for display
   * @param {string[]} path - Array of task IDs in the cycle
   * @returns {string} - Formatted string
   */
  const formatCyclePathForDisplay = useCallback(
    (path) => {
      return formatCyclePath(path, tasks);
    },
    [tasks]
  );

  /**
   * Check if a task is blocked
   * @param {string} targetTaskId - Task ID to check
   * @returns {boolean} - True if task is blocked
   */
  const isTaskBlocked = useCallback(
    (targetTaskId) => {
      const info = dependencyMap[targetTaskId];
      return info?.isBlocked || false;
    },
    [dependencyMap]
  );

  /**
   * Get blockers for a task
   * @param {string} targetTaskId - Task ID
   * @returns {object[]} - Array of incomplete blocking tasks
   */
  const getBlockersForTask = useCallback(
    (targetTaskId) => {
      const info = dependencyMap[targetTaskId];
      return info?.blockedBy || [];
    },
    [dependencyMap]
  );

  return {
    // State
    dependencies,
    loading,
    error,

    // Computed for current task
    isBlocked,
    blockedBy,
    blockedByIds,
    blocks,
    blocksIds,
    dependencyStatus,
    dependencyCount,

    // Actions
    addDependency,
    removeDependency,
    refresh,
    clearError,

    // Utilities
    canAddDependency,
    getAvailableTasks,
    getAvailableTasksSync,
    getDependencyInfoForTask,
    getUpstreamChain,
    getDownstreamChain,
    formatCyclePathForDisplay,
    isTaskBlocked,
    getBlockersForTask,

    // Map for batch access
    dependencyMap,
  };
}

export default useDependencies;
