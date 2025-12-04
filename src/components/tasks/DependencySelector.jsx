/**
 * DependencySelector Component
 * Searchable dropdown for selecting tasks to add as dependencies
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { STATUS_LABELS, STATUS_COLORS, STATUSES } from '../../utils/constants';

/**
 * DependencySelector component
 * @param {object} props
 * @param {object[]} props.availableTasks - Tasks that can be selected as dependencies
 * @param {Function} props.onSelect - Callback when a task is selected
 * @param {Function} props.canAddDependency - Async function to validate selection
 * @param {boolean} props.disabled - Whether the selector is disabled
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.isLoading - Loading state
 * @param {number} props.currentDependencyCount - Current number of dependencies
 * @param {number} props.maxDependencies - Maximum allowed dependencies
 */
export function DependencySelector({
  availableTasks = [],
  onSelect,
  canAddDependency,
  disabled = false,
  placeholder = 'Search tasks to add as dependency...',
  isLoading = false,
  currentDependencyCount = 0,
  maxDependencies = 10,
}) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [validationError, setValidationError] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery('');
        setValidationError(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter tasks based on search query
  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) {
      return availableTasks;
    }

    const query = searchQuery.toLowerCase().trim();
    return availableTasks.filter(
      (task) =>
        task.taskName.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query)
    );
  }, [availableTasks, searchQuery]);

  // Reset highlighted index when filtered list changes
  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredTasks.length]);

  // Check if at limit
  const isAtLimit = currentDependencyCount >= maxDependencies;

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => Math.min(prev + 1, filteredTasks.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredTasks[highlightedIndex]) {
          handleSelectTask(filteredTasks[highlightedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchQuery('');
        setValidationError(null);
        break;
      default:
        break;
    }
  };

  // Handle task selection
  const handleSelectTask = async (task) => {
    if (isAtLimit) {
      setValidationError(`Maximum of ${maxDependencies} dependencies reached`);
      return;
    }

    setIsValidating(true);
    setValidationError(null);

    try {
      // Validate if function provided
      if (canAddDependency) {
        const result = await canAddDependency(task.id);
        if (!result.valid) {
          setValidationError(result.message);
          setIsValidating(false);
          return;
        }
      }

      // Call onSelect callback
      await onSelect(task.id);

      // Reset state
      setIsOpen(false);
      setSearchQuery('');
      setValidationError(null);
    } catch (err) {
      setValidationError(err.message || 'Failed to add dependency');
    } finally {
      setIsValidating(false);
    }
  };

  // Get status badge for a task
  const getStatusBadge = (status) => {
    const colorClass = STATUS_COLORS[status] || STATUS_COLORS[STATUSES.PENDING];
    const label = STATUS_LABELS[status] || status;

    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}
      >
        {status === STATUSES.COMPLETED && (
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {label}
      </span>
    );
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Input field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setIsOpen(true);
            setValidationError(null);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          disabled={disabled || isAtLimit}
          placeholder={isAtLimit ? `Maximum ${maxDependencies} dependencies reached` : placeholder}
          className={`
            w-full px-3 py-2 pr-10
            border rounded-lg
            text-gray-900 dark:text-gray-100
            bg-white dark:bg-gray-800
            border-gray-300 dark:border-gray-600
            placeholder-gray-400 dark:placeholder-gray-500
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-100 disabled:dark:bg-gray-700 disabled:cursor-not-allowed
            transition-colors
          `}
          aria-label="Search tasks to add as dependency"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          role="combobox"
        />

        {/* Icon */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          {isLoading || isValidating ? (
            <svg
              className="w-5 h-5 text-gray-400 animate-spin"
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
          ) : (
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Validation error */}
      {validationError && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{validationError}</p>
      )}

      {/* Dropdown */}
      {isOpen && !disabled && !isAtLimit && (
        <ul
          className={`
            absolute z-50 w-full mt-1
            max-h-60 overflow-auto
            bg-white dark:bg-gray-800
            border border-gray-300 dark:border-gray-600
            rounded-lg shadow-lg
          `}
          role="listbox"
        >
          {filteredTasks.length === 0 ? (
            <li className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
              {searchQuery ? 'No matching tasks found' : 'No available tasks'}
            </li>
          ) : (
            filteredTasks.map((task, index) => (
              <li
                key={task.id}
                onClick={() => handleSelectTask(task)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`
                  px-3 py-2 cursor-pointer
                  flex items-center justify-between
                  ${index === highlightedIndex
                    ? 'bg-blue-50 dark:bg-blue-900/30'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }
                `}
                role="option"
                aria-selected={index === highlightedIndex}
              >
                <div className="flex-1 min-w-0 mr-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {task.taskName}
                  </p>
                  {task.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {task.description}
                    </p>
                  )}
                </div>
                {getStatusBadge(task.status)}
              </li>
            ))
          )}
        </ul>
      )}

      {/* Dependency count indicator */}
      <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        {currentDependencyCount} of {maxDependencies} dependencies used
      </div>
    </div>
  );
}

export default DependencySelector;
