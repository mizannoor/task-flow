/**
 * Shortcut Analytics Service
 * Handles keyboard shortcut usage tracking in IndexedDB
 */

import { db } from './db';

/**
 * Get today's date in YYYY-MM-DD format
 * @returns {string} Date string
 */
function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Record a keyboard shortcut usage
 * Uses upsert pattern: increment count if exists, create if not
 * @param {string} userId - The user ID
 * @param {string} shortcutKey - Normalized shortcut key (e.g., 'ctrl+n')
 * @param {string} context - View context where shortcut was used
 * @returns {Promise<void>}
 */
export async function recordShortcutUsage(userId, shortcutKey, context = 'global') {
  if (!userId || !shortcutKey) {
    return;
  }

  const date = getTodayDate();
  const now = new Date();

  try {
    // Try to find existing record for today
    const existing = await db.shortcutUsage
      .where('[userId+shortcutKey+date]')
      .equals([userId, shortcutKey, date])
      .first();

    if (existing) {
      // Update existing record
      await db.shortcutUsage.update(existing.id, {
        count: existing.count + 1,
        lastUsedAt: now,
        context: context, // Update to most recent context
      });
    } else {
      // Create new record
      await db.shortcutUsage.add({
        userId,
        shortcutKey,
        date,
        count: 1,
        lastUsedAt: now,
        context,
      });
    }
  } catch (error) {
    // Silently fail - analytics should not break the app
    console.warn('Failed to record shortcut usage:', error);
  }
}

/**
 * Get shortcut usage statistics for a user
 * @param {string} userId - The user ID
 * @param {number} days - Number of days to look back (default: 30)
 * @returns {Promise<object>} Usage statistics
 */
export async function getShortcutUsageStats(userId, days = 30) {
  if (!userId) {
    return { totalUses: 0, uniqueShortcuts: 0, byCategory: {}, byDay: [] };
  }

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

  try {
    const records = await db.shortcutUsage
      .where('userId')
      .equals(userId)
      .and((record) => record.date >= cutoffDateStr)
      .toArray();

    // Calculate statistics
    const totalUses = records.reduce((sum, r) => sum + r.count, 0);
    const uniqueShortcuts = new Set(records.map((r) => r.shortcutKey)).size;

    // Group by shortcut key
    const byShortcut = {};
    records.forEach((r) => {
      if (!byShortcut[r.shortcutKey]) {
        byShortcut[r.shortcutKey] = 0;
      }
      byShortcut[r.shortcutKey] += r.count;
    });

    // Group by day
    const byDay = [];
    const dayMap = {};
    records.forEach((r) => {
      if (!dayMap[r.date]) {
        dayMap[r.date] = 0;
      }
      dayMap[r.date] += r.count;
    });
    Object.keys(dayMap)
      .sort()
      .forEach((date) => {
        byDay.push({ date, count: dayMap[date] });
      });

    return {
      totalUses,
      uniqueShortcuts,
      byShortcut,
      byDay,
    };
  } catch (error) {
    console.warn('Failed to get shortcut usage stats:', error);
    return { totalUses: 0, uniqueShortcuts: 0, byShortcut: {}, byDay: [] };
  }
}

/**
 * Get most used shortcuts for a user
 * @param {string} userId - The user ID
 * @param {number} limit - Maximum number of shortcuts to return
 * @returns {Promise<Array>} Array of { shortcutKey, totalCount, lastUsed }
 */
export async function getMostUsedShortcuts(userId, limit = 10) {
  if (!userId) {
    return [];
  }

  try {
    const records = await db.shortcutUsage.where('userId').equals(userId).toArray();

    // Aggregate by shortcut key
    const aggregated = {};
    records.forEach((r) => {
      if (!aggregated[r.shortcutKey]) {
        aggregated[r.shortcutKey] = {
          shortcutKey: r.shortcutKey,
          totalCount: 0,
          lastUsed: r.lastUsedAt,
          primaryContext: r.context,
        };
      }
      aggregated[r.shortcutKey].totalCount += r.count;
      if (new Date(r.lastUsedAt) > new Date(aggregated[r.shortcutKey].lastUsed)) {
        aggregated[r.shortcutKey].lastUsed = r.lastUsedAt;
        aggregated[r.shortcutKey].primaryContext = r.context;
      }
    });

    // Sort by count and return top N
    return Object.values(aggregated)
      .sort((a, b) => b.totalCount - a.totalCount)
      .slice(0, limit);
  } catch (error) {
    console.warn('Failed to get most used shortcuts:', error);
    return [];
  }
}

/**
 * Clean up old shortcut usage records
 * @param {number} olderThanDays - Delete records older than this many days
 * @returns {Promise<number>} Number of deleted records
 */
export async function cleanupOldShortcutUsage(olderThanDays = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
  const cutoffDateStr = cutoffDate.toISOString().split('T')[0];

  try {
    const count = await db.shortcutUsage.where('date').below(cutoffDateStr).delete();
    return count;
  } catch (error) {
    console.warn('Failed to cleanup old shortcut usage:', error);
    return 0;
  }
}
