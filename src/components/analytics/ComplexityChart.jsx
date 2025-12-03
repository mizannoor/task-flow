/**
 * ComplexityChart Component
 * Displays task distribution by complexity level as bar chart
 * US5: View Complexity Distribution
 */

import PropTypes from 'prop-types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { MetricEmptyState } from './AnalyticsEmptyState';
import { getComplexityColor } from '../../services/analyticsService';

/**
 * Custom tooltip for complexity chart
 */
function ComplexityTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  const count = payload[0].value;
  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-3 border border-gray-200 dark:border-gray-700">
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
        Complexity Level {label}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {count} task{count !== 1 ? 's' : ''}
      </p>
    </div>
  );
}

ComplexityTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  label: PropTypes.number,
};

/**
 * Complexity indicator badge
 */
function ComplexityBadge({ level, label }) {
  const color = getComplexityColor(level);
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: `${color}20`, color }}
    >
      {label}
    </span>
  );
}

ComplexityBadge.propTypes = {
  level: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
};

/**
 * ComplexityChart component
 * @param {object} props - Component props
 * @param {object} props.data - Complexity distribution data from useAnalytics
 */
export function ComplexityChart({ data }) {
  // Empty state - no tasks
  if (data.total === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          📊 Complexity Distribution
        </h3>
        <MetricEmptyState
          message="Create tasks with complexity ratings to see distribution"
          icon={
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          📊 Complexity Distribution
        </h3>
        <div className="text-right">
          <p className="text-sm text-gray-500 dark:text-gray-400">Average</p>
          <p className="text-xl font-bold" style={{ color: getComplexityColor(Math.round(data.average)) }}>
            {data.average.toFixed(1)}
          </p>
        </div>
      </div>

      {/* Legend for complexity ranges */}
      <div className="flex justify-center gap-4 mb-4">
        <ComplexityBadge level={2} label="Low (1-3)" />
        <ComplexityBadge level={5} label="Medium (4-6)" />
        <ComplexityBadge level={8} label="High (7-10)" />
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data.data}
            margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="level"
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<ComplexityTooltip />} />
            <Bar
              dataKey="count"
              radius={[4, 4, 0, 0]}
              maxBarSize={40}
            >
              {data.data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getComplexityColor(entry.level)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Stats summary */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Low (1-3)</p>
            <p className="text-lg font-semibold text-emerald-600">
              {data.data.filter((d) => d.level <= 3).reduce((sum, d) => sum + d.count, 0)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Medium (4-6)</p>
            <p className="text-lg font-semibold text-amber-600">
              {data.data.filter((d) => d.level >= 4 && d.level <= 6).reduce((sum, d) => sum + d.count, 0)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">High (7-10)</p>
            <p className="text-lg font-semibold text-red-600">
              {data.data.filter((d) => d.level >= 7).reduce((sum, d) => sum + d.count, 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

ComplexityChart.propTypes = {
  data: PropTypes.shape({
    data: PropTypes.arrayOf(
      PropTypes.shape({
        level: PropTypes.number.isRequired,
        count: PropTypes.number.isRequired,
      })
    ).isRequired,
    average: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
  }).isRequired,
};

export default ComplexityChart;
