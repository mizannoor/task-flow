/**
 * Authentication System Contracts
 * Feature Branch: 001-auth-system
 * 
 * This file defines the TypeScript interfaces and types for the
 * TaskFlow authentication system.
 */

// =============================================================================
// IDENTIFIER TYPES
// =============================================================================

/**
 * Types of identifiers accepted for passwordless login
 */
export type IdentifierType = 'email' | 'username' | 'phone';

/**
 * Available view types for task display
 */
export type ViewType = 'list' | 'kanban' | 'calendar' | 'focus';

/**
 * Theme options for UI
 */
export type Theme = 'light' | 'dark';

// =============================================================================
// USER ENTITY
// =============================================================================

/**
 * User preferences for personalization
 */
export interface UserPreferences {
  /** UI theme preference */
  theme: Theme;
  /** Default view when opening task list */
  defaultView: ViewType;
}

/**
 * User entity stored in IndexedDB
 */
export interface User {
  /** Unique identifier (UUID v4) */
  id: string;
  /** Login identifier (email, username, or phone) */
  identifier: string;
  /** Type of the identifier */
  identifierType: IdentifierType;
  /** Display name shown in UI (derived from identifier) */
  displayName: string;
  /** Timestamp when user was created */
  createdAt: Date;
  /** Timestamp of last profile update */
  updatedAt: Date;
  /** Optional user preferences */
  preferences?: UserPreferences;
}

/**
 * Data required to create a new user
 */
export interface CreateUserInput {
  identifier: string;
  identifierType: IdentifierType;
  displayName: string;
  preferences?: UserPreferences;
}

// =============================================================================
// SESSION
// =============================================================================

/**
 * Session data stored in localStorage
 */
export interface Session {
  /** Reference to authenticated user */
  userId: string;
  /** Unique session identifier (UUID v4) */
  token: string;
  /** Timestamp when session was created */
  loginAt: Date;
  /** Timestamp of last user activity */
  lastActiveAt: Date;
}

// =============================================================================
// AUTH STATE & ERRORS
// =============================================================================

/**
 * Error codes for authentication operations
 */
export type AuthErrorCode =
  | 'INVALID_IDENTIFIER'
  | 'VALIDATION_FAILED'
  | 'STORAGE_UNAVAILABLE'
  | 'SESSION_CORRUPTED'
  | 'USER_NOT_FOUND'
  | 'UNKNOWN_ERROR';

/**
 * Authentication error object
 */
export interface AuthError {
  /** Error classification code */
  code: AuthErrorCode;
  /** Human-readable error message */
  message: string;
  /** Field that caused the error (for validation errors) */
  field?: string;
}

/**
 * Authentication state managed by AuthContext
 */
export interface AuthState {
  /** Currently logged-in user, or null if not authenticated */
  currentUser: User | null;
  /** All users registered in the system */
  users: User[];
  /** True if a valid session exists */
  isAuthenticated: boolean;
  /** True during async operations (login, loading users) */
  isLoading: boolean;
  /** Last error that occurred, if any */
  error: AuthError | null;
}

// =============================================================================
// AUTH CONTEXT API
// =============================================================================

/**
 * Actions available through AuthContext
 */
export interface AuthContextActions {
  /**
   * Log in with an identifier (creates user if not exists)
   * @param identifier - Email, username, or phone number
   * @returns Promise resolving to the logged-in user
   */
  login: (identifier: string) => Promise<User>;

  /**
   * Log out the current user
   * Clears session but preserves user data in IndexedDB
   */
  logout: () => void;

  /**
   * Switch to a different user account
   * @param userId - The ID of the user to switch to
   */
  switchUser: (userId: string) => Promise<void>;

  /**
   * Add a new account (same as login, but from user switcher)
   * @param identifier - Email, username, or phone number
   * @returns Promise resolving to the new/existing user
   */
  addAccount: (identifier: string) => Promise<User>;

  /**
   * Clear any existing auth error
   */
  clearError: () => void;
}

/**
 * Complete AuthContext value (state + actions)
 */
export interface AuthContextValue extends AuthState, AuthContextActions {}

// =============================================================================
// AUTH REDUCER
// =============================================================================

/**
 * Action types for auth reducer
 */
export type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; users: User[] } }
  | { type: 'LOGIN_FAILURE'; payload: AuthError }
  | { type: 'LOGOUT' }
  | { type: 'SWITCH_USER'; payload: User }
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'SET_ERROR'; payload: AuthError }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SYNC_SESSION'; payload: { user: User; users: User[] } | null };

