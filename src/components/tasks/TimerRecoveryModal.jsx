/**
 * TimerRecoveryModal Component
 * Modal dialog for recovering abandoned timer sessions
 */

import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { formatDurationShort } from '../../utils/formatters';

/**
 * TimerRecoveryModal component
 * @param {object} props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Callback to close modal
 * @param {Function} props.onRecover - Callback with recovery action ('save' | 'adjust' | 'discard', adjustedMinutes?)
 * @param {object} props.recoveryInfo - Recovery info { taskId, taskName, elapsedSeconds, startedAt }
 */
export function TimerRecoveryModal({ isOpen, onClose, onRecover, recoveryInfo }) {
  const [adjustedHours, setAdjustedHours] = useState(0);
  const [adjustedMinutes, setAdjustedMinutes] = useState(0);
  const [showAdjust, setShowAdjust] = useState(false);

  // Calculate elapsed time info
  const elapsedMinutes = recoveryInfo ? Math.floor(recoveryInfo.elapsedSeconds / 60) : 0;
  const elapsedHours = Math.floor(elapsedMinutes / 60);
  const remainingMins = elapsedMinutes % 60;

  // Initialize adjusted time from elapsed
  useEffect(() => {
    if (recoveryInfo) {
      setAdjustedHours(elapsedHours);
      setAdjustedMinutes(remainingMins);
    }
  }, [recoveryInfo, elapsedHours, remainingMins]);

  if (!isOpen || !recoveryInfo) return null;

  const totalAdjustedMinutes = adjustedHours * 60 + adjustedMinutes;
  const isValidAdjustment = totalAdjustedMinutes > 0 && totalAdjustedMinutes <= elapsedMinutes;

  const handleSave = () => {
    onRecover('save');
  };

  const handleAdjustedSave = () => {
    if (isValidAdjustment) {
      onRecover('adjust', totalAdjustedMinutes);
    }
  };

  const handleDiscard = () => {
    onRecover('discard');
  };

  // Format the start time
  const formatStartTime = () => {
    if (!recoveryInfo.startedAt) return 'Unknown';
    const date = new Date(recoveryInfo.startedAt);
    return date.toLocaleString();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Timer Recovery">
      <div className="space-y-4">
        {/* Info message */}
        <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
          <svg
            className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-blue-800">
              Timer Session Found
            </h4>
            <p className="text-sm text-blue-700 mt-1">
              A timer was left running from a previous session. Would you like to save or discard the tracked time?
            </p>
          </div>
        </div>

        {/* Session info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">Task</div>
          <div className="font-medium text-gray-900 mb-3">{recoveryInfo.taskName}</div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500">Started At</div>
              <div className="text-sm font-medium text-gray-900">{formatStartTime()}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Elapsed Time</div>
              <div className="text-lg font-mono font-semibold text-gray-900">
                {formatDurationShort(elapsedMinutes)}
              </div>
            </div>
          </div>
        </div>

        {/* Adjustment section (conditional) */}
        {showAdjust && (
          <div className="border border-gray-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adjust time to save
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Hours</label>
                <input
                  type="number"
                  min="0"
                  max={elapsedHours}
                  value={adjustedHours}
                  onChange={(e) => setAdjustedHours(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <span className="text-gray-500 mt-5">:</span>
              <div className="flex-1">
                <label className="block text-xs text-gray-500 mb-1">Minutes</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={adjustedMinutes}
                  onChange={(e) => setAdjustedMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            {!isValidAdjustment && totalAdjustedMinutes > elapsedMinutes && (
              <p className="text-sm text-red-600 mt-1">
                Cannot exceed elapsed time ({formatDurationShort(elapsedMinutes)})
              </p>
            )}
            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={handleAdjustedSave}
                disabled={!isValidAdjustment}
                className="flex-1 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save {formatDurationShort(totalAdjustedMinutes)}
              </button>
              <button
                type="button"
                onClick={() => setShowAdjust(false)}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Actions */}
        {!showAdjust && (
          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={handleSave}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Save All ({formatDurationShort(elapsedMinutes)})
            </button>
            <button
              type="button"
              onClick={() => setShowAdjust(true)}
              className="w-full px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Adjust Time Before Saving
            </button>
            <button
              type="button"
              onClick={handleDiscard}
              className="w-full px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Discard Time
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default TimerRecoveryModal;
