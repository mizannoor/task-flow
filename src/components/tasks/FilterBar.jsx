/**
 * FilterBar Component
 * Filter controls for tasks including status, priority, category, dependency, and user filters
 */

import { useState, useRef, useEffect } from 'react';
import {
  STATUSES,
  STATUS_LABELS,
  PRIORITIES,
  PRIORITY_LABELS,
  CATEGORIES,
  CATEGORY_LABELS,
  DEPENDENCY_FILTER_OPTIONS,
} from '../../utils/constants';
import { SortSelect } from './SortSelect';
import { useTranslation } from '../../hooks/useTranslation';
import { useTranslatedLabels } from '../../hooks/useTranslatedLabels';

/**
 * MultiSelectDropdown component
 * @param {object} props
 * @param {string} props.label - Dropdown label
 * @param {string[]} props.options - Available options
 * @param {object} props.labels - Option labels map
 * @param {string[]} props.selected - Selected options
 * @param {Function} props.onChange - Callback when selection changes
 */
function MultiSelectDropdown({ label, options, labels, selected, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Toggle option selection
  const handleToggle = (option) => {
    if (selected.includes(option)) {
      onChange(selected.filter((o) => o !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  // Clear all selections
  const handleClearAll = (e) => {
    e.stopPropagation();
    onChange([]);
  };

  // Get display text
  const getDisplayText = () => {
    if (selected.length === 0) return label;
    if (selected.length === 1) return labels[selected[0]] || selected[0];
    return `${selected.length} selected`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium shadow-sm ring-1 ring-inset hover:bg-gray-50 dark:hover:bg-slate-700 ${selected.length > 0
          ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 ring-indigo-300 dark:ring-indigo-600'
          : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 ring-gray-300 dark:ring-slate-600'
          }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {getDisplayText()}
        {selected.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="ml-1 rounded-full p-0.5 hover:bg-indigo-200 dark:hover:bg-indigo-700"
            aria-label="Clear selection"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 z-10 mt-2 w-48 origin-top-left rounded-md bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-slate-700 focus:outline-none">
          <div className="py-1" role="listbox" aria-multiselectable="true">
            {Object.entries(options).map(([key, value]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleToggle(value)}
                className={`flex w-full items-center px-4 py-2 text-sm ${selected.includes(value)
                  ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700'
                  }`}
                role="option"
                aria-selected={selected.includes(value)}
              >
                <span
                  className={`mr-3 flex h-4 w-4 items-center justify-center rounded border ${selected.includes(value)
                    ? 'border-indigo-600 bg-indigo-600'
                    : 'border-gray-300 dark:border-slate-500 bg-white dark:bg-slate-700'
                    }`}
                >
                  {selected.includes(value) && (
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
                {labels[value] || value}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * DependencyStatusDropdown component
 * Single-select dropdown for dependency status filtering
 */
function DependencyStatusDropdown({ value, onChange }) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get display text
  const getDisplayText = () => {
    const option = DEPENDENCY_FILTER_OPTIONS.find((o) => o.value === value);
    return option ? t(`filter.dependency.${option.value || 'all'}`, option.label) : t('filter.dependencies', 'Dependencies');
  };

  // Handle selection
  const handleSelect = (newValue) => {
    onChange(newValue);
    setIsOpen(false);
  };

  // Handle clear
  const handleClear = (e) => {
    e.stopPropagation();
    onChange('');
  };

  const hasValue = value && value !== '';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium shadow-sm ring-1 ring-inset hover:bg-gray-50 dark:hover:bg-slate-700 ${
          hasValue
            ? 'bg-purple-50 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 ring-purple-300 dark:ring-purple-600'
            : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 ring-gray-300 dark:ring-slate-600'
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {/* Dependency icon */}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
        {getDisplayText()}
        {hasValue && (
          <button
            type="button"
            onClick={handleClear}
            className="ml-1 rounded-full p-0.5 hover:bg-purple-200 dark:hover:bg-purple-700"
            aria-label="Clear dependency filter"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 z-10 mt-2 w-48 origin-top-left rounded-md bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-slate-700 focus:outline-none">
          <div className="py-1" role="listbox">
            {DEPENDENCY_FILTER_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`flex w-full items-center px-4 py-2 text-sm ${
                  value === option.value
                    ? 'bg-purple-50 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700'
                }`}
                role="option"
                aria-selected={value === option.value}
              >
                <span
                  className={`mr-3 flex h-4 w-4 items-center justify-center rounded-full border ${
                    value === option.value
                      ? 'border-purple-600 bg-purple-600'
                      : 'border-gray-300 dark:border-slate-500 bg-white dark:bg-slate-700'
                  }`}
                >
                  {value === option.value && (
                    <svg className="h-2 w-2 text-white" fill="currentColor" viewBox="0 0 8 8">
                      <circle cx="4" cy="4" r="3" />
                    </svg>
                  )}
                </span>
                {t(`filter.dependency.${option.value || 'all'}`, option.label)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * FilterBar component
 * @param {object} props
 * @param {object} props.filters - Current filter state
 * @param {Function} props.onStatusChange - Callback when status filter changes
 * @param {Function} props.onPriorityChange - Callback when priority filter changes
 * @param {Function} props.onCategoryChange - Callback when category filter changes
 * @param {Function} props.onDependencyStatusChange - Callback when dependency status filter changes
 * @param {Function} props.onClearFilters - Callback to clear all filters
 * @param {object} props.sort - Current sort state { field, order }
 * @param {Function} props.onSortChange - Callback when sort changes (field, order)
 * @param {boolean} props.showSort - Whether to show sort controls
 * @param {boolean} props.showDependencyFilter - Whether to show dependency filter
 */
export function FilterBar({
  filters,
  onStatusChange,
  onPriorityChange,
  onCategoryChange,
  onDependencyStatusChange,
  onClearFilters,
  sort,
  onSortChange,
  showSort = true,
  showDependencyFilter = true,
}) {
  const { t } = useTranslation();
  const { priorityLabels, statusLabels, categoryLabels } = useTranslatedLabels();

  // Count active filters
  const activeFilterCount =
    filters.status.length +
    filters.priority.length +
    filters.category.length +
    (filters.dependencyStatus ? 1 : 0);

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Filter dropdowns */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('common.filter')}:</span>

        {/* Status filter */}
        <MultiSelectDropdown
          label={t('filter.status')}
          options={STATUSES}
          labels={statusLabels}
          selected={filters.status}
          onChange={onStatusChange}
        />

        {/* Priority filter */}
        <MultiSelectDropdown
          label={t('filter.priority')}
          options={PRIORITIES}
          labels={priorityLabels}
          selected={filters.priority}
          onChange={onPriorityChange}
        />

        {/* Category filter */}
        <MultiSelectDropdown
          label={t('filter.category')}
          options={CATEGORIES}
          labels={categoryLabels}
          selected={filters.category}
          onChange={onCategoryChange}
        />

        {/* Dependency status filter */}
        {showDependencyFilter && onDependencyStatusChange && (
          <DependencyStatusDropdown
            value={filters.dependencyStatus || ''}
            onChange={onDependencyStatusChange}
          />
        )}

        {/* Clear all filters */}
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            {t('common.clear')} ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-grow" />

      {/* Sort controls */}
      {showSort && sort && onSortChange && (
        <SortSelect field={sort.field} order={sort.order} onChange={onSortChange} />
      )}
    </div>
  );
}

/**
 * FilterChips component - Compact display of active filters
 */
export function FilterChips({ filters, onRemove, onClearAll }) {
  const { t } = useTranslation();
  const { priorityLabels, statusLabels, categoryLabels } = useTranslatedLabels();

  // Get dependency status label
  const getDependencyLabel = (value) => {
    const option = DEPENDENCY_FILTER_OPTIONS.find((o) => o.value === value);
    return option ? t(`filter.dependency.${option.value}`, option.label) : value;
  };

  const chips = [
    ...filters.status.map((s) => ({ type: 'status', value: s, label: statusLabels[s] })),
    ...filters.priority.map((p) => ({ type: 'priority', value: p, label: priorityLabels[p] })),
    ...filters.category.map((c) => ({ type: 'category', value: c, label: categoryLabels[c] })),
    ...(filters.dependencyStatus
      ? [{ type: 'dependencyStatus', value: filters.dependencyStatus, label: getDependencyLabel(filters.dependencyStatus) }]
      : []),
  ];

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-gray-500">{t('filter.activeFilters')}:</span>
      {chips.map((chip) => (
        <span
          key={`${chip.type}-${chip.value}`}
          className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700"
        >
          {chip.label}
          <button
            type="button"
            onClick={() => onRemove(chip.type, chip.value)}
            className="rounded-full p-0.5 hover:bg-indigo-200"
            aria-label={`Remove ${chip.label} filter`}
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="text-xs text-gray-500 hover:text-gray-700 underline"
      >
        {t('common.clearAll')}
      </button>
    </div>
  );
}

export default FilterBar;
