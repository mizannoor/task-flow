/**
 * StreakDisplay Component
 * Displays completion streak information with motivational styling
 * US3: View Completion Streak
 */

import PropTypes from 'prop-types';

/**
 * Get motivational message based on streak count
 */
function getStreakMessage(current, best) {
  if (current === 0 && best === 0) {
    return { text: 'Complete your first task to start your streak!', type: 'encourage' };
  }

  if (current === 0 && best > 0) {
    return { text: 'Start a new streak today!', type: 'encourage' };
  }

  if (current === 1) {
    return { text: 'Great start! Keep it going tomorrow!', type: 'success' };
  }

  if (current < 7) {
    return { text: `You're building momentum! ${7 - current} more day${7 - current !== 1 ? 's' : ''} to a week streak!`, type: 'progress' };
  }

  if (current === 7) {
    return { text: '🎉 One week streak! Amazing consistency!', type: 'celebrate' };
  }

  if (current < 30) {
    return { text: `Impressive! ${30 - current} days to a month streak!`, type: 'progress' };
  }

  if (current >= 30) {
    return { text: '🏆 Legendary streak! You\'re unstoppable!', type: 'legendary' };
  }

  return { text: 'Keep going!', type: 'progress' };
}

/**
 * Get streak badge styling based on streak count
 */
function getStreakStyle(current) {
  if (current === 0) {
    return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
  }
  if (current < 7) {
    return 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300';
  }
  if (current < 30) {
    return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
  }
  return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
}

/**
 * Fire emoji count based on streak
 */
function getFireEmojis(current) {
  if (current === 0) return '';
  if (current < 7) return '🔥';
  if (current < 14) return '🔥🔥';
  if (current < 30) return '🔥🔥🔥';
  return '🔥🔥🔥🔥';
}

/**
 * StreakDisplay component
 * @param {object} props - Component props
 * @param {object} props.streak - Streak data from useAnalytics
 */
export function StreakDisplay({ streak }) {
  const message = getStreakMessage(streak.current, streak.best);
  const streakStyle = getStreakStyle(streak.current);
  const fireEmojis = getFireEmojis(streak.current);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
        🔥 Completion Streak
      </h3>

      <div className="flex flex-col items-center">
        {/* Current streak display */}
        <div className={`inline-flex items-center px-6 py-4 rounded-xl ${streakStyle} mb-4`}>
          <span className="text-4xl font-bold mr-2">
            {streak.current}
          </span>
          <span className="text-lg font-medium">
            day{streak.current !== 1 ? 's' : ''}
          </span>
          {fireEmojis && (
            <span className="ml-2 text-2xl" role="img" aria-label="fire">
              {fireEmojis}
            </span>
          )}
        </div>

        {/* Motivational message */}
        <p className={`text-sm text-center mb-4 ${message.type === 'legendary' ? 'text-red-600 font-semibold' :
            message.type === 'celebrate' ? 'text-orange-600 font-semibold' :
              message.type === 'success' ? 'text-green-600' :
                message.type === 'progress' ? 'text-amber-600' :
                  'text-gray-500 dark:text-gray-400'
          }`}>
          {message.text}
        </p>

        {/* Best streak (only show if different from current and > 0) */}
        {streak.best > 0 && (streak.best !== streak.current || streak.current === 0) && (
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm9 4a1 1 0 10-2 0v6a1 1 0 102 0V7zm-3 2a1 1 0 10-2 0v4a1 1 0 102 0V9zm-3 3a1 1 0 10-2 0v1a1 1 0 102 0v-1z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Best streak: <span className="font-semibold">{streak.best} day{streak.best !== 1 ? 's' : ''}</span>
            </span>
          </div>
        )}

        {/* Show when best = current and both > 0 */}
        {streak.current > 0 && streak.best === streak.current && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-green-600 dark:text-green-400 font-medium">
              This is your best streak!
            </span>
          </div>
        )}

        {/* Last completion info */}
        {streak.lastCompletionDate && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
            Last completed: {new Date(streak.lastCompletionDate).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </p>
        )}
      </div>
    </div>
  );
}

StreakDisplay.propTypes = {
  streak: PropTypes.shape({
    current: PropTypes.number.isRequired,
    best: PropTypes.number.isRequired,
    lastCompletionDate: PropTypes.string,
  }).isRequired,
};

export default StreakDisplay;
