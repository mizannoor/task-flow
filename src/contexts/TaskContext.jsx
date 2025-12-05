/**
 * Task Context
 * State management for task data using React Context + useReducer
 */

import { createContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import * as taskService from '../services/taskService';
import { validateCreateTaskInput, validateUpdateTaskInput } from '../utils/validators';
import {
  DEFAULT_FILTERS,
  DEFAULT_SORT,
  PRIORITY_ORDER,
  STATUSES,
  TASK_STORAGE_KEYS,
  SORT_ORDERS,
} from '../utils/constants';

// =============================================================================
// Context Creation
// =============================================================================

export const TaskContext = createContext(null);

// =============================================================================
// Action Types
// =============================================================================

const TASK_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_TASKS: 'SET_TASKS',
  ADD_TASK: 'ADD_TASK',
  UPDATE_TASK: 'UPDATE_TASK',
  DELETE_TASK: 'DELETE_TASK',
  SET_FILTERS: 'SET_FILTERS',
  CLEAR_FILTERS: 'CLEAR_FILTERS',
  SET_SORT: 'SET_SORT',
};

// =============================================================================
// Initial State
// =============================================================================

const getInitialSort = () => {
  try {
    const saved = localStorage.getItem(TASK_STORAGE_KEYS.SORT_PREFERENCE);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Failed to load sort preference from localStorage:', e);
  }
  return DEFAULT_SORT;
};

const initialState = {
  tasks: [],
  loading: true,
  error: null,
  filters: { ...DEFAULT_FILTERS },
  sort: getInitialSort(),
};

// =============================================================================
// Reducer
// =============================================================================

function taskReducer(state, action) {
  switch (action.type) {
    case TASK_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };

    case TASK_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };

    case TASK_ACTIONS.SET_TASKS:
      return { ...state, tasks: action.payload, loading: false, error: null };

    case TASK_ACTIONS.ADD_TASK:
      return { ...state, tasks: [...state.tasks, action.payload] };

    case TASK_ACTIONS.UPDATE_TASK:
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id ? { ...task, ...action.payload.updates } : task
        ),
      };

    case TASK_ACTIONS.DELETE_TASK:
      return { ...state, tasks: state.tasks.filter((task) => task.id !== action.payload) };

    case TASK_ACTIONS.SET_FILTERS:
      return { ...state, filters: { ...state.filters, ...action.payload } };

    case TASK_ACTIONS.CLEAR_FILTERS:
      return { ...state, filters: { ...DEFAULT_FILTERS } };

    case TASK_ACTIONS.SET_SORT:
      return { ...state, sort: action.payload };

    default:
      return state;
  }
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Filter tasks based on filter state
 * @param {Array} tasks - Array of task objects
 * @param {object} filters - Filter configuration
 * @param {string} currentUserId - Current user's ID
 * @param {object} dependencyMap - Optional map of taskId -> dependency info
 */
function filterTasks(tasks, filters, currentUserId, dependencyMap = null) {
  return tasks.filter((task) => {
    // Filter by userId if set (My Tasks vs All Tasks)
    if (filters.userId !== null) {
      if (task.userId !== filters.userId) {
        return false;
      }
    }

    // Filter by status (multi-select)
    if (filters.status.length > 0) {
      if (!filters.status.includes(task.status)) {
        return false;
      }
    }

    // Filter by priority (multi-select)
    if (filters.priority.length > 0) {
      if (!filters.priority.includes(task.priority)) {
        return false;
      }
    }

    // Filter by category (multi-select)
    if (filters.category.length > 0) {
      if (!filters.category.includes(task.category)) {
        return false;
      }
    }

    // Filter by search query (name + description)
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase().trim();
      const nameMatch = task.taskName.toLowerCase().includes(query);
      const descMatch = task.description?.toLowerCase().includes(query);
      if (!nameMatch && !descMatch) {
        return false;
      }
    }

    // Filter by dependency status (if dependencyMap provided)
    if (filters.dependencyStatus && dependencyMap) {
      const depInfo = dependencyMap[task.id];
      if (!depInfo) {
        // No dependency info - exclude if filtering for blocked/blocking
        return false;
      }

      if (filters.dependencyStatus === 'blocked') {
        if (!depInfo.isBlocked) {
          return false;
        }
      } else if (filters.dependencyStatus === 'blocking') {
        if (!depInfo.blocksIds || depInfo.blocksIds.length === 0) {
          return false;
        }
      }
    }

    return true;
  });
}

/**
 * Sort tasks based on sort state
 */
