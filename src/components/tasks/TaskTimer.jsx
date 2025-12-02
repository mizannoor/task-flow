/**
 * TaskTimer Component
 * Timer display and controls for time tracking on tasks
 */

import { useState, useCallback } from 'react';
import { useTimer } from '../../hooks/useTimer';
import { formatElapsedTime, formatDurationShort, formatDurationComparison, getTimeStatusColor } from '../../utils/formatters';
import { TIMER_STATUS, STATUSES } from '../../utils/constants';
import { TimeProgressDisplay } from './TimeProgressDisplay';

/**
 * Play Icon SVG
 */
function PlayIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

/**
 * Pause Icon SVG
 */
function PauseIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

/**
 * Stop Icon SVG
 */
function StopIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
      />
    </svg>
  );
}

/**
 * Clock Icon SVG
 */
function ClockIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

/**
 * TaskTimer component
 * @param {object} props
 * @param {object} props.task - Task object
 * @param {string} [props.variant='full'] - Display variant: 'full' | 'compact'
 * @param {string} [props.className] - Additional CSS classes
 * @param {Function} [props.onManualEntry] - Callback to open manual time entry
 */
export function TaskTimer({ task, variant = 'full', className = '', onManualEntry }) {
  const {
    elapsedSeconds,
    timerStatus,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    getTaskTimerState,
  } = useTimer();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get timer state for this specific task
  const taskTimerState = getTaskTimerState(task?.id);
  const { isActive, canStart } = taskTimerState;

  // Determine which elapsed time to display
  const displaySeconds = isActive ? elapsedSeconds : taskTimerState.elapsedSeconds;

  // Check if task allows timer operations
  const canUseTimer = task?.status === STATUSES.IN_PROGRESS;
  const isCompleted = task?.status === STATUSES.COMPLETED;
  const isPending = task?.status === STATUSES.PENDING;

  // Handle timer actions with loading state
  const handleAction = useCallback(async (action) => {
    setIsLoading(true);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(err.message);
      console.error('Timer action failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleStart = () => handleAction(() => startTimer(task.id));
  const handlePause = () => handleAction(() => pauseTimer());
  const handleResume = () => handleAction(() => resumeTimer());
  const handleStop = () => handleAction(() => stopTimer());

  // Compact variant - just show time and a small indicator
  if (variant === 'compact') {
    if (!task) return null;

    const hasTrackedTime = (task.actualDuration || 0) > 0;
    const hasEstimate = (task.estimatedDuration || 0) > 0;

    // Don't show anything if no time data
    if (!hasTrackedTime && !hasEstimate && !isActive) {
      return null;
    }

    const comparison = formatDurationComparison(task.actualDuration || 0, task.estimatedDuration || 0);
    const colorClass = getTimeStatusColor(task.actualDuration || 0, task.estimatedDuration || 0);

    return (
      <div className={`flex items-center gap-1 text-xs ${className}`}>
        {isActive && (
          <span className="flex items-center gap-1 text-blue-600 font-medium">
            <span className={`w-2 h-2 rounded-full ${timerStatus === TIMER_STATUS.RUNNING ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
            {formatElapsedTime(displaySeconds)}
          </span>
        )}
        {!isActive && hasTrackedTime && (
          <span className={`flex items-center gap-1 ${colorClass}`}>
            <ClockIcon className="h-3.5 w-3.5" />
            {hasEstimate ? comparison.display : formatDurationShort(task.actualDuration)}
          </span>
        )}
      </div>
    );
  }

  // Full variant - complete timer controls
  if (!task) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Timer Display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Timer status indicator */}
          <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
            isActive && timerStatus === TIMER_STATUS.RUNNING
              ? 'bg-green-100'
              : isActive && timerStatus === TIMER_STATUS.PAUSED
              ? 'bg-yellow-100'
              : 'bg-gray-100'
          }`}>
            <ClockIcon className={`h-5 w-5 ${
              isActive && timerStatus === TIMER_STATUS.RUNNING
                ? 'text-green-600'
                : isActive && timerStatus === TIMER_STATUS.PAUSED
                ? 'text-yellow-600'
                : 'text-gray-400'
            }`} />
          </div>

          {/* Time display */}
          <div>
            <div className="text-2xl font-mono font-semibold text-gray-900" aria-live="polite" aria-atomic="true">
              {isActive ? formatElapsedTime(displaySeconds) : formatElapsedTime(0)}
            </div>
            {isActive && timerStatus === TIMER_STATUS.PAUSED && (
              <div className="text-xs text-yellow-600 font-medium">Paused</div>
            )}
            {isActive && timerStatus === TIMER_STATUS.RUNNING && (
              <div className="text-xs text-green-600 font-medium">Running</div>
            )}
            {!isActive && canUseTimer && (
              <div className="text-xs text-gray-500">Ready to track</div>
            )}
          </div>
        </div>

        {/* Total tracked time */}
        {(task.actualDuration || 0) > 0 && (
          <div className="text-right">
            <div className="text-xs text-gray-500 uppercase tracking-wider">Total Tracked</div>
            <div className="text-sm font-medium text-gray-700">
              {formatDurationShort(task.actualDuration)}
            </div>
          </div>
        )}
      </div>

      {/* Time Progress vs Estimate */}
      {(task.actualDuration > 0 || task.estimatedDuration > 0) && (
        <TimeProgressDisplay 
          actualMinutes={task.actualDuration || 0} 
          estimatedMinutes={task.estimatedDuration || 0}
          variant="bar"
        />
      )}

      {/* Timer Controls */}
      {canUseTimer && (
        <div className="flex items-center gap-2">
          {/* Start button - shown when idle */}
          {!isActive && (
            <button
              type="button"
              onClick={handleStart}
              disabled={isLoading || !canStart}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Start timer"
            >
              <PlayIcon className="h-4 w-4" />
              Start Timer
            </button>
          )}

          {/* Pause button - shown when running */}
          {isActive && timerStatus === TIMER_STATUS.RUNNING && (
            <button
              type="button"
              onClick={handlePause}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Pause timer"
            >
              <PauseIcon className="h-4 w-4" />
              Pause
            </button>
          )}

          {/* Resume button - shown when paused */}
          {isActive && timerStatus === TIMER_STATUS.PAUSED && (
            <button
              type="button"
              onClick={handleResume}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Resume timer"
            >
              <PlayIcon className="h-4 w-4" />
              Resume
            </button>
          )}

          {/* Stop button - shown when timer is active */}
          {isActive && (
            <button
              type="button"
              onClick={handleStop}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md text-red-600 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Stop and save timer"
            >
              <StopIcon className="h-4 w-4" />
              Stop & Save
            </button>
          )}

          {/* Manual entry button */}
          {!isActive && onManualEntry && (
            <button
              type="button"
              onClick={onManualEntry}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Add time manually"
            >
              + Add Time
            </button>
          )}
        </div>
      )}

      {/* Disabled state message for non-in-progress tasks */}
      {isPending && (
        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md text-sm text-gray-600">
          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Start the task to enable time tracking
        </div>
      )}

      {/* Completed state - show total time only */}
      {isCompleted && (
        <div className="flex items-center gap-2 p-2 bg-green-50 rounded-md text-sm text-green-700">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Task completed
          {(task.actualDuration || 0) > 0 && (
            <span className="font-medium">• {formatDurationShort(task.actualDuration)} tracked</span>
          )}
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
}

export default TaskTimer;
