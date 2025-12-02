/**
 * Timer Service
 * Business logic for time tracking operations using Dexie.js
 */

import { db } from './db';
import { TIMER_CONSTANTS, STATUSES } from '../utils/constants';

// =============================================================================
// Timer Calculation Functions
// =============================================================================

/**
 * Calculate elapsed seconds for a task based on timer fields
 * Uses timestamp-based calculation for accuracy regardless of display performance
 * @param {object} task - Task object with timer fields
 * @returns {number} - Total elapsed seconds for the current session
 */
export function calculateElapsedSeconds(task) {
  if (!task || !task.timerStartedAt) {
    return 0;
  }

  const startTime = new Date(task.timerStartedAt).getTime();
  
  // If paused, use pause time as end; otherwise use current time
  const endTime = task.timerPausedAt
    ? new Date(task.timerPausedAt).getTime()
    : Date.now();

  // Calculate seconds from current timing segment
  const sessionSeconds = Math.max(0, Math.floor((endTime - startTime) / 1000));
  
  // Add any accumulated time from previous pause/resume cycles
  const accumulatedSeconds = (task.accumulatedDuration || 0) * 60;

  return sessionSeconds + accumulatedSeconds;
}

/**
 * Calculate elapsed minutes for a task (rounded down)
 * @param {object} task - Task object with timer fields
 * @returns {number} - Total elapsed minutes
 */
export function calculateElapsedMinutes(task) {
  return Math.floor(calculateElapsedSeconds(task) / 60);
}

/**
 * Check if a session duration exceeds the long session threshold (4 hours)
 * @param {number} elapsedMinutes - The elapsed time in minutes
 * @returns {boolean} - True if session exceeds threshold
 */
export function isLongSession(elapsedMinutes) {
  return elapsedMinutes >= TIMER_CONSTANTS.LONG_SESSION_THRESHOLD_MINUTES;
}

// =============================================================================
// Timer Query Functions
// =============================================================================

/**
 * Get task with active timer for a specific user
 * @param {string} userId - The user ID
 * @returns {Promise<object | null>} - Task with active timer or null
 */
export async function getActiveTimerTask(userId) {
  if (!userId) {
    return null;
  }

  // Find task where timerStartedAt is set (not null) for this user
  const tasks = await db.tasks
    .where('userId')
    .equals(userId)
    .filter((task) => task.timerStartedAt !== null)
    .toArray();

  // Should only be one active timer per user, but return first if multiple
  return tasks.length > 0 ? tasks[0] : null;
}

/**
 * Check if any timer is running for a user
 * @param {string} userId - The user ID
 * @returns {Promise<boolean>} - True if any timer is active
 */
export async function hasActiveTimer(userId) {
  const activeTask = await getActiveTimerTask(userId);
  return activeTask !== null;
}

// =============================================================================
// Timer Control Functions
// =============================================================================

/**
 * Start timer on a task
 * @param {string} taskId - The task ID
 * @returns {Promise<object>} - Updated task object
 * @throws {Error} - If task not found or not in-progress
 */
export async function startTaskTimer(taskId) {
  const task = await db.tasks.get(taskId);
  
  if (!task) {
    throw new Error('Task not found');
  }

  if (task.status !== STATUSES.IN_PROGRESS) {
    throw new Error('Timer can only be started on tasks that are in progress');
  }

  // Already running? Just return the task
  if (task.timerStartedAt && !task.timerPausedAt) {
    return task;
  }

  const now = new Date();

  await db.tasks.update(taskId, {
    timerStartedAt: now,
    timerPausedAt: null,
    accumulatedDuration: 0,
    updatedAt: now,
  });

  return db.tasks.get(taskId);
}

/**
 * Pause timer on a task
 * @param {string} taskId - The task ID
 * @returns {Promise<object>} - Updated task object
 * @throws {Error} - If task not found or timer not running
 */
export async function pauseTaskTimer(taskId) {
  const task = await db.tasks.get(taskId);

  if (!task) {
    throw new Error('Task not found');
  }

  if (!task.timerStartedAt) {
    throw new Error('No timer is running on this task');
  }

  if (task.timerPausedAt) {
    // Already paused, just return
    return task;
  }

  const now = new Date();
  
  // Calculate elapsed time since timer started and add to accumulated
  const elapsedMinutes = calculateElapsedMinutes(task);
  const newAccumulated = elapsedMinutes;

  await db.tasks.update(taskId, {
    timerPausedAt: now,
    accumulatedDuration: newAccumulated,
    updatedAt: now,
  });

  return db.tasks.get(taskId);
}

