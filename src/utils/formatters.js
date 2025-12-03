/**
 * Date and Duration Formatting Functions
 * Utility functions for formatting dates and durations in tasks
 */

/**
 * Format a date for display
 * @param {Date | string | null} date - The date to format
 * @param {object} options - Formatting options
 * @param {boolean} options.includeTime - Whether to include time
 * @param {boolean} options.relative - Whether to use relative formatting
 * @returns {string} - The formatted date string
 */
export function formatDate(date, { includeTime = false, relative = false } = {}) {
  if (!date) {
    return '—';
  }

  const dateObj = date instanceof Date ? date : new Date(date);

  if (isNaN(dateObj.getTime())) {
    return '—';
  }

  if (relative) {
    return formatRelativeDate(dateObj);
  }

  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }

  return dateObj.toLocaleDateString('en-US', options);
}

/**
 * Format a date relative to now (e.g., "2 days ago", "in 3 hours")
 * @param {Date} date - The date to format
 * @returns {string} - The relative date string
 */
export function formatRelativeDate(date) {
  const now = new Date();
  const diffMs = date - now;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  // Future dates
  if (diffMs > 0) {
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `in ${diffMins} minute${diffMins !== 1 ? 's' : ''}`;
    if (diffHours < 24) return `in ${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
    if (diffDays === 1) return 'tomorrow';
    if (diffDays < 7) return `in ${diffDays} days`;
    if (diffDays < 30) return `in ${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) !== 1 ? 's' : ''}`;
    return formatDate(date);
  }

  // Past dates
  const absDiffMins = Math.abs(diffMins);
  const absDiffHours = Math.abs(diffHours);
  const absDiffDays = Math.abs(diffDays);

  if (absDiffMins < 1) return 'just now';
  if (absDiffMins < 60) return `${absDiffMins} minute${absDiffMins !== 1 ? 's' : ''} ago`;
  if (absDiffHours < 24) return `${absDiffHours} hour${absDiffHours !== 1 ? 's' : ''} ago`;
  if (absDiffDays === 1) return 'yesterday';
  if (absDiffDays < 7) return `${absDiffDays} days ago`;
  if (absDiffDays < 30) return `${Math.floor(absDiffDays / 7)} week${Math.floor(absDiffDays / 7) !== 1 ? 's' : ''} ago`;

  return formatDate(date);
}

/**
 * Format a duration in minutes to a human-readable string
 * @param {number} minutes - The duration in minutes
 * @param {object} options - Formatting options
 * @param {boolean} options.short - Whether to use short format (1h 30m vs 1 hour 30 minutes)
 * @returns {string} - The formatted duration string
 */
export function formatDuration(minutes, { short = true } = {}) {
  if (minutes === null || minutes === undefined || isNaN(minutes)) {
    return '—';
  }

  const mins = Math.floor(Number(minutes));

  if (mins <= 0) {
    return short ? '0m' : '0 minutes';
  }

  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;

  if (short) {
    if (hours === 0) {
      return `${remainingMins}m`;
    }
    if (remainingMins === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainingMins}m`;
  }

  // Long format
  const parts = [];
  if (hours > 0) {
    parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
  }
  if (remainingMins > 0) {
    parts.push(`${remainingMins} minute${remainingMins !== 1 ? 's' : ''}`);
  }

  return parts.join(' ');
}

/**
 * Format duration for input field (always show as minutes)
 * @param {number} minutes - The duration in minutes
 * @returns {string} - The formatted string for input
 */
export function formatDurationForInput(minutes) {
  if (minutes === null || minutes === undefined || isNaN(minutes)) {
    return '';
  }
  return String(Math.floor(Number(minutes)));
}

/**
 * Parse duration string to minutes
 * @param {string} input - The duration input (e.g., "1h 30m", "90", "1.5h")
 * @returns {number | null} - The duration in minutes or null if invalid
 */
