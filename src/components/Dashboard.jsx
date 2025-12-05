/**
 * Dashboard Component
 * Main view for authenticated users
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTimer } from '../hooks/useTimer';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from '../hooks/useTranslation';
import { useTranslatedLabels } from '../hooks/useTranslatedLabels';
import { UserSwitcher } from './auth/UserSwitcher';
import { ThemeToggle } from './ui/ThemeToggle';
import { LanguageSelector } from './ui/LanguageSelector';
import { TaskProvider } from '../contexts/TaskContext';
import { KeyboardShortcutProvider } from '../contexts/KeyboardShortcutContext';
import { TaskModal } from './tasks/TaskModal';
import { TaskList } from './tasks/TaskList';
import { KanbanView, FocusView, CalendarView } from './views';
import { PersonalDashboard } from './analytics/PersonalDashboard';
import { TeamDashboard } from './analytics/TeamDashboard';
import { useTasks } from '../hooks/useTasks';
import { DeleteConfirmDialog, ReopenConfirmDialog } from './ui/ConfirmDialog';
import { LongSessionModal } from './tasks/LongSessionModal';
import { TimerRecoveryModal } from './tasks/TimerRecoveryModal';
import { ToastContainer, useToast } from './ui/Toast';
import { KeyboardShortcutsHelp } from './ui/KeyboardShortcutsHelp';
import { BulkActionBar } from './tasks/BulkActionBar';
import { BulkDeleteConfirmModal } from './tasks/BulkDeleteConfirmModal';
import { BulkBlockedWarningModal } from './tasks/BulkBlockedWarningModal';
import { BulkTagModal } from './tasks/BulkTagModal';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { bulkDeleteTasks, bulkUpdateStatus, bulkReassignTasks, bulkAddTags, bulkRemoveTags, getBlockedTasksInfo, getTagsFromTasks } from '../services/bulkService';
import { formatElapsedTime, formatDurationShort } from '../utils/formatters';
import { STATUSES, THEME_MODES } from '../utils/constants';

// View type constants
const VIEW_TYPES = {
  LIST: 'list',
  KANBAN: 'kanban',
  FOCUS: 'focus',
  CALENDAR: 'calendar',
  STATISTICS: 'statistics',
  TEAM_ANALYTICS: 'team-analytics',
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
 * Wrapper component for BulkActionBar that accesses KeyboardShortcutContext
 */
