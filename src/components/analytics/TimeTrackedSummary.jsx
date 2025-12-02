/**
 * TimeTrackedSummary Component
 * Displays total time tracked for the selected period
 * US7: View Time Tracked Summary
 */

import PropTypes from 'prop-types';
import { MetricEmptyState } from './AnalyticsEmptyState';
import { formatDuration } from '../../utils/formatters';

/**
 * Time display with large numbers
 */
function TimeDisplay({ minutes }) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return (
    <div className="flex items-baseline justify-center gap-2">
      <span className="text-4xl font-bold text-blue-600">{hours}</span>
      <span className="text-xl text-gray-500 dark:text-gray-400">h</span>
      <span className="text-4xl font-bold text-blue-600">{mins}</span>
      <span className="text-xl text-gray-500 dark:text-gray-400">m</span>
    </div>
  );
}

TimeDisplay.propTypes = {
  minutes: PropTypes.number.isRequired,
};

/**
 * TimeTrackedSummary component
 * @param {object} props - Component props
 * @param {object} props.data - Time tracked data from useAnalytics
 */
export function TimeTrackedSummary({ data }) {
  // Empty state - no tracked time
  if (data.totalMinutes === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          ⏱️ Time Tracked
        </h3>
        <MetricEmptyState
          message="Start tracking time on tasks to see your time investment"
          icon={
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <div className="mt-4 text-center">
          <TimeDisplay minutes={0} />
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            tracked this period
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
        ⏱️ Time Tracked
      </h3>

      <div className="text-center mb-6">
        <TimeDisplay minutes={data.totalMinutes} />
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          tracked this period
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Daily Average</p>
          <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {formatDuration(data.dailyAverage)}
          </p>
        </div>
        <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Tasks Tracked</p>
          <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {data.taskCount}
          </p>
        </div>
      </div>

      {/* Motivational message based on time tracked */}
      {data.totalMinutes >= 480 && ( // 8+ hours
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
          <p className="text-sm text-green-600 dark:text-green-400">
            🎯 Great focus! You've tracked {Math.round(data.totalMinutes / 60)} hours of productive work.
          </p>
        </div>
      )}

      {data.totalMinutes > 0 && data.totalMinutes < 60 && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
          <p className="text-sm text-blue-600 dark:text-blue-400">
            💡 Tip: Track more tasks to get better insights into your time investment.
          </p>
        </div>
      )}
    </div>
  );
}

TimeTrackedSummary.propTypes = {
  data: PropTypes.shape({
    totalMinutes: PropTypes.number.isRequired,
    formattedTotal: PropTypes.string.isRequired,
    dailyAverage: PropTypes.number.isRequired,
    taskCount: PropTypes.number.isRequired,
  }).isRequired,
};

export default TimeTrackedSummary;