export function parseDuration(input) {
  if (!input) {
    return null;
  }

  const trimmed = String(input).trim().toLowerCase();

  // Plain number = minutes
  if (/^\d+$/.test(trimmed)) {
    return parseInt(trimmed, 10);
  }

  // Hours and minutes format (e.g., "1h 30m", "1h30m", "1:30")
  const hourMinPattern = /^(\d+)\s*h\s*(\d+)\s*m?$/;
  const match = trimmed.match(hourMinPattern);
  if (match) {
    return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
  }

  // Hours only (e.g., "2h", "1.5h")
  const hourPattern = /^(\d+(?:\.\d+)?)\s*h$/;
  const hourMatch = trimmed.match(hourPattern);
  if (hourMatch) {
    return Math.round(parseFloat(hourMatch[1]) * 60);
  }

  // Minutes only (e.g., "30m", "90m")
  const minPattern = /^(\d+)\s*m$/;
  const minMatch = trimmed.match(minPattern);
  if (minMatch) {
    return parseInt(minMatch[1], 10);
  }

  // Time format (e.g., "1:30")
  const timePattern = /^(\d+):(\d{1,2})$/;
  const timeMatch = trimmed.match(timePattern);
  if (timeMatch) {
    return parseInt(timeMatch[1], 10) * 60 + parseInt(timeMatch[2], 10);
  }

  return null;
}

/**
 * Format a deadline with overdue indication
 * @param {Date | string | null} deadline - The deadline to format
 * @returns {{ text: string, isOverdue: boolean, isToday: boolean, isSoon: boolean }}
 */
