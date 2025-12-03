/**
 * TeamLeaderboard Component
 * Ranked table with sortable columns, rank badges, and current user highlighting (US3)
 */

import { useState } from 'react';
import PropTypes from 'prop-types';
import { RANK_BADGES, LEADERBOARD_DEFAULT_LIMIT } from '../../utils/constants';
import { isMetricError } from './MetricErrorFallback';
import { TeamEmptyState } from './TeamEmptyState';

/**
 * Sort indicator icon
 */
const SortIcon = ({ active, direction }) => (
  <svg
    className={`w-4 h-4 inline-block ml-1 transition-colors ${
      active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
    }`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    {direction === 'asc' ? (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    ) : (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    )}
  </svg>
);

SortIcon.propTypes = {
  active: PropTypes.bool,
  direction: PropTypes.oneOf(['asc', 'desc']),
};

/**
 * Loading skeleton for leaderboard
 */
const LeaderboardSkeleton = () => (
  <div className="animate-pulse">
    <div className="flex items-center gap-4 py-3 border-b border-gray-200 dark:border-gray-700">
      <div className="w-8 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="flex-1" />
      <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="w-12 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
    {[1, 2, 3, 4, 5].map((i) => (
      <div
        key={i}
        className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-800"
      >
        <div className="w-8 h-6 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="flex-1" />
        <div className="w-12 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="w-12 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="w-10 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    ))}
  </div>
);

/**
 * TeamLeaderboard Component
 * @param {object} props
 * @param {object} props.data - Leaderboard data from useTeamAnalytics
 * @param {boolean} props.isLoading - Loading state
 * @param {string} props.sortField - Current sort field
 * @param {string} props.sortOrder - Current sort order
 * @param {function} props.onSortChange - Handler for sort field change
 * @param {function} props.onToggleSortOrder - Handler to toggle sort order
 */
export function TeamLeaderboard({
  data,
  isLoading,
  sortField = 'completed',
  sortOrder = 'desc',
  onSortChange,
  onToggleSortOrder,
}) {
  const [showAll, setShowAll] = useState(false);

  // Handle loading state
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Team Leaderboard
        </h3>
        <LeaderboardSkeleton />
      </div>
    );
  }

  // Handle error state
  if (isMetricError(data)) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Team Leaderboard
        </h3>
        <TeamEmptyState
          type="custom"
          title="Unable to Load"
          description={data.errorMessage || 'Unable to calculate leaderboard'}
        />
      </div>
    );
  }

  // Handle empty data
  if (!data || !data.entries || data.entries.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          Team Leaderboard
        </h3>
        <TeamEmptyState type="no-users" />
      </div>
    );
  }

  // Determine visible entries
  const visibleEntries = showAll
    ? data.entries
    : data.entries.slice(0, LEADERBOARD_DEFAULT_LIMIT);
  const hasMore = data.entries.length > LEADERBOARD_DEFAULT_LIMIT;

  // Sort column handler
  const handleSort = (field) => {
    if (sortField === field) {
      onToggleSortOrder?.();
    } else {
      onSortChange?.(field);
    }
  };

  // Sortable column header
  const SortableHeader = ({ field, label, className = '' }) => (
    <th
      className={`px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 select-none ${className}`}
      onClick={() => handleSort(field)}
      aria-sort={sortField === field ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      {label}
      <SortIcon active={sortField === field} direction={sortOrder} />
    </th>
  );

  SortableHeader.propTypes = {
    field: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    className: PropTypes.string,
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Team Leaderboard
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {data.totalUsers} team members
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full" role="grid">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-16">
                Rank
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Name
              </th>
              <SortableHeader field="completed" label="Completed" className="text-right" />
              <SortableHeader field="accuracy" label="Accuracy" className="text-right" />
              <SortableHeader field="streak" label="Streak" className="text-right" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {visibleEntries.map((entry) => (
              <tr
                key={entry.userId}
                className={`transition-colors ${
                  entry.isCurrentUser
                    ? 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}
              >
                {/* Rank */}
                <td className="px-3 py-3 whitespace-nowrap">
                  {entry.rankBadge ? (
                    <span className="text-xl" role="img" aria-label={`Rank ${entry.rank}`}>
                      {entry.rankBadge}
                    </span>
                  ) : (
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      #{entry.rank}
                    </span>
                  )}
                </td>

                {/* Name */}
                <td className="px-3 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-medium ${
                        entry.isCurrentUser
                          ? 'text-blue-700 dark:text-blue-300'
                          : 'text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      {entry.userName}
                    </span>
                    {entry.isCurrentUser && (
                      <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-1.5 py-0.5 rounded">
                        You
                      </span>
                    )}
                  </div>
                </td>

                {/* Completed */}
                <td className="px-3 py-3 whitespace-nowrap text-right">
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {entry.tasksCompleted}
                  </span>
                </td>

                {/* Accuracy */}
                <td className="px-3 py-3 whitespace-nowrap text-right">
                  {entry.estimationAccuracy !== null ? (
                    <span
                      className={`text-sm font-medium ${
                        entry.estimationAccuracy >= 80
                          ? 'text-green-600 dark:text-green-400'
                          : entry.estimationAccuracy >= 60
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {entry.estimationAccuracy}%
                    </span>
                  ) : (
                    <span className="text-sm text-gray-400 dark:text-gray-500">—</span>
                  )}
                </td>

                {/* Streak */}
                <td className="px-3 py-3 whitespace-nowrap text-right">
                  <span className="text-sm text-gray-900 dark:text-gray-100">
                    {entry.currentStreak > 0 ? (
                      <>
                        🔥 {entry.currentStreak}
                      </>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500">0</span>
                    )}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Show All / Show Less button */}
      {hasMore && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            {showAll
              ? 'Show Top 10'
              : `Show All ${data.entries.length} Members`}
          </button>
        </div>
      )}

      {/* Current user rank indicator (if not visible) */}
      {!showAll && data.currentUserRank && data.currentUserRank > LEADERBOARD_DEFAULT_LIMIT && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
          Your rank: #{data.currentUserRank}
        </p>
      )}
    </div>
  );
}

TeamLeaderboard.propTypes = {
  data: PropTypes.shape({
    entries: PropTypes.arrayOf(
      PropTypes.shape({
        rank: PropTypes.number.isRequired,
        rankBadge: PropTypes.string,
        userId: PropTypes.string.isRequired,
        userName: PropTypes.string.isRequired,
        tasksCompleted: PropTypes.number.isRequired,
        estimationAccuracy: PropTypes.number,
        currentStreak: PropTypes.number.isRequired,
        isCurrentUser: PropTypes.bool.isRequired,
      })
    ),
    totalUsers: PropTypes.number,
    currentUserRank: PropTypes.number,
    hasError: PropTypes.bool,
    errorMessage: PropTypes.string,
  }),
  isLoading: PropTypes.bool,
  sortField: PropTypes.oneOf(['completed', 'accuracy', 'streak']),
  sortOrder: PropTypes.oneOf(['asc', 'desc']),
  onSortChange: PropTypes.func,
  onToggleSortOrder: PropTypes.func,
};

export default TeamLeaderboard;
