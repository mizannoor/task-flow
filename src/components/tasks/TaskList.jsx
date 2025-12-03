/**
 * TaskList Component
 * List view container with table structure and pagination
 */

import { useState, useMemo } from 'react';
import { TaskRow, TaskRowCompact } from './TaskRow';
import { TaskEmptyState, SearchEmptyState, FilterEmptyState } from '../ui/EmptyState';
import { useTasks } from '../../hooks/useTasks';
import { useTranslation } from '../../hooks/useTranslation';
import { PAGINATION_DEFAULTS, SORT_FIELD_LABELS, SORT_ORDERS } from '../../utils/constants';
import { FilterBar } from './FilterBar';
import { SearchInput } from './SearchInput';

/**
 * TaskList component
 * @param {object} props
 * @param {Function} props.onEditTask - Callback when edit is clicked
 * @param {Function} props.onDeleteTask - Callback when delete is clicked
 * @param {Function} props.onStatusChange - Callback when status action is clicked
 * @param {Function} props.onCreateTask - Callback when create task is clicked (for empty state)
 * @param {boolean} props.showFilters - Whether to show filter bar
 * @param {boolean} props.showSearch - Whether to show search input
 */
export function TaskList({
  onEditTask,
  onDeleteTask,
  onStatusChange,
  onCreateTask,
  showFilters = true,
  showSearch = true,
}) {
  const { t } = useTranslation();
  const {
    tasks,
    filters,
    sort,
    setSort,
    setFilters,
    clearFilters,
    loading,
    error
  } = useTasks();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = PAGINATION_DEFAULTS.PAGE_SIZE;

  // Calculate pagination
  const totalPages = Math.ceil(tasks.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedTasks = tasks.slice(startIndex, endIndex);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.status.length > 0 ||
      filters.priority.length > 0 ||
      filters.category.length > 0 ||
      filters.searchQuery.trim() !== '' ||
      filters.userId !== null
    );
  }, [filters]);

  // Reset to page 1 when tasks change significantly
  useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  // Handle sort header click
  const handleSortClick = (field) => {
    if (sort.field === field) {
      // Toggle order if same field
      setSort(field, sort.order === SORT_ORDERS.ASC ? SORT_ORDERS.DESC : SORT_ORDERS.ASC);
    } else {
      // New field, default to descending
      setSort(field, SORT_ORDERS.DESC);
    }
  };

  // Handle filter changes
  const handleStatusChange = (status) => {
    setFilters({ status });
    setCurrentPage(1);
  };

  const handlePriorityChange = (priority) => {
    setFilters({ priority });
    setCurrentPage(1);
  };

  const handleCategoryChange = (category) => {
    setFilters({ category });
    setCurrentPage(1);
  };

  const handleSearchChange = (searchQuery) => {
    setFilters({ searchQuery });
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    clearFilters();
    setCurrentPage(1);
  };

  // Render sort indicator
  const renderSortIndicator = (field) => {
    if (sort.field !== field) {
      return (
        <svg
          className="ml-1 h-4 w-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
          />
        </svg>
      );
    }

    return sort.order === SORT_ORDERS.ASC ? (
      <svg
        className="ml-1 h-4 w-4 text-indigo-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 15l7-7 7 7"
        />
      </svg>
    ) : (
      <svg
        className="ml-1 h-4 w-4 text-indigo-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <svg
          className="animate-spin h-8 w-8 text-indigo-600"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span className="ml-2 text-gray-500 dark:text-gray-400">{t('common.loading')}</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-red-800 dark:text-red-300">
              {t('tasks.loadError')}: {error.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Empty states
  if (tasks.length === 0) {
    if (filters.searchQuery.trim()) {
      return (
        <div>
          {/* Search and Filter Bar */}
          {(showFilters || showSearch) && (
            <div className="mb-4 space-y-3">
              {showSearch && (
                <SearchInput
                  value={filters.searchQuery}
                  onChange={handleSearchChange}
                  placeholder={t('common.search')}
                />
              )}
              {showFilters && (
                <FilterBar
                  filters={filters}
                  onStatusChange={handleStatusChange}
                  onPriorityChange={handlePriorityChange}
                  onCategoryChange={handleCategoryChange}
                  onClearFilters={handleClearFilters}
                  sort={sort}
                  onSortChange={setSort}
                />
              )}
            </div>
          )}
          <SearchEmptyState
            searchQuery={filters.searchQuery}
            onClearSearch={clearFilters}
          />
        </div>
      );
    }

    if (hasActiveFilters) {
      return (
        <div>
          {/* Search and Filter Bar */}
          {(showFilters || showSearch) && (
            <div className="mb-4 space-y-3">
              {showSearch && (
                <SearchInput
                  value={filters.searchQuery}
                  onChange={handleSearchChange}
                  placeholder={t('common.search')}
                />
              )}
              {showFilters && (
                <FilterBar
                  filters={filters}
                  onStatusChange={handleStatusChange}
                  onPriorityChange={handlePriorityChange}
                  onCategoryChange={handleCategoryChange}
                  onClearFilters={handleClearFilters}
                  sort={sort}
                  onSortChange={setSort}
                />
              )}
            </div>
          )}
          <FilterEmptyState onClearFilters={clearFilters} />
        </div>
      );
    }

    return <TaskEmptyState onCreateTask={onCreateTask} />;
  }

  return (
    <div>
      {/* Search and Filter Bar */}
      {(showFilters || showSearch) && (
        <div className="mb-4 space-y-3">
          {showSearch && (
            <SearchInput
              value={filters.searchQuery}
              onChange={handleSearchChange}
              placeholder={t('common.search')}
            />
          )}
          {showFilters && (
            <FilterBar
              filters={filters}
              onStatusChange={handleStatusChange}
              onPriorityChange={handlePriorityChange}
              onCategoryChange={handleCategoryChange}
              onClearFilters={handleClearFilters}
              sort={sort}
              onSortChange={setSort}
            />
          )}
        </div>
      )}

      {/* Task count */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('tasks.showing', { start: startIndex + 1, end: Math.min(endIndex, tasks.length), total: tasks.length })}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t('tasks.sortedBy', { field: SORT_FIELD_LABELS[sort.field], order: sort.order === SORT_ORDERS.ASC ? t('common.ascending') : t('common.descending') })}
        </p>
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
          <thead className="bg-gray-50 dark:bg-slate-800">
            <tr>
              {/* Task Name - sortable */}
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700"
                onClick={() => handleSortClick('taskName')}
              >
                <div className="flex items-center">
                  {t('tasks.task')}
                  {renderSortIndicator('taskName')}
                </div>
              </th>

              {/* Status */}
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                {t('tasks.status')}
              </th>

              {/* Priority - sortable */}
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700"
                onClick={() => handleSortClick('priority')}
              >
                <div className="flex items-center">
                  {t('tasks.priority')}
                  {renderSortIndicator('priority')}
                </div>
              </th>

              {/* Category */}
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                {t('tasks.category')}
              </th>

              {/* Deadline - sortable */}
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700"
                onClick={() => handleSortClick('deadline')}
              >
                <div className="flex items-center">
                  {t('tasks.deadline')}
                  {renderSortIndicator('deadline')}
                </div>
              </th>

              {/* Duration - sortable */}
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700"
                onClick={() => handleSortClick('estimatedDuration')}
              >
                <div className="flex items-center">
                  {t('tasks.duration')}
                  {renderSortIndicator('estimatedDuration')}
                </div>
              </th>

              {/* Created - sortable */}
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700"
                onClick={() => handleSortClick('createdAt')}
              >
                <div className="flex items-center">
                  {t('tasks.created')}
                  {renderSortIndicator('createdAt')}
                </div>
              </th>

              {/* Actions */}
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                {t('common.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
            {paginatedTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                onStatusChange={onStatusChange}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card view */}
      <div className="md:hidden space-y-4">
        {paginatedTasks.map((task) => (
          <TaskRowCompact
            key={task.id}
            task={task}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between border-t border-gray-200 dark:border-slate-700 pt-4">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-slate-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('common.previous')}
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-slate-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('common.next')}
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {t('common.pageOf', { current: currentPage, total: totalPages })}
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                {/* Previous */}
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">{t('common.previous')}</span>
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === pageNum
                        ? 'z-10 bg-indigo-50 dark:bg-indigo-900/50 border-indigo-500 text-indigo-600 dark:text-indigo-300'
                        : 'bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-600'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {/* Next */}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">{t('common.next')}</span>
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskList;
