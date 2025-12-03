/**
 * SortSelect Component
 * Dropdown for selecting sort field and order
 */

import { useState, useRef, useEffect } from 'react';
import { SORT_FIELDS, SORT_FIELD_LABELS, SORT_ORDERS } from '../../utils/constants';
import { useTranslation } from '../../hooks/useTranslation';
import { useTranslatedLabels } from '../../hooks/useTranslatedLabels';

/**
 * SortSelect component
 * @param {object} props
 * @param {string} props.field - Current sort field
 * @param {string} props.order - Current sort order (asc/desc)
 * @param {Function} props.onChange - Callback when sort changes (field, order)
 */
export function SortSelect({ field, order, onChange }) {
  const { t } = useTranslation();
  const { sortFieldLabels } = useTranslatedLabels();
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

  // Handle field selection
  const handleFieldSelect = (newField) => {
    if (newField === field) {
      // Toggle order if same field
      onChange(field, order === SORT_ORDERS.ASC ? SORT_ORDERS.DESC : SORT_ORDERS.ASC);
    } else {
      // New field, default to descending
      onChange(newField, SORT_ORDERS.DESC);
    }
    setIsOpen(false);
  };

  // Toggle sort order
  const handleToggleOrder = (e) => {
    e.stopPropagation();
    onChange(field, order === SORT_ORDERS.ASC ? SORT_ORDERS.DESC : SORT_ORDERS.ASC);
  };

  // Get current label
  const currentLabel = sortFieldLabels[field] || t('sort.sortBy');

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div className="flex items-center gap-1">
        {/* Sort field dropdown */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1 rounded-md bg-white dark:bg-slate-800 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <svg
            className="h-4 w-4 text-gray-400 dark:text-gray-500"
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
          {currentLabel}
          <svg
            className={`h-4 w-4 text-gray-400 dark:text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
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
        </button>

        {/* Sort order toggle */}
        <button
          type="button"
          onClick={handleToggleOrder}
          className="inline-flex items-center rounded-md bg-white dark:bg-slate-800 px-2 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700"
          title={order === SORT_ORDERS.ASC ? t('sort.ascending') : t('sort.descending')}
        >
          {order === SORT_ORDERS.ASC ? (
            <svg className="h-4 w-4 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          ) : (
            <svg className="h-4 w-4 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          )}
        </button>
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-slate-700 focus:outline-none">
          <div className="py-1" role="listbox">
            {Object.entries(SORT_FIELDS).map(([key, value]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleFieldSelect(value)}
                className={`flex w-full items-center justify-between px-4 py-2 text-sm ${field === value
                  ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700'
                  }`}
                role="option"
                aria-selected={field === value}
              >
                <span>{sortFieldLabels[value]}</span>
                {field === value && (
                  <svg
                    className="h-4 w-4 text-indigo-600 dark:text-indigo-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SortSelect;
