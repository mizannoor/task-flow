/**
 * Task Service
 * CRUD operations for task data storage using Dexie.js
 */

import { db } from './db';
import { v4 as uuidv4 } from 'uuid';
import { TASK_DEFAULTS, STATUSES } from '../utils/constants';
import * as timerService from './timerService';
import * as dependencyService from './dependencyService';

/**
 * Create a new task in the database
 * @param {object} input - Task creation input
 * @param {string} input.taskName - Required task name
 * @param {string} input.userId - User ID to assign task to
 * @param {string} input.createdBy - User ID who created the task
 * @param {string} [input.description] - Task description
 * @param {number} [input.complexity] - Task complexity (1-10)
 * @param {string} [input.priority] - Task priority
 * @param {string} [input.category] - Task category
 * @param {string[]} [input.tags] - Task tags
 * @param {number} [input.estimatedDuration] - Estimated duration in minutes
 * @param {Date|null} [input.deadline] - Task deadline
 * @returns {Promise<object>} - The created task object
 */
export async function createTask(input) {
  const now = new Date();

  const task = {
    id: uuidv4(),
    userId: input.userId,
    createdBy: input.createdBy,
    taskName: input.taskName.trim(),
    description: input.description?.trim() || '',
    complexity: input.complexity ?? TASK_DEFAULTS.COMPLEXITY,
    priority: input.priority || TASK_DEFAULTS.PRIORITY,
    category: input.category || TASK_DEFAULTS.CATEGORY,
    tags: input.tags || [],
    estimatedDuration: input.estimatedDuration ?? TASK_DEFAULTS.ESTIMATED_DURATION,
    actualDuration: 0,
    status: TASK_DEFAULTS.STATUS,
    deadline: input.deadline || null,
    createdAt: now,
    updatedAt: now,
    completedAt: null,
  };

  await db.tasks.add(task);
  return task;
}

/**
 * Get a task by its ID
 * @param {string} id - The task ID
 * @returns {Promise<object | undefined>} - The task object or undefined
 */
export async function getTaskById(id) {
  return db.tasks.get(id);
}

/**
 * Get all tasks assigned to a specific user
 * @param {string} userId - The user ID
 * @returns {Promise<object[]>} - Array of task objects
 */
export async function getTasksByUser(userId) {
  return db.tasks.where('userId').equals(userId).toArray();
}

/**
 * Get all tasks created by a specific user
 * @param {string} createdBy - The creator user ID
 * @returns {Promise<object[]>} - Array of task objects
 */
export async function getTasksByCreator(createdBy) {
  return db.tasks.where('createdBy').equals(createdBy).toArray();
}

/**
 * Get all tasks in the database
 * @returns {Promise<object[]>} - Array of all task objects
 */
export async function getAllTasks() {
  return db.tasks.toArray();
}

/**
 * Get tasks by status
 * @param {string} status - The status to filter by
 * @returns {Promise<object[]>} - Array of task objects
 */
export async function getTasksByStatus(status) {
  return db.tasks.where('status').equals(status).toArray();
}

/**
 * Get tasks by priority
 * @param {string} priority - The priority to filter by
 * @returns {Promise<object[]>} - Array of task objects
 */
export async function getTasksByPriority(priority) {
  return db.tasks.where('priority').equals(priority).toArray();
}

/**
 * Get tasks by category
 * @param {string} category - The category to filter by
 * @returns {Promise<object[]>} - Array of task objects
 */
export async function getTasksByCategory(category) {
  return db.tasks.where('category').equals(category).toArray();
}

/**
 * Update a task's information
 * @param {string} id - The task ID
 * @param {object} updates - The fields to update
 * @returns {Promise<object>} - The updated task object
 */
export async function updateTask(id, updates) {
  const now = new Date();
  const updateData = {
    ...updates,
    updatedAt: now,
  };

  // Handle task name trimming
  if (updates.taskName !== undefined) {
    updateData.taskName = updates.taskName.trim();
  }

  // Handle description trimming
  if (updates.description !== undefined) {
    updateData.description = updates.description?.trim() || '';
  }

  // Handle status change to completed
  if (updates.status === STATUSES.COMPLETED) {
    updateData.completedAt = now;
  }

  // Clear completedAt if reopening task
  if (updates.status && updates.status !== STATUSES.COMPLETED) {
    const existingTask = await getTaskById(id);
    if (existingTask?.status === STATUSES.COMPLETED) {
      updateData.completedAt = null;
    }
  }

  await db.tasks.update(id, updateData);
  return db.tasks.get(id);
}

