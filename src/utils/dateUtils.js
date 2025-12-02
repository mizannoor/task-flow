/**
 * Date Utilities for Analytics
 * Helper functions for date range filtering and chart formatting
 */

import { DATE_RANGES } from './constants';

/**
 * Get start and end dates for a preset date range
 * @param {string} rangeKey - One of DATE_RANGES values
 * @returns {{ key: string, start: Date, end: Date }} - Date range object
 */
export function getDateRange(rangeKey) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (rangeKey) {
    case DATE_RANGES.TODAY:
      return { key: rangeKey, start: today, end: now };

    case DATE_RANGES.THIS_WEEK: {
      const dayOfWeek = today.getDay();
      // Monday = 0 offset, Sunday = 6 offset (ISO week starts Monday)
      const monday = new Date(today);
      monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      return { key: rangeKey, start: monday, end: now };
    }

    case DATE_RANGES.LAST_WEEK: {
      const dayOfWeek = today.getDay();
      const thisMonday = new Date(today);
      thisMonday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      const lastMonday = new Date(thisMonday);
      lastMonday.setDate(thisMonday.getDate() - 7);
      const lastSunday = new Date(thisMonday);
      lastSunday.setDate(thisMonday.getDate() - 1);
      lastSunday.setHours(23, 59, 59, 999);
      return { key: rangeKey, start: lastMonday, end: lastSunday };
    }

    case DATE_RANGES.THIS_MONTH: {
      const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return { key: rangeKey, start: firstOfMonth, end: now };
    }

    case DATE_RANGES.LAST_MONTH: {
      const firstOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      lastOfLastMonth.setHours(23, 59, 59, 999);
      return { key: rangeKey, start: firstOfLastMonth, end: lastOfLastMonth };
    }

    case DATE_RANGES.LAST_30_DAYS: {
      const start = new Date(today);
      start.setDate(today.getDate() - 29);
      return { key: rangeKey, start, end: now };
    }

    default:
      return getDateRange(DATE_RANGES.THIS_WEEK);
  }
}

/**
 * Check if a date falls within a range (inclusive)
 * @param {Date | string | null} date - The date to check
 * @param {{ start: Date, end: Date }} range - The date range
 * @returns {boolean} - True if date is within range
 */
export function isDateInRange(date, { start, end }) {
  if (!date) return false;
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return false;
  return d >= start && d <= end;
}

/**
 * Format date for chart axis labels (short format)
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
 * Get the number of days in a date range
 * @param {{ start: Date, end: Date }} range - The date range
 * @returns {number} - Number of days (inclusive)
 */
export function getDaysInRange({ start, end }) {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.ceil((end - start) / msPerDay) + 1;
}

/**
 * Generate an array of dates in a range
 * @param {{ start: Date, end: Date }} range - The date range
 * @returns {Date[]} - Array of Date objects
 */
export function getDateArray({ start, end }) {
  const dates = [];
  const current = new Date(start);

  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

/**
 * Convert a date to local date string for grouping (YYYY-MM-DD)
 * @param {Date | string} date - The date to convert
 * @returns {string} - Local date string
 */
export function toLocalDateString(date) {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-CA'); // YYYY-MM-DD format
}

/**
 * Get the start of the day for a given date
 * @param {Date} date - The date
 * @returns {Date} - Start of day (00:00:00.000)
 */
export function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get the end of the day for a given date
 * @param {Date} date - The date
 * @returns {Date} - End of day (23:59:59.999)
 */
export function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

/**
 * Check if two dates are the same day (local timezone)
 * @param {Date | string} date1 - First date
 * @param {Date | string} date2 - Second date
 * @returns {boolean} - True if same day
 */
export function isSameDay(date1, date2) {
  return toLocalDateString(date1) === toLocalDateString(date2);
}

/**
 * Get week number for a date (ISO week)
 * @param {Date} date - The date
 * @returns {number} - Week number (1-53)
 */
export function getWeekNumber(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}
