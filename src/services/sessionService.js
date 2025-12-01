/**
 * Session Service
 * Handles session persistence in localStorage
 */

import { v4 as uuidv4 } from 'uuid';
import { SESSION_KEY } from '../utils/constants';

/**
 * Get the current session from localStorage
 * @returns {object | null} - The session object or null if not found
 */
export function getSession() {
  try {
    const sessionData = localStorage.getItem(SESSION_KEY);
    if (!sessionData) {
      return null;
    }

    const session = JSON.parse(sessionData);

    // Validate session structure
    if (!session || !session.userId || !session.token) {
      console.warn('Invalid session structure found, clearing session');
      clearSession();
      return null;
    }

    // Convert date strings back to Date objects
    return {
      ...session,
      loginAt: new Date(session.loginAt),
      lastActiveAt: new Date(session.lastActiveAt),
    };
  } catch (error) {
    console.error('Error reading session:', error);
    clearSession();
    return null;
  }
}

/**
 * Save a new session to localStorage
 * @param {string} userId - The user's ID
 * @returns {object} - The created session object
 */
export function saveSession(userId) {
  const now = new Date();

  const session = {
    userId,
    token: uuidv4(),
    loginAt: now.toISOString(),
    lastActiveAt: now.toISOString(),
  };

  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return {
      ...session,
      loginAt: now,
      lastActiveAt: now,
    };
  } catch (error) {
    console.error('Error saving session:', error);
    throw new Error('Failed to save session');
  }
}

/**
 * Update the last active timestamp of the current session
 * @returns {boolean} - True if session was updated successfully
 */
export function updateSessionActivity() {
  try {
    const session = getSession();
    if (!session) {
      return false;
    }

    const updatedSession = {
      ...session,
      loginAt: session.loginAt.toISOString(),
      lastActiveAt: new Date().toISOString(),
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedSession));
    return true;
  } catch (error) {
    console.error('Error updating session activity:', error);
    return false;
  }
}

/**
 * Clear the current session from localStorage
 */
export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.error('Error clearing session:', error);
  }
}

/**
 * Check if a valid session exists
 * @returns {boolean} - True if a valid session exists
 */
export function hasSession() {
  const session = getSession();
  return session !== null;
}

/**
 * Check if localStorage is available
 * @returns {boolean} - True if localStorage is available
 */
export function isLocalStorageAvailable() {
  try {
    const testKey = '__test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
}
