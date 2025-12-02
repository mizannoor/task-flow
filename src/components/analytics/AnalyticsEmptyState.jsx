/**
 * AnalyticsEmptyState Component
 * Displayed when user has no tasks for analytics
 */

import PropTypes from 'prop-types';

/**
 * Empty state for analytics dashboard
 * @param {object} props - Component props
 * @param {string} props.title - Empty state title
 * @param {string} props.description - Empty state description
 * @param {React.ReactNode} props.icon - Optional icon
 * @param {object} props.action - Optional action button
 */
export function AnalyticsEmptyState({
  title = 'No data yet',
  description = 'Start creating and completing tasks to see your analytics.',
  icon = null,
  action = null,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && (
        <div className="mb-4 text-gray-400">
          {icon}
        </div>
      )}
      
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>
      
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">
        {description}
      </p>
      
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

AnalyticsEmptyState.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  icon: PropTypes.node,
  action: PropTypes.shape({
    label: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
  }),
};

/**
 * Metric-specific empty state (smaller, inline version)
 */
export function MetricEmptyState({ message, icon = null }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center bg-gray-50 dark:bg-gray-800 rounded-lg">
      {icon && (
        <div className="mb-2 text-gray-400">
          {icon}
        </div>
      )}
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {message}
      </p>
    </div>
  );
}

MetricEmptyState.propTypes = {
  message: PropTypes.string.isRequired,
  icon: PropTypes.node,
};

export default AnalyticsEmptyState;
