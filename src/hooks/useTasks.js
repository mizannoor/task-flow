/**
 * useTasks Hook
 * Provides access to the TaskContext for task management
 */

import { useContext } from 'react';
import { TaskContext } from '../contexts/TaskContext';

/**
 * Custom hook to access task context
 * @returns {object} - TaskContext value with state and operations
 * @throws {Error} - If used outside of TaskProvider
 */
export function useTasks() {
  const context = useContext(TaskContext);

  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }

  return context;
}

export default useTasks;
