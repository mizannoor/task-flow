/**
 * PersonalDashboard Component
 * Main container for analytics dashboard
 */

import { useAnalytics } from '../../hooks/useAnalytics';
import { useTranslation } from '../../hooks/useTranslation';
import { AnalyticsEmptyState } from './AnalyticsEmptyState';
import { PeriodFilter } from './PeriodFilter';
import { StatCards } from './StatCards';
import { EstimationAccuracy } from './EstimationAccuracy';
import { StreakDisplay } from './StreakDisplay';
import { CategoryChart } from './CategoryChart';
import { ComplexityChart } from './ComplexityChart';
import { VelocityChart } from './VelocityChart';
import { TimeTrackedSummary } from './TimeTrackedSummary';

/**
 * Personal Analytics Dashboard
 * Displays task statistics and visualizations for the current user
 */
export function PersonalDashboard() {
  const { t } = useTranslation();
  const {
    summary,
    streak,
    accuracy,
    categoryDistribution,
    complexityDistribution,
    velocity,
    timeTracked,
    dateRangeKey,
    setDateRangeKey,
    velocityAggregation,
    toggleVelocityAggregation,
    isLoading,
    isEmpty,
  } = useAnalytics();

  // Loading state
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6 p-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    );
  }

  // Empty state - no tasks at all
  if (isEmpty) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          📊 {t('analytics.personal.title')}
        </h1>
        <AnalyticsEmptyState
          title={t('analytics.personal.noTasksYet')}
          description="Create your first task to start tracking your productivity statistics."
          icon={
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          📊 {t('analytics.personal.title')}
        </h1>
        <PeriodFilter
          value={dateRangeKey}
          onChange={setDateRangeKey}
          className="w-full sm:w-48"
        />
      </div>

      {/* Task Summary Cards */}
      <StatCards summary={summary} />

      {/* Row 2: Estimation Accuracy + Streak */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EstimationAccuracy accuracy={accuracy} />
        <StreakDisplay streak={streak} />
      </div>

      {/* Row 3: Category + Complexity Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryChart data={categoryDistribution} />
        <ComplexityChart data={complexityDistribution} />
      </div>

      {/* Row 4: Velocity Trend + Time Tracked */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VelocityChart
          data={velocity}
          aggregation={velocityAggregation}
          onToggleAggregation={toggleVelocityAggregation}
        />
        <TimeTrackedSummary data={timeTracked} />
      </div>
    </div>
  );
}

export default PersonalDashboard;
