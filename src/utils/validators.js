/**
 * Identifier Validation Functions
 * Validates and processes user identifiers (email, username, phone)
 */

import { PATTERNS, IDENTIFIER_LIMITS, ERROR_MESSAGES, IDENTIFIER_TYPES } from './constants';
import {
  TASK_LIMITS,
  TASK_ERROR_MESSAGES,
  PRIORITIES,
  CATEGORIES,
  STATUSES,
  TIMER_CONSTANTS,
  TIMER_ERROR_MESSAGES,
} from './constants';

/**
 * Detect the type of identifier based on its format
 * @param {string} identifier - The identifier to analyze
 * @returns {'email' | 'username' | 'phone' | null} - The detected type
 */
export function detectIdentifierType(identifier) {
  const trimmed = identifier?.trim();

  if (!trimmed) {
    return null;
  }

  // Check for email (contains @)
  if (trimmed.includes('@')) {
    return IDENTIFIER_TYPES.EMAIL;
  }

  // Check for phone (starts with + or is all digits)
  if (/^\+?\d+$/.test(trimmed)) {
    return IDENTIFIER_TYPES.PHONE;
  }

  // Default to username
  return IDENTIFIER_TYPES.USERNAME;
}

/**
 * Validate an identifier based on its detected or specified type
 * @param {string} identifier - The identifier to validate
 * @returns {{ isValid: boolean, type: string | null, error: string | null }}
 */
export function validateIdentifier(identifier) {
  const trimmed = identifier?.trim();

  // Check for empty input
  if (!trimmed) {
    return {
      isValid: false,
      type: null,
      error: ERROR_MESSAGES.IDENTIFIER_REQUIRED,
    };
  }

  // Check length constraints
  if (trimmed.length < IDENTIFIER_LIMITS.MIN_LENGTH) {
    return {
      isValid: false,
      type: null,
      error: ERROR_MESSAGES.IDENTIFIER_TOO_SHORT,
    };
  }

  if (trimmed.length > IDENTIFIER_LIMITS.MAX_LENGTH) {
    return {
      isValid: false,
      type: null,
      error: ERROR_MESSAGES.IDENTIFIER_TOO_LONG,
    };
  }

  // Detect type and validate accordingly
  const type = detectIdentifierType(trimmed);

  switch (type) {
    case IDENTIFIER_TYPES.EMAIL:
      return PATTERNS.EMAIL.test(trimmed)
        ? { isValid: true, type, error: null }
        : { isValid: false, type, error: ERROR_MESSAGES.INVALID_EMAIL };

    case IDENTIFIER_TYPES.PHONE:
      return PATTERNS.PHONE.test(trimmed)
        ? { isValid: true, type, error: null }
        : { isValid: false, type, error: ERROR_MESSAGES.INVALID_PHONE };

    case IDENTIFIER_TYPES.USERNAME:
    default:
      return PATTERNS.USERNAME.test(trimmed)
        ? { isValid: true, type: IDENTIFIER_TYPES.USERNAME, error: null }
        : { isValid: false, type: IDENTIFIER_TYPES.USERNAME, error: ERROR_MESSAGES.INVALID_USERNAME };
  }
}

/**
 * Derive a display name from an identifier
 * @param {string} identifier - The user's identifier
 * @param {'email' | 'username' | 'phone'} type - The type of identifier
 * @returns {string} - The derived display name
 */
export function deriveDisplayName(identifier, type) {
  const trimmed = identifier?.trim();

  if (!trimmed) {
    return 'User';
  }

  switch (type) {
    case IDENTIFIER_TYPES.EMAIL:
      // Use the part before @ as display name
      return trimmed.split('@')[0];

    case IDENTIFIER_TYPES.PHONE:
      // Mask phone number, showing only last 4 digits
      return `User ***${trimmed.slice(-4)}`;

    case IDENTIFIER_TYPES.USERNAME:
    default:
      // Use the username as-is
      return trimmed;
  }
}

/**
 * Normalize an identifier for consistent storage and comparison
 * @param {string} identifier - The identifier to normalize
 * @returns {string} - The normalized identifier
 */
export function normalizeIdentifier(identifier) {
  return identifier?.trim().toLowerCase() || '';
}

// =============================================================================
// Task Validation Functions
// =============================================================================

/**
 * Validate task name
 * @param {string} taskName - The task name to validate
 * @returns {{ isValid: boolean, error: string | null }}
 */
export function validateTaskName(taskName) {
  const trimmed = taskName?.trim();

  if (!trimmed) {
    return { isValid: false, error: TASK_ERROR_MESSAGES.NAME_REQUIRED };
  }

  if (trimmed.length < TASK_LIMITS.NAME_MIN_LENGTH) {
    return { isValid: false, error: TASK_ERROR_MESSAGES.NAME_TOO_SHORT };
  }

  if (trimmed.length > TASK_LIMITS.NAME_MAX_LENGTH) {
    return { isValid: false, error: TASK_ERROR_MESSAGES.NAME_TOO_LONG };
  }

  return { isValid: true, error: null };
}

