/**
 * useTimer Hook
 * Timer state management and control actions for time tracking feature
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAuth } from './useAuth';
import { useTasks } from './useTasks';
import * as timerService from '../services/timerService';
import { TIMER_STATUS, TIMER_CONSTANTS } from '../utils/constants';

/**
 * Custom hook for managing task timers
 * Provides timer state, elapsed time display, and control actions
 * 
 * @returns {object} - Timer state and actions
 */
export function useTimer() {
  const { currentUser } = useAuth();
  const { tasks, refreshTasks } = useTasks();
  
  // Timer state
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [timerStatus, setTimerStatus] = useState(TIMER_STATUS.IDLE);
  const [pendingRecovery, setPendingRecovery] = useState(null);
  const [showLongSessionModal, setShowLongSessionModal] = useState(false);
  const [longSessionData, setLongSessionData] = useState(null);
  const [lastAutoStoppedTask, setLastAutoStoppedTask] = useState(null);
  
  // Refs for interval management
  const intervalRef = useRef(null);
  const activeTaskRef = useRef(null);

  // Get the active task object
  const activeTask = useMemo(() => {
    if (!activeTaskId) return null;
    return tasks.find((t) => t.id === activeTaskId) || null;
  }, [activeTaskId, tasks]);

  // Update activeTaskRef for use in interval callback
  useEffect(() => {
    activeTaskRef.current = activeTask;
  }, [activeTask]);

  // ==========================================================================
  // Timer Display Interval
  // ==========================================================================

  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Only run interval if timer is running (not paused, not idle)
    if (timerStatus === TIMER_STATUS.RUNNING && activeTask) {
      // Update immediately - this is necessary to sync display with actual elapsed time
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setElapsedSeconds(timerService.calculateElapsedSeconds(activeTask));

      // Set up 1-second interval
      intervalRef.current = setInterval(() => {
        if (activeTaskRef.current) {
          setElapsedSeconds(timerService.calculateElapsedSeconds(activeTaskRef.current));
        }
      }, TIMER_CONSTANTS.DISPLAY_INTERVAL_MS);
    } else if (timerStatus === TIMER_STATUS.PAUSED && activeTask) {
      // When paused, calculate and display frozen time
      setElapsedSeconds(timerService.calculateElapsedSeconds(activeTask));
    } else {
      // Idle - reset display
      setElapsedSeconds(0);
    }

    // Cleanup on unmount or status change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [timerStatus, activeTask]);

  // ==========================================================================
  // Initialize Timer State on Mount / User Change
  // ==========================================================================

  useEffect(() => {
    async function initializeTimerState() {
      if (!currentUser?.id) {
        setActiveTaskId(null);
        setTimerStatus(TIMER_STATUS.IDLE);
        setElapsedSeconds(0);
        return;
      }

      try {
        // Check for any task with active timer for this user
        const taskWithTimer = await timerService.getActiveTimerTask(currentUser.id);

        if (taskWithTimer) {
          setActiveTaskId(taskWithTimer.id);
          
          // Determine status
          const status = timerService.getTimerStatus(taskWithTimer);
          setTimerStatus(status);

          // Calculate elapsed time
          const elapsed = timerService.calculateElapsedSeconds(taskWithTimer);
          setElapsedSeconds(elapsed);

          // Check if this is an abandoned timer (running but page was closed)
          // If it's been running for a while, show recovery modal
          const elapsedMinutes = Math.floor(elapsed / 60);
          if (status === TIMER_STATUS.RUNNING && elapsedMinutes > 0) {
            // Check if this might be an abandoned session (over 4 hours auto-prompts)
            if (timerService.isLongSession(elapsedMinutes)) {
              setPendingRecovery({
                taskId: taskWithTimer.id,
                taskName: taskWithTimer.taskName,
                elapsedSeconds: elapsed,
                startedAt: taskWithTimer.timerStartedAt,
              });
            }
          }
        } else {
          setActiveTaskId(null);
          setTimerStatus(TIMER_STATUS.IDLE);
          setElapsedSeconds(0);
        }
      } catch (error) {
        console.error('Failed to initialize timer state:', error);
      }
    }

    initializeTimerState();
  }, [currentUser?.id]);

  // ==========================================================================
  // Timer Control Actions
  // ==========================================================================

  /**
   * Start timer on a task
   * Auto-stops any existing active timer first
   */
  const startTimer = useCallback(async (taskId) => {
    if (!currentUser?.id) return;

    try {
      // If there's already an active timer on a different task, stop it first
      if (activeTaskId && activeTaskId !== taskId) {
        const previousTask = tasks.find(t => t.id === activeTaskId);
        const previousElapsed = timerService.calculateElapsedMinutes(previousTask);
        
        await timerService.stopTaskTimer(activeTaskId);
        await refreshTasks();
        
        // Store info about auto-stopped task for toast notification
        if (previousTask) {
          setLastAutoStoppedTask({
            id: previousTask.id,
            taskName: previousTask.taskName,
            savedMinutes: previousElapsed,
          });
        }
      }

      // Start the new timer
      const updatedTask = await timerService.startTaskTimer(taskId);
      
      setActiveTaskId(taskId);
      setTimerStatus(TIMER_STATUS.RUNNING);
      setElapsedSeconds(0);
      
      await refreshTasks();
      
      return updatedTask;
    } catch (error) {
      console.error('Failed to start timer:', error);
      throw error;
    }
  }, [currentUser?.id, activeTaskId, tasks, refreshTasks]);

  /**
   * Pause the currently running timer
   */
  const pauseTimer = useCallback(async () => {
    if (!activeTaskId) return;

    try {
      const updatedTask = await timerService.pauseTaskTimer(activeTaskId);
      setTimerStatus(TIMER_STATUS.PAUSED);
      await refreshTasks();
      return updatedTask;
    } catch (error) {
      console.error('Failed to pause timer:', error);
      throw error;
    }
  }, [activeTaskId, refreshTasks]);

  /**
   * Resume a paused timer
   */
  const resumeTimer = useCallback(async () => {
    if (!activeTaskId) return;

    try {
      const updatedTask = await timerService.resumeTaskTimer(activeTaskId);
      setTimerStatus(TIMER_STATUS.RUNNING);
      await refreshTasks();
      return updatedTask;
    } catch (error) {
      console.error('Failed to resume timer:', error);
      throw error;
    }
  }, [activeTaskId, refreshTasks]);

  /**
   * Stop timer and save time
   * Shows long session modal if session > 4 hours
   */
  const stopTimer = useCallback(async (adjustedMinutes = null) => {
    if (!activeTaskId) return;

    try {
      const elapsedMinutes = Math.floor(elapsedSeconds / 60);

      // Check for long session and show modal if no adjusted time provided
      if (adjustedMinutes === null && timerService.isLongSession(elapsedMinutes)) {
        setLongSessionData({
          taskId: activeTaskId,
          taskName: activeTask?.taskName || 'Unknown Task',
          elapsedMinutes,
        });
        setShowLongSessionModal(true);
        return; // Don't stop yet - wait for modal confirmation
      }

      // Stop and save
      const updatedTask = await timerService.stopTaskTimer(activeTaskId, adjustedMinutes);
      
      setActiveTaskId(null);
      setTimerStatus(TIMER_STATUS.IDLE);
      setElapsedSeconds(0);
      setShowLongSessionModal(false);
      setLongSessionData(null);
      
      await refreshTasks();
      
      return updatedTask;
    } catch (error) {
      console.error('Failed to stop timer:', error);
      throw error;
    }
  }, [activeTaskId, activeTask, elapsedSeconds, refreshTasks]);

  /**
   * Confirm long session stop with adjusted time
   */
  const confirmLongSessionStop = useCallback(async (adjustedMinutes) => {
    await stopTimer(adjustedMinutes);
  }, [stopTimer]);

  /**
   * Cancel long session modal
   */
  const cancelLongSessionModal = useCallback(() => {
    setShowLongSessionModal(false);
    setLongSessionData(null);
  }, []);

  /**
   * Discard timer without saving
   */
  const discardTimer = useCallback(async () => {
    if (!activeTaskId) return;

    try {
      await timerService.discardTaskTimer(activeTaskId);
      
      setActiveTaskId(null);
      setTimerStatus(TIMER_STATUS.IDLE);
      setElapsedSeconds(0);
      setPendingRecovery(null);
      
      await refreshTasks();
    } catch (error) {
      console.error('Failed to discard timer:', error);
      throw error;
    }
  }, [activeTaskId, refreshTasks]);

  /**
   * Handle timer recovery (for abandoned sessions)
   */
  const recoverTimer = useCallback(async (action, adjustedMinutes = null) => {
    if (!pendingRecovery) return;

    try {
      switch (action) {
        case 'save':
          await timerService.stopTaskTimer(pendingRecovery.taskId);
          break;
        case 'adjust':
          await timerService.stopTaskTimer(pendingRecovery.taskId, adjustedMinutes);
          break;
        case 'discard':
          await timerService.discardTaskTimer(pendingRecovery.taskId);
          break;
      }

      setActiveTaskId(null);
      setTimerStatus(TIMER_STATUS.IDLE);
      setElapsedSeconds(0);
      setPendingRecovery(null);
      
      await refreshTasks();
    } catch (error) {
      console.error('Failed to recover timer:', error);
      throw error;
    }
  }, [pendingRecovery, refreshTasks]);

  /**
   * Dismiss recovery modal without action
   */
  const dismissRecovery = useCallback(() => {
    setPendingRecovery(null);
  }, []);

  /**
   * Clear the last auto-stopped task notification
   */
  const clearAutoStoppedTask = useCallback(() => {
    setLastAutoStoppedTask(null);
  }, []);

  /**
   * Add manual time entry
   */
  const addManualTime = useCallback(async (taskId, minutes) => {
    try {
      const updatedTask = await timerService.addManualTimeEntry(taskId, minutes);
      await refreshTasks();
      return updatedTask;
    } catch (error) {
      console.error('Failed to add manual time:', error);
      throw error;
    }
  }, [refreshTasks]);

  // ==========================================================================
  // Task-specific helpers
  // ==========================================================================

  /**
   * Get timer state for a specific task
   */
  const getTaskTimerState = useCallback((taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) {
      return {
        status: TIMER_STATUS.IDLE,
        isActive: false,
        elapsedSeconds: 0,
        canStart: false,
        canPause: false,
        canResume: false,
        canStop: false,
      };
    }

    const isActive = activeTaskId === taskId;
    const status = isActive ? timerStatus : timerService.getTimerStatus(task);

    return {
      status,
      isActive,
      elapsedSeconds: isActive ? elapsedSeconds : timerService.calculateElapsedSeconds(task),
      canStart: timerService.canStartTimer(task) && !isActive,
      canPause: timerService.canPauseTimer(task) && isActive,
      canResume: timerService.canResumeTimer(task) && isActive,
      canStop: timerService.canStopTimer(task) && isActive,
    };
  }, [tasks, activeTaskId, timerStatus, elapsedSeconds]);

  // ==========================================================================
  // Return Value
  // ==========================================================================

  return {
    // State
    activeTaskId,
    activeTask,
    elapsedSeconds,
    timerStatus,
    isRunning: timerStatus === TIMER_STATUS.RUNNING,
    isPaused: timerStatus === TIMER_STATUS.PAUSED,
    isIdle: timerStatus === TIMER_STATUS.IDLE,
    
    // Recovery state
    pendingRecovery,
    
    // Long session modal state
    showLongSessionModal,
    longSessionData,
    
    // Auto-stop notification
    lastAutoStoppedTask,
    clearAutoStoppedTask,
    
    // Actions
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    discardTimer,
    addManualTime,
    
    // Recovery actions
    recoverTimer,
    dismissRecovery,
    
    // Long session actions
    confirmLongSessionStop,
    cancelLongSessionModal,
    
    // Helpers
    getTaskTimerState,
  };
}

export default useTimer;
