/**
 * FilterBar Component
 * Filter controls for tasks including status, priority, category, and user filters
 */

import { useState, useRef, useEffect } from 'react';
import {
  STATUSES,
  STATUS_LABELS,
  PRIORITIES,
  PRIORITY_LABELS,
  CATEGORIES,
  CATEGORY_LABELS,
} from '../../utils/constants';
import { SortSelect } from './SortSelect';

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
        className={`inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium shadow-sm ring-1 ring-inset hover:bg-gray-50 ${selected.length > 0
            ? 'bg-indigo-50 text-indigo-700 ring-indigo-300'
            : 'bg-white text-gray-700 ring-gray-300'
          }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {getDisplayText()}
        {selected.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="ml-1 rounded-full p-0.5 hover:bg-indigo-200"
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
        <div className="absolute left-0 z-10 mt-2 w-48 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1" role="listbox" aria-multiselectable="true">
            {Object.entries(options).map(([key, value]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleToggle(value)}
                className={`flex w-full items-center px-4 py-2 text-sm ${selected.includes(value)
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-50'
                  }`}
                role="option"
                aria-selected={selected.includes(value)}
              >
                <span
                  className={`mr-3 flex h-4 w-4 items-center justify-center rounded border ${selected.includes(value)
                      ? 'border-indigo-600 bg-indigo-600'
                      : 'border-gray-300 bg-white'
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
 * FilterBar component
 * @param {object} props
 * @param {object} props.filters - Current filter state
 * @param {Function} props.onStatusChange - Callback when status filter changes
 * @param {Function} props.onPriorityChange - Callback when priority filter changes
 * @param {Function} props.onCategoryChange - Callback when category filter changes
 * @param {Function} props.onClearFilters - Callback to clear all filters
 * @param {object} props.sort - Current sort state { field, order }
 * @param {Function} props.onSortChange - Callback when sort changes (field, order)
 * @param {boolean} props.showSort - Whether to show sort controls
 */
export function FilterBar({
  filters,
  onStatusChange,
  onPriorityChange,
  onCategoryChange,
  onClearFilters,
  sort,
  onSortChange,
  showSort = true,
}) {
  // Count active filters
  const activeFilterCount =
    filters.status.length +
    filters.priority.length +
    filters.category.length;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Filter dropdowns */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-gray-500">Filter:</span>

        {/* Status filter */}
        <MultiSelectDropdown
          label="Status"
          options={STATUSES}
          labels={STATUS_LABELS}
          selected={filters.status}
          onChange={onStatusChange}
        />

        {/* Priority filter */}
        <MultiSelectDropdown
          label="Priority"
          options={PRIORITIES}
          labels={PRIORITY_LABELS}
          selected={filters.priority}
          onChange={onPriorityChange}
        />

        {/* Category filter */}
        <MultiSelectDropdown
          label="Category"
          options={CATEGORIES}
          labels={CATEGORY_LABELS}
          selected={filters.category}
          onChange={onCategoryChange}
        />

        {/* Clear all filters */}
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear ({activeFilterCount})
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
  const chips = [
    ...filters.status.map((s) => ({ type: 'status', value: s, label: STATUS_LABELS[s] })),
    ...filters.priority.map((p) => ({ type: 'priority', value: p, label: PRIORITY_LABELS[p] })),
    ...filters.category.map((c) => ({ type: 'category', value: c, label: CATEGORY_LABELS[c] })),
  ];

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-gray-500">Active filters:</span>
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
        Clear all
      </button>
    </div>
  );
}

export default FilterBar;
