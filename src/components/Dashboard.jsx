/**
 * Dashboard Component
 * Main view for authenticated users
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTimer } from '../hooks/useTimer';
import { UserSwitcher } from './auth/UserSwitcher';
import { TaskProvider } from '../contexts/TaskContext';
import { TaskModal } from './tasks/TaskModal';
import { TaskList } from './tasks/TaskList';
import { KanbanView, FocusView } from './views';
import { useTasks } from '../hooks/useTasks';
import { DeleteConfirmDialog, ReopenConfirmDialog } from './ui/ConfirmDialog';
import { LongSessionModal } from './tasks/LongSessionModal';
import { TimerRecoveryModal } from './tasks/TimerRecoveryModal';
import { ToastContainer, useToast } from './ui/Toast';
import { formatElapsedTime, formatDurationShort } from '../utils/formatters';
import { STATUSES, TIMER_STATUS } from '../utils/constants';

// View type constants
const VIEW_TYPES = {
  LIST: 'list',
  KANBAN: 'kanban',
  FOCUS: 'focus',
};

// Local storage key for view preference
const VIEW_STORAGE_KEY = 'taskflow_view_preference';

/**
 * Load view preference from localStorage
 * @returns {string} - View type
 */
function loadViewPreference() {
  try {
    return localStorage.getItem(VIEW_STORAGE_KEY) || VIEW_TYPES.LIST;
  } catch {
    return VIEW_TYPES.LIST;
  }
}

/**
 * Save view preference to localStorage
 * @param {string} view - View type
 */
function saveViewPreference(view) {
  try {
    localStorage.setItem(VIEW_STORAGE_KEY, view);
  } catch (e) {
    console.warn('Failed to save view preference:', e);
  }
}

/**
 * Dashboard content component (wrapped by TaskProvider)
 */
function DashboardContent() {
  const { currentUser } = useAuth();
  const { deleteTask, startTask, completeTask, reopenTask } = useTasks();
  const {
    activeTask,
    elapsedSeconds,
    isRunning,
    isPaused,
    pendingRecovery,
    showLongSessionModal,
    longSessionData,
    lastAutoStoppedTask,
    clearAutoStoppedTask,
    confirmLongSessionStop,
    cancelLongSessionModal,
    recoverTimer,
    dismissRecovery,
    stopTimer,
  } = useTimer();

  const { toasts, toast, removeToast } = useToast();

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [taskToReopen, setTaskToReopen] = useState(null);
  const [isReopening, setIsReopening] = useState(false);

  // Show toast when a timer is auto-stopped
  useEffect(() => {
    if (lastAutoStoppedTask) {
      toast.info(
        `Timer stopped for "${lastAutoStoppedTask.taskName}". ${formatDurationShort(lastAutoStoppedTask.savedMinutes)} saved.`,
        5000
      );
      clearAutoStoppedTask();
    }
  }, [lastAutoStoppedTask, toast, clearAutoStoppedTask]);

  // View state (List vs Kanban)
  const [currentView, setCurrentView] = useState(loadViewPreference);

  // Handle view change
  const handleViewChange = (view) => {
    setCurrentView(view);
    saveViewPreference(view);
  };

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

          {/* Global Timer Indicator */}
          {activeTask && (
            <div className="flex items-center gap-3 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : isPaused ? 'bg-yellow-500' : 'bg-gray-400'}`} />
                <span className="text-sm font-medium text-gray-700 truncate max-w-[150px]">
                  {activeTask.taskName}
                </span>
              </div>
              <span className="text-sm font-mono font-semibold text-gray-900">
                {formatElapsedTime(elapsedSeconds)}
              </span>
              {isPaused && (
                <span className="text-xs text-yellow-600 font-medium">Paused</span>
              )}
              <button
                type="button"
                onClick={() => stopTimer()}
                className="p-1 text-gray-400 hover:text-red-500 rounded"
                title="Stop timer"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
              </button>
            </div>
          )}

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
        <div className={`bg-white rounded-lg shadow ${currentView === VIEW_TYPES.KANBAN ? 'p-4' : 'p-6'}`}>
          {/* Section header with view toggle */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Your Tasks
            </h3>

            {/* View toggle buttons */}
            <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
              <button
                type="button"
                onClick={() => handleViewChange(VIEW_TYPES.LIST)}
                className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${currentView === VIEW_TYPES.LIST
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
                aria-pressed={currentView === VIEW_TYPES.LIST}
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                List
              </button>
              <button
                type="button"
                onClick={() => handleViewChange(VIEW_TYPES.KANBAN)}
                className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${currentView === VIEW_TYPES.KANBAN
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
                aria-pressed={currentView === VIEW_TYPES.KANBAN}
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
                Kanban
              </button>
              <button
                type="button"
                onClick={() => handleViewChange(VIEW_TYPES.FOCUS)}
                className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${currentView === VIEW_TYPES.FOCUS
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
                aria-pressed={currentView === VIEW_TYPES.FOCUS}
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Focus
              </button>
            </div>
          </div>

          {/* Conditional view rendering */}
          {currentView === VIEW_TYPES.LIST && (
            <TaskList
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteClick}
              onStatusChange={handleStatusChange}
              onCreateTask={handleCreateTask}
            />
          )}
          {currentView === VIEW_TYPES.KANBAN && (
            <KanbanView
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteClick}
              onCreateTask={handleCreateTask}
            />
          )}
          {currentView === VIEW_TYPES.FOCUS && (
            <FocusView
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteClick}
              onCreateTask={handleCreateTask}
            />
          )}
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

      {/* Long Session Modal */}
      <LongSessionModal
        isOpen={showLongSessionModal}
        onClose={cancelLongSessionModal}
        onConfirm={confirmLongSessionStop}
        sessionData={longSessionData}
      />

      {/* Timer Recovery Modal */}
      <TimerRecoveryModal
        isOpen={!!pendingRecovery}
        onClose={dismissRecovery}
        onRecover={recoverTimer}
        recoveryInfo={pendingRecovery}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
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