/**
 * Validate task description
 * @param {string} description - The description to validate
 * @returns {{ isValid: boolean, error: string | null }}
 */
export function validateTaskDescription(description) {
  if (!description) {
    return { isValid: true, error: null }; // Optional field
  }

  if (description.length > TASK_LIMITS.DESCRIPTION_MAX_LENGTH) {
    return { isValid: false, error: TASK_ERROR_MESSAGES.DESCRIPTION_TOO_LONG };
  }

  return { isValid: true, error: null };
}

/**
 * Validate task complexity
 * @param {number} complexity - The complexity value to validate
 * @returns {{ isValid: boolean, error: string | null }}
 */
export function validateTaskComplexity(complexity) {
  if (complexity === undefined || complexity === null) {
    return { isValid: true, error: null }; // Optional field, will use default
  }

  const num = Number(complexity);
  if (
    isNaN(num) ||
    !Number.isInteger(num) ||
    num < TASK_LIMITS.COMPLEXITY_MIN ||
    num > TASK_LIMITS.COMPLEXITY_MAX
  ) {
    return { isValid: false, error: TASK_ERROR_MESSAGES.INVALID_COMPLEXITY };
  }

  return { isValid: true, error: null };
}

/**
 * Validate task estimated duration
 * @param {number} duration - The duration in minutes to validate
 * @returns {{ isValid: boolean, error: string | null }}
 */
export function validateTaskDuration(duration) {
  if (duration === undefined || duration === null) {
    return { isValid: true, error: null }; // Optional field, will use default
  }

  const num = Number(duration);
  if (
    isNaN(num) ||
    !Number.isInteger(num) ||
    num < TASK_LIMITS.DURATION_MIN ||
    num > TASK_LIMITS.DURATION_MAX
  ) {
    return { isValid: false, error: TASK_ERROR_MESSAGES.INVALID_DURATION };
  }

  return { isValid: true, error: null };
}

/**
 * Validate task priority
 * @param {string} priority - The priority value to validate
 * @returns {{ isValid: boolean, error: string | null }}
 */
export function validateTaskPriority(priority) {
  if (!priority) {
    return { isValid: true, error: null }; // Optional field, will use default
  }

  const validPriorities = Object.values(PRIORITIES);
  if (!validPriorities.includes(priority)) {
    return { isValid: false, error: TASK_ERROR_MESSAGES.INVALID_PRIORITY };
  }

  return { isValid: true, error: null };
}

/**
 * Validate task category
 * @param {string} category - The category value to validate
 * @returns {{ isValid: boolean, error: string | null }}
 */
export function validateTaskCategory(category) {
  if (!category) {
    return { isValid: true, error: null }; // Optional field, will use default
  }

  const validCategories = Object.values(CATEGORIES);
  if (!validCategories.includes(category)) {
    return { isValid: false, error: TASK_ERROR_MESSAGES.INVALID_CATEGORY };
  }

  return { isValid: true, error: null };
}

/**
 * Validate task status
 * @param {string} status - The status value to validate
 * @returns {{ isValid: boolean, error: string | null }}
 */
export function validateTaskStatus(status) {
  if (!status) {
    return { isValid: true, error: null }; // Optional field, will use default
  }

  const validStatuses = Object.values(STATUSES);
  if (!validStatuses.includes(status)) {
    return { isValid: false, error: TASK_ERROR_MESSAGES.INVALID_STATUS };
  }

  return { isValid: true, error: null };
}

/**
 * Validate task deadline
 * @param {Date | string | null} deadline - The deadline to validate
 * @returns {{ isValid: boolean, error: string | null, isPastDeadline: boolean }}
 */
export function validateTaskDeadline(deadline) {
  if (!deadline) {
    return { isValid: true, error: null, isPastDeadline: false }; // Optional field
  }

  const date = deadline instanceof Date ? deadline : new Date(deadline);

  if (isNaN(date.getTime())) {
    return { isValid: false, error: TASK_ERROR_MESSAGES.DEADLINE_INVALID, isPastDeadline: false };
  }

  const isPastDeadline = date < new Date();
  return { isValid: true, error: null, isPastDeadline };
}

/**
 * Validate complete task input for creation
 * @param {object} input - The task input object
 * @returns {{ valid: boolean, errors: Record<string, string> }}
 */