export function formatDeadline(deadline) {
  if (!deadline) {
    return { text: '—', isOverdue: false, isToday: false, isSoon: false };
  }

  const date = deadline instanceof Date ? deadline : new Date(deadline);

  if (isNaN(date.getTime())) {
    return { text: '—', isOverdue: false, isToday: false, isSoon: false };
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const deadlineDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffDays = Math.floor((deadlineDay - today) / (1000 * 60 * 60 * 24));

  const isOverdue = diffDays < 0;
  const isToday = diffDays === 0;
  const isSoon = diffDays > 0 && diffDays <= 3;

  let text;
  if (isToday) {
    text = 'Today';
  } else if (diffDays === 1) {
    text = 'Tomorrow';
  } else if (diffDays === -1) {
    text = 'Yesterday';
  } else if (isOverdue) {
    text = `${Math.abs(diffDays)} days overdue`;
  } else if (isSoon) {
    text = `In ${diffDays} days`;
  } else {
    text = formatDate(date);
  }

  return { text, isOverdue, isToday, isSoon };
}

/**
 * Format complexity as a visual representation
 * @param {number} complexity - The complexity value (1-10)
 * @returns {string} - A visual representation (e.g., "●●●○○")
 */
export function formatComplexity(complexity) {
  if (complexity === null || complexity === undefined || isNaN(complexity)) {
    return '—';
  }

  const value = Math.min(10, Math.max(1, Math.floor(Number(complexity))));
  const filled = '●'.repeat(value);
  const empty = '○'.repeat(10 - value);

  return filled + empty;
}

/**
 * Format complexity as a simple number with max
 * @param {number} complexity - The complexity value (1-10)
 * @returns {string} - Formatted string (e.g., "5/10")
 */
export function formatComplexityNumber(complexity) {
  if (complexity === null || complexity === undefined || isNaN(complexity)) {
    return '—';
  }

  const value = Math.min(10, Math.max(1, Math.floor(Number(complexity))));
  return `${value}/10`;
}

/**
 * Format date for input field (YYYY-MM-DD format)
 * @param {Date | string | null} date - The date to format
 * @returns {string} - The formatted string for date input
 */
export function formatDateForInput(date) {
  if (!date) {
    return '';
  }

  const dateObj = date instanceof Date ? date : new Date(date);

  if (isNaN(dateObj.getTime())) {
    return '';
  }

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Format datetime for input field (YYYY-MM-DDTHH:mm format)
 * @param {Date | string | null} date - The date to format
 * @returns {string} - The formatted string for datetime-local input
 */
export function formatDateTimeForInput(date) {
  if (!date) {
    return '';
  }

  const dateObj = date instanceof Date ? date : new Date(date);

  if (isNaN(dateObj.getTime())) {
    return '';
  }

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// =============================================================================
// Kanban View Utilities
// =============================================================================

import { STATUSES, PRIORITY_ORDER } from './constants';

/**
 * Group tasks by their status for Kanban view
 * @param {Array} tasks - Array of task objects
 * @returns {object} - Tasks grouped by status { pending: [], 'in-progress': [], completed: [] }
 */
export function groupTasksByStatus(tasks) {
  const grouped = {
    [STATUSES.PENDING]: [],
    [STATUSES.IN_PROGRESS]: [],
    [STATUSES.COMPLETED]: [],
  };

  if (!Array.isArray(tasks)) {
    return grouped;
  }

  for (const task of tasks) {
    const status = task.status || STATUSES.PENDING;
    if (grouped[status]) {
      grouped[status].push(task);
    } else {
      // Fallback to pending if unknown status
      grouped[STATUSES.PENDING].push(task);
    }
  }

  return grouped;
}

/**
 * Sort tasks within a column by priority, then deadline, then creation date
 * Priority: Urgent > High > Medium > Low
 * Deadline: Earlier dates first, null/undefined last
 * CreatedAt: Oldest first (ascending)
 * 
 * @param {Array} tasks - Array of task objects to sort
 * @returns {Array} - Sorted array of tasks
 */
export function sortTasksInColumn(tasks) {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return [];
  }

  return [...tasks].sort((a, b) => {
    // 1. Priority (higher priority value = more urgent = should come first)
    const priorityA = PRIORITY_ORDER[a.priority] || 0;
    const priorityB = PRIORITY_ORDER[b.priority] || 0;

    if (priorityB !== priorityA) {
      return priorityB - priorityA; // Descending (Urgent first)
    }

    // 2. Deadline (earlier dates first, null/undefined last)
    const deadlineA = a.deadline ? new Date(a.deadline).getTime() : Infinity;
    const deadlineB = b.deadline ? new Date(b.deadline).getTime() : Infinity;

    if (deadlineA !== deadlineB) {
      return deadlineA - deadlineB; // Ascending (earlier first)
    }

    // 3. CreatedAt (oldest first)
    const createdA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const createdB = b.createdAt ? new Date(b.createdAt).getTime() : 0;

    return createdA - createdB; // Ascending (oldest first)
  });
}

/**
 * Get column counts for Kanban badges
 * @param {object} groupedTasks - Tasks grouped by status from groupTasksByStatus
 * @returns {object} - Counts by status { pending: number, 'in-progress': number, completed: number }
 */
export function getColumnCounts(groupedTasks) {
  return {
    [STATUSES.PENDING]: groupedTasks[STATUSES.PENDING]?.length || 0,
    [STATUSES.IN_PROGRESS]: groupedTasks[STATUSES.IN_PROGRESS]?.length || 0,
    [STATUSES.COMPLETED]: groupedTasks[STATUSES.COMPLETED]?.length || 0,
  };
}

// =============================================================================
// Time Tracking Utilities
// =============================================================================

/**
 * Format elapsed time in HH:MM:SS format for timer display
 * @param {number} totalSeconds - The total elapsed seconds
 * @returns {string} - Formatted time string (e.g., "01:23:45")
 */
export function formatElapsedTime(totalSeconds) {
  if (totalSeconds === null || totalSeconds === undefined || isNaN(totalSeconds) || totalSeconds < 0) {
    return '00:00:00';
  }

  const seconds = Math.floor(totalSeconds);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Format duration in short format for compact display
 * @param {number} minutes - The duration in minutes
 * @returns {string} - Short formatted string (e.g., "1h 30m", "45m", "2h")
 */
export function formatDurationShort(minutes) {
  if (minutes === null || minutes === undefined || isNaN(minutes) || minutes <= 0) {
    return '0m';
  }

  const mins = Math.floor(Number(minutes));
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;

  if (hours === 0) {
    return `${remainingMins}m`;
  }

  if (remainingMins === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMins}m`;
}

/**
 * Format time comparison between tracked and estimated time
 * @param {number} actualMinutes - The actual tracked time in minutes
 * @param {number} estimatedMinutes - The estimated time in minutes
 * @returns {{ 
 *   display: string, 
 *   percentage: number | null, 
 *   status: 'under' | 'on-track' | 'over' | 'no-estimate',
 *   actualFormatted: string,
 *   estimatedFormatted: string
 * }}
 */
export function formatDurationComparison(actualMinutes, estimatedMinutes) {
  const actual = Number(actualMinutes) || 0;
  const estimated = Number(estimatedMinutes) || 0;

  const actualFormatted = formatDurationShort(actual);
  const estimatedFormatted = formatDurationShort(estimated);

  // No estimate provided
  if (estimated <= 0) {
    return {
      display: actualFormatted,
      percentage: null,
      status: 'no-estimate',
      actualFormatted,
      estimatedFormatted: '—',
    };
  }

  const percentage = Math.round((actual / estimated) * 100);

  let status;
  if (percentage <= 75) {
    status = 'under';
  } else if (percentage <= 100) {
    status = 'on-track';
  } else {
    status = 'over';
  }

  return {
    display: `${actualFormatted} / ${estimatedFormatted} (${percentage}%)`,
    percentage,
    status,
    actualFormatted,
    estimatedFormatted,
  };
}

/**
 * Format tracked vs estimated for compact display (e.g., in task cards)
 * @param {number} actualMinutes - The actual tracked time in minutes
 * @param {number} estimatedMinutes - The estimated time in minutes
 * @returns {string} - Compact comparison string (e.g., "1h / 2h")
 */
export function formatTimeCompact(actualMinutes, estimatedMinutes) {
  const actual = Number(actualMinutes) || 0;
  const estimated = Number(estimatedMinutes) || 0;

  if (estimated <= 0) {
    return actual > 0 ? formatDurationShort(actual) : '';
  }

  return `${formatDurationShort(actual)} / ${formatDurationShort(estimated)}`;
}

/**
 * Get color class based on time tracking status
 * @param {number} actualMinutes - The actual tracked time in minutes
 * @param {number} estimatedMinutes - The estimated time in minutes
 * @returns {string} - Tailwind CSS class for the status color
 */
export function getTimeStatusColor(actualMinutes, estimatedMinutes) {
  const actual = Number(actualMinutes) || 0;
  const estimated = Number(estimatedMinutes) || 0;

  if (estimated <= 0) {
    return 'text-gray-500'; // No estimate
  }

  const percentage = (actual / estimated) * 100;

  if (percentage <= 75) {
    return 'text-green-600'; // Under estimate - good
  } else if (percentage <= 100) {
    return 'text-yellow-600'; // Approaching estimate - caution
  } else {
    return 'text-red-600'; // Over estimate - warning
  }
}

// =============================================================================
// Analytics Formatting Functions
// =============================================================================

/**
 * Format a number as a percentage
 * @param {number | null} value - The value to format (0-100)
 * @param {object} options - Formatting options
 * @param {number} options.decimals - Number of decimal places (default: 0)
 * @param {boolean} options.includeSymbol - Whether to include % symbol (default: true)
 * @returns {string} - The formatted percentage string
 */
export function formatPercentage(value, { decimals = 0, includeSymbol = true } = {}) {
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }

  const num = Number(value);
  const formatted = num.toFixed(decimals);

  return includeSymbol ? `${formatted}%` : formatted;
}

/**
 * Format a change percentage with positive/negative indicator
 * @param {number | null} value - The change value
 * @returns {string} - Formatted string with +/- prefix
 */
export function formatChangePercentage(value) {
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }

  const num = Number(value);
  const prefix = num > 0 ? '+' : '';
  return `${prefix}${num.toFixed(0)}%`;
}

/**
 * Format a date for chart axis labels (short format)
 * @param {Date | string} date - The date to format
 * @returns {string} - Short formatted date (e.g., "Dec 2")
 */
export function formatChartDate(date) {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Format a large number compactly (e.g., 1.2K, 3.5M)
 * @param {number} value - The number to format
 * @returns {string} - Compact formatted number
 */
export function formatCompactNumber(value) {
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }

  const num = Number(value);
  if (num < 1000) return num.toString();
  if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
  return `${(num / 1000000).toFixed(1)}M`;
}