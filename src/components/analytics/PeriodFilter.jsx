/**
 * PeriodFilter Component
 * Dropdown for selecting analytics date range
 */

import PropTypes from 'prop-types';
import { DATE_RANGES, PERIOD_LABELS } from '../../utils/constants';

/**
 * Period filter dropdown for analytics
 * @param {object} props - Component props
 * @param {string} props.value - Current selected date range key
 * @param {function} props.onChange - Handler for date range change
 * @param {string} props.className - Additional CSS classes
 */
export function PeriodFilter({ value, onChange, className = '' }) {
  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={handleChange}
        className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer appearance-none"
        aria-label="Select time period"
      >
        {Object.entries(DATE_RANGES).map(([key, rangeKey]) => (
          <option key={rangeKey} value={rangeKey}>
            {PERIOD_LABELS[rangeKey]}
          </option>
        ))}
      </select>
      
      {/* Custom dropdown arrow */}
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
}

PeriodFilter.propTypes = {
  value: PropTypes.oneOf(Object.values(DATE_RANGES)).isRequired,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default PeriodFilter;
