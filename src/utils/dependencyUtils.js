/**
 * Dependency Utilities
 * Helper functions for task dependency management including circular detection
 */

import { STATUSES } from './constants';

/**
 * Detect if adding a dependency would create a circular reference
 * Uses Depth-First Search (DFS) algorithm to traverse the dependency graph
 *
 * @param {string} dependentTaskId - The task that would be blocked
 * @param {string} blockingTaskId - The task that would block
 * @param {Array} allDependencies - All existing dependency records
 * @returns {{ wouldCycle: boolean, path?: string[] }} - Whether it would cycle and the path if so
 */
export function detectCycle(dependentTaskId, blockingTaskId, allDependencies) {
  // If trying to add A depends on B, we need to check if B already depends on A
  // (directly or indirectly through a chain)
  // We traverse from blockingTaskId and see if we can reach dependentTaskId

  const visited = new Set();
  const path = [];

  function dfs(currentId) {
    // If we reach the dependentTaskId, we've found a cycle
    if (currentId === dependentTaskId) {
      return true;
    }

    // If already visited, no cycle through this path
    if (visited.has(currentId)) {
      return false;
    }

    visited.add(currentId);
    path.push(currentId);

    // Find all tasks that currentId depends on (where currentId is dependent)
    const dependencies = allDependencies.filter((d) => d.dependentTaskId === currentId);

    for (const dep of dependencies) {
      if (dfs(dep.blockingTaskId)) {
        return true;
      }
    }

    path.pop();
    return false;
  }

  const wouldCycle = dfs(blockingTaskId);

  if (wouldCycle) {
    // Build the cycle path for error messaging
    return {
      wouldCycle: true,
      path: [...path, dependentTaskId],
    };
  }

  return { wouldCycle: false };
}

/**
 * Calculate if a task is blocked based on its dependencies
 *
 * @param {string} taskId - The task ID to check
 * @param {Array} dependencies - All dependency records
 * @param {Array} tasks - All task records
 * @returns {{ isBlocked: boolean, blockedBy: Array, blockedByIds: string[] }}
 */
export function calculateBlockedStatus(taskId, dependencies, tasks) {
  // Find all dependencies where this task is the dependent
  const taskDependencies = dependencies.filter((d) => d.dependentTaskId === taskId);

  if (taskDependencies.length === 0) {
    return {
      isBlocked: false,
      blockedBy: [],
      blockedByIds: [],
    };
  }

  // Get the blocking tasks that are not completed
  const blockedByIds = taskDependencies.map((d) => d.blockingTaskId);
  const blockedBy = tasks.filter(
    (t) => blockedByIds.includes(t.id) && t.status !== STATUSES.COMPLETED
  );

  return {
    isBlocked: blockedBy.length > 0,
    blockedBy,
    blockedByIds,
  };
}

/**
 * Calculate what tasks this task blocks
 *
 * @param {string} taskId - The task ID to check
 * @param {Array} dependencies - All dependency records
 * @param {Array} tasks - All task records
 * @returns {{ blocks: Array, blocksIds: string[] }}
 */
export function calculateBlocksStatus(taskId, dependencies, tasks) {
  // Find all dependencies where this task is the blocker
  const blocking = dependencies.filter((d) => d.blockingTaskId === taskId);

  if (blocking.length === 0) {
    return {
      blocks: [],
      blocksIds: [],
    };
  }

  const blocksIds = blocking.map((d) => d.dependentTaskId);
  const blocks = tasks.filter((t) => blocksIds.includes(t.id));

  return {
    blocks,
    blocksIds,
  };
}

/**
 * Get the full dependency status for a task
 *
 * @param {string} taskId - The task ID
 * @param {Array} dependencies - All dependency records
 * @param {Array} tasks - All task records
 * @returns {object} - Complete dependency info
 */
