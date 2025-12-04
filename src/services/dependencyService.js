/**
 * Dependency Service
 * CRUD operations for task dependencies in IndexedDB
 */

import { db } from './db';
import { v4 as uuidv4 } from 'uuid';
import { getTaskById } from './taskService';
import {
  DEPENDENCY_ERROR_CODES,
  DEPENDENCY_ERROR_MESSAGES,
  DEPENDENCY_LIMITS,
} from '../utils/constants';
import { detectCycle } from '../utils/dependencyUtils';

// =============================================================================
// Error Types
// =============================================================================

/**
 * Custom error class for dependency-related errors
 */
export class DependencyError extends Error {
  /**
   * @param {string} code - Error code from DEPENDENCY_ERROR_CODES
   * @param {string} [message] - Custom error message (uses default if not provided)
   * @param {object} [details] - Additional error details (e.g., cycle path)
   */
  constructor(code, message, details = {}) {
    super(message || DEPENDENCY_ERROR_MESSAGES[code] || 'Unknown dependency error');
    this.name = 'DependencyError';
    this.code = code;
    this.details = details;
  }
}

// =============================================================================
// Validation Functions
// =============================================================================

/**
 * Validate that a dependency can be created
 * @param {string} dependentTaskId - Task that will be blocked
 * @param {string} blockingTaskId - Task that blocks
 * @throws {DependencyError} If validation fails
 */
async function validateDependency(dependentTaskId, blockingTaskId) {
  // 1. Self-reference check
  if (dependentTaskId === blockingTaskId) {
    throw new DependencyError(DEPENDENCY_ERROR_CODES.SELF_REFERENCE);
  }

  // 2. Task existence check
  const [dependentTask, blockingTask] = await Promise.all([
    getTaskById(dependentTaskId),
    getTaskById(blockingTaskId),
  ]);

  if (!dependentTask || !blockingTask) {
    throw new DependencyError(DEPENDENCY_ERROR_CODES.TASK_NOT_FOUND);
  }

  // 3. Duplicate check
  const existingDep = await db.dependencies
    .where('[dependentTaskId+blockingTaskId]')
    .equals([dependentTaskId, blockingTaskId])
    .first();

  if (existingDep) {
    throw new DependencyError(DEPENDENCY_ERROR_CODES.DUPLICATE);
  }

  // 4. Limit check
  const currentCount = await db.dependencies
    .where('dependentTaskId')
    .equals(dependentTaskId)
    .count();

  if (currentCount >= DEPENDENCY_LIMITS.MAX_DEPENDENCIES_PER_TASK) {
    throw new DependencyError(DEPENDENCY_ERROR_CODES.LIMIT_EXCEEDED);
  }

  // 5. Circular dependency check
  const allDependencies = await db.dependencies.toArray();
  const cycleCheck = detectCycle(dependentTaskId, blockingTaskId, allDependencies);

  if (cycleCheck.wouldCycle) {
    throw new DependencyError(
      DEPENDENCY_ERROR_CODES.CIRCULAR,
      DEPENDENCY_ERROR_MESSAGES[DEPENDENCY_ERROR_CODES.CIRCULAR],
      { path: cycleCheck.path }
    );
  }
}

// =============================================================================
// CRUD Operations
// =============================================================================

/**
 * Create a new dependency relationship between two tasks
 * @param {object} input - Dependency creation input
 * @param {string} input.dependentTaskId - Task that will be blocked
 * @param {string} input.blockingTaskId - Task that blocks
 * @param {string} input.createdBy - User ID creating the dependency
 * @returns {Promise<object>} - The created dependency record
 * @throws {DependencyError} If validation fails
 */
export async function createDependency({ dependentTaskId, blockingTaskId, createdBy }) {
  // Validate before creating
  await validateDependency(dependentTaskId, blockingTaskId);

  const dependency = {
    id: uuidv4(),
    dependentTaskId,
    blockingTaskId,
    createdBy,
    createdAt: new Date(),
  };

  await db.dependencies.add(dependency);
  return dependency;
}

