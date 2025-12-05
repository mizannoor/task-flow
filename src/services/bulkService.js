/**
 * Bulk Operations Service
 * Batch operations for tasks using Dexie.js transactions
 * Ensures atomic all-or-nothing semantics for bulk actions
 */

import { db } from './db';
import { STATUSES } from '../utils/constants';

// =============================================================================
// Bulk Delete Operations
// =============================================================================

/**
 * Delete multiple tasks and their dependencies in a single transaction
 * @param {string[]} taskIds - Array of task IDs to delete
 * @returns {Promise<{success: boolean, affectedCount: number, error?: string}>}
 */
export async function bulkDeleteTasks(taskIds) {
  if (!taskIds || taskIds.length === 0) {
    return { success: true, affectedCount: 0 };
  }

  try {
    const affectedCount = await db.transaction('rw', db.tasks, db.dependencies, async () => {
      // Delete dependencies where these tasks are the dependent (blocked by others)
      await db.dependencies
        .where('dependentTaskId')
        .anyOf(taskIds)
        .delete();

      // Delete dependencies where these tasks are blocking others
      await db.dependencies
        .where('blockingTaskId')
        .anyOf(taskIds)
        .delete();

      // Delete the tasks themselves
      await db.tasks.bulkDelete(taskIds);

      return taskIds.length;
    });

    return { success: true, affectedCount };
  } catch (error) {
    console.error('Bulk delete failed:', error);
    return {
      success: false,
      affectedCount: 0,
      error: error.message || 'Failed to delete tasks'
    };
  }
}

// =============================================================================
// Bulk Status Operations
// =============================================================================

/**
 * Update status for multiple tasks
 * @param {string[]} taskIds - Array of task IDs to update
 * @param {string} newStatus - New status value (pending, in-progress, completed)
 * @param {Object} [options] - Optional settings
 * @param {boolean} [options.skipBlocked] - Skip tasks that are blocked by dependencies
 * @returns {Promise<{success: boolean, affectedCount: number, skippedCount: number, skippedTaskIds: string[], error?: string}>}
 */
export async function bulkUpdateStatus(taskIds, newStatus, options = {}) {
  if (!taskIds || taskIds.length === 0) {
    return { success: true, affectedCount: 0, skippedCount: 0, skippedTaskIds: [] };
  }

  const { skipBlocked = false } = options;

  try {
    const result = await db.transaction('rw', db.tasks, db.dependencies, async () => {
      const now = new Date();
      let affectedCount = 0;
      let skippedCount = 0;
      const skippedTaskIds = [];

      // Get blocked task IDs if we need to skip them
      let blockedTaskIds = new Set();
      if (skipBlocked && newStatus === STATUSES.IN_PROGRESS) {
        blockedTaskIds = await getBlockedTaskIdsSet(taskIds);
      }

      for (const taskId of taskIds) {
        // Skip blocked tasks if requested
        if (skipBlocked && blockedTaskIds.has(taskId)) {
          skippedCount++;
          skippedTaskIds.push(taskId);
          continue;
        }

        const updates = {
          status: newStatus,
          updatedAt: now,
        };

        // Handle completedAt timestamp
        if (newStatus === STATUSES.COMPLETED) {
          updates.completedAt = now;
        } else {
          updates.completedAt = null;
        }

        await db.tasks.update(taskId, updates);
        affectedCount++;
      }

      return { affectedCount, skippedCount, skippedTaskIds };
    });

    return { success: true, ...result };
  } catch (error) {
    console.error('Bulk status update failed:', error);
    return {
      success: false,
      affectedCount: 0,
      skippedCount: 0,
      skippedTaskIds: [],
      error: error.message || 'Failed to update task status'
    };
  }
}

// =============================================================================
// Bulk Reassign Operations
// =============================================================================

/**
 * Reassign multiple tasks to a different user
 * @param {string[]} taskIds - Array of task IDs to reassign
 * @param {string} newUserId - ID of the user to assign tasks to
 * @returns {Promise<{success: boolean, affectedCount: number, error?: string}>}
 */