/**
 * Start a task (change status to in-progress)
 * @param {string} id - The task ID
 * @returns {Promise<object>} - The updated task object
 */
export async function startTask(id) {
  return updateTask(id, { status: STATUSES.IN_PROGRESS });
}

/**
 * Complete a task (change status to completed)
 * Auto-stops any active timer and saves tracked time
 * @param {string} id - The task ID
 * @returns {Promise<object>} - The updated task object
 */
export async function completeTask(id) {
  // Check if task has an active timer and stop it first
  const task = await getTaskById(id);
  if (task?.timerStartedAt) {
    await timerService.stopTaskTimer(id);
  }

  return updateTask(id, { status: STATUSES.COMPLETED });
}

/**
 * Reopen a task (change status back to pending)
 * @param {string} id - The task ID
 * @returns {Promise<object>} - The updated task object
 */
export async function reopenTask(id) {
  return updateTask(id, { status: STATUSES.PENDING });
}

/**
 * Delete a task from the database
 * Discards any active timer without saving
 * Cascades deletion to all associated dependencies
 * @param {string} id - The task ID
 * @returns {Promise<void>}
 */
export async function deleteTask(id) {
  // If task has active timer, discard it (don't save)
  const task = await getTaskById(id);
  if (task?.timerStartedAt) {
    await timerService.discardTaskTimer(id);
  }

  // Cascade delete all dependencies involving this task
  await dependencyService.deleteDependenciesForTask(id);

  return db.tasks.delete(id);
}

/**
 * Delete all tasks for a specific user
 * @param {string} userId - The user ID
 * @returns {Promise<number>} - The number of deleted tasks
 */
export async function deleteTasksByUser(userId) {
  return db.tasks.where('userId').equals(userId).delete();
}

/**
 * Get the count of tasks for a user
 * @param {string} userId - The user ID
 * @returns {Promise<number>} - The count of tasks
 */
export async function getTaskCountByUser(userId) {
  return db.tasks.where('userId').equals(userId).count();
}

/**
 * Get the count of all tasks
 * @returns {Promise<number>} - The total count of tasks
 */
export async function getTaskCount() {
  return db.tasks.count();
}

/**
 * Check if a task exists
 * @param {string} id - The task ID
 * @returns {Promise<boolean>} - True if task exists
 */
export async function taskExists(id) {
  const task = await getTaskById(id);
  return !!task;
}

/**
 * Bulk create tasks
 * @param {object[]} tasks - Array of task objects to create
 * @returns {Promise<string[]>} - Array of created task IDs
 */
export async function bulkCreateTasks(tasks) {
  const now = new Date();
  const tasksToAdd = tasks.map((input) => ({
    id: uuidv4(),
    userId: input.userId,
    createdBy: input.createdBy,
    taskName: input.taskName.trim(),
    description: input.description?.trim() || '',
    complexity: input.complexity ?? TASK_DEFAULTS.COMPLEXITY,
    priority: input.priority || TASK_DEFAULTS.PRIORITY,
    category: input.category || TASK_DEFAULTS.CATEGORY,
    tags: input.tags || [],
    estimatedDuration: input.estimatedDuration ?? TASK_DEFAULTS.ESTIMATED_DURATION,
    actualDuration: 0,
    status: TASK_DEFAULTS.STATUS,
    deadline: input.deadline || null,
    createdAt: now,
    updatedAt: now,
    completedAt: null,
  }));

  await db.tasks.bulkAdd(tasksToAdd);
  return tasksToAdd.map((t) => t.id);
}

/**
 * Bulk delete tasks
 * @param {string[]} ids - Array of task IDs to delete
 * @returns {Promise<void>}
 */
export async function bulkDeleteTasks(ids) {
  return db.tasks.bulkDelete(ids);
}
