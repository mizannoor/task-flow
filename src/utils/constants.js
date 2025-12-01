/**
 * Authentication Constants
 * Validation patterns, error messages, and configuration values
 */

// Session storage key for localStorage
export const SESSION_KEY = 'taskflow_session';

// Validation patterns for identifier types
export const PATTERNS = {
  // Valid email format: x@y.z
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  // Username: 3-30 alphanumeric + underscore characters
  USERNAME: /^[a-zA-Z0-9_]{3,30}$/,
  // Phone: 10-15 digits with optional + prefix
  PHONE: /^\+?[0-9]{10,15}$/,
};

// Identifier constraints
export const IDENTIFIER_LIMITS = {
  MIN_LENGTH: 3,
  MAX_LENGTH: 254,
};

// Display name constraints
export const DISPLAY_NAME_LIMITS = {
  MIN_LENGTH: 1,
  MAX_LENGTH: 100,
};

// Error messages for validation failures
export const ERROR_MESSAGES = {
  IDENTIFIER_REQUIRED: 'Please enter an identifier',
  IDENTIFIER_TOO_SHORT: `Identifier must be at least ${IDENTIFIER_LIMITS.MIN_LENGTH} characters`,
  IDENTIFIER_TOO_LONG: `Identifier must be at most ${IDENTIFIER_LIMITS.MAX_LENGTH} characters`,
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_USERNAME: 'Username must be 3-30 alphanumeric characters or underscores',
  INVALID_PHONE: 'Phone number must be 10-15 digits (optional + prefix)',
  STORAGE_UNAVAILABLE: 'Local storage is not available. Please enable it in your browser settings.',
  SESSION_CORRUPTED: 'Your session data is corrupted. Please log in again.',
  USER_NOT_FOUND: 'User not found. Please check your identifier.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
};

// Auth error codes
export const AUTH_ERROR_CODES = {
  INVALID_IDENTIFIER: 'INVALID_IDENTIFIER',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  STORAGE_UNAVAILABLE: 'STORAGE_UNAVAILABLE',
  SESSION_CORRUPTED: 'SESSION_CORRUPTED',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};

// Auth action types for reducer
export const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  SWITCH_USER: 'SWITCH_USER',
  SET_USERS: 'SET_USERS',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_LOADING: 'SET_LOADING',
  SYNC_SESSION: 'SYNC_SESSION',
};

// Identifier types
export const IDENTIFIER_TYPES = {
  EMAIL: 'email',
  USERNAME: 'username',
  PHONE: 'phone',
};
