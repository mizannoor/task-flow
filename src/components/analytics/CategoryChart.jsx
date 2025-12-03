/**
 * CategoryChart Component
 * Displays task distribution by category as pie chart
 * US4: View Category Distribution
 */

import PropTypes from 'prop-types';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import { MetricEmptyState } from './AnalyticsEmptyState';
import { ANALYTICS_CATEGORY_COLORS, CATEGORY_LABELS, CATEGORIES } from '../../utils/constants';

/**
 * Custom tooltip for category chart
 */
function CategoryTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;
  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-3 border border-gray-200 dark:border-gray-700">
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
        {CATEGORY_LABELS[data.category] || data.category}
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {data.count} task{data.count !== 1 ? 's' : ''} ({data.percentage}%)
      </p>
    </div>
  );
}

CategoryTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
};

/**
 * Custom legend renderer
 */
function renderLegend(props) {
  const { payload } = props;

  return (
    <ul className="flex flex-wrap justify-center gap-4 mt-4">
      {payload.map((entry, index) => (
        <li key={`legend-${index}`} className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {CATEGORY_LABELS[entry.value] || entry.value}
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * CategoryChart component
 * @param {object} props - Component props
 * @param {object} props.data - Category distribution data from useAnalytics
 */
export function CategoryChart({ data }) {
  // Empty state - no tasks
  if (data.total === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          📁 Category Distribution
        </h3>
        <MetricEmptyState
          message="Create tasks to see your category distribution"
          icon={
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          }
        />
      </div>
    );
  }

  // Filter out categories with 0 count for pie chart
  const chartData = data.data.filter((d) => d.count > 0);

  // Single category case
  const singleCategory = chartData.length === 1;

  // Map category to color
  const getColor = (category) => {
    return ANALYTICS_CATEGORY_COLORS[category] || '#6B7280';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
        📁 Category Distribution
      </h3>

      {singleCategory && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-2">
          All tasks are in the {CATEGORY_LABELS[chartData[0].category]} category
        </p>
      )}

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={chartData.length > 1 ? 5 : 0}
              dataKey="count"
              nameKey="category"
              label={({ percentage }) => `${percentage}%`}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getColor(entry.category)}
                  stroke="none"
                />
              ))}
            </Pie>
            <Tooltip content={<CategoryTooltip />} />
            <Legend content={renderLegend} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Summary stats */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-3 gap-2 text-center">
          {Object.values(CATEGORIES).map((category) => {
            const categoryData = data.data.find((d) => d.category === category) || { count: 0, percentage: 0 };
            return (
              <div key={category}>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {CATEGORY_LABELS[category]}
                </p>
                <p className="text-lg font-semibold" style={{ color: getColor(category) }}>
                  {categoryData.count}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

CategoryChart.propTypes = {
  data: PropTypes.shape({
    data: PropTypes.arrayOf(
      PropTypes.shape({
        category: PropTypes.string.isRequired,
        count: PropTypes.number.isRequired,
        percentage: PropTypes.number.isRequired,
      })
    ).isRequired,
    total: PropTypes.number.isRequired,
  }).isRequired,
};

export default CategoryChart;