export function validateCreateTaskInput(input) {
  const errors = {};

  // Validate task name (required)
  const nameResult = validateTaskName(input.taskName);
  if (!nameResult.isValid) {
    errors.taskName = nameResult.error;
  }

  // Validate description (optional)
  const descResult = validateTaskDescription(input.description);
  if (!descResult.isValid) {
    errors.description = descResult.error;
  }

  // Validate complexity (optional)
  const complexityResult = validateTaskComplexity(input.complexity);
  if (!complexityResult.isValid) {
    errors.complexity = complexityResult.error;
  }

  // Validate duration (optional)
  const durationResult = validateTaskDuration(input.estimatedDuration);
  if (!durationResult.isValid) {
    errors.estimatedDuration = durationResult.error;
  }

  // Validate priority (optional)
  const priorityResult = validateTaskPriority(input.priority);
  if (!priorityResult.isValid) {
    errors.priority = priorityResult.error;
  }

  // Validate category (optional)
  const categoryResult = validateTaskCategory(input.category);
  if (!categoryResult.isValid) {
    errors.category = categoryResult.error;
  }

  // Validate deadline (optional)
  const deadlineResult = validateTaskDeadline(input.deadline);
  if (!deadlineResult.isValid) {
    errors.deadline = deadlineResult.error;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Validate task update input
 * @param {object} input - The task update input object
 * @returns {{ valid: boolean, errors: Record<string, string> }}
 */
export function validateUpdateTaskInput(input) {
  const errors = {};

  // Only validate fields that are present
  if (input.taskName !== undefined) {
    const nameResult = validateTaskName(input.taskName);
    if (!nameResult.isValid) {
      errors.taskName = nameResult.error;
    }
  }

  if (input.description !== undefined) {
    const descResult = validateTaskDescription(input.description);
    if (!descResult.isValid) {
      errors.description = descResult.error;
    }
  }

  if (input.complexity !== undefined) {
    const complexityResult = validateTaskComplexity(input.complexity);
    if (!complexityResult.isValid) {
      errors.complexity = complexityResult.error;
    }
  }

  if (input.estimatedDuration !== undefined) {
    const durationResult = validateTaskDuration(input.estimatedDuration);
    if (!durationResult.isValid) {
      errors.estimatedDuration = durationResult.error;
    }
  }

  if (input.actualDuration !== undefined) {
    const durationResult = validateTaskDuration(input.actualDuration);
    if (!durationResult.isValid) {
      errors.actualDuration = durationResult.error;
    }
  }

  if (input.priority !== undefined) {
    const priorityResult = validateTaskPriority(input.priority);
    if (!priorityResult.isValid) {
      errors.priority = priorityResult.error;
    }
  }

  if (input.category !== undefined) {
    const categoryResult = validateTaskCategory(input.category);
    if (!categoryResult.isValid) {
      errors.category = categoryResult.error;
    }
  }

  if (input.status !== undefined) {
    const statusResult = validateTaskStatus(input.status);
    if (!statusResult.isValid) {
      errors.status = statusResult.error;
    }
  }

  if (input.deadline !== undefined) {
    const deadlineResult = validateTaskDeadline(input.deadline);
    if (!deadlineResult.isValid) {
      errors.deadline = deadlineResult.error;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

// =============================================================================
// Time Tracking Validation Functions
// =============================================================================

/**
 * Validate manual time entry input
 * @param {number} hours - The hours value
 * @param {number} minutes - The minutes value
 * @returns {{ isValid: boolean, error: string | null, totalMinutes: number }}
 */
export function validateManualTimeEntry(hours, minutes) {
  const h = Number(hours);
  const m = Number(minutes);

  // Check for NaN or non-numeric
  if (isNaN(h) || isNaN(m)) {
    return {
      isValid: false,
      error: TIMER_ERROR_MESSAGES.INVALID_MANUAL_TIME,
      totalMinutes: 0,
    };
  }

  // Check for negative values
  if (h < 0 || m < 0) {
    return {
      isValid: false,
      error: TIMER_ERROR_MESSAGES.INVALID_MANUAL_TIME,
      totalMinutes: 0,
    };
  }

  // Check hours limit
  if (h > TIMER_CONSTANTS.MAX_MANUAL_HOURS) {
    return {
      isValid: false,
      error: TIMER_ERROR_MESSAGES.MANUAL_HOURS_EXCEEDED,
      totalMinutes: 0,
    };
  }

  // Check minutes limit
  if (m > TIMER_CONSTANTS.MAX_MANUAL_MINUTES) {
    return {
      isValid: false,
      error: TIMER_ERROR_MESSAGES.MANUAL_MINUTES_EXCEEDED,
      totalMinutes: 0,
    };
  }

  const totalMinutes = Math.floor(h) * 60 + Math.floor(m);

  // Must be at least 1 minute
  if (totalMinutes <= 0) {
    return {
      isValid: false,
      error: TIMER_ERROR_MESSAGES.MANUAL_TIME_REQUIRED,
      totalMinutes: 0,
    };
  }

  return {
    isValid: true,
    error: null,
    totalMinutes,
  };
}

/**
 * Validate that a task can have its timer started
 * @param {object} task - The task object
 * @returns {{ canStart: boolean, error: string | null }}
 */
export function validateTimerStart(task) {
  if (!task) {
    return {
      canStart: false,
      error: 'Task not found',
    };
  }

  if (task.status !== STATUSES.IN_PROGRESS) {
    return {
      canStart: false,
      error: TIMER_ERROR_MESSAGES.TASK_NOT_IN_PROGRESS,
    };
  }

  return {
    canStart: true,
    error: null,
  };
}
