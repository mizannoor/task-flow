/**
 * TeamVelocityChart Component
 * Area chart showing team-wide completion trends over time (US4)
 */

import PropTypes from 'prop-types';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TEAM_CHART_COLORS, TEAM_ANALYTICS_MESSAGES } from '../../utils/constants';
import { isMetricError } from './MetricErrorFallback';
import { TeamEmptyState } from './TeamEmptyState';

/**
 * Custom tooltip for velocity chart
 */
const CustomTooltip = ({ active, payload, label, showByUser, userNames }) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
      <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">{label}</p>
      {showByUser && userNames ? (
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {userNames[entry.dataKey] || entry.dataKey}: {entry.value}
            </p>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-semibold text-blue-600 dark:text-blue-400">
            {payload[0]?.value || 0}
          </span>{' '}
          {payload[0]?.value === 1 ? 'task' : 'tasks'} completed
        </p>
      )}
    </div>
  );
};

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  label: PropTypes.string,
  showByUser: PropTypes.bool,
  userNames: PropTypes.object,
};

/**
 * Loading skeleton for velocity chart
 */
const VelocitySkeleton = () => (
  <div className="animate-pulse">
    <div className="h-48 bg-gradient-to-t from-gray-200 dark:from-gray-700 to-transparent rounded" />
    <div className="flex justify-between mt-2">
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <div key={i} className="w-8 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
      ))}
    </div>
  </div>
);

/**
 * TeamVelocityChart Component
 * @param {object} props
 * @param {object} props.data - Velocity data from useTeamAnalytics
 * @param {boolean} props.isLoading - Loading state
 * @param {'day' | 'week'} props.aggregation - Current aggregation level
 * @param {function} props.onAggregationChange - Handler for aggregation change
 * @param {boolean} props.showByUser - Whether to show per-user breakdown
 * @param {function} props.onToggleShowByUser - Handler to toggle show by user
 * @param {Array} props.users - Array of users for legend
 */
export function TeamVelocityChart({
  data,
  isLoading,
  aggregation = 'day',
  onAggregationChange,
  showByUser = false,
  onToggleShowByUser,
  users = [],
}) {
  // Handle loading state
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Team Velocity
        </h3>
        <div className="h-64">
          <VelocitySkeleton />
        </div>
      </div>
    );
  }

  // Handle error state
  if (isMetricError(data)) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Team Velocity
        </h3>
        <TeamEmptyState
          type="custom"
          title="Unable to Load"
          description={data.errorMessage || 'Unable to calculate velocity data'}
        />
      </div>
    );
  }

  // Handle empty data
  if (!data || !data.data || data.data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Team Velocity
        </h3>
        <TeamEmptyState type="no-data" description="No completion data available" />
      </div>
    );
  }

  const colors = TEAM_CHART_COLORS.USER_PALETTE;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Team Velocity
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {data.totalInPeriod} total
          </span>

          {/* Aggregation toggle */}
          {onAggregationChange && (
            <div className="inline-flex rounded-md border border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => onAggregationChange('day')}
                className={`px-2 py-1 text-xs font-medium rounded-l-md transition-colors ${aggregation === 'day'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
              >
                Daily
              </button>
              <button
                type="button"
                onClick={() => onAggregationChange('week')}
                className={`px-2 py-1 text-xs font-medium rounded-r-md transition-colors ${aggregation === 'week'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
              >
                Weekly
              </button>
            </div>
          )}

          {/* Show by user toggle */}
          {onToggleShowByUser && users.length > 1 && (
            <button
              type="button"
              onClick={onToggleShowByUser}
              className={`text-xs px-2 py-1 rounded-md transition-colors ${showByUser
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}
            >
              By User
            </button>
          )}
        </div>
      </div>

      {/* Insufficient data warning */}
      {data.insufficientData && (
        <p className="text-xs text-amber-600 dark:text-amber-400 mb-2">
          {TEAM_ANALYTICS_MESSAGES.INSUFFICIENT_DATA}
        </p>
      )}

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data.data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              {showByUser && users.length > 0 ? (
                users.map((user, index) => (
                  <linearGradient
                    key={user.id}
                    id={`gradient-${user.id}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor={colors[index % colors.length]}
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor={colors[index % colors.length]}
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                ))
              ) : (
                <linearGradient id="gradient-total" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={TEAM_CHART_COLORS.PRIMARY} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={TEAM_CHART_COLORS.PRIMARY} stopOpacity={0.1} />
                </linearGradient>
              )}
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#6B7280', fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#6B7280', fontSize: 12 }}
              allowDecimals={false}
            />
            <Tooltip
              content={
                <CustomTooltip
                  showByUser={showByUser}
                  userNames={data.userNames}
                />
              }
            />
            {showByUser && data.data[0]?.breakdown ? (
              <>
                {users.slice(0, 10).map((user, index) => (
                  <Area
                    key={user.id}
                    type="monotone"
                    dataKey={`breakdown.${user.id}`}
                    name={user.id}
                    stackId="1"
                    stroke={colors[index % colors.length]}
                    fill={`url(#gradient-${user.id})`}
                  />
                ))}
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) =>
                    data.userNames?.[value] || value
                  }
                />
              </>
            ) : (
              <Area
                type="monotone"
                dataKey="count"
                stroke={TEAM_CHART_COLORS.PRIMARY}
                fill="url(#gradient-total)"
                strokeWidth={2}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

TeamVelocityChart.propTypes = {
  data: PropTypes.shape({
    data: PropTypes.arrayOf(
      PropTypes.shape({
        date: PropTypes.string.isRequired,
        fullDate: PropTypes.string,
        count: PropTypes.number.isRequired,
        breakdown: PropTypes.object,
      })
    ),
    totalInPeriod: PropTypes.number,
    insufficientData: PropTypes.bool,
    userNames: PropTypes.object,
    hasError: PropTypes.bool,
    errorMessage: PropTypes.string,
  }),
  isLoading: PropTypes.bool,
  aggregation: PropTypes.oneOf(['day', 'week']),
  onAggregationChange: PropTypes.func,
  showByUser: PropTypes.bool,
  onToggleShowByUser: PropTypes.func,
  users: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      displayName: PropTypes.string,
      identifier: PropTypes.string,
    })
  ),
};

export default TeamVelocityChart;
