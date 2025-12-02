/**
 * Timer Types - Time Tracking Feature
 * TypeScript type definitions for timer-related data structures
 * 
 * Feature: 005-time-tracking
 * Date: December 1, 2025
 */

// =============================================================================
// Timer Status
// =============================================================================

/**
 * Possible states for a task timer
 */
export type TimerStatus = 'idle' | 'running' | 'paused';

// =============================================================================
// Task Timer Fields (Database Schema Extension)
// =============================================================================

/**
 * Timer-related fields added to Task entity
 * These fields extend the existing Task interface from task-context.ts
 */
export interface TaskTimerFields {
  /** Timestamp when timer was started; null if timer is not active */
  timerStartedAt: Date | null;

  /** Timestamp when timer was paused; null if not paused */
  timerPausedAt: Date | null;

  /** Minutes accumulated in current session before pause; resets on stop */
  accumulatedDuration: number;

  /** Total tracked time in minutes (cumulative across all sessions) - existing field */
  actualDuration: number;

  /** Estimated duration in minutes - existing field, used for comparison */
  estimatedDuration: number;
}

// =============================================================================
// Timer Context State
// =============================================================================

/**
 * Transient timer state stored in React Context
 */
export interface TimerContextState {
  /** ID of task with currently running timer; null if no active timer */
  activeTaskId: string | null;

  /** Current elapsed seconds for UI display (updated every second) */
  displaySeconds: number;

  /** Current timer status for the active task */
  timerStatus: TimerStatus;

  /** Whether a timer recovery prompt should be shown on app load */
  pendingRecovery: TimerRecoveryInfo | null;
}

/**
 * Information about an abandoned timer session to recover
 */
export interface TimerRecoveryInfo {
  /** Task ID with abandoned timer */
  taskId: string;

  /** Task name for display */
  taskName: string;

  /** Calculated elapsed time in seconds since timer was started */
  elapsedSeconds: number;

  /** Timestamp when timer was originally started */
  startedAt: Date;
}

// =============================================================================
// Timer Actions
// =============================================================================

/**
 * Available timer operations
 */
export interface TimerActions {
  /** Start timer on a task (auto-stops any running timer) */
  startTimer: (taskId: string) => Promise<void>;

  /** Pause the currently running timer */
  pauseTimer: () => Promise<void>;

  /** Resume a paused timer */
  resumeTimer: () => Promise<void>;

  /** Stop timer and save tracked time (may prompt for long sessions) */
  stopTimer: () => Promise<void>;

  /** Add time manually to a task */
  addManualTime: (taskId: string, minutes: number) => Promise<void>;

  /** Recover an abandoned timer session */
  recoverTimer: (action: 'save' | 'adjust' | 'discard', adjustedMinutes?: number) => Promise<void>;

  /** Dismiss recovery prompt without saving */
  dismissRecovery: () => void;
}

// =============================================================================
// Timer Hook Return Type
// =============================================================================

/**
 * Return type for useTimer hook
 */
export interface UseTimerReturn {
  /** Current timer status for display */
  status: TimerStatus;

  /** Elapsed seconds for the active timer */
  elapsedSeconds: number;

  /** ID of task with active timer */
  activeTaskId: string | null;

  /** Whether timer is running (convenience boolean) */
  isRunning: boolean;

  /** Whether timer is paused (convenience boolean) */
  isPaused: boolean;

  /** Timer control actions */
  actions: TimerActions;

  /** Pending recovery info if an abandoned timer was found */
  pendingRecovery: TimerRecoveryInfo | null;
}

// =============================================================================
// Timer Service Functions
// =============================================================================

/**
 * Timer service function signatures
 */
export interface TimerService {
  /** Calculate elapsed seconds for a task based on timer fields */
  calculateElapsedSeconds: (task: TaskTimerFields) => number;

  /** Check if a session exceeds the long session threshold (4 hours) */
  isLongSession: (elapsedMinutes: number) => boolean;

  /** Get task with active timer for current user */
  getActiveTimerTask: (userId: string) => Promise<TaskWithTimer | null>;

  /** Start timer on a task */
  startTaskTimer: (taskId: string) => Promise<void>;

  /** Pause timer on a task */
  pauseTaskTimer: (taskId: string) => Promise<void>;

  /** Resume timer on a task */
  resumeTaskTimer: (taskId: string) => Promise<void>;

  /** Stop timer and update actualDuration */
  stopTaskTimer: (taskId: string, adjustedMinutes?: number) => Promise<void>;

  /** Add manual time entry */
  addManualTimeEntry: (taskId: string, minutes: number) => Promise<void>;
}

/**
 * Task entity with timer fields included
 */
export interface TaskWithTimer extends TaskTimerFields {
  id: string;
  userId: string;
  taskName: string;
  status: 'pending' | 'in-progress' | 'completed';
  // ... other task fields inherited from existing Task type
}

// =============================================================================
// Component Props
// =============================================================================

/**
 * Props for TaskTimer component
 */
export interface TaskTimerProps {
  /** Task to display timer for */
  task: TaskWithTimer;

  /** Whether this is the compact (inline) or full display mode */
  variant?: 'compact' | 'full';

  /** Additional CSS classes */
  className?: string;
}

/**
 * Props for ManualTimeEntry component
 */
export interface ManualTimeEntryProps {
  /** Task to add time to */
  taskId: string;

  /** Current total tracked time in minutes */
  currentDuration: number;

  /** Callback when time is added successfully */
  onSuccess?: () => void;

  /** Callback when entry is cancelled */
  onCancel?: () => void;
}

/**
 * Props for TimerRecoveryModal component
 */
export interface TimerRecoveryModalProps {
  /** Recovery info for abandoned timer */
  recovery: TimerRecoveryInfo;

  /** Handle recovery action */
  onRecover: (action: 'save' | 'adjust' | 'discard', adjustedMinutes?: number) => void;

  /** Handle dismiss */
  onDismiss: () => void;
}

/**
 * Props for LongSessionModal component
 */
export interface LongSessionModalProps {
  /** Elapsed minutes in the long session */
  elapsedMinutes: number;

  /** Task name for display */
  taskName: string;

  /** Handle save with optional adjustment */
  onSave: (adjustedMinutes: number) => void;

  /** Handle discard */
  onDiscard: () => void;
}

// =============================================================================
// Constants
// =============================================================================

/**
 * Timer-related constants
 */
export const TIMER_CONSTANTS = {
  /** Update interval for timer display in milliseconds */
  DISPLAY_INTERVAL_MS: 1000,

  /** Threshold for long session warning in minutes */
  LONG_SESSION_THRESHOLD_MINUTES: 240,

  /** Maximum manual time entry in hours */
  MAX_MANUAL_HOURS: 999,

  /** Storage key for timer state backup */
  TIMER_STATE_KEY: 'taskflow_timer_state',
} as const;
