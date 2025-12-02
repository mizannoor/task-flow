/**
 * IndexedDB Database Service
 * Handles user data storage using Dexie.js
 */

import Dexie from 'dexie';
import { v4 as uuidv4 } from 'uuid';
import { deriveDisplayName } from '../utils/validators';

// Initialize database
const db = new Dexie('TaskFlowDB');

// Define schema
// &id = primary key (unique)
// &identifier = unique index for fast lookup
db.version(1).stores({
  users: '&id, &identifier, identifierType, createdAt',
});

// Version 2: Add tasks table for task management
db.version(2).stores({
  users: '&id, &identifier, identifierType, createdAt',
  tasks: '&id, userId, createdBy, status, priority, category, createdAt, deadline',
});

// Version 3: Add timer fields to tasks table for time tracking feature
db.version(3)
  .stores({
    users: '&id, &identifier, identifierType, createdAt',
    tasks: '&id, userId, createdBy, status, priority, category, createdAt, deadline, timerStartedAt',
  })
  .upgrade((tx) => {
    // Set default values for existing tasks
    return tx
      .table('tasks')
      .toCollection()
      .modify((task) => {
        task.timerStartedAt = task.timerStartedAt ?? null;
        task.timerPausedAt = task.timerPausedAt ?? null;
        task.accumulatedDuration = task.accumulatedDuration ?? 0;
        // actualDuration should already exist, but ensure it does
        task.actualDuration = task.actualDuration ?? 0;
      });
  });

// Export the database instance
export { db };

/**
 * Check if IndexedDB is available
 * @returns {Promise<boolean>} - True if IndexedDB is available
 */
export async function isIndexedDBAvailable() {
  try {
    // Try to open the database to verify IndexedDB works
    await db.open();
    return true;
  } catch (error) {
    console.error('IndexedDB is not available:', error);
    return false;
  }
}

/**
 * Create a new user in the database
 * @param {object} params - User creation parameters
 * @param {string} params.identifier - The user's identifier
 * @param {string} params.identifierType - Type of identifier (email, username, phone)
 * @param {string} [params.displayName] - Optional display name (derived if not provided)
 * @param {object} [params.preferences] - Optional user preferences
 * @returns {Promise<object>} - The created user object
 */
export async function createUser({ identifier, identifierType, displayName, preferences }) {
  const now = new Date();

  const user = {
    id: uuidv4(),
    identifier: identifier.trim(),
    identifierType,
    displayName: displayName || deriveDisplayName(identifier, identifierType),
    createdAt: now,
    updatedAt: now,
    preferences: preferences || {
      theme: 'light',
      defaultView: 'list',
    },
  };

  await db.users.add(user);
  return user;
}

/**
 * Get a user by their identifier
 * @param {string} identifier - The identifier to look up
 * @returns {Promise<object | undefined>} - The user object or undefined
 */
export async function getUserByIdentifier(identifier) {
  const normalizedIdentifier = identifier.trim();
  return db.users.where('identifier').equals(normalizedIdentifier).first();
}

/**
 * Get a user by their ID
 * @param {string} userId - The user's ID
 * @returns {Promise<object | undefined>} - The user object or undefined
 */
export async function getUserById(userId) {
  return db.users.get(userId);
}

/**
 * Get all users in the database
 * @returns {Promise<object[]>} - Array of all user objects
 */
export async function getAllUsers() {
  return db.users.toArray();
}

/**
 * Update a user's information
 * @param {string} userId - The user's ID
 * @param {object} updates - The fields to update
 * @returns {Promise<number>} - Number of records updated (0 or 1)
 */
export async function updateUser(userId, updates) {
  return db.users.update(userId, {
    ...updates,
    updatedAt: new Date(),
  });
}

/**
 * Delete a user from the database
 * @param {string} userId - The user's ID
 * @returns {Promise<void>}
 */
export async function deleteUser(userId) {
  return db.users.delete(userId);
}

/**
 * Check if a user exists with the given identifier
 * @param {string} identifier - The identifier to check
 * @returns {Promise<boolean>} - True if user exists
 */
export async function userExists(identifier) {
  const user = await getUserByIdentifier(identifier);
  return !!user;
}

/**
 * Get the count of users in the database
 * @returns {Promise<number>} - The number of users
 */
export async function getUserCount() {
  return db.users.count();
}