function BulkActionBarWrapper({ toast, isBulkProcessing, setIsBulkProcessing, showDeleteConfirmFromKeyboard, setShowDeleteConfirmFromKeyboard }) {
  const { t } = useTranslation();
  const { selectedTaskIds, clearSelections } = useKeyboardShortcuts();
  const { refreshTasks } = useTasks();
  const { users } = useAuth();

  // Bulk delete state - combine with keyboard trigger
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isDeleteConfirmOpen = showDeleteConfirm || showDeleteConfirmFromKeyboard;

  // Bulk status change state
  const [showBlockedWarning, setShowBlockedWarning] = useState(false);
  const [blockedTasksInfo, setBlockedTasksInfo] = useState([]);
  const [pendingStatusChange, setPendingStatusChange] = useState(null);

  // Bulk tag state
  const [showTagModal, setShowTagModal] = useState(false);
  const [tagMode, setTagMode] = useState('add');
  const [existingTags, setExistingTags] = useState([]);
  const [tagModalKey, setTagModalKey] = useState(0);

  // Handle bulk delete - show confirmation modal
  const handleBulkDelete = () => {
    setShowDeleteConfirm(true);
  };

  // Confirm bulk delete
  const confirmBulkDelete = async () => {
    setIsBulkProcessing(true);
    try {
      const taskIdsArray = Array.from(selectedTaskIds);
      const result = await bulkDeleteTasks(taskIdsArray);

      if (result.success) {
        toast.success(
          result.affectedCount === 1
            ? t('bulk.delete.successSingular', { count: result.affectedCount })
            : t('bulk.delete.success', { count: result.affectedCount })
        );
        clearSelections();
        await refreshTasks();
      } else {
        toast.error(result.error || t('bulk.delete.error'));
      }
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast.error(t('bulk.delete.error'));
    } finally {
      setIsBulkProcessing(false);
      setShowDeleteConfirm(false);
      setShowDeleteConfirmFromKeyboard?.(false);
    }
  };

  // Cancel bulk delete
  const cancelBulkDelete = () => {
    setShowDeleteConfirm(false);
    setShowDeleteConfirmFromKeyboard?.(false);
  };

  // Handle bulk status change - check for blocked tasks first
  const handleBulkStatusChange = async (status) => {
    const taskIdsArray = Array.from(selectedTaskIds);

    // Check for blocked tasks when changing to in-progress
    if (status === STATUSES.IN_PROGRESS) {
      setIsBulkProcessing(true);
      try {
        const blocked = await getBlockedTasksInfo(taskIdsArray);
        if (blocked.length > 0) {
          // Show warning modal
          setBlockedTasksInfo(blocked);
          setPendingStatusChange(status);
          setShowBlockedWarning(true);
          setIsBulkProcessing(false);
          return;
        }
      } catch (error) {
        console.error('Error checking blocked tasks:', error);
      }
      setIsBulkProcessing(false);
    }

    // No blocked tasks or not in-progress, proceed directly
    await executeBulkStatusChange(status, false);
  };

  // Execute bulk status change
  const executeBulkStatusChange = async (status, skipBlocked = false) => {
    setIsBulkProcessing(true);
    try {
      const taskIdsArray = Array.from(selectedTaskIds);
      const result = await bulkUpdateStatus(taskIdsArray, status, { skipBlocked });

      if (result.success) {
        toast.success(
          result.affectedCount === 1
            ? t('bulk.status.successSingular', { count: result.affectedCount })
            : t('bulk.status.success', { count: result.affectedCount })
        );
        clearSelections();
        await refreshTasks();
      } else {
        toast.error(result.error || t('bulk.status.error'));
      }
    } catch (error) {
      console.error('Bulk status change error:', error);
      toast.error(t('bulk.status.error'));
    } finally {
      setIsBulkProcessing(false);
      setShowBlockedWarning(false);
      setPendingStatusChange(null);
      setBlockedTasksInfo([]);
    }
  };

  // Handle blocked warning actions
  const handleSkipBlocked = () => {
    if (pendingStatusChange) {
      executeBulkStatusChange(pendingStatusChange, true);
    }
  };

  const handleForceAll = () => {
    if (pendingStatusChange) {
      executeBulkStatusChange(pendingStatusChange, false);
    }
  };

  const cancelStatusChange = () => {
    setShowBlockedWarning(false);
    setPendingStatusChange(null);
    setBlockedTasksInfo([]);
  };

  // Handle bulk reassign
  const handleBulkReassign = async (userId) => {
    const user = users?.find(u => u.id === userId);
    const userName = user?.displayName || user?.identifier || 'Unknown';

    setIsBulkProcessing(true);
    try {
      const taskIdsArray = Array.from(selectedTaskIds);
      const result = await bulkReassignTasks(taskIdsArray, userId);

      if (result.success) {
        toast.success(
          result.affectedCount === 1
            ? t('bulk.reassign.successSingular', { count: result.affectedCount, userName })
            : t('bulk.reassign.success', { count: result.affectedCount, userName })
        );
        clearSelections();
        await refreshTasks();
      } else {
        toast.error(result.error || t('bulk.reassign.error'));
      }
    } catch (error) {
      console.error('Bulk reassign error:', error);
      toast.error(t('bulk.reassign.error'));
    } finally {
      setIsBulkProcessing(false);
    }
  };

  // Handle manage tags
  const handleManageTags = async (mode) => {
    setTagMode(mode);
    setTagModalKey(prev => prev + 1); // Reset modal state

    if (mode === 'remove') {
      // Fetch existing tags from selected tasks
      setIsBulkProcessing(true);
      try {
        const taskIdsArray = Array.from(selectedTaskIds);
        const tags = await getTagsFromTasks(taskIdsArray);
        setExistingTags(tags);
      } catch (error) {
        console.error('Error fetching tags:', error);
        setExistingTags([]);
      } finally {
        setIsBulkProcessing(false);
      }
    } else {
      setExistingTags([]);
    }

    setShowTagModal(true);
  };

  // Confirm bulk tag operation
  const confirmBulkTags = async (tags) => {
    setIsBulkProcessing(true);
    try {
      const taskIdsArray = Array.from(selectedTaskIds);
      let result;

      if (tagMode === 'add') {
        result = await bulkAddTags(taskIdsArray, tags);
      } else {
        result = await bulkRemoveTags(taskIdsArray, tags);
      }

      if (result.success) {
        toast.success(
          result.affectedCount === 1
            ? t('bulk.tags.successSingular', { count: result.affectedCount })
            : t('bulk.tags.success', { count: result.affectedCount })
        );
        clearSelections();
        await refreshTasks();
      } else {
        toast.error(result.error || t('bulk.tags.error'));
      }
    } catch (error) {
      console.error('Bulk tag error:', error);
      toast.error(t('bulk.tags.error'));
    } finally {
      setIsBulkProcessing(false);
      setShowTagModal(false);
    }
  };

  // Cancel tag modal
  const cancelTagModal = () => {
    setShowTagModal(false);
  };

  return (
    <>
      <BulkActionBar
        selectedCount={selectedTaskIds.size}
        onClearSelection={clearSelections}
        onDelete={handleBulkDelete}
        onStatusChange={handleBulkStatusChange}
        onReassign={handleBulkReassign}
        onManageTags={handleManageTags}
        isProcessing={isBulkProcessing}
      />

      {/* Bulk Delete Confirmation Modal */}
      <BulkDeleteConfirmModal
        isOpen={isDeleteConfirmOpen}
        taskCount={selectedTaskIds.size}
        onConfirm={confirmBulkDelete}
        onCancel={cancelBulkDelete}
        isLoading={isBulkProcessing}
      />

      {/* Bulk Blocked Warning Modal */}
      <BulkBlockedWarningModal
        isOpen={showBlockedWarning}
        blockedTasks={blockedTasksInfo}
        totalTaskCount={selectedTaskIds.size}
        onSkipBlocked={handleSkipBlocked}
        onForceAll={handleForceAll}
        onCancel={cancelStatusChange}
        isLoading={isBulkProcessing}
      />

      {/* Bulk Tag Modal */}
      <BulkTagModal
        isOpen={showTagModal}
        mode={tagMode}
        existingTags={existingTags}
        onConfirm={confirmBulkTags}
        onCancel={cancelTagModal}
        isLoading={isBulkProcessing}
        resetKey={tagModalKey}
      />
    </>
  );
}

