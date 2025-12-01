/**
 * SearchInput Component
 * Search input with debounce functionality for task searching
 */

import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from '../../hooks/useDebounce';

/**
 * SearchInput component
 * @param {object} props
 * @param {string} props.value - Current search value
 * @param {Function} props.onChange - Callback when search value changes (debounced)
 * @param {string} props.placeholder - Placeholder text
 * @param {number} props.debounceMs - Debounce delay in milliseconds
 */
export function SearchInput({
  value = '',
  onChange,
  placeholder = 'Search tasks...',
  debounceMs = 300,
}) {
  const [inputValue, setInputValue] = useState(value);
  const debouncedValue = useDebounce(inputValue, debounceMs);

  // Sync internal state with external value
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Call onChange when debounced value changes
  useEffect(() => {
    if (debouncedValue !== value) {
      onChange(debouncedValue);
    }
  }, [debouncedValue, value, onChange]);

  // Handle input change
  const handleChange = (e) => {
    setInputValue(e.target.value);
  };

  // Handle clear
  const handleClear = () => {
    setInputValue('');
    onChange('');
  };

  // Handle key down
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  return (
    <div className="relative">
      {/* Search icon */}
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <svg
          className="h-5 w-5 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Input field */}
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="block w-full rounded-md border-0 py-2 pl-10 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        aria-label="Search tasks"
      />

      {/* Clear button */}
      {inputValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
          aria-label="Clear search"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}

      {/* Loading indicator (optional, shown when typing) */}
      {inputValue !== debouncedValue && (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg
            className="animate-spin h-4 w-4 text-gray-400"
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
        </div>
      )}
    </div>
  );
}

/**
 * SearchInputWithFilters - Search input combined with quick filter suggestions
 */
export function SearchInputWithFilters({
  value = '',
  onChange,
  suggestions = [],
  onSuggestionClick,
  placeholder = 'Search tasks...',
  debounceMs = 300,
}) {
  const [inputValue, setInputValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debouncedValue = useDebounce(inputValue, debounceMs);

  // Sync internal state with external value
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Call onChange when debounced value changes
  useEffect(() => {
    if (debouncedValue !== value) {
      onChange(debouncedValue);
    }
  }, [debouncedValue, value, onChange]);

  // Handle input change
  const handleChange = (e) => {
    setInputValue(e.target.value);
    setShowSuggestions(e.target.value.length > 0 && suggestions.length > 0);
  };

  // Handle clear
  const handleClear = () => {
    setInputValue('');
    onChange('');
    setShowSuggestions(false);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    if (onSuggestionClick) {
      onSuggestionClick(suggestion);
    } else {
      setInputValue(suggestion);
      onChange(suggestion);
    }
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      {/* Search icon */}
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <svg
          className="h-5 w-5 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Input field */}
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        onFocus={() => setShowSuggestions(inputValue.length > 0 && suggestions.length > 0)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder={placeholder}
        className="block w-full rounded-md border-0 py-2 pl-10 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        aria-label="Search tasks"
        aria-expanded={showSuggestions}
        aria-haspopup="listbox"
      />

      {/* Clear button */}
      {inputValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
          aria-label="Clear search"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <ul
          className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          role="listbox"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="relative cursor-pointer select-none py-2 px-4 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-900"
              role="option"
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SearchInput;
