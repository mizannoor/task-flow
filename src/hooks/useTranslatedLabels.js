/**
 * useTranslatedLabels Hook
 * Provides translated versions of constant labels (priorities, statuses, categories, etc.)
 */

import { useMemo } from 'react';
import { useTranslation } from './useTranslation';
import { PRIORITIES, TASK_STATUSES, TASK_CATEGORIES, SORT_FIELDS } from '../utils/constants';

/**
 * Hook for accessing translated label objects
 * Converts constant values to their translated display strings
 * 
 * @returns {Object} Object containing translated label mappings
 * 
 * @example
 * function PriorityBadge({ priority }) {
 *   const { priorityLabels } = useTranslatedLabels();
 *   return <span>{priorityLabels[priority]}</span>;
 * }
 */
export function useTranslatedLabels() {
  const { t } = useTranslation();

  // Translated priority labels
  const priorityLabels = useMemo(() => ({
    [PRIORITIES.URGENT]: t('priorities.urgent'),
    [PRIORITIES.HIGH]: t('priorities.high'),
    [PRIORITIES.MEDIUM]: t('priorities.medium'),
    [PRIORITIES.LOW]: t('priorities.low'),
  }), [t]);

  // Translated status labels
  const statusLabels = useMemo(() => ({
    [TASK_STATUSES.PENDING]: t('statuses.pending'),
    [TASK_STATUSES.IN_PROGRESS]: t('statuses.inProgress'),
    [TASK_STATUSES.COMPLETED]: t('statuses.completed'),
  }), [t]);

  // Translated category labels
  const categoryLabels = useMemo(() => ({
    [TASK_CATEGORIES.DEVELOPMENT]: t('categories.development'),
    [TASK_CATEGORIES.FIX]: t('categories.fix'),
    [TASK_CATEGORIES.SUPPORT]: t('categories.support'),
  }), [t]);

  // Translated sort field labels
  const sortFieldLabels = useMemo(() => ({
    [SORT_FIELDS.PRIORITY]: t('sort.priority'),
    [SORT_FIELDS.COMPLEXITY]: t('sort.complexity'),
    [SORT_FIELDS.ESTIMATED_DURATION]: t('sort.estimatedDuration'),
    [SORT_FIELDS.CREATED_AT]: t('sort.createdAt'),
    [SORT_FIELDS.DEADLINE]: t('sort.deadline'),
    [SORT_FIELDS.TASK_NAME]: t('sort.taskName'),
  }), [t]);

  // Translated view labels
  const viewLabels = useMemo(() => ({
    list: t('views.list'),
    kanban: t('views.kanban'),
    focus: t('views.focus'),
    calendar: t('views.calendar'),
    statistics: t('views.statistics'),
    teamAnalytics: t('views.teamAnalytics'),
  }), [t]);

  // Translated date range labels for analytics
  const dateRangeLabels = useMemo(() => ({
    today: t('analytics.dateRanges.today'),
    thisWeek: t('analytics.dateRanges.thisWeek'),
    lastWeek: t('analytics.dateRanges.lastWeek'),
    thisMonth: t('analytics.dateRanges.thisMonth'),
    lastMonth: t('analytics.dateRanges.lastMonth'),
    last30Days: t('analytics.dateRanges.last30Days'),
  }), [t]);

  // Priority options for select dropdowns
  const priorityOptions = useMemo(() => [
    { value: PRIORITIES.URGENT, label: priorityLabels[PRIORITIES.URGENT] },
    { value: PRIORITIES.HIGH, label: priorityLabels[PRIORITIES.HIGH] },
    { value: PRIORITIES.MEDIUM, label: priorityLabels[PRIORITIES.MEDIUM] },
    { value: PRIORITIES.LOW, label: priorityLabels[PRIORITIES.LOW] },
  ], [priorityLabels]);

  // Status options for select dropdowns
  const statusOptions = useMemo(() => [
    { value: TASK_STATUSES.PENDING, label: statusLabels[TASK_STATUSES.PENDING] },
    { value: TASK_STATUSES.IN_PROGRESS, label: statusLabels[TASK_STATUSES.IN_PROGRESS] },
    { value: TASK_STATUSES.COMPLETED, label: statusLabels[TASK_STATUSES.COMPLETED] },
  ], [statusLabels]);

  // Category options for select dropdowns
  const categoryOptions = useMemo(() => [
    { value: TASK_CATEGORIES.DEVELOPMENT, label: categoryLabels[TASK_CATEGORIES.DEVELOPMENT] },
    { value: TASK_CATEGORIES.FIX, label: categoryLabels[TASK_CATEGORIES.FIX] },
    { value: TASK_CATEGORIES.SUPPORT, label: categoryLabels[TASK_CATEGORIES.SUPPORT] },
  ], [categoryLabels]);

  return {
    priorityLabels,
    statusLabels,
    categoryLabels,
    sortFieldLabels,
    viewLabels,
    dateRangeLabels,
    priorityOptions,
    statusOptions,
    categoryOptions,
  };
}

export default useTranslatedLabels;
