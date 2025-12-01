/**
 * Authentication Context
 * Provides auth state management using React Context API and useReducer
 */

import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import {
  db,
  createUser,
  getUserByIdentifier,
  getUserById,
  getAllUsers,
  isIndexedDBAvailable,
} from '../services/db';
import {
  getSession,
  saveSession,
  clearSession,
  isLocalStorageAvailable,
} from '../services/sessionService';
import { validateIdentifier } from '../utils/validators';
import {
  AUTH_ACTIONS,
  AUTH_ERROR_CODES,
  ERROR_MESSAGES,
  SESSION_KEY,
} from '../utils/constants';

// Create the context
const AuthContext = createContext(null);

// Initial state
const initialState = {
  currentUser: null,
  users: [],
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

/**
 * Auth reducer for managing state transitions
 */
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        currentUser: action.payload.user,
        users: action.payload.users,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        currentUser: null,
        isAuthenticated: false,
        error: null,
      };

    case AUTH_ACTIONS.SWITCH_USER:
      return {
        ...state,
        currentUser: action.payload,
        error: null,
      };

    case AUTH_ACTIONS.SET_USERS:
      return {
        ...state,
        users: action.payload,
      };

    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };

    case AUTH_ACTIONS.SYNC_SESSION:
      if (action.payload === null) {
        return {
          ...state,
          currentUser: null,
          isAuthenticated: false,
        };
      }
      return {
        ...state,
        currentUser: action.payload.user,
        users: action.payload.users,
        isAuthenticated: true,
      };

    default:
      return state;
  }
}

/**
 * AuthProvider Component
 * Wraps the app and provides auth context
 */
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize: Check for existing session and restore if valid
  useEffect(() => {
    async function initAuth() {
      try {
        // Check if storage is available
        if (!isLocalStorageAvailable()) {
          dispatch({
            type: AUTH_ACTIONS.SET_ERROR,
            payload: {
              code: AUTH_ERROR_CODES.STORAGE_UNAVAILABLE,
              message: ERROR_MESSAGES.STORAGE_UNAVAILABLE,
            },
          });
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
          return;
        }

        // Check if IndexedDB is available
        const indexedDBAvailable = await isIndexedDBAvailable();
        if (!indexedDBAvailable) {
          dispatch({
            type: AUTH_ACTIONS.SET_ERROR,
            payload: {
              code: AUTH_ERROR_CODES.STORAGE_UNAVAILABLE,
              message: ERROR_MESSAGES.STORAGE_UNAVAILABLE,
            },
          });
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
          return;
        }

        // Get all users from database
        const users = await getAllUsers();

        // Try to restore session
        const session = getSession();

        if (session) {
          const user = await getUserById(session.userId);

          if (user) {
            // Valid session found
            dispatch({
              type: AUTH_ACTIONS.LOGIN_SUCCESS,
              payload: { user, users },
            });
            return;
          } else {
            // Session references a non-existent user - clear it
            clearSession();
          }
        }

        // No valid session, just set users and stop loading
        dispatch({ type: AUTH_ACTIONS.SET_USERS, payload: users });
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      } catch (error) {
        console.error('Error initializing auth:', error);
        dispatch({
          type: AUTH_ACTIONS.SET_ERROR,
          payload: {
            code: AUTH_ERROR_CODES.UNKNOWN_ERROR,
            message: error.message || ERROR_MESSAGES.UNKNOWN_ERROR,
          },
        });
      }
    }

    initAuth();
  }, []);

  // Listen for storage changes (multi-tab sync)
  useEffect(() => {
    function handleStorageChange(event) {
      if (event.key !== SESSION_KEY) {
        return;
      }

      // Session was cleared in another tab
      if (event.newValue === null) {
        dispatch({ type: AUTH_ACTIONS.SYNC_SESSION, payload: null });
        return;
      }

      // Session was updated in another tab
      try {
        const newSession = JSON.parse(event.newValue);

        // Fetch the user and update state
        getUserById(newSession.userId).then(async (user) => {
          if (user) {
            const users = await getAllUsers();
            dispatch({
              type: AUTH_ACTIONS.SYNC_SESSION,
              payload: { user, users },
            });
          }
        });
      } catch (error) {
        console.error('Error syncing session:', error);
      }
    }

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  /**
   * Login with an identifier (creates user if not exists)
   * @param {string} identifier - Email, username, or phone number
   * @returns {Promise<object>} - The logged-in user
   */
  const login = useCallback(async (identifier) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    // Validate identifier
    const validation = validateIdentifier(identifier);
    if (!validation.isValid) {
      const error = {
        code: AUTH_ERROR_CODES.VALIDATION_FAILED,
        message: validation.error,
        field: 'identifier',
      };
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: error });
      throw new Error(validation.error);
    }

    try {
      // Check if user exists
      let user = await getUserByIdentifier(identifier.trim());

      if (!user) {
        // Create new user
        user = await createUser({
          identifier: identifier.trim(),
          identifierType: validation.type,
        });
      }

      // Create session
      saveSession(user.id);

      // Get all users for the list
      const users = await getAllUsers();

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user, users },
      });

      return user;
    } catch (error) {
      const authError = {
        code: AUTH_ERROR_CODES.UNKNOWN_ERROR,
        message: error.message || ERROR_MESSAGES.UNKNOWN_ERROR,
      };
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: authError });
      throw error;
    }
  }, []);

  /**
   * Log out the current user
   */
  const logout = useCallback(() => {
    clearSession();
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  }, []);

  /**
   * Switch to a different user account
   * @param {string} userId - The ID of the user to switch to
   */
  const switchUser = useCallback(async (userId) => {
    try {
      const user = await getUserById(userId);

      if (!user) {
        throw new Error(ERROR_MESSAGES.USER_NOT_FOUND);
      }

      // Update session
      saveSession(user.id);

      dispatch({ type: AUTH_ACTIONS.SWITCH_USER, payload: user });
    } catch (error) {
      dispatch({
        type: AUTH_ACTIONS.SET_ERROR,
        payload: {
          code: AUTH_ERROR_CODES.USER_NOT_FOUND,
          message: error.message || ERROR_MESSAGES.USER_NOT_FOUND,
        },
      });
      throw error;
    }
  }, []);

  /**
   * Add a new account (same as login, but for user switcher)
   * @param {string} identifier - Email, username, or phone number
   * @returns {Promise<object>} - The new/existing user
   */
  const addAccount = useCallback(async (identifier) => {
    // Reuse login logic
    return login(identifier);
  }, [login]);

  /**
   * Clear any existing auth error
   */
  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  }, []);

  /**
   * Refresh the users list
   */
  const refreshUsers = useCallback(async () => {
    try {
      const users = await getAllUsers();
      dispatch({ type: AUTH_ACTIONS.SET_USERS, payload: users });
    } catch (error) {
      console.error('Error refreshing users:', error);
    }
  }, []);

  // Context value
  const value = {
    // State
    ...state,
    // Actions
    login,
    logout,
    switchUser,
    addAccount,
    clearError,
    refreshUsers,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to use auth context
 * @returns {object} - Auth context value
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

export default AuthContext;