/**
 * Dashboard content component (wrapped by TaskProvider and KeyboardShortcutProvider)
 */
function DashboardContent() {
  const { currentUser } = useAuth();
  const { setTheme } = useTheme();
  const { t } = useTranslation();
  const { viewLabels, statusLabels } = useTranslatedLabels();
  const { tasks, deleteTask, startTask, completeTask, reopenTask, getTaskById } = useTasks();
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

  // Refs for keyboard shortcuts
  const searchRef = useRef(null);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [taskToReopen, setTaskToReopen] = useState(null);
  const [isReopening, setIsReopening] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Bulk operation state
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  // Visible task IDs for keyboard shortcuts (Ctrl+A select all)
  const visibleTaskIdsRef = useRef([]);

  // Update visible task IDs when tasks change
  useEffect(() => {
    visibleTaskIdsRef.current = tasks?.map(t => t.id) || [];
  }, [tasks]);

  // Handler for bulk delete keyboard shortcut
  const handleKeyboardBulkDelete = useCallback(() => {
    setShowBulkDeleteConfirm(true);
  }, []);

  // Show toast when a timer is auto-stopped
  useEffect(() => {
    if (lastAutoStoppedTask) {
      toast.info(
        t('toast.timerStopped', {
          duration: formatDurationShort(lastAutoStoppedTask.savedMinutes)
        }),
        5000
      );
      clearAutoStoppedTask();
    }
  }, [lastAutoStoppedTask, toast, clearAutoStoppedTask, t]);

  // View state (List vs Kanban)
  const [currentView, setCurrentView] = useState(loadViewPreference);

  // Handle view change with toast notification
  const handleViewChange = useCallback((view) => {
    if (view !== currentView) {
      setCurrentView(view);
      saveViewPreference(view);
    }
  }, [currentView]);

  // Handle opening create task modal
  const handleCreateTask = useCallback(() => {
    setSelectedTask(null);
    setIsTaskModalOpen(true);
  }, []);

  // Handle keyboard shortcut for editing task by ID
  const handleEditTaskById = useCallback((taskId) => {
    const task = getTaskById ? getTaskById(taskId) : tasks?.find(t => t.id === taskId);
    if (task) {
      setSelectedTask(task);
      setIsTaskModalOpen(true);
    }
  }, [getTaskById, tasks]);

  // Handle keyboard shortcut for deleting task by ID
  const handleDeleteTaskById = useCallback((taskId) => {
    const task = getTaskById ? getTaskById(taskId) : tasks?.find(t => t.id === taskId);
    if (task) {
      setTaskToDelete(task);
    }
  }, [getTaskById, tasks]);

  // Handle keyboard shortcut for completing task by ID
  const handleCompleteTaskById = useCallback(async (taskId) => {
    const task = getTaskById ? getTaskById(taskId) : tasks?.find(t => t.id === taskId);
    if (task && task.status === STATUSES.IN_PROGRESS) {
      try {
        await completeTask(taskId);
        toast.success(t('toast.taskCompleted', { name: task.taskName }), 3000);
      } catch (error) {
        toast.error(t('toast.errorGeneric'));
      }
    }
  }, [getTaskById, tasks, completeTask, toast, t]);

  // Handle keyboard shortcut for starting task by ID
  const handleStartTaskById = useCallback(async (taskId) => {
    const task = getTaskById ? getTaskById(taskId) : tasks?.find(t => t.id === taskId);
    if (task && task.status === STATUSES.PENDING) {
      try {
        await startTask(taskId);
        toast.success(t('toast.taskStarted', { name: task.taskName }), 3000);
      } catch (error) {
        toast.error(t('toast.errorGeneric'));
      }
    }
  }, [getTaskById, tasks, startTask, toast, t]);

  // Handle keyboard shortcut for switching to dark mode
  const handleSwitchToDark = useCallback(() => {
    setTheme(THEME_MODES.DARK);
  }, [setTheme]);

  // Handle keyboard shortcut for switching to light mode
  const handleSwitchToLight = useCallback(() => {
    setTheme(THEME_MODES.LIGHT);
  }, [setTheme]);

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

  // Handle delete task click - accepts either a task object or task ID
  const handleDeleteClick = (taskOrId) => {
    // If it's a string (ID), find the task; otherwise use the task object directly
    if (typeof taskOrId === 'string') {
      const task = getTaskById(taskOrId);
      if (task) {
        setTaskToDelete(task);
      }
    } else {
      setTaskToDelete(taskOrId);
    }
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
    <KeyboardShortcutProvider
      userId={currentUser?.id}
      currentView={currentView}
      onViewChange={handleViewChange}
      onCreateTask={handleCreateTask}
      onEditTask={handleEditTaskById}
      onDeleteTask={handleDeleteTaskById}
      onCompleteTask={handleCompleteTaskById}
      onStartTask={handleStartTaskById}
      onSwitchToDark={handleSwitchToDark}
      onSwitchToLight={handleSwitchToLight}
      searchRef={searchRef}
      visibleTaskIds={visibleTaskIdsRef.current}
      onBulkDelete={handleKeyboardBulkDelete}
    >
      <div className="min-h-screen bg-gray-100 dark:bg-slate-900">
        {/* Header */}
        <header className="bg-white dark:bg-slate-800 shadow dark:shadow-slate-700/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t('auth.appName')}
            </h1>

            {/* Global Timer Indicator */}
            {activeTask && (
              <div className="flex items-center gap-3 px-3 py-1.5 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : isPaused ? 'bg-yellow-500' : 'bg-gray-400'}`} />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate max-w-[150px]">
                    {activeTask.taskName}
                  </span>
                </div>
                <span className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
                  {formatElapsedTime(elapsedSeconds)}
                </span>
                {isPaused && (
                  <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">{t('timer.paused')}</span>
                )}
                <button
                  type="button"
                  onClick={() => stopTimer()}
                  className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded"
                  title={t('timer.stopTimer')}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  </svg>
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              <LanguageSelector />
              <ThemeToggle />
              <UserSwitcher />
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome section */}
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-slate-700/30 p-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {t('auth.welcome', { name: currentUser?.displayName || 'User' })}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {currentUser?.identifier && (
                    <span className="font-medium text-indigo-600 dark:text-indigo-400">
                      {currentUser.identifier}
                    </span>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={handleCreateTask}
                title={t('tasks.createTask') + " (Ctrl+N)"}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-800"
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
                {t('tasks.newTask')}
                <kbd className="ml-2 hidden sm:inline-flex items-center px-1.5 py-0.5 rounded bg-indigo-500 dark:bg-indigo-600 text-xs font-mono">⌃N</kbd>
              </button>
            </div>
          </div>

          {/* Tasks section */}
          <div className={`bg-white dark:bg-slate-800 rounded-lg shadow dark:shadow-slate-700/30 ${currentView === VIEW_TYPES.KANBAN ? 'p-4' : 'p-6'}`}>
            {/* Section header with view toggle */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {t('tasks.myTasks')}
              </h3>

              {/* View toggle buttons */}
              <div className="inline-flex rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 p-1">
                <button
                  type="button"
                  onClick={() => handleViewChange(VIEW_TYPES.LIST)}
                  title={viewLabels.list + " (Press 1)"}
                  className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${currentView === VIEW_TYPES.LIST
                    ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                  aria-pressed={currentView === VIEW_TYPES.LIST}
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  {viewLabels.list}
                  <span className="ml-1.5 text-xs text-gray-400 dark:text-gray-500">[1]</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleViewChange(VIEW_TYPES.KANBAN)}
                  title={viewLabels.kanban + " (Press 2)"}
                  className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${currentView === VIEW_TYPES.KANBAN
                    ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                  aria-pressed={currentView === VIEW_TYPES.KANBAN}
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                  {viewLabels.kanban}
                  <span className="ml-1.5 text-xs text-gray-400 dark:text-gray-500">[2]</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleViewChange(VIEW_TYPES.FOCUS)}
                  title={viewLabels.focus + " (Press 4)"}
                  className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${currentView === VIEW_TYPES.FOCUS
                    ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                  aria-pressed={currentView === VIEW_TYPES.FOCUS}
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {viewLabels.focus}
                  <span className="ml-1.5 text-xs text-gray-400 dark:text-gray-500">[4]</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleViewChange(VIEW_TYPES.CALENDAR)}
                  title="Calendar view (Press 3)"
                  className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${currentView === VIEW_TYPES.CALENDAR
                    ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                  aria-pressed={currentView === VIEW_TYPES.CALENDAR}
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {viewLabels.calendar}
                  <span className="ml-1.5 text-xs text-gray-400 dark:text-gray-500">[3]</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleViewChange(VIEW_TYPES.STATISTICS)}
                  className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${currentView === VIEW_TYPES.STATISTICS
                    ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                  aria-pressed={currentView === VIEW_TYPES.STATISTICS}
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  {viewLabels.statistics}
                </button>
                <button
                  type="button"
                  onClick={() => handleViewChange(VIEW_TYPES.TEAM_ANALYTICS)}
                  className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${currentView === VIEW_TYPES.TEAM_ANALYTICS
                    ? 'bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                  aria-pressed={currentView === VIEW_TYPES.TEAM_ANALYTICS}
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {viewLabels.teamAnalytics}
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
            {currentView === VIEW_TYPES.CALENDAR && (
              <div className="h-[600px] -mx-6 -mb-6">
                <CalendarView
                  onEditTask={handleEditTask}
                  onDeleteTask={handleDeleteClick}
                />
              </div>
            )}
            {currentView === VIEW_TYPES.STATISTICS && (
              <PersonalDashboard />
            )}
            {currentView === VIEW_TYPES.TEAM_ANALYTICS && (
              <TeamDashboard />
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

        {/* Keyboard Shortcuts Help Modal */}
        <KeyboardShortcutsHelp
          isOpen={isHelpOpen}
          onClose={() => setIsHelpOpen(false)}
        />

        {/* Bulk Action Bar - only visible when tasks are selected in list view */}
        {currentView === VIEW_TYPES.LIST && (
          <BulkActionBarWrapper
            toast={toast}
            isBulkProcessing={isBulkProcessing}
            setIsBulkProcessing={setIsBulkProcessing}
            showDeleteConfirmFromKeyboard={showBulkDeleteConfirm}
            setShowDeleteConfirmFromKeyboard={setShowBulkDeleteConfirm}
          />
        )}

        {/* Toast Notifications */}
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
      </div>
    </KeyboardShortcutProvider>
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