/**
 * Delete a single dependency relationship
 * @param {string} dependencyId - ID of the dependency to remove
 * @returns {Promise<void>}
 * @throws {DependencyError} If dependency not found
 */
export async function deleteDependency(dependencyId) {
  const existing = await db.dependencies.get(dependencyId);
  if (!existing) {
    throw new DependencyError(DEPENDENCY_ERROR_CODES.NOT_FOUND);
  }

  await db.dependencies.delete(dependencyId);
}

/**
 * Get all dependencies where the specified task is the dependent (what blocks this task)
 * @param {string} taskId - ID of the dependent task
 * @returns {Promise<object[]>} - Array of dependency records
 */
export async function getDependenciesForTask(taskId) {
  return db.dependencies.where('dependentTaskId').equals(taskId).toArray();
}

/**
 * Get all dependencies where the specified task is the blocker (what this task blocks)
 * @param {string} taskId - ID of the blocking task
 * @returns {Promise<object[]>} - Array of dependency records
 */
export async function getTasksBlockedBy(taskId) {
  return db.dependencies.where('blockingTaskId').equals(taskId).toArray();
}

/**
 * Get all dependency records in the database
 * @returns {Promise<object[]>} - Array of all dependency records
 */
export async function getAllDependencies() {
  return db.dependencies.toArray();
}

/**
 * Get the count of dependencies for a task (where task is dependent)
 * @param {string} taskId - ID of the dependent task
 * @returns {Promise<number>} - Count of dependencies
 */
export async function getDependencyCount(taskId) {
  return db.dependencies.where('dependentTaskId').equals(taskId).count();
}

/**
 * Check if adding a dependency would create a circular reference
 * @param {string} dependentTaskId - Proposed dependent task
 * @param {string} blockingTaskId - Proposed blocking task
 * @returns {Promise<{ wouldCycle: boolean, path?: string[] }>}
 */
export async function wouldCreateCycle(dependentTaskId, blockingTaskId) {
  const allDependencies = await db.dependencies.toArray();
  return detectCycle(dependentTaskId, blockingTaskId, allDependencies);
}

/**
 * Delete all dependencies involving a task (both as dependent and blocker)
 * Used when deleting a task to maintain referential integrity
 * @param {string} taskId - ID of the task being deleted
 * @returns {Promise<{ deletedCount: number }>} - Count of deleted dependencies
 */
export async function deleteDependenciesForTask(taskId) {
  let deletedCount = 0;

  await db.transaction('rw', db.dependencies, async () => {
    // Delete where task is dependent
    const dependentCount = await db.dependencies
      .where('dependentTaskId')
      .equals(taskId)
      .delete();

    // Delete where task is blocker
    const blockingCount = await db.dependencies
      .where('blockingTaskId')
      .equals(taskId)
      .delete();

    deletedCount = dependentCount + blockingCount;
  });

  return { deletedCount };
}

/**
 * Check if a dependency exists between two tasks
 * @param {string} dependentTaskId - The dependent task ID
 * @param {string} blockingTaskId - The blocking task ID
 * @returns {Promise<boolean>} - True if dependency exists
 */
export async function dependencyExists(dependentTaskId, blockingTaskId) {
  const count = await db.dependencies
    .where('[dependentTaskId+blockingTaskId]')
    .equals([dependentTaskId, blockingTaskId])
    .count();

  return count > 0;
}

/**
 * Get a dependency by its ID
 * @param {string} dependencyId - The dependency ID
 * @returns {Promise<object | undefined>} - The dependency record or undefined
 */
export async function getDependencyById(dependencyId) {
  return db.dependencies.get(dependencyId);
}

/**
 * Get dependency between two specific tasks
 * @param {string} dependentTaskId - The dependent task ID
 * @param {string} blockingTaskId - The blocking task ID
 * @returns {Promise<object | undefined>} - The dependency record or undefined
 */
export async function getDependencyByTasks(dependentTaskId, blockingTaskId) {
  return db.dependencies
    .where('[dependentTaskId+blockingTaskId]')
    .equals([dependentTaskId, blockingTaskId])
    .first();
}
