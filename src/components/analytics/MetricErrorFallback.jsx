/**
 * MetricErrorFallback Component
 * Displays fallback UI when a metric calculation fails (FR-017)
 * Shows "—" or "N/A" with an info tooltip explaining the issue
 */

import { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Info icon for hover tooltip
 */
const InfoIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

InfoIcon.propTypes = {
  className: PropTypes.string,
};

/**
 * MetricErrorFallback Component
 * @param {object} props
 * @param {string} props.message - Error message to display in tooltip
 * @param {'—' | 'N/A'} props.fallback - Fallback text to display
 * @param {'sm' | 'md' | 'lg'} props.size - Size variant
 * @param {string} props.className - Additional CSS classes
 */
export function MetricErrorFallback({
  message = 'Unable to calculate this metric',
  fallback = '—',
  size = 'md',
  className = '',
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div className={`inline-flex items-center gap-1 relative ${className}`}>
      <span className={`text-gray-400 dark:text-gray-500 font-medium ${sizeClasses[size]}`}>
        {fallback}
      </span>
      <div
        className="relative"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
      >
        <button
          type="button"
          className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 rounded-full"
          aria-label="More information about this error"
          tabIndex={0}
        >
          <InfoIcon className={iconSizes[size]} />
        </button>

        {/* Tooltip */}
        {showTooltip && (
          <div
            className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 px-3 py-2 text-xs text-white bg-gray-900 dark:bg-gray-700 rounded-lg shadow-lg"
            role="tooltip"
          >
            {message}
            {/* Arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
          </div>
        )}
      </div>
    </div>
  );
}

MetricErrorFallback.propTypes = {
  message: PropTypes.string,
  fallback: PropTypes.oneOf(['—', 'N/A']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
};

/**
 * Helper to check if a metric result is an error
 * @param {any} result - The metric result
 * @returns {boolean} - True if result is an error object
 */
export function isMetricError(result) {
  return result && result.hasError === true;
}

/**
 * Wrapper component that renders either the metric or the error fallback
 * @param {object} props
 * @param {any} props.data - The metric data (could be error or valid data)
 * @param {function} props.children - Render function for valid data
 * @param {string} props.errorMessage - Optional custom error message
 */
export function MetricOrError({ data, children, errorMessage }) {
  if (isMetricError(data)) {
    return (
      <MetricErrorFallback
        message={errorMessage || data.errorMessage}
        fallback={data.fallbackDisplay || '—'}
      />
    );
  }

  return children(data);
}

MetricOrError.propTypes = {
  data: PropTypes.any.isRequired,
  children: PropTypes.func.isRequired,
  errorMessage: PropTypes.string,
};

export default MetricErrorFallback;