/**
 * Resume a paused timer
 * @param {string} taskId - The task ID
 * @returns {Promise<object>} - Updated task object
 * @throws {Error} - If task not found or timer not paused
 */
export async function resumeTaskTimer(taskId) {
  const task = await db.tasks.get(taskId);

  if (!task) {
    throw new Error('Task not found');
  }

  if (!task.timerStartedAt || !task.timerPausedAt) {
    throw new Error('Timer is not paused on this task');
  }

  const now = new Date();

  await db.tasks.update(taskId, {
    timerStartedAt: now,
    timerPausedAt: null,
    // Keep accumulatedDuration as-is
    updatedAt: now,
  });

  return db.tasks.get(taskId);
}

/**
 * Stop timer and save tracked time to actualDuration
 * @param {string} taskId - The task ID
 * @param {number} [adjustedMinutes] - Optional adjusted minutes (for long session review)
 * @returns {Promise<object>} - Updated task object with new actualDuration
 * @throws {Error} - If task not found or no timer to stop
 */
export async function stopTaskTimer(taskId, adjustedMinutes = null) {
  const task = await db.tasks.get(taskId);

  if (!task) {
    throw new Error('Task not found');
  }

  if (!task.timerStartedAt) {
    throw new Error('No timer is running on this task');
  }

  // Calculate session time
  const elapsedMinutes = calculateElapsedMinutes(task);
  
  // Use adjusted time if provided (from long session review), otherwise use calculated
  const minutesToAdd = adjustedMinutes !== null 
    ? Math.max(0, Math.min(adjustedMinutes, elapsedMinutes)) // Clamp to 0..elapsed
    : elapsedMinutes;

  const now = new Date();
  const newActualDuration = (task.actualDuration || 0) + minutesToAdd;

  await db.tasks.update(taskId, {
    actualDuration: newActualDuration,
    timerStartedAt: null,
    timerPausedAt: null,
    accumulatedDuration: 0,
    updatedAt: now,
  });

  return db.tasks.get(taskId);
}

/**
 * Discard timer without saving (for abandoned sessions user wants to discard)
 * @param {string} taskId - The task ID
 * @returns {Promise<object>} - Updated task object
 */
export async function discardTaskTimer(taskId) {
  const task = await db.tasks.get(taskId);

  if (!task) {
    throw new Error('Task not found');
  }

  const now = new Date();

  await db.tasks.update(taskId, {
    timerStartedAt: null,
    timerPausedAt: null,
    accumulatedDuration: 0,
    updatedAt: now,
  });

  return db.tasks.get(taskId);
}

/**
 * Add manual time entry to a task
 * @param {string} taskId - The task ID
 * @param {number} minutes - Minutes to add
 * @returns {Promise<object>} - Updated task object
 * @throws {Error} - If task not found or minutes invalid
 */
export async function addManualTimeEntry(taskId, minutes) {
  if (minutes <= 0 || isNaN(minutes)) {
    throw new Error('Minutes must be a positive number');
  }

  const task = await db.tasks.get(taskId);

  if (!task) {
    throw new Error('Task not found');
  }

  const now = new Date();
  const newActualDuration = (task.actualDuration || 0) + Math.floor(minutes);

  await db.tasks.update(taskId, {
    actualDuration: newActualDuration,
    updatedAt: now,
  });

  return db.tasks.get(taskId);
}

// =============================================================================
// Timer Status Helpers
// =============================================================================

/**
 * Get timer status for a task
 * @param {object} task - Task object
 * @returns {'idle' | 'running' | 'paused'} - Timer status
 */
export function getTimerStatus(task) {
  if (!task || !task.timerStartedAt) {
    return 'idle';
  }

  if (task.timerPausedAt) {
    return 'paused';
  }

  return 'running';
}

/**
 * Check if timer can be started on a task
 * @param {object} task - Task object
 * @returns {boolean} - True if timer can be started
 */
export function canStartTimer(task) {
  return task && task.status === STATUSES.IN_PROGRESS;
}

/**
 * Check if timer can be paused on a task
 * @param {object} task - Task object
 * @returns {boolean} - True if timer can be paused
 */
export function canPauseTimer(task) {
  return task && task.timerStartedAt && !task.timerPausedAt;
}

/**
 * Check if timer can be resumed on a task
 * @param {object} task - Task object
 * @returns {boolean} - True if timer can be resumed
 */
export function canResumeTimer(task) {
  return task && task.timerStartedAt && task.timerPausedAt;
}

/**
 * Check if timer can be stopped on a task
 * @param {object} task - Task object
 * @returns {boolean} - True if timer can be stopped
 */
export function canStopTimer(task) {
  return task && task.timerStartedAt;
}
