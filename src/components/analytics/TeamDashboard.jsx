/**
 * TeamDashboard Component
 * Main container for team analytics dashboard (US7)
 */

import { useTeamAnalytics } from '../../hooks/useTeamAnalytics';
import { useTranslation } from '../../hooks/useTranslation';
import { PeriodFilter } from './PeriodFilter';
import { TeamEmptyState } from './TeamEmptyState';
import { TeamWorkloadChart } from './TeamWorkloadChart';
import { TeamCompletionChart } from './TeamCompletionChart';
import { TeamLeaderboard } from './TeamLeaderboard';
import { TeamVelocityChart } from './TeamVelocityChart';
import { TeamCategoryChart } from './TeamCategoryChart';
import { TEAM_ANALYTICS_MESSAGES } from '../../utils/constants';

/**
 * Loading skeleton for the entire dashboard
 */
const DashboardSkeleton = () => (
  <div className="animate-pulse space-y-6 p-6">
    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-72 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      ))}
    </div>
  </div>
);

/**
 * TeamDashboard Component
 * Displays team-wide analytics and metrics
 */
export function TeamDashboard() {
  const { t } = useTranslation();
  const {
    // Data
    workload,
    completions,
    leaderboard,
    velocity,
    categoryDistribution,

    // Date Range Controls
    dateRangeKey,
    setDateRangeKey,

    // Leaderboard Controls
    leaderboardSortField,
    setLeaderboardSortField,
    leaderboardSortOrder,
    toggleLeaderboardSortOrder,

    // Velocity Controls
    velocityAggregation,
    setVelocityAggregation,
    velocityShowByUser,
    toggleVelocityShowByUser,

    // Completions Controls
    completionsComparisonEnabled,
    toggleCompletionsComparison,

    // Category Controls
    categoryShowTeamTotals,
    toggleCategoryTeamTotals,

    // Meta/State
    isLoading,
    isEmpty,
    isSingleUser,
    users,
  } = useTeamAnalytics();

  // Loading state
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Empty state - no users or tasks
  if (isEmpty) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          👥 {t('analytics.team.title')}
        </h1>
        <TeamEmptyState
          type="no-tasks"
          title={t('analytics.team.noTeamData')}
          description="Create tasks and add team members to see team analytics."
          icon={
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
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
          👥 {t('analytics.team.title')}
        </h1>
        <PeriodFilter
          value={dateRangeKey}
          onChange={setDateRangeKey}
          className="w-full sm:w-48"
        />
      </div>

      {/* Single user notice */}
      {isSingleUser && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <span className="text-amber-600 dark:text-amber-400 text-2xl">👤</span>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              {TEAM_ANALYTICS_MESSAGES.SINGLE_USER}
            </p>
          </div>
        </div>
      )}

      {/* Row 1: Workload + Completions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TeamWorkloadChart
          data={workload}
          isLoading={isLoading}
        />
        <TeamCompletionChart
          data={completions}
          isLoading={isLoading}
          comparisonEnabled={completionsComparisonEnabled}
          onToggleComparison={toggleCompletionsComparison}
        />
      </div>

      {/* Row 2: Leaderboard (full width) */}
      <TeamLeaderboard
        data={leaderboard}
        isLoading={isLoading}
        sortField={leaderboardSortField}
        sortOrder={leaderboardSortOrder}
        onSortChange={setLeaderboardSortField}
        onToggleSortOrder={toggleLeaderboardSortOrder}
      />

      {/* Row 3: Velocity + Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TeamVelocityChart
          data={velocity}
          isLoading={isLoading}
          aggregation={velocityAggregation}
          onAggregationChange={setVelocityAggregation}
          showByUser={velocityShowByUser}
          onToggleShowByUser={toggleVelocityShowByUser}
          users={users}
        />
        <TeamCategoryChart
          data={categoryDistribution}
          isLoading={isLoading}
          showTeamTotals={categoryShowTeamTotals}
          onToggleTeamTotals={toggleCategoryTeamTotals}
        />
      </div>
    </div>
  );
}

export default TeamDashboard;