function sortTasks(tasks, sort) {
  const { field, order } = sort;

  return [...tasks].sort((a, b) => {
    let comparison = 0;

    switch (field) {
      case 'priority':
        // Use numeric priority order
        comparison = (PRIORITY_ORDER[a.priority] || 0) - (PRIORITY_ORDER[b.priority] || 0);
        break;

      case 'complexity':
        comparison = (a.complexity || 0) - (b.complexity || 0);
        break;

      case 'estimatedDuration':
        comparison = (a.estimatedDuration || 0) - (b.estimatedDuration || 0);
        break;

      case 'createdAt':
        comparison = new Date(a.createdAt) - new Date(b.createdAt);
        break;

      case 'deadline':
        // Null deadlines go to end
        if (!a.deadline && !b.deadline) comparison = 0;
        else if (!a.deadline) comparison = 1;
        else if (!b.deadline) comparison = -1;
        else comparison = new Date(a.deadline) - new Date(b.deadline);
        break;

      case 'taskName':
        comparison = a.taskName.localeCompare(b.taskName);
        break;

      default:
        comparison = 0;
    }

    // Apply sort order
    return order === SORT_ORDERS.DESC ? -comparison : comparison;
  });
}

// =============================================================================
// Provider Component
// =============================================================================

export function TaskProvider({ children }) {
  const [state, dispatch] = useReducer(taskReducer, initialState);
  const { currentUser } = useAuth();

  // -------------------------------------------------------------------------
  // Load Tasks on Mount / User Change
  // -------------------------------------------------------------------------

  useEffect(() => {
    async function loadTasks() {
      if (!currentUser) {
        dispatch({ type: TASK_ACTIONS.SET_TASKS, payload: [] });
        return;
      }

      try {
        dispatch({ type: TASK_ACTIONS.SET_LOADING, payload: true });
        const tasks = await taskService.getAllTasks();
        dispatch({ type: TASK_ACTIONS.SET_TASKS, payload: tasks });
      } catch (error) {
        console.error('Failed to load tasks:', error);
        dispatch({ type: TASK_ACTIONS.SET_ERROR, payload: error });
      }
    }

    loadTasks();
  }, [currentUser]);

  // -------------------------------------------------------------------------
  // Persist Sort Preference
  // -------------------------------------------------------------------------

  useEffect(() => {
    try {
      localStorage.setItem(TASK_STORAGE_KEYS.SORT_PREFERENCE, JSON.stringify(state.sort));
    } catch (e) {
      console.warn('Failed to save sort preference to localStorage:', e);
    }
  }, [state.sort]);

  // -------------------------------------------------------------------------
  // CRUD Operations
  // -------------------------------------------------------------------------

  const createTask = useCallback(
    async (input) => {
      if (!currentUser) {
        throw new Error('User must be logged in to create tasks');
      }

      // Validate input
      const validation = validateCreateTaskInput(input);
      if (!validation.valid) {
        const error = new Error('Validation failed');
        error.validationErrors = validation.errors;
        throw error;
      }

      try {
        const task = await taskService.createTask({
          ...input,
          userId: input.userId || currentUser.id,
          createdBy: currentUser.id,
        });

        dispatch({ type: TASK_ACTIONS.ADD_TASK, payload: task });
        return task;
      } catch (error) {
        console.error('Failed to create task:', error);
        throw error;
      }
    },
    [currentUser]
  );

  const updateTask = useCallback(async (id, input) => {
    // Validate input
    const validation = validateUpdateTaskInput(input);
    if (!validation.valid) {
      const error = new Error('Validation failed');
      error.validationErrors = validation.errors;
      throw error;
    }

    try {
      const updatedTask = await taskService.updateTask(id, input);

      dispatch({
        type: TASK_ACTIONS.UPDATE_TASK,
        payload: { id, updates: updatedTask },
      });

      return updatedTask;
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    }
  }, []);

  const deleteTask = useCallback(async (id) => {
    try {
      await taskService.deleteTask(id);
      dispatch({ type: TASK_ACTIONS.DELETE_TASK, payload: id });
    } catch (error) {
      console.error('Failed to delete task:', error);
      throw error;
    }
  }, []);

  const getTaskById = useCallback(
    (id) => {
      return state.tasks.find((task) => task.id === id);
    },
    [state.tasks]
  );

  // -------------------------------------------------------------------------
  // Status Operations
  // -------------------------------------------------------------------------

  const startTask = useCallback(
    async (id) => {
      const task = getTaskById(id);
      if (!task) {
        throw new Error('Task not found');
      }

      if (task.status === STATUSES.IN_PROGRESS) {
        return task; // Already in progress
      }

      return updateTask(id, { status: STATUSES.IN_PROGRESS });
    },
    [getTaskById, updateTask]
  );

  const completeTask = useCallback(
    async (id) => {
      const task = getTaskById(id);
      if (!task) {
        throw new Error('Task not found');
      }

      if (task.status === STATUSES.COMPLETED) {
        return task; // Already completed
      }

      return updateTask(id, { status: STATUSES.COMPLETED });
    },
    [getTaskById, updateTask]
  );

  const reopenTask = useCallback(
    async (id) => {
      const task = getTaskById(id);
      if (!task) {
        throw new Error('Task not found');
      }

      if (task.status === STATUSES.PENDING) {
        return task; // Already pending
      }

      return updateTask(id, { status: STATUSES.PENDING });
    },
    [getTaskById, updateTask]
  );

  // -------------------------------------------------------------------------
  // Filter Operations
  // -------------------------------------------------------------------------

  const setFilter = useCallback((key, value) => {
    dispatch({ type: TASK_ACTIONS.SET_FILTERS, payload: { [key]: value } });
  }, []);

  const setFilters = useCallback((filters) => {
    dispatch({ type: TASK_ACTIONS.SET_FILTERS, payload: filters });
  }, []);

  const clearFilters = useCallback(() => {
    dispatch({ type: TASK_ACTIONS.CLEAR_FILTERS });
  }, []);

  // -------------------------------------------------------------------------
  // Sort Operations
  // -------------------------------------------------------------------------

  const setSort = useCallback((field, order) => {
    dispatch({
      type: TASK_ACTIONS.SET_SORT,
      payload: { field, order: order || SORT_ORDERS.DESC },
    });
  }, []);

  const toggleSortOrder = useCallback(() => {
    dispatch({
      type: TASK_ACTIONS.SET_SORT,
      payload: {
        ...state.sort,
        order: state.sort.order === SORT_ORDERS.ASC ? SORT_ORDERS.DESC : SORT_ORDERS.ASC,
      },
    });
  }, [state.sort]);

  // -------------------------------------------------------------------------
  // Utility Operations
  // -------------------------------------------------------------------------

  const refreshTasks = useCallback(async () => {
    if (!currentUser) {
      return;
    }

    try {
      dispatch({ type: TASK_ACTIONS.SET_LOADING, payload: true });
      const tasks = await taskService.getAllTasks();
      dispatch({ type: TASK_ACTIONS.SET_TASKS, payload: tasks });
    } catch (error) {
      console.error('Failed to refresh tasks:', error);
      dispatch({ type: TASK_ACTIONS.SET_ERROR, payload: error });
    }
  }, [currentUser]);

  // -------------------------------------------------------------------------
  // Computed Values
  // -------------------------------------------------------------------------

  // Filter and sort tasks (without dependency filtering - use getFilteredTasksWithDependencies for that)
  const filteredAndSortedTasks = useMemo(() => {
    const filtered = filterTasks(state.tasks, state.filters, currentUser?.id);
    return sortTasks(filtered, state.sort);
  }, [state.tasks, state.filters, state.sort, currentUser?.id]);

  // Helper to get filtered tasks with dependency info
  const getFilteredTasksWithDependencies = useCallback(
    (dependencyMap) => {
      const filtered = filterTasks(state.tasks, state.filters, currentUser?.id, dependencyMap);
      return sortTasks(filtered, state.sort);
    },
    [state.tasks, state.filters, state.sort, currentUser?.id]
  );

  // -------------------------------------------------------------------------
  // Context Value
  // -------------------------------------------------------------------------

  const value = useMemo(
    () => ({
      // State
      tasks: filteredAndSortedTasks,
      allTasks: state.tasks,
      loading: state.loading,
      error: state.error,
      filters: state.filters,
      sort: state.sort,

      // CRUD Operations
      createTask,
      updateTask,
      deleteTask,
      getTaskById,

      // Status Operations
      startTask,
      completeTask,
      reopenTask,

      // Filter Operations
      setFilter,
      setFilters,
      clearFilters,
      getFilteredTasksWithDependencies,

      // Sort Operations
      setSort,
      toggleSortOrder,

      // Utilities
      refreshTasks,
    }),
    [
      filteredAndSortedTasks,
      state.tasks,
      state.loading,
      state.error,
      state.filters,
      state.sort,
      createTask,
      updateTask,
      deleteTask,
      getTaskById,
      startTask,
      completeTask,
      reopenTask,
      setFilter,
      setFilters,
      clearFilters,
      getFilteredTasksWithDependencies,
      setSort,
      toggleSortOrder,
      refreshTasks,
    ]
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export default TaskContext;
