/**
 * ManualTimeEntry Component
 * Form for manually adding time to a task
 */

import { useState, useCallback } from 'react';
import { Modal } from '../ui/Modal';
import { validateManualTimeEntry } from '../../utils/validators';
import { useTimer } from '../../hooks/useTimer';
import { formatDurationShort } from '../../utils/formatters';

/**
 * ManualTimeEntry component
 * @param {object} props
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Callback to close modal
 * @param {object} props.task - Task to add time to
 * @param {Function} props.onSuccess - Callback when time is added successfully
 */
export function ManualTimeEntry({ isOpen, onClose, task, onSuccess }) {
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addManualTime } = useTimer();

  // Reset form when modal opens
  const handleOpen = useCallback(() => {
    setHours('');
    setMinutes('');
    setError(null);
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError(null);

    // Parse values
    const h = parseInt(hours, 10) || 0;
    const m = parseInt(minutes, 10) || 0;

    // Validate
    const validation = validateManualTimeEntry(h, m);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    setIsSubmitting(true);
    try {
      await addManualTime(task.id, validation.totalMinutes);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add time');
    } finally {
      setIsSubmitting(false);
    }
  }, [hours, minutes, task?.id, addManualTime, onSuccess, onClose]);

  // Handle close
  const handleClose = useCallback(() => {
    setError(null);
    onClose();
  }, [onClose]);

  if (!isOpen || !task) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Time Manually" onOpen={handleOpen}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Task info */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm text-gray-500">Task</div>
          <div className="font-medium text-gray-900">{task.taskName}</div>
          {(task.actualDuration || 0) > 0 && (
            <div className="text-sm text-gray-600 mt-1">
              Current tracked time: {formatDurationShort(task.actualDuration)}
            </div>
          )}
        </div>

        {/* Time input fields */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time to add
          </label>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label htmlFor="manual-hours" className="block text-xs text-gray-500 mb-1">
                Hours
              </label>
              <input
                id="manual-hours"
                type="number"
                min="0"
                max="999"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-center"
              />
            </div>
            <span className="text-gray-500 text-xl mt-5">:</span>
            <div className="flex-1">
              <label htmlFor="manual-minutes" className="block text-xs text-gray-500 mb-1">
                Minutes
              </label>
              <input
                id="manual-minutes"
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-center"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Enter the amount of time you want to add to this task
          </p>
        </div>

        {/* Error display */}
        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md flex items-center gap-2">
            <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Adding...' : 'Add Time'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default ManualTimeEntry;