// =============================================================================
// VALIDATION
// =============================================================================

/**
 * Result of identifier validation
 */
export interface ValidationResult {
  /** Whether the identifier is valid */
  isValid: boolean;
  /** Detected type of identifier */
  type: IdentifierType | null;
  /** Error message if invalid */
  error?: string;
}

/**
 * Validation functions interface
 */
export interface Validators {
  /**
   * Validate an email address
   * @param email - The email to validate
   * @returns True if valid email format
   */
  isValidEmail: (email: string) => boolean;

  /**
   * Validate a username
   * @param username - The username to validate
   * @returns True if valid username format
   */
  isValidUsername: (username: string) => boolean;

  /**
   * Validate a phone number
   * @param phone - The phone number to validate
   * @returns True if valid phone format
   */
  isValidPhone: (phone: string) => boolean;

  /**
   * Validate and detect identifier type
   * @param identifier - The identifier to validate
   * @returns Validation result with type detection
   */
  validateIdentifier: (identifier: string) => ValidationResult;
}

// =============================================================================
// DATABASE SERVICE
// =============================================================================

/**
 * Database service interface for user operations
 */
export interface UserDatabaseService {
  /**
   * Get all users from IndexedDB
   * @returns Promise resolving to array of users
   */
  getAllUsers: () => Promise<User[]>;

  /**
   * Get a user by their identifier
   * @param identifier - The login identifier
   * @returns Promise resolving to user or undefined
   */
  getUserByIdentifier: (identifier: string) => Promise<User | undefined>;

  /**
   * Get a user by their ID
   * @param id - The user ID
   * @returns Promise resolving to user or undefined
   */
  getUserById: (id: string) => Promise<User | undefined>;

  /**
   * Create a new user
   * @param input - User creation data
   * @returns Promise resolving to the created user
   */
  createUser: (input: CreateUserInput) => Promise<User>;

  /**
   * Update an existing user
   * @param id - The user ID
   * @param updates - Partial user data to update
   * @returns Promise resolving to the updated user
   */
  updateUser: (id: string, updates: Partial<User>) => Promise<User>;

  /**
   * Delete a user
   * @param id - The user ID to delete
   * @returns Promise resolving when deletion is complete
   */
  deleteUser: (id: string) => Promise<void>;
}

/**
 * Session service interface for localStorage operations
 */
export interface SessionService {
  /**
   * Get the current session from localStorage
   * @returns The current session or null
   */
  getSession: () => Session | null;

  /**
   * Save a session to localStorage
   * @param session - The session to save
   */
  saveSession: (session: Session) => void;

  /**
   * Clear the current session
   */
  clearSession: () => void;

  /**
   * Check if a valid session exists
   * @returns True if session exists and is valid
   */
  hasValidSession: () => boolean;

  /**
   * Update the lastActiveAt timestamp
   */
  updateActivity: () => void;
}

// =============================================================================
// COMPONENT PROPS
// =============================================================================

/**
 * Props for LoginForm component
 */
export interface LoginFormProps {
  /** Callback when login is successful */
  onLoginSuccess?: (user: User) => void;
  /** Optional CSS class name */
  className?: string;
}

/**
 * Props for UserSwitcher component
 */
export interface UserSwitcherProps {
  /** Optional CSS class name */
  className?: string;
  /** Callback when user is switched */
  onUserSwitch?: (user: User) => void;
  /** Callback when logout is clicked */
  onLogout?: () => void;
}

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * localStorage key for session data
 */
export const SESSION_STORAGE_KEY = 'taskflow_session';

/**
 * IndexedDB database name
 */
export const DB_NAME = 'TaskFlowDB';

/**
 * Validation patterns
 */
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  USERNAME: /^[a-zA-Z0-9_]{3,30}$/,
  PHONE: /^\+?[0-9]{10,15}$/,
} as const;

/**
 * Validation error messages
 */
export const VALIDATION_MESSAGES = {
  EMPTY: 'Please enter an identifier',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_USERNAME: 'Username must be 3-30 characters (letters, numbers, underscore)',
  INVALID_PHONE: 'Please enter a valid phone number (10-15 digits)',
  INVALID_FORMAT: 'Please enter a valid email, username, or phone number',
} as const;