export async function bulkReassignTasks(taskIds, newUserId) {
  if (!taskIds || taskIds.length === 0) {
    return { success: true, affectedCount: 0 };
  }

  if (!newUserId) {
    return { success: false, affectedCount: 0, error: 'User ID is required' };
  }

  try {
    const affectedCount = await db.transaction('rw', db.tasks, async () => {
      const now = new Date();

      for (const taskId of taskIds) {
        await db.tasks.update(taskId, {
          userId: newUserId,
          updatedAt: now,
        });
      }

      return taskIds.length;
    });

    return { success: true, affectedCount };
  } catch (error) {
    console.error('Bulk reassign failed:', error);
    return {
      success: false,
      affectedCount: 0,
      error: error.message || 'Failed to reassign tasks'
    };
  }
}

// =============================================================================
// Bulk Tag Operations
// =============================================================================

/**
 * Add tags to multiple tasks (additive, doesn't remove existing tags)
 * @param {string[]} taskIds - Array of task IDs to modify
 * @param {string[]} tagsToAdd - Array of tags to add
 * @returns {Promise<{success: boolean, affectedCount: number, error?: string}>}
 */
export async function bulkAddTags(taskIds, tagsToAdd) {
  if (!taskIds || taskIds.length === 0) {
    return { success: true, affectedCount: 0 };
  }

  if (!tagsToAdd || tagsToAdd.length === 0) {
    return { success: true, affectedCount: 0 };
  }

  // Clean and validate tags
  const cleanedTags = tagsToAdd
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);

  if (cleanedTags.length === 0) {
    return { success: true, affectedCount: 0 };
  }

  try {
    const affectedCount = await db.transaction('rw', db.tasks, async () => {
      const now = new Date();
      let count = 0;

      for (const taskId of taskIds) {
        const task = await db.tasks.get(taskId);
        if (task) {
          // Merge existing tags with new tags (deduplicated)
          const existingTags = task.tags || [];
          const mergedTags = [...new Set([...existingTags, ...cleanedTags])];

          await db.tasks.update(taskId, {
            tags: mergedTags,
            updatedAt: now,
          });
          count++;
        }
      }

      return count;
    });

    return { success: true, affectedCount };
  } catch (error) {
    console.error('Bulk add tags failed:', error);
    return {
      success: false,
      affectedCount: 0,
      error: error.message || 'Failed to add tags'
    };
  }
}

/**
 * Remove tags from multiple tasks
 * @param {string[]} taskIds - Array of task IDs to modify
 * @param {string[]} tagsToRemove - Array of tags to remove
 * @returns {Promise<{success: boolean, affectedCount: number, error?: string}>}
 */
