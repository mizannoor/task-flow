/**
 * TeamCompletionChart Component
 * Grouped bar chart showing completed tasks per user with comparison mode (US2)
 */

import PropTypes from 'prop-types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts';
import { TEAM_CHART_COLORS } from '../../utils/constants';
import { isMetricError } from './MetricErrorFallback';
import { TeamEmptyState } from './TeamEmptyState';

/**
 * Custom tooltip for completion chart
 */
const CustomTooltip = ({ active, payload, comparisonEnabled }) => {
  if (!active || !payload || !payload[0]) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
      <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">
        {data.userName}
      </p>
      <div className="space-y-1 text-sm">
        <p className="text-gray-600 dark:text-gray-400">
          <span
            className="inline-block w-3 h-3 rounded mr-2"
            style={{ backgroundColor: TEAM_CHART_COLORS.CURRENT_PERIOD }}
          />
          Current:{' '}
          <span className="font-semibold text-blue-600 dark:text-blue-400">
            {data.completedCount}
          </span>{' '}
          ({data.percentage}%)
        </p>
        {comparisonEnabled && data.previousPeriodCount !== undefined && (
          <>
            <p className="text-gray-600 dark:text-gray-400">
              <span
                className="inline-block w-3 h-3 rounded mr-2"
                style={{ backgroundColor: TEAM_CHART_COLORS.PREVIOUS_PERIOD }}
              />
              Previous:{' '}
              <span className="font-semibold">{data.previousPeriodCount}</span>
            </p>
            {data.changePercent !== undefined && (
              <p
                className={`text-xs font-medium ${
                  data.changePercent > 0
                    ? 'text-green-600'
                    : data.changePercent < 0
                    ? 'text-red-600'
                    : 'text-gray-500'
                }`}
              >
                {data.changePercent > 0 ? '↑' : data.changePercent < 0 ? '↓' : '→'}{' '}
                {Math.abs(data.changePercent)}% change
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  comparisonEnabled: PropTypes.bool,
};

/**
 * Loading skeleton for completion chart
 */
const CompletionSkeleton = () => (
  <div className="animate-pulse">
    <div className="flex items-end justify-around h-48 gap-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="bg-gray-200 dark:bg-gray-700 rounded-t w-12"
          style={{ height: `${Math.random() * 60 + 20}%` }}
        />
      ))}
    </div>
    <div className="flex justify-around mt-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="w-12 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
      ))}
    </div>
  </div>
);

/**
 * TeamCompletionChart Component
 * @param {object} props
 * @param {object} props.data - Completions data from useTeamAnalytics
 * @param {boolean} props.isLoading - Loading state
 * @param {boolean} props.comparisonEnabled - Whether comparison mode is on
 * @param {function} props.onToggleComparison - Handler to toggle comparison
 */
export function TeamCompletionChart({
  data,
  isLoading,
  comparisonEnabled = false,
  onToggleComparison,
}) {
  // Handle loading state
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Team Completions
        </h3>
        <div className="h-64">
          <CompletionSkeleton />
        </div>
      </div>
    );
  }

  // Handle error state
  if (isMetricError(data)) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Team Completions
        </h3>
        <TeamEmptyState
          type="custom"
          title="Unable to Load"
          description={data.errorMessage || 'Unable to calculate completion data'}
        />
      </div>
    );
  }

  // Handle empty data
  if (!data || !data.data || data.data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Team Completions
        </h3>
        <TeamEmptyState type="no-data" description="No completed tasks in this period" />
      </div>
    );
  }

  // Prepare data - limit to top 10
  const chartData = data.data.slice(0, 10);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Team Completions
        </h3>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {data.totalCompleted} completed
          </span>
          {onToggleComparison && (
            <button
              type="button"
              onClick={onToggleComparison}
              className={`text-xs px-2 py-1 rounded-md transition-colors ${
                comparisonEnabled
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }`}
            >
              {comparisonEnabled ? 'Comparing' : 'Compare'}
            </button>
          )}
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="userName"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#6B7280', fontSize: 11 }}
              angle={-45}
              textAnchor="end"
              height={60}
              interval={0}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
            />
            <Tooltip
              content={<CustomTooltip comparisonEnabled={comparisonEnabled} />}
              cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
            />
            {comparisonEnabled && (
              <Legend
                verticalAlign="top"
                height={30}
                formatter={(value) =>
                  value === 'completedCount' ? 'Current' : 'Previous'
                }
              />
            )}
            <Bar
              dataKey="completedCount"
              name="completedCount"
              fill={TEAM_CHART_COLORS.CURRENT_PERIOD}
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            />
            {comparisonEnabled && (
              <Bar
                dataKey="previousPeriodCount"
                name="previousPeriodCount"
                fill={TEAM_CHART_COLORS.PREVIOUS_PERIOD}
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Show note if more than 10 users */}
      {data.data.length > 10 && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
          Showing top 10 of {data.data.length} team members
        </p>
      )}
    </div>
  );
}

TeamCompletionChart.propTypes = {
  data: PropTypes.shape({
    data: PropTypes.arrayOf(
      PropTypes.shape({
        userId: PropTypes.string.isRequired,
        userName: PropTypes.string.isRequired,
        completedCount: PropTypes.number.isRequired,
        percentage: PropTypes.number.isRequired,
        previousPeriodCount: PropTypes.number,
        changePercent: PropTypes.number,
      })
    ),
    totalCompleted: PropTypes.number,
    previousPeriodTotal: PropTypes.number,
    hasError: PropTypes.bool,
    errorMessage: PropTypes.string,
  }),
  isLoading: PropTypes.bool,
  comparisonEnabled: PropTypes.bool,
  onToggleComparison: PropTypes.func,
};

export default TeamCompletionChart;
