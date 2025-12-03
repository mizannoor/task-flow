/**
 * TeamEmptyState Component
 * Displays contextual empty states for team analytics
 */

import PropTypes from 'prop-types';
import { TEAM_ANALYTICS_MESSAGES } from '../../utils/constants';

/**
 * Default icon for team analytics empty state
 */
const TeamIcon = () => (
  <svg
    className="w-16 h-16"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
    />
  </svg>
);

/**
 * Chart icon for no data states
 */
const ChartIcon = () => (
  <svg
    className="w-16 h-16"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
    />
  </svg>
);

/**
 * TeamEmptyState Component
 * @param {object} props
 * @param {'no-users' | 'no-tasks' | 'no-data' | 'single-user' | 'custom'} props.type - Type of empty state
 * @param {string} props.title - Optional custom title
 * @param {string} props.description - Optional custom description
 * @param {React.ReactNode} props.icon - Optional custom icon
 * @param {React.ReactNode} props.action - Optional action button/link
 */
export function TeamEmptyState({
  type = 'no-tasks',
  title,
  description,
  icon,
  action,
}) {
  // Determine content based on type
  let defaultTitle = '';
  let defaultDescription = '';
  let IconComponent = ChartIcon;

  switch (type) {
    case 'no-users':
      defaultTitle = 'No Team Members';
      defaultDescription = TEAM_ANALYTICS_MESSAGES.NO_USERS;
      IconComponent = TeamIcon;
      break;
    case 'no-tasks':
      defaultTitle = 'No Tasks Yet';
      defaultDescription = TEAM_ANALYTICS_MESSAGES.NO_TASKS;
      break;
    case 'no-data':
      defaultTitle = 'No Data Available';
      defaultDescription = TEAM_ANALYTICS_MESSAGES.NO_DATA_IN_RANGE;
      break;
    case 'single-user':
      defaultTitle = 'Single User Mode';
      defaultDescription = TEAM_ANALYTICS_MESSAGES.SINGLE_USER;
      IconComponent = TeamIcon;
      break;
    default:
      defaultTitle = title || 'No Data';
      defaultDescription = description || '';
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="text-gray-400 dark:text-gray-500 mb-4">
        {icon || <IconComponent />}
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
        {title || defaultTitle}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
        {description || defaultDescription}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

TeamEmptyState.propTypes = {
  type: PropTypes.oneOf(['no-users', 'no-tasks', 'no-data', 'single-user', 'custom']),
  title: PropTypes.string,
  description: PropTypes.string,
  icon: PropTypes.node,
  action: PropTypes.node,
};

export default TeamEmptyState;
