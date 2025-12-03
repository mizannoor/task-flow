/**
 * TeamWorkloadChart Component
 * Horizontal bar chart showing task counts per team member (US1)
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
  Cell,
} from 'recharts';
import { TEAM_CHART_COLORS } from '../../utils/constants';
import { isMetricError } from './MetricErrorFallback';
import { TeamEmptyState } from './TeamEmptyState';

/**
 * Custom tooltip for workload chart
 */
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload[0]) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
      <p className="font-medium text-gray-900 dark:text-gray-100 mb-1">
        {data.userName}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        <span className="font-semibold text-blue-600 dark:text-blue-400">
          {data.taskCount}
        </span>{' '}
        {data.taskCount === 1 ? 'task' : 'tasks'}
      </p>
      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
        {data.percentage}% of team total
      </p>
    </div>
  );
};

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
};

/**
 * Loading skeleton for workload chart
 */
const WorkloadSkeleton = () => (
  <div className="animate-pulse space-y-3">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="flex items-center gap-3">
        <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
        <div
          className="h-6 bg-gray-200 dark:bg-gray-700 rounded"
          style={{ width: `${Math.random() * 60 + 20}%` }}
        />
      </div>
    ))}
  </div>
);

/**
 * TeamWorkloadChart Component
 * @param {object} props
 * @param {object} props.data - Workload data from useTeamAnalytics
 * @param {boolean} props.isLoading - Loading state
 */
export function TeamWorkloadChart({ data, isLoading }) {
  // Handle loading state
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Team Workload
        </h3>
        <div className="h-64">
          <WorkloadSkeleton />
        </div>
      </div>
    );
  }

  // Handle error state
  if (isMetricError(data)) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Team Workload
        </h3>
        <TeamEmptyState
          type="custom"
          title="Unable to Load"
          description={data.errorMessage || 'Unable to calculate workload data'}
        />
      </div>
    );
  }

  // Handle empty data
  if (!data || !data.data || data.data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Team Workload
        </h3>
        <TeamEmptyState type="no-tasks" />
      </div>
    );
  }

  // Prepare data for chart - limit to top 10 for readability
  const chartData = data.data.slice(0, 10);
  const colors = TEAM_CHART_COLORS.USER_PALETTE;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Team Workload
        </h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {data.totalTasks} total tasks • avg {data.averagePerUser}/user
        </div>
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
              domain={[0, 'dataMax']}
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
              tick={{ fill: '#6B7280', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} />
            <Bar
              dataKey="taskCount"
              radius={[0, 4, 4, 0]}
              maxBarSize={24}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${entry.userId}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Bar>
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

TeamWorkloadChart.propTypes = {
  data: PropTypes.shape({
    data: PropTypes.arrayOf(
      PropTypes.shape({
        userId: PropTypes.string.isRequired,
        userName: PropTypes.string.isRequired,
        taskCount: PropTypes.number.isRequired,
        percentage: PropTypes.number.isRequired,
      })
    ),
    totalTasks: PropTypes.number,
    averagePerUser: PropTypes.number,
    maxTaskCount: PropTypes.number,
    hasError: PropTypes.bool,
    errorMessage: PropTypes.string,
  }),
  isLoading: PropTypes.bool,
};

export default TeamWorkloadChart;
