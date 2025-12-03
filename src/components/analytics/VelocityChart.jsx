/**
 * VelocityChart Component
 * Displays tasks completed over time as line chart
 * US6: View Velocity Trend
 */

import PropTypes from 'prop-types';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Area,
  ComposedChart,
} from 'recharts';
import { MetricEmptyState } from './AnalyticsEmptyState';
import { formatChangePercentage } from '../../utils/formatters';

/**
 * Custom tooltip for velocity chart
 */
function VelocityTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  const count = payload[0].value;
  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-3 border border-gray-200 dark:border-gray-700">
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
        {label}
      </p>
      <p className="text-sm text-blue-600">
        {count} task{count !== 1 ? 's' : ''} completed
      </p>
    </div>
  );
}

VelocityTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  label: PropTypes.string,
};

/**
 * Aggregation toggle button
 */
function AggregationToggle({ aggregation, onToggle }) {
  return (
    <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-600 p-0.5 bg-gray-50 dark:bg-gray-700">
      <button
        type="button"
        onClick={aggregation === 'week' ? onToggle : undefined}
        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${aggregation === 'day'
            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        aria-pressed={aggregation === 'day'}
      >
        Daily
      </button>
      <button
        type="button"
        onClick={aggregation === 'day' ? onToggle : undefined}
        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${aggregation === 'week'
            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        aria-pressed={aggregation === 'week'}
      >
        Weekly
      </button>
    </div>
  );
}

AggregationToggle.propTypes = {
  aggregation: PropTypes.oneOf(['day', 'week']).isRequired,
  onToggle: PropTypes.func.isRequired,
};

/**
 * VelocityChart component
 * @param {object} props - Component props
 * @param {object} props.data - Velocity data from useAnalytics
 * @param {string} props.aggregation - 'day' or 'week'
 * @param {function} props.onToggleAggregation - Toggle aggregation handler
 */
export function VelocityChart({ data, aggregation, onToggleAggregation }) {
  // Empty state - no data points or all zeros
  const hasData = data.data.some((d) => d.count > 0);

  if (!hasData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            📈 Velocity Trend
          </h3>
          <AggregationToggle aggregation={aggregation} onToggle={onToggleAggregation} />
        </div>
        <MetricEmptyState
          message="More data coming as you use TaskFlow"
          icon={
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
        />
      </div>
    );
  }

  // Calculate max for Y axis
  const maxCount = Math.max(...data.data.map((d) => d.count), 1);
  const yAxisMax = Math.ceil(maxCount * 1.2);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          📈 Velocity Trend
        </h3>
        <AggregationToggle aggregation={aggregation} onToggle={onToggleAggregation} />
      </div>

      {/* Period summary */}
      <div className="flex items-center gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Period Total</p>
          <p className="text-2xl font-bold text-blue-600">{data.periodTotal}</p>
        </div>
        {data.changePercent !== null && (
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${data.changePercent >= 0
              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
              : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
            }`}>
            {formatChangePercentage(data.changePercent)} vs last period
          </div>
        )}
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data.data}
            margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
          >
            <defs>
              <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              allowDecimals={false}
              domain={[0, yAxisMax]}
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<VelocityTooltip />} />
            <Area
              type="monotone"
              dataKey="count"
              fill="url(#velocityGradient)"
              stroke="none"
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ fill: '#3B82F6', strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Stats summary */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {aggregation === 'day' ? 'Daily Avg' : 'Weekly Avg'}
            </p>
            <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {data.data.length > 0
                ? (data.periodTotal / data.data.length).toFixed(1)
                : '0'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Best Day</p>
            <p className="text-lg font-semibold text-green-600">
              {maxCount}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Days Active</p>
            <p className="text-lg font-semibold text-blue-600">
              {data.data.filter((d) => d.count > 0).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

VelocityChart.propTypes = {
  data: PropTypes.shape({
    data: PropTypes.arrayOf(
      PropTypes.shape({
        date: PropTypes.string.isRequired,
        count: PropTypes.number.isRequired,
      })
    ).isRequired,
    periodTotal: PropTypes.number.isRequired,
    previousPeriodTotal: PropTypes.number,
    changePercent: PropTypes.number,
  }).isRequired,
  aggregation: PropTypes.oneOf(['day', 'week']).isRequired,
  onToggleAggregation: PropTypes.func.isRequired,
};

export default VelocityChart;
