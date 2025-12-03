/**
 * Platform Detection Utilities
 * Handles OS detection and modifier key formatting for keyboard shortcuts
 */

/**
 * Detect if the current platform is macOS
 * @returns {boolean} True if running on macOS
 */
export function isMac() {
  // Check modern API first, fallback to legacy
  if (typeof navigator !== 'undefined') {
    // Modern browsers with userAgentData
    if (navigator.userAgentData?.platform) {
      return navigator.userAgentData.platform.toLowerCase().includes('mac');
    }
    // Legacy platform detection
    if (navigator.platform) {
      return navigator.platform.toLowerCase().includes('mac');
    }
  }
  return false;
}

/**
 * Get the modifier key symbol for display
 * @returns {string} '⌘' on macOS, 'Ctrl' on Windows/Linux
 */
export function getModifierKey() {
  return isMac() ? '⌘' : 'Ctrl';
}

/**
 * Get the modifier key name for event matching
 * @returns {string} 'meta' on macOS, 'ctrl' on Windows/Linux
 */
export function getModifierKeyName() {
  return isMac() ? 'meta' : 'ctrl';
}

/**
 * Check if an element is an input field where shortcuts should be disabled
 * @param {EventTarget|null} target - The event target to check
 * @returns {boolean} True if target is an input element
 */
export function isInputElement(target) {
  if (!target || !(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName.toUpperCase();

  // Standard form elements
  if (tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT') {
    return true;
  }

  // Contenteditable elements (rich text editors)
  if (target.isContentEditable) {
    return true;
  }

  // Check for contenteditable attribute
  if (target.getAttribute('contenteditable') === 'true') {
    return true;
  }

  return false;
}

/**
 * Match a keyboard event against a shortcut definition
 * @param {KeyboardEvent} event - The keyboard event
 * @param {object} shortcut - The shortcut definition to match
 * @param {string} shortcut.key - The key to match
 * @param {string[]} shortcut.modifiers - Required modifiers
 * @returns {boolean} True if the event matches the shortcut
 */
export function matchShortcut(event, shortcut) {
  // Guard against undefined event.key or shortcut.key
  if (!event?.key || !shortcut?.key) {
    return false;
  }

  // Normalize key comparison (case-insensitive for letters)
  const eventKey = event.key.toLowerCase();
  const shortcutKey = shortcut.key.toLowerCase();

  // Special handling for space
  if (shortcutKey === ' ' && (eventKey === ' ' || eventKey === 'spacebar')) {
    // Space key matches
  } else if (eventKey !== shortcutKey) {
    return false;
  }

  // Check modifiers
  const modifiers = shortcut.modifiers || [];
  const needsCtrl = modifiers.includes('ctrl');
  const needsShift = modifiers.includes('shift');
  const needsAlt = modifiers.includes('alt');
  const needsMeta = modifiers.includes('meta');

  // On macOS, use metaKey for 'ctrl' modifier shortcuts
  const hasCtrlOrMeta = isMac() ? event.metaKey : event.ctrlKey;

  // Check if ctrl/meta matches expectation
  if (needsCtrl && !hasCtrlOrMeta) return false;
  if (!needsCtrl && hasCtrlOrMeta) return false;

  // Check other modifiers
  if (needsShift !== event.shiftKey) return false;
  if (needsAlt !== event.altKey) return false;

  // On Windows/Linux, also check metaKey independently
  if (!isMac() && needsMeta !== event.metaKey) return false;

  return true;
}

/**
 * Format a shortcut for display in UI
 * @param {object} shortcut - The shortcut definition
 * @param {string} shortcut.key - The key
 * @param {string[]} shortcut.modifiers - The modifiers
 * @returns {string} Formatted shortcut string (e.g., "⌘N" or "Ctrl+N")
 */
export function formatShortcut(shortcut) {
  const parts = [];
  const modifiers = shortcut.modifiers || [];

  // Add modifiers in standard order
  if (modifiers.includes('ctrl')) {
    parts.push(getModifierKey());
  }
  if (modifiers.includes('shift')) {
    parts.push('Shift');
  }
  if (modifiers.includes('alt')) {
    parts.push(isMac() ? '⌥' : 'Alt');
  }
  if (modifiers.includes('meta') && !modifiers.includes('ctrl')) {
    parts.push(isMac() ? '⌘' : 'Win');
  }

  // Format key for display
  let keyDisplay = shortcut.key;

  // Special key mappings
  const keyMappings = {
    ' ': 'Space',
    'ArrowUp': '↑',
    'ArrowDown': '↓',
    'ArrowLeft': '←',
    'ArrowRight': '→',
    'Escape': 'Esc',
    'Enter': '↵',
    'Backspace': '⌫',
    'Delete': 'Del',
    'Tab': '⇥',
  };

  if (keyMappings[keyDisplay]) {
    keyDisplay = keyMappings[keyDisplay];
  } else {
    // Uppercase single letters
    keyDisplay = keyDisplay.toUpperCase();
  }

  parts.push(keyDisplay);

  // Join with + for non-Mac, directly for Mac modifier symbols
  if (isMac() && parts.length > 1 && parts[0] === '⌘') {
    return parts.join('');
  }

  return parts.join('+');
}

/**
 * Normalize a shortcut key for storage/comparison
 * @param {object} shortcut - The shortcut definition
 * @returns {string} Normalized key (e.g., 'ctrl+n', 'arrowup')
 */
export function normalizeShortcutKey(shortcut) {
  const parts = [];
  const modifiers = shortcut.modifiers || [];

  // Add modifiers in alphabetical order
  if (modifiers.includes('alt')) parts.push('alt');
  if (modifiers.includes('ctrl')) parts.push('ctrl');
  if (modifiers.includes('meta')) parts.push('meta');
  if (modifiers.includes('shift')) parts.push('shift');

  // Add the key
  let key = shortcut.key.toLowerCase();
  if (key === ' ') key = 'space';
  parts.push(key);

  return parts.join('+');
}