export async function bulkRemoveTags(taskIds, tagsToRemove) {
  if (!taskIds || taskIds.length === 0) {
    return { success: true, affectedCount: 0 };
  }

  if (!tagsToRemove || tagsToRemove.length === 0) {
    return { success: true, affectedCount: 0 };
  }

  const tagsToRemoveSet = new Set(tagsToRemove.map(tag => tag.trim().toLowerCase()));

  try {
    const affectedCount = await db.transaction('rw', db.tasks, async () => {
      const now = new Date();
      let count = 0;

      for (const taskId of taskIds) {
        const task = await db.tasks.get(taskId);
        if (task && task.tags && task.tags.length > 0) {
          const filteredTags = task.tags.filter(
            tag => !tagsToRemoveSet.has(tag.toLowerCase())
          );

          // Only update if tags actually changed
          if (filteredTags.length !== task.tags.length) {
            await db.tasks.update(taskId, {
              tags: filteredTags,
              updatedAt: now,
            });
            count++;
          }
        }
      }

      return count;
    });

    return { success: true, affectedCount };
  } catch (error) {
    console.error('Bulk remove tags failed:', error);
    return {
      success: false,
      affectedCount: 0,
      error: error.message || 'Failed to remove tags'
    };
  }
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get a Set of task IDs that are blocked by incomplete dependencies
 * @param {string[]} taskIds - Array of task IDs to check
 * @returns {Promise<Set<string>>} Set of blocked task IDs
 */
async function getBlockedTaskIdsSet(taskIds) {
  const blockedIds = new Set();

  // Get all dependencies where these tasks are dependent on others
  const dependencies = await db.dependencies
    .where('dependentTaskId')
    .anyOf(taskIds)
    .toArray();

  if (dependencies.length === 0) {
    return blockedIds;
  }

  // Get all blocking task IDs
  const blockingTaskIds = [...new Set(dependencies.map(d => d.blockingTaskId))];

  // Get the blocking tasks
  const blockingTasks = await db.tasks
    .where('id')
    .anyOf(blockingTaskIds)
    .toArray();

  // Create map of task ID to completion status
  const taskCompletionMap = new Map();
  for (const task of blockingTasks) {
    taskCompletionMap.set(task.id, task.status === STATUSES.COMPLETED);
  }

  // For each dependency, check if the blocking task is incomplete
  for (const dep of dependencies) {
    const isBlockingComplete = taskCompletionMap.get(dep.blockingTaskId);
    if (isBlockingComplete === false) {
      blockedIds.add(dep.dependentTaskId);
    }
  }

  return blockedIds;
}

/**
 * Get blocked task IDs with their blocking task info
 * @param {string[]} taskIds - Array of task IDs to check
 * @returns {Promise<Array<{taskId: string, taskName: string, blockedByCount: number}>>}
 */
export async function getBlockedTasksInfo(taskIds) {
  const blockedTasksInfo = [];

  // Get all dependencies where these tasks are dependent on others
  const dependencies = await db.dependencies
    .where('dependentTaskId')
    .anyOf(taskIds)
    .toArray();

  if (dependencies.length === 0) {
    return blockedTasksInfo;
  }

  // Get all blocking task IDs
  const blockingTaskIds = [...new Set(dependencies.map(d => d.blockingTaskId))];

  // Get the blocking tasks to check their status
  const blockingTasks = await db.tasks
    .where('id')
    .anyOf(blockingTaskIds)
    .toArray();

  // Create map of incomplete blocking tasks
  const incompleteBlockingIds = new Set();
  for (const task of blockingTasks) {
    if (task.status !== STATUSES.COMPLETED) {
      incompleteBlockingIds.add(task.id);
    }
  }

  // Group dependencies by dependent task
  const dependencyMap = new Map();
  for (const dep of dependencies) {
    if (incompleteBlockingIds.has(dep.blockingTaskId)) {
      if (!dependencyMap.has(dep.dependentTaskId)) {
        dependencyMap.set(dep.dependentTaskId, []);
      }
      dependencyMap.get(dep.dependentTaskId).push(dep.blockingTaskId);
    }
  }

  // Get the dependent tasks to get their names
  const blockedTaskIds = [...dependencyMap.keys()];
  if (blockedTaskIds.length === 0) {
    return blockedTasksInfo;
  }

  const blockedTasks = await db.tasks
    .where('id')
    .anyOf(blockedTaskIds)
    .toArray();

  for (const task of blockedTasks) {
    const blockingIds = dependencyMap.get(task.id) || [];
    blockedTasksInfo.push({
      taskId: task.id,
      taskName: task.taskName,
      blockedByCount: blockingIds.length,
    });
  }

  return blockedTasksInfo;
}

/**
 * Get all unique tags from a set of tasks
 * @param {string[]} taskIds - Array of task IDs
 * @returns {Promise<string[]>} Array of unique tags
 */
export async function getTagsFromTasks(taskIds) {
  if (!taskIds || taskIds.length === 0) {
    return [];
  }

  const tasks = await db.tasks
    .where('id')
    .anyOf(taskIds)
    .toArray();

  const allTags = new Set();
  for (const task of tasks) {
    if (task.tags && task.tags.length > 0) {
      for (const tag of task.tags) {
        allTags.add(tag);
      }
    }
  }

  return [...allTags].sort();
}
