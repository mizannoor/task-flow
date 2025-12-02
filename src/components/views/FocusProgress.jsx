/**
 * FocusProgress Component
 * Daily progress indicator for Focus View
 */

import { memo } from 'react';

/**
 * FocusProgress component
 * @param {object} props
 * @param {object} props.progress - DailyProgress object
 * @param {number} props.progress.completedToday - Tasks completed today
 * @param {number} props.progress.totalQualifying - Total qualifying tasks
 * @param {number} props.progress.remainingTasks - Tasks remaining
 * @param {number} props.progress.completionPercentage - 0-100
 */
function FocusProgressComponent({ progress }) {
  if (!progress) return null;

  const {
    completedToday,
    totalQualifying,
    remainingTasks,
    completionPercentage,
  } = progress;

  // Determine progress bar color based on percentage
  const getProgressColor = (percent) => {
    if (percent >= 100) return 'bg-green-500';
    if (percent >= 75) return 'bg-emerald-500';
    if (percent >= 50) return 'bg-blue-500';
    if (percent >= 25) return 'bg-indigo-500';
    return 'bg-indigo-400';
  };

  const progressColor = getProgressColor(completionPercentage);

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-5 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-medium text-gray-700">
            Today's Progress
          </h3>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {completedToday} of {totalQualifying}
            <span className="text-base font-normal text-gray-500 ml-2">
              tasks completed
            </span>
          </p>
        </div>

        {/* Percentage badge */}
        <div className="flex flex-col items-end">
          <span className={`text-3xl font-bold ${completionPercentage >= 100 ? 'text-green-600' : 'text-indigo-600'}`}>
            {completionPercentage}%
          </span>
          {remainingTasks > 0 && (
            <span className="text-xs text-gray-500 mt-1">
              {remainingTasks} remaining
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div
        className="h-3 bg-white rounded-full overflow-hidden shadow-inner"
        role="progressbar"
        aria-valuenow={completionPercentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${completionPercentage}% complete, ${completedToday} of ${totalQualifying} tasks done`}
      >
        <div
          className={`h-full ${progressColor} transition-all duration-500 ease-out rounded-full`}
          style={{ width: `${Math.min(completionPercentage, 100)}%` }}
        />
      </div>

      {/* Motivational message */}
      {completionPercentage >= 100 && (
        <p className="text-sm text-green-700 font-medium mt-3 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Amazing work! You've completed all your focus tasks!
        </p>
      )}
      {completionPercentage >= 75 && completionPercentage < 100 && (
        <p className="text-sm text-emerald-700 mt-3">
          🔥 Almost there! Keep up the great work!
        </p>
      )}
      {completionPercentage >= 50 && completionPercentage < 75 && (
        <p className="text-sm text-blue-700 mt-3">
          💪 Halfway done! You're making great progress.
        </p>
      )}
    </div>
  );
}

export const FocusProgress = memo(FocusProgressComponent);
export default FocusProgress;
