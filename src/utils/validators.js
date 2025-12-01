/**
 * Identifier Validation Functions
 * Validates and processes user identifiers (email, username, phone)
 */

import { PATTERNS, IDENTIFIER_LIMITS, ERROR_MESSAGES, IDENTIFIER_TYPES } from './constants';

/**
 * Detect the type of identifier based on its format
 * @param {string} identifier - The identifier to analyze
 * @returns {'email' | 'username' | 'phone' | null} - The detected type
 */
export function detectIdentifierType(identifier) {
  const trimmed = identifier?.trim();

  if (!trimmed) {
    return null;
  }

  // Check for email (contains @)
  if (trimmed.includes('@')) {
    return IDENTIFIER_TYPES.EMAIL;
  }

  // Check for phone (starts with + or is all digits)
  if (/^\+?\d+$/.test(trimmed)) {
    return IDENTIFIER_TYPES.PHONE;
  }

  // Default to username
  return IDENTIFIER_TYPES.USERNAME;
}

/**
 * Validate an identifier based on its detected or specified type
 * @param {string} identifier - The identifier to validate
 * @returns {{ isValid: boolean, type: string | null, error: string | null }}
 */
export function validateIdentifier(identifier) {
  const trimmed = identifier?.trim();

  // Check for empty input
  if (!trimmed) {
    return {
      isValid: false,
      type: null,
      error: ERROR_MESSAGES.IDENTIFIER_REQUIRED,
    };
  }

  // Check length constraints
  if (trimmed.length < IDENTIFIER_LIMITS.MIN_LENGTH) {
    return {
      isValid: false,
      type: null,
      error: ERROR_MESSAGES.IDENTIFIER_TOO_SHORT,
    };
  }

  if (trimmed.length > IDENTIFIER_LIMITS.MAX_LENGTH) {
    return {
      isValid: false,
      type: null,
      error: ERROR_MESSAGES.IDENTIFIER_TOO_LONG,
    };
  }

  // Detect type and validate accordingly
  const type = detectIdentifierType(trimmed);

  switch (type) {
    case IDENTIFIER_TYPES.EMAIL:
      return PATTERNS.EMAIL.test(trimmed)
        ? { isValid: true, type, error: null }
        : { isValid: false, type, error: ERROR_MESSAGES.INVALID_EMAIL };

    case IDENTIFIER_TYPES.PHONE:
      return PATTERNS.PHONE.test(trimmed)
        ? { isValid: true, type, error: null }
        : { isValid: false, type, error: ERROR_MESSAGES.INVALID_PHONE };

    case IDENTIFIER_TYPES.USERNAME:
    default:
      return PATTERNS.USERNAME.test(trimmed)
        ? { isValid: true, type: IDENTIFIER_TYPES.USERNAME, error: null }
        : { isValid: false, type: IDENTIFIER_TYPES.USERNAME, error: ERROR_MESSAGES.INVALID_USERNAME };
  }
}

/**
 * Derive a display name from an identifier
 * @param {string} identifier - The user's identifier
 * @param {'email' | 'username' | 'phone'} type - The type of identifier
 * @returns {string} - The derived display name
 */
export function deriveDisplayName(identifier, type) {
  const trimmed = identifier?.trim();

  if (!trimmed) {
    return 'User';
  }

  switch (type) {
    case IDENTIFIER_TYPES.EMAIL:
      // Use the part before @ as display name
      return trimmed.split('@')[0];

    case IDENTIFIER_TYPES.PHONE:
      // Mask phone number, showing only last 4 digits
      return `User ***${trimmed.slice(-4)}`;

    case IDENTIFIER_TYPES.USERNAME:
    default:
      // Use the username as-is
      return trimmed;
  }
}

/**
 * Normalize an identifier for consistent storage and comparison
 * @param {string} identifier - The identifier to normalize
 * @returns {string} - The normalized identifier
 */
export function normalizeIdentifier(identifier) {
  return identifier?.trim().toLowerCase() || '';
}
