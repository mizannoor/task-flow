/**
 * TaskModal Component
 * Modal wrapper for TaskForm used for creating and editing tasks
 */

import { useState } from 'react';
import { Modal } from '../ui/Modal';
import { TaskForm } from './TaskForm';
import { useTasks } from '../../hooks/useTasks';
import { useAuth } from '../../hooks/useAuth';

/**
 * TaskModal component
 * @param {object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Callback when modal should close
 * @param {object} props.task - Task to edit (null for create mode)
 * @param {Function} props.onSuccess - Callback when task is created/updated successfully
 * @param {object[]} props.users - List of users for assignment dropdown
 */
export function TaskModal({
  isOpen,
  onClose,
  task = null,
  onSuccess,
  users = [],
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { createTask, updateTask } = useTasks();
  const { currentUser } = useAuth();

  const isEditMode = !!task;

  // Handle form submission
  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (isEditMode) {
        await updateTask(task.id, formData);
      } else {
        await createTask(formData);
      }

      // Success callback
      if (onSuccess) {
        onSuccess();
      }

      // Close modal
      onClose();
    } catch (err) {
      console.error('Failed to save task:', err);

      if (err.validationErrors) {
        // Validation errors are handled by the form
        setError('Please fix the validation errors.');
      } else {
        setError(err.message || 'Failed to save task. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    if (!isSubmitting) {
      setError(null);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? 'Edit Task' : 'Create New Task'}
      size="lg"
      closeOnBackdropClick={!isSubmitting}
      closeOnEscape={!isSubmitting}
    >
      {/* Error message */}
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      <TaskForm
        initialValues={task}
        onSubmit={handleSubmit}
        onCancel={handleClose}
        isLoading={isSubmitting}
        isEditMode={isEditMode}
        users={users}
        currentUserId={currentUser?.id}
      />
    </Modal>
  );
}

export default TaskModal;
