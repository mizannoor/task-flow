/**
 * LongSessionModal Component
 * Modal dialog for reviewing and adjusting time before saving long sessions (4+ hours)
 */

import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { useTranslation } from '../../hooks/useTranslation';
import { formatDurationShort } from '../../utils/formatters';

/**
 * LongSessionModal component
 * @param {object} props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Callback to close modal
 * @param {Function} props.onConfirm - Callback with adjusted minutes when confirmed
 * @param {object} props.sessionData - Session data { taskName, elapsedMinutes }
 */
export function LongSessionModal({ isOpen, onClose, onConfirm, sessionData }) {
  const { t } = useTranslation();
  const [adjustedHours, setAdjustedHours] = useState(0);
  const [adjustedMinutes, setAdjustedMinutes] = useState(0);

  // Initialize adjusted time from elapsed minutes
  useEffect(() => {
    if (sessionData?.elapsedMinutes) {
      const hours = Math.floor(sessionData.elapsedMinutes / 60);
      const minutes = sessionData.elapsedMinutes % 60;
      setAdjustedHours(hours);
      setAdjustedMinutes(minutes);
    }
  }, [sessionData?.elapsedMinutes]);

  if (!isOpen || !sessionData) return null;

  const totalAdjustedMinutes = adjustedHours * 60 + adjustedMinutes;
  const maxMinutes = sessionData.elapsedMinutes;
  const isValid = totalAdjustedMinutes > 0 && totalAdjustedMinutes <= maxMinutes;

  const handleConfirm = () => {
    if (isValid) {
      onConfirm(totalAdjustedMinutes);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('timer.longSessionReview')}>
      <div className="space-y-4">
        {/* Warning message */}
        <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
          <svg
            className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-yellow-800">
              {t('timer.longSessionTitle')}
            </h4>
            <p className="text-sm text-yellow-700 mt-1">
              {t('timer.longSessionMessage')}
            </p>
          </div>
        </div>

        {/* Session info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-sm text-gray-500 mb-1">{t('task.task')}</div>
          <div className="font-medium text-gray-900">{sessionData.taskName}</div>

          <div className="mt-3 grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500">{t('timer.recordedTime')}</div>
              <div className="text-lg font-mono font-semibold text-gray-900">
                {formatDurationShort(sessionData.elapsedMinutes)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500">{t('timer.adjustedTime')}</div>
              <div className={`text-lg font-mono font-semibold ${isValid ? 'text-green-600' : 'text-red-600'}`}>
                {formatDurationShort(totalAdjustedMinutes)}
              </div>
            </div>
          </div>
        </div>

        {/* Time adjustment inputs */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('timer.adjustTimeToSave')}
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">{t('timer.hours')}</label>
              <input
                type="number"
                min="0"
                max={Math.floor(maxMinutes / 60)}
                value={adjustedHours}
                onChange={(e) => setAdjustedHours(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <span className="text-gray-500 mt-5">:</span>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-1">{t('timer.minutes')}</label>
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
          {!isValid && totalAdjustedMinutes > maxMinutes && (
            <p className="text-sm text-red-600 mt-1">
              {t('timer.cannotExceedRecordedTime', { duration: formatDurationShort(maxMinutes) })}
            </p>
          )}
          {!isValid && totalAdjustedMinutes === 0 && (
            <p className="text-sm text-red-600 mt-1">
              {t('timer.mustSaveAtLeast1Minute')}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {t('timer.keepRunning')}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!isValid}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('timer.save')} {formatDurationShort(totalAdjustedMinutes)}
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default LongSessionModal;
