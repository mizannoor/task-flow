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
 * Get the previous date range for comparison mode
 * @param {string} rangeKey - One of DATE_RANGES values
 * @returns {{ start: Date, end: Date } | null} - Previous period date range
 */
export function getPreviousDateRange(rangeKey) {
  const currentRange = getDateRange(rangeKey);
  const rangeDuration = currentRange.end.getTime() - currentRange.start.getTime();

  switch (rangeKey) {
    case DATE_RANGES.TODAY: {
      // Yesterday
      const yesterday = new Date(currentRange.start);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayEnd = new Date(yesterday);
      yesterdayEnd.setHours(23, 59, 59, 999);
      return { start: yesterday, end: yesterdayEnd };
    }

    case DATE_RANGES.THIS_WEEK:
    case DATE_RANGES.LAST_WEEK: {
      // Previous week
      const prevStart = new Date(currentRange.start);
      prevStart.setDate(prevStart.getDate() - 7);
      const prevEnd = new Date(currentRange.end);
      prevEnd.setDate(prevEnd.getDate() - 7);
      return { start: prevStart, end: prevEnd };
    }

    case DATE_RANGES.THIS_MONTH:
    case DATE_RANGES.LAST_MONTH: {
      // Previous month (same number of days)
      const prevStart = new Date(currentRange.start);
      prevStart.setMonth(prevStart.getMonth() - 1);
      const prevEnd = new Date(currentRange.end);
      prevEnd.setMonth(prevEnd.getMonth() - 1);
      return { start: prevStart, end: prevEnd };
    }

    case DATE_RANGES.LAST_30_DAYS: {
      // Previous 30 days before the current range
      const prevEnd = new Date(currentRange.start);
      prevEnd.setDate(prevEnd.getDate() - 1);
      prevEnd.setHours(23, 59, 59, 999);
      const prevStart = new Date(prevEnd);
      prevStart.setDate(prevStart.getDate() - 29);
      prevStart.setHours(0, 0, 0, 0);
      return { start: prevStart, end: prevEnd };
    }

    default:
      return null;
  }
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

// =============================================================================
// Calendar View Date Utilities
// =============================================================================

/**
 * Format a date as a key string for task grouping (YYYY-MM-DD)
 * @param {Date | string} date - The date to format
 * @returns {string} - Date key in YYYY-MM-DD format
 */
export function formatDateKey(date) {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Check if a date is today (local timezone)
 * @param {Date | string} date - The date to check
 * @returns {boolean} - True if the date is today
 */
export function isToday(date) {
  if (!date) return false;
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return false;
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}

/**
 * Check if a date is before today (overdue)
 * @param {Date | string} date - The date to check
 * @returns {boolean} - True if the date is before today
 */
export function isOverdue(date) {
  if (!date) return false;
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return false;
  const today = startOfDay(new Date());
  return startOfDay(d) < today;
}

/**
 * Get the first day of a month
 * @param {number} year - The year
 * @param {number} month - The month (0-indexed)
 * @returns {Date} - First day of the month
 */
export function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1);
}

/**
 * Get the last day of a month
 * @param {number} year - The year
 * @param {number} month - The month (0-indexed)
 * @returns {Date} - Last day of the month
 */
export function getLastDayOfMonth(year, month) {
  return new Date(year, month + 1, 0);
}

/**
 * Get the number of days in a month
 * @param {number} year - The year
 * @param {number} month - The month (0-indexed)
 * @returns {number} - Number of days in the month
 */
export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Generate a month grid for calendar display (42 cells = 6 weeks × 7 days)
 * @param {number} year - The year
 * @param {number} month - The month (0-indexed)
 * @returns {Object} - Month grid data with days array
 */
export function getMonthGrid(year, month) {
  const firstDay = getFirstDayOfMonth(year, month);
  const lastDay = getLastDayOfMonth(year, month);
  const daysInMonth = getDaysInMonth(year, month);

  // Get the day of week for the first day (0 = Sunday)
  const startDayOfWeek = firstDay.getDay();

  // Calculate days from previous month to show
  const prevMonthDays = startDayOfWeek;
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevMonthYear = month === 0 ? year - 1 : year;
  const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonth);

  const days = [];
  const today = new Date();

  // Add days from previous month
  for (let i = prevMonthDays - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const date = new Date(prevMonthYear, prevMonth, day);
    days.push({
      date,
      dateKey: formatDateKey(date),
      day,
      isCurrentMonth: false,
      isToday: isSameDay(date, today),
    });
  }

  // Add days from current month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    days.push({
      date,
      dateKey: formatDateKey(date),
      day,
      isCurrentMonth: true,
      isToday: isSameDay(date, today),
    });
  }

  // Add days from next month to fill the grid (42 cells total)
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextMonthYear = month === 11 ? year + 1 : year;
  const remainingDays = 42 - days.length;

  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(nextMonthYear, nextMonth, day);
    days.push({
      date,
      dateKey: formatDateKey(date),
      day,
      isCurrentMonth: false,
      isToday: isSameDay(date, today),
    });
  }

  return {
    year,
    month,
    startDate: days[0].date,
    endDate: days[days.length - 1].date,
    days,
  };
}

/**
 * Generate a week grid for calendar display (7 days)
 * @param {Date} date - Any date within the desired week
 * @returns {Object} - Week grid data with days array
 */
export function getWeekGrid(date) {
  const d = new Date(date);
  const dayOfWeek = d.getDay(); // 0 = Sunday

  // Get Sunday of the week
  const weekStart = new Date(d);
  weekStart.setDate(d.getDate() - dayOfWeek);
  weekStart.setHours(0, 0, 0, 0);

  // Get Saturday of the week
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  const days = [];
  const today = new Date();

  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(weekStart);
    dayDate.setDate(weekStart.getDate() + i);
    days.push({
      date: dayDate,
      dateKey: formatDateKey(dayDate),
      day: dayDate.getDate(),
      isCurrentMonth: true, // In week view, all days are "current"
      isToday: isSameDay(dayDate, today),
    });
  }

  return {
    weekStart,
    weekEnd,
    days,
  };
}

/**
 * Get day view data for a single date
 * @param {Date} date - The date to display
 * @returns {Object} - Day view data
 */
export function getDayView(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);

  return {
    date: d,
    dateKey: formatDateKey(d),
    isToday: isToday(d),
  };
}

/**
 * Add months to a date
 * @param {Date} date - The starting date
 * @param {number} months - Number of months to add (can be negative)
 * @returns {Date} - New date with months added
 */
export function addMonths(date, months) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

/**
 * Add weeks to a date
 * @param {Date} date - The starting date
 * @param {number} weeks - Number of weeks to add (can be negative)
 * @returns {Date} - New date with weeks added
 */
export function addWeeks(date, weeks) {
  const d = new Date(date);
  d.setDate(d.getDate() + weeks * 7);
  return d;
}

/**
 * Add days to a date
 * @param {Date} date - The starting date
 * @param {number} days - Number of days to add (can be negative)
 * @returns {Date} - New date with days added
 */
export function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Format a date for calendar header display
 * @param {Date} date - The date to format
 * @param {string} viewMode - The current view mode (month, week, day)
 * @returns {string} - Formatted date string
 */
export function formatCalendarHeader(date, viewMode) {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';

  const options = {
    month: { year: 'numeric', month: 'long' },
    week: { year: 'numeric', month: 'long' },
    day: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
  };

  return d.toLocaleDateString('en-US', options[viewMode] || options.month);
}
