/**
 * TeamCategoryChart Component
 * Stacked horizontal bar chart showing category distribution per user (US5)
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
} from 'recharts';
import { TEAM_CHART_COLORS, CATEGORY_LABELS, CATEGORIES } from '../../utils/constants';
import { isMetricError } from './MetricErrorFallback';
import { TeamEmptyState } from './TeamEmptyState';

/**
 * Custom tooltip for category chart
 */
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
      <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">
        {data.userName}
      </p>
      <div className="space-y-1 text-sm">
        <p className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded"
            style={{ backgroundColor: TEAM_CHART_COLORS.DEVELOPMENT }}
          />
          <span className="text-gray-600 dark:text-gray-400">
            {CATEGORY_LABELS[CATEGORIES.DEVELOPMENT]}:
          </span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {data.development}
          </span>
          <span className="text-xs text-gray-500">
            ({data.percentages?.[CATEGORIES.DEVELOPMENT] || 0}%)
          </span>
        </p>
        <p className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded"
            style={{ backgroundColor: TEAM_CHART_COLORS.FIX }}
          />
          <span className="text-gray-600 dark:text-gray-400">
            {CATEGORY_LABELS[CATEGORIES.FIX]}:
          </span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {data.fix}
          </span>
          <span className="text-xs text-gray-500">
            ({data.percentages?.[CATEGORIES.FIX] || 0}%)
          </span>
        </p>
        <p className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded"
            style={{ backgroundColor: TEAM_CHART_COLORS.SUPPORT }}
          />
          <span className="text-gray-600 dark:text-gray-400">
            {CATEGORY_LABELS[CATEGORIES.SUPPORT]}:
          </span>
          <span className="font-semibold text-gray-900 dark:text-gray-100">
            {data.support}
          </span>
          <span className="text-xs text-gray-500">
            ({data.percentages?.[CATEGORIES.SUPPORT] || 0}%)
          </span>
        </p>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
        Total: {data.totalTasks} tasks
      </p>
    </div>
  );
};

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
};

/**
 * Loading skeleton for category chart
 */
const CategorySkeleton = () => (
  <div className="animate-pulse space-y-3">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="flex items-center gap-3">
        <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="flex flex-1 gap-0.5">
          <div
            className="h-6 bg-blue-200 dark:bg-blue-800 rounded-l"
            style={{ width: `${Math.random() * 40 + 10}%` }}
          />
          <div
            className="h-6 bg-red-200 dark:bg-red-800"
            style={{ width: `${Math.random() * 30 + 5}%` }}
          />
          <div
            className="h-6 bg-green-200 dark:bg-green-800 rounded-r"
            style={{ width: `${Math.random() * 20 + 5}%` }}
          />
        </div>
      </div>
    ))}
  </div>
);

/**
 * TeamCategoryChart Component
 * @param {object} props
 * @param {object} props.data - Category distribution data from useTeamAnalytics
 * @param {boolean} props.isLoading - Loading state
 * @param {boolean} props.showTeamTotals - Whether to show team totals summary
 * @param {function} props.onToggleTeamTotals - Handler to toggle team totals
 */
export function TeamCategoryChart({
  data,
  isLoading,
  showTeamTotals = false,
  onToggleTeamTotals,
}) {
  // Handle loading state
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Category Distribution
        </h3>
        <div className="h-64">
          <CategorySkeleton />
        </div>
      </div>
    );
  }

  // Handle error state
  if (isMetricError(data)) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Category Distribution
        </h3>
        <TeamEmptyState
          type="custom"
          title="Unable to Load"
          description={data.errorMessage || 'Unable to calculate category data'}
        />
      </div>
    );
  }

  // Handle empty data
  if (!data || !data.data || data.data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Category Distribution
        </h3>
        <TeamEmptyState type="no-tasks" />
      </div>
    );
  }

  // Transform data for Recharts
  const chartData = data.data.slice(0, 10).map((user) => ({
    userName: user.userName,
    userId: user.userId,
    development: user.categories[CATEGORIES.DEVELOPMENT],
    fix: user.categories[CATEGORIES.FIX],
    support: user.categories[CATEGORIES.SUPPORT],
    totalTasks: user.totalTasks,
    percentages: user.percentages,
  }));

  // Add team totals row if enabled
  if (showTeamTotals && data.teamTotals) {
    const totalTasks =
      data.teamTotals[CATEGORIES.DEVELOPMENT] +
      data.teamTotals[CATEGORIES.FIX] +
      data.teamTotals[CATEGORIES.SUPPORT];

    chartData.unshift({
      userName: '📊 Team Total',
      userId: 'team-total',
      development: data.teamTotals[CATEGORIES.DEVELOPMENT],
      fix: data.teamTotals[CATEGORIES.FIX],
      support: data.teamTotals[CATEGORIES.SUPPORT],
      totalTasks,
      percentages: {
        [CATEGORIES.DEVELOPMENT]:
          totalTasks > 0
            ? Math.round((data.teamTotals[CATEGORIES.DEVELOPMENT] / totalTasks) * 100)
            : 0,
        [CATEGORIES.FIX]:
          totalTasks > 0
            ? Math.round((data.teamTotals[CATEGORIES.FIX] / totalTasks) * 100)
            : 0,
        [CATEGORIES.SUPPORT]:
          totalTasks > 0
            ? Math.round((data.teamTotals[CATEGORIES.SUPPORT] / totalTasks) * 100)
            : 0,
      },
    });
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Category Distribution
        </h3>
        {onToggleTeamTotals && (
          <button
            type="button"
            onClick={onToggleTeamTotals}
            className={`text-xs px-2 py-1 rounded-md transition-colors ${
              showTeamTotals
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
            }`}
          >
            Team Total
          </button>
        )}
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
            />
            <YAxis
              type="category"
              dataKey="userName"
              width={75}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#6B7280', fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
            <Legend
              verticalAlign="top"
              height={36}
              formatter={(value) => CATEGORY_LABELS[value] || value}
            />
            <Bar
              dataKey="development"
              name={CATEGORIES.DEVELOPMENT}
              stackId="a"
              fill={TEAM_CHART_COLORS.DEVELOPMENT}
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="fix"
              name={CATEGORIES.FIX}
              stackId="a"
              fill={TEAM_CHART_COLORS.FIX}
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="support"
              name={CATEGORIES.SUPPORT}
              stackId="a"
              fill={TEAM_CHART_COLORS.SUPPORT}
              radius={[0, 4, 4, 0]}
            />
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

TeamCategoryChart.propTypes = {
  data: PropTypes.shape({
    data: PropTypes.arrayOf(
      PropTypes.shape({
        userId: PropTypes.string.isRequired,
        userName: PropTypes.string.isRequired,
        categories: PropTypes.shape({
          development: PropTypes.number,
          fix: PropTypes.number,
          support: PropTypes.number,
        }).isRequired,
        totalTasks: PropTypes.number.isRequired,
        percentages: PropTypes.object,
      })
    ),
    teamTotals: PropTypes.shape({
      development: PropTypes.number,
      fix: PropTypes.number,
      support: PropTypes.number,
    }),
    hasError: PropTypes.bool,
    errorMessage: PropTypes.string,
  }),
  isLoading: PropTypes.bool,
  showTeamTotals: PropTypes.bool,
  onToggleTeamTotals: PropTypes.func,
};

export default TeamCategoryChart;
