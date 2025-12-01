/**
 * Dashboard Component
 * Main view for authenticated users
 */

import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserSwitcher } from './auth/UserSwitcher';
import { TaskProvider } from '../contexts/TaskContext';
import { TaskModal } from './tasks/TaskModal';
import { TaskList } from './tasks/TaskList';
import { useTasks } from '../hooks/useTasks';
import { DeleteConfirmDialog, ReopenConfirmDialog } from './ui/ConfirmDialog';
import { STATUSES } from '../utils/constants';

/**
 * Dashboard content component (wrapped by TaskProvider)
 */
function DashboardContent() {
  const { currentUser } = useAuth();
  const { deleteTask, startTask, completeTask, reopenTask } = useTasks();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [taskToReopen, setTaskToReopen] = useState(null);
  const [isReopening, setIsReopening] = useState(false);

  // Handle opening create task modal
  const handleCreateTask = () => {
    setSelectedTask(null);
    setIsTaskModalOpen(true);
  };

  // Handle opening edit task modal
  const handleEditTask = (task) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  // Handle modal close
  const handleCloseModal = () => {
    setIsTaskModalOpen(false);
    setSelectedTask(null);
  };

  // Handle task creation/update success
  const handleTaskSuccess = () => {
    // Could show a toast notification here
    console.log('Task saved successfully');
  };

  // Handle delete task click
  const handleDeleteClick = (task) => {
    setTaskToDelete(task);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!taskToDelete) return;

    setIsDeleting(true);
    try {
      await deleteTask(taskToDelete.id);
      setTaskToDelete(null);
      console.log('Task deleted successfully');
    } catch (error) {
      console.error('Failed to delete task:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle delete cancel
  const handleDeleteCancel = () => {
    setTaskToDelete(null);
  };

  // Handle status change
  const handleStatusChange = async (task) => {
    try {
      switch (task.status) {
        case STATUSES.PENDING:
          await startTask(task.id);
          console.log('Task started');
          break;
        case STATUSES.IN_PROGRESS:
          await completeTask(task.id);
          console.log('Task completed');
          break;
        case STATUSES.COMPLETED:
          // Show confirmation dialog for reopening
          setTaskToReopen(task);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Failed to change task status:', error);
    }
  };

  // Handle reopen confirmation
  const handleReopenConfirm = async () => {
    if (!taskToReopen) return;

    setIsReopening(true);
    try {
      await reopenTask(taskToReopen.id);
      setTaskToReopen(null);
      console.log('Task reopened');
    } catch (error) {
      console.error('Failed to reopen task:', error);
    } finally {
      setIsReopening(false);
    }
  };

  // Handle reopen cancel
  const handleReopenCancel = () => {
    setTaskToReopen(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            TaskFlow
          </h1>
          <UserSwitcher />
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Welcome, {currentUser?.displayName || 'User'}!
              </h2>
              <p className="text-gray-600">
                You're logged in as{' '}
                <span className="font-medium text-indigo-600">
                  {currentUser?.identifier}
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={handleCreateTask}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg
                className="-ml-1 mr-2 h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              New Task
            </button>
          </div>
        </div>

        {/* Tasks section */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Your Tasks
          </h3>

          {/* Task List */}
          <TaskList
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteClick}
            onStatusChange={handleStatusChange}
            onCreateTask={handleCreateTask}
          />
        </div>
      </main>

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={handleCloseModal}
        task={selectedTask}
        onSuccess={handleTaskSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={!!taskToDelete}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        itemName={taskToDelete?.taskName ? `"${taskToDelete.taskName}"` : 'this task'}
        isLoading={isDeleting}
      />

      {/* Reopen Confirmation Dialog */}
      <ReopenConfirmDialog
        isOpen={!!taskToReopen}
        onClose={handleReopenCancel}
        onConfirm={handleReopenConfirm}
        taskName={taskToReopen?.taskName || ''}
        isLoading={isReopening}
      />
    </div>
  );
}

/**
 * Dashboard component (with TaskProvider wrapper)
 */
export function Dashboard() {
  return (
    <TaskProvider>
      <DashboardContent />
    </TaskProvider>
  );
}

export default Dashboard;
