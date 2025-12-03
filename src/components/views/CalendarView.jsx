/**
 * CalendarView Component
 * Main container for the calendar view feature
 * Displays tasks on a calendar grid based on deadline dates
 * Feature: 007-calendar-view
 */

import { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTasks } from '../../hooks/useTasks';
import { useCalendar } from '../../hooks/useCalendar';
import { useTranslation } from '../../hooks/useTranslation';
import { CalendarHeader } from './CalendarHeader';
import { CalendarGrid } from './CalendarGrid';
import { CalendarWeekView } from './CalendarWeekView';
import { CalendarDayView } from './CalendarDayView';
import { UnscheduledSidebar } from './UnscheduledSidebar';
import { TaskSidePanel } from './TaskSidePanel';
import { formatDateKey } from '../../utils/dateUtils';
import { CALENDAR_VIEW_MODES, STATUSES } from '../../utils/constants';

/**
 * CalendarView container component
 * @param {object} props
 * @param {Function} props.onEditTask - Callback when task edit is requested
 * @param {Function} props.onDeleteTask - Callback when task delete is requested
 */
export function CalendarView({ onEditTask, onDeleteTask }) {
  const { t } = useTranslation();

  // Calendar state management
  const calendar = useCalendar();

  // Task data from context
  const { tasks, updateTask } = useTasks();

  // Selected task for side panel
  const [selectedTask, setSelectedTask] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Group tasks by deadline date for efficient calendar rendering
  const tasksByDate = useMemo(() => {
    const grouped = new Map();

    tasks.forEach((task) => {
      if (task.deadline) {
        const dateKey = formatDateKey(task.deadline);
        if (!grouped.has(dateKey)) {
          grouped.set(dateKey, []);
        }
        grouped.get(dateKey).push(task);
      }
    });

    return grouped;
  }, [tasks]);

  // Filter tasks without deadlines for unscheduled sidebar
  const unscheduledTasks = useMemo(() => {
    return tasks.filter((task) => !task.deadline);
  }, [tasks]);

  // Handle task click - open side panel
  const handleTaskClick = useCallback((task) => {
    setSelectedTask(task);
    setIsPanelOpen(true);
  }, []);

  // Handle side panel close
  const handlePanelClose = useCallback(() => {
    setIsPanelOpen(false);
    // Keep selectedTask for animation, clear after close
    setTimeout(() => setSelectedTask(null), 300);
  }, []);

  // Handle task drop on calendar (deadline update)
  const handleTaskDrop = useCallback(
    async (taskId, newDeadline) => {
      try {
        await updateTask(taskId, { deadline: newDeadline });
      } catch (error) {
        console.error('Failed to update task deadline:', error);
        // TODO: Show error notification
      }
    },
    [updateTask]
  );

  // Handle status change from side panel
  const handleStatusChange = useCallback(
    async (taskId, newStatus) => {
      try {
        const updates = { status: newStatus };

        // Set completedAt when marking as completed
        if (newStatus === STATUSES.COMPLETED) {
          updates.completedAt = new Date();
        } else {
          updates.completedAt = null;
        }

        await updateTask(taskId, updates);

        // Update selected task state if panel is open
        if (selectedTask?.id === taskId) {
          setSelectedTask((prev) => ({
            ...prev,
            ...updates,
          }));
        }
      } catch (error) {
        console.error('Failed to update task status:', error);
      }
    },
    [updateTask, selectedTask]
  );

  // Handle task edit request
  const handleTaskEdit = useCallback((task) => {
    handlePanelClose();
    onEditTask?.(task);
  }, [onEditTask, handlePanelClose]);

  // Handle task delete
  const handleTaskDelete = useCallback(
    async (taskId) => {
      handlePanelClose();
      onDeleteTask?.(taskId);
    },
    [handlePanelClose, onDeleteTask]
  );

  // Render the appropriate view based on view mode
  const renderCalendarView = () => {
    switch (calendar.state.viewMode) {
      case CALENDAR_VIEW_MODES.WEEK:
        return (
          <CalendarWeekView
            gridData={calendar.weekGrid}
            tasksByDate={tasksByDate}
            selectedDate={calendar.state.selectedDate}
            onDateSelect={calendar.selectDate}
            onTaskClick={handleTaskClick}
            onTaskDrop={handleTaskDrop}
          />
        );

      case CALENDAR_VIEW_MODES.DAY:
        return (
          <CalendarDayView
            dayData={calendar.dayViewData}
            tasks={tasksByDate.get(calendar.dayViewData.dateKey) || []}
            onTaskClick={handleTaskClick}
            onTaskDrop={handleTaskDrop}
          />
        );

      case CALENDAR_VIEW_MODES.MONTH:
      default:
        return (
          <CalendarGrid
            gridData={calendar.monthGrid}
            tasksByDate={tasksByDate}
            selectedDate={calendar.state.selectedDate}
            onDateSelect={calendar.selectDate}
            onTaskClick={handleTaskClick}
            onTaskDrop={handleTaskDrop}
          />
        );
    }
  };

  // Check if calendar has no tasks with deadlines
  const hasNoScheduledTasks = tasksByDate.size === 0;

  return (
    <div className="flex h-full flex-col bg-white dark:bg-slate-900">
      {/* Calendar Header */}
      <CalendarHeader
        viewMode={calendar.state.viewMode}
        currentDate={calendar.state.currentDate}
        headerText={calendar.headerText}
        onViewModeChange={calendar.setViewMode}
        onPrevious={calendar.goToPrevious}
        onNext={calendar.goToNext}
        onToday={calendar.goToToday}
        sidebarOpen={calendar.state.sidebarOpen}
        onToggleSidebar={calendar.toggleSidebar}
        unscheduledCount={unscheduledTasks.length}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Calendar Grid Area */}
        <div className="flex-1 overflow-auto">
          {hasNoScheduledTasks && tasks.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <svg
                  className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">{t('calendar.noTasksYet')}</h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {t('calendar.createTasksHint')}
                </p>
              </div>
            </div>
          ) : (
            renderCalendarView()
          )}
        </div>

        {/* Unscheduled Sidebar */}
        <UnscheduledSidebar
          tasks={unscheduledTasks}
          isOpen={calendar.state.sidebarOpen}
          onToggle={calendar.toggleSidebar}
          onTaskClick={handleTaskClick}
          onTaskDrop={handleTaskDrop}
        />
      </div>

      {/* Task Side Panel */}
      <TaskSidePanel
        task={selectedTask}
        isOpen={isPanelOpen}
        onClose={handlePanelClose}
        onEdit={handleTaskEdit}
        onDelete={handleTaskDelete}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}

CalendarView.propTypes = {
  onEditTask: PropTypes.func,
  onDeleteTask: PropTypes.func,
};

CalendarView.defaultProps = {
  onEditTask: null,
  onDeleteTask: null,
};

export default CalendarView;