export function getDependencyInfo(taskId, dependencies, tasks) {
  const { isBlocked, blockedBy, blockedByIds } = calculateBlockedStatus(taskId, dependencies, tasks);
  const { blocks, blocksIds } = calculateBlocksStatus(taskId, dependencies, tasks);

  // Determine dependency status
  let dependencyStatus = null;
  if (isBlocked) {
    dependencyStatus = 'blocked';
  } else if (blocks.length > 0) {
    dependencyStatus = 'blocking';
  } else if (blockedByIds.length > 0 && !isBlocked) {
    // Has dependencies but all are completed
    dependencyStatus = 'ready';
  }

  return {
    isBlocked,
    blockedBy,
    blockedByIds,
    blocks,
    blocksIds,
    dependencyStatus,
    dependencyCount: blockedByIds.length,
  };
}

/**
 * Build a map of dependency info for all tasks
 *
 * @param {Array} dependencies - All dependency records
 * @param {Array} tasks - All task records
 * @returns {Object} - Map of taskId -> dependency info
 */
export function buildDependencyMap(dependencies, tasks) {
  const map = {};

  for (const task of tasks) {
    map[task.id] = getDependencyInfo(task.id, dependencies, tasks);
  }

  return map;
}

/**
 * Get upstream dependencies (all tasks that block this task, recursively)
 *
 * @param {string} taskId - The task ID
 * @param {Array} dependencies - All dependency records
 * @param {Array} tasks - All task records
 * @param {Set} visited - Already visited task IDs (for cycle prevention)
 * @returns {Array} - Array of upstream tasks with depth info
 */
export function getUpstreamDependencies(taskId, dependencies, tasks, visited = new Set()) {
  if (visited.has(taskId)) {
    return [];
  }
  visited.add(taskId);

  const result = [];
  const directDeps = dependencies.filter((d) => d.dependentTaskId === taskId);

  for (const dep of directDeps) {
    const blockingTask = tasks.find((t) => t.id === dep.blockingTaskId);
    if (blockingTask) {
      result.push({
        task: blockingTask,
        depth: 1,
        dependencyId: dep.id,
      });

      // Recursively get upstream of the blocking task
      const upstream = getUpstreamDependencies(dep.blockingTaskId, dependencies, tasks, visited);
      for (const up of upstream) {
        result.push({
          ...up,
          depth: up.depth + 1,
        });
      }
    }
  }

  return result;
}

/**
 * Get downstream dependencies (all tasks blocked by this task, recursively)
 *
 * @param {string} taskId - The task ID
 * @param {Array} dependencies - All dependency records
 * @param {Array} tasks - All task records
 * @param {Set} visited - Already visited task IDs (for cycle prevention)
 * @returns {Array} - Array of downstream tasks with depth info
 */
export function getDownstreamDependencies(taskId, dependencies, tasks, visited = new Set()) {
  if (visited.has(taskId)) {
    return [];
  }
  visited.add(taskId);

  const result = [];
  const blocking = dependencies.filter((d) => d.blockingTaskId === taskId);

  for (const dep of blocking) {
    const dependentTask = tasks.find((t) => t.id === dep.dependentTaskId);
    if (dependentTask) {
      result.push({
        task: dependentTask,
        depth: 1,
        dependencyId: dep.id,
      });

      // Recursively get downstream of the dependent task
      const downstream = getDownstreamDependencies(dep.dependentTaskId, dependencies, tasks, visited);
      for (const down of downstream) {
        result.push({
          ...down,
          depth: down.depth + 1,
        });
      }
    }
  }

  return result;
}

/**
 * Format cycle path for user-friendly error message
 *
 * @param {string[]} path - Array of task IDs in the cycle
 * @param {Array} tasks - All task records
 * @returns {string} - Formatted cycle string like "Task A → Task B → Task C → Task A"
 */
export function formatCyclePath(path, tasks) {
  const taskNames = path.map((id) => {
    const task = tasks.find((t) => t.id === id);
    return task ? task.taskName : id;
  });

  // Add the first task at the end to show the complete cycle
  if (taskNames.length > 0) {
    taskNames.push(taskNames[0]);
  }

  return taskNames.join(' → ');
}
