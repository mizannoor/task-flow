/**
 * EstimationAccuracy Component
 * Displays estimation accuracy percentage and comparison chart
 * US2: Track Estimation Accuracy
 */

import PropTypes from 'prop-types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { MetricEmptyState } from './AnalyticsEmptyState';
import { formatPercentage, formatDuration } from '../../utils/formatters';

/**
 * Custom tooltip for accuracy chart
 */
function AccuracyTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-3 border border-gray-200 dark:border-gray-700">
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
        Time Comparison
      </p>
      {payload.map((entry, index) => (
        <p key={index} className="text-sm" style={{ color: entry.color }}>
          {entry.name}: {formatDuration(entry.value)}
        </p>
      ))}
    </div>
  );
}

AccuracyTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
};

/**
 * Accuracy indicator ring
 */
function AccuracyRing({ percentage }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const progress = ((percentage || 0) / 100) * circumference;
  const remaining = circumference - progress;

  // Color based on accuracy
  const getColor = (pct) => {
    if (pct >= 80) return '#10B981'; // Green
    if (pct >= 60) return '#F59E0B'; // Amber
    return '#EF4444'; // Red
  };

  const color = getColor(percentage);

  return (
    <div className="relative w-32 h-32">
      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth="8"
          className="dark:stroke-gray-700"
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${remaining}`}
          style={{ transition: 'stroke-dasharray 0.5s ease' }}
        />
      </svg>
      {/* Percentage text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {percentage !== null ? `${percentage}%` : '—'}
        </span>
      </div>
    </div>
  );
}

AccuracyRing.propTypes = {
  percentage: PropTypes.number,
};

/**
 * EstimationAccuracy component
 * @param {object} props - Component props
 * @param {object} props.accuracy - Accuracy data from useAnalytics
 */
export function EstimationAccuracy({ accuracy }) {
  // Empty state - no tasks with time tracking
  if (accuracy.percentage === null || accuracy.taskCount === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          📊 Estimation Accuracy
        </h3>
        <MetricEmptyState
          message="Track time on completed tasks to see your estimation accuracy"
          icon={
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>
    );
  }

  // Chart data for estimated vs actual comparison
  const chartData = [
    {
      name: 'Time',
      Estimated: accuracy.totalEstimated,
      Actual: accuracy.totalActual,
    },
  ];

  // Status message based on accuracy
  const getStatusMessage = (pct) => {
    if (pct >= 90) return { text: 'Excellent! Your estimates are very accurate.', color: 'text-green-600' };
    if (pct >= 80) return { text: 'Great job! You\'re estimating well.', color: 'text-green-600' };
    if (pct >= 60) return { text: 'Good progress. Keep refining your estimates.', color: 'text-amber-600' };
    return { text: 'Room for improvement. Review your estimation patterns.', color: 'text-red-600' };
  };

  const status = getStatusMessage(accuracy.percentage);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
        📊 Estimation Accuracy
      </h3>

      <div className="flex flex-col lg:flex-row items-center gap-6">
        {/* Accuracy ring */}
        <div className="flex flex-col items-center">
          <AccuracyRing percentage={accuracy.percentage} />
          <p className={`mt-2 text-sm font-medium ${status.color}`}>
            {status.text}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Based on {accuracy.taskCount} task{accuracy.taskCount !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Comparison chart */}
        <div className="flex-1 w-full h-48 min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis
                type="number"
                tickFormatter={(value) => formatDuration(value)}
                tick={{ fontSize: 12 }}
              />
              <YAxis type="category" dataKey="name" hide />
              <Tooltip content={<AccuracyTooltip />} />
              <Legend />
              <Bar
                dataKey="Estimated"
                fill="#3B82F6"
                name="Estimated"
                radius={[0, 4, 4, 0]}
              />
              <Bar
                dataKey="Actual"
                fill="#10B981"
                name="Actual"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary stats */}
      <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Estimated</p>
          <p className="text-lg font-semibold text-blue-600">
            {formatDuration(accuracy.totalEstimated)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Actual</p>
          <p className="text-lg font-semibold text-green-600">
            {formatDuration(accuracy.totalActual)}
          </p>
        </div>
      </div>
    </div>
  );
}

EstimationAccuracy.propTypes = {
  accuracy: PropTypes.shape({
    percentage: PropTypes.number,
    totalEstimated: PropTypes.number.isRequired,
    totalActual: PropTypes.number.isRequired,
    taskCount: PropTypes.number.isRequired,
    trend: PropTypes.string,
  }).isRequired,
};

export default EstimationAccuracy;
