/**
 * Keyboard Shortcuts Feature - Type Contracts
 * 
 * This file defines the TypeScript interfaces for the keyboard shortcuts feature.
 * These serve as contracts between components and can be used for documentation
 * and future TypeScript migration.
 */

// =============================================================================
// Enums
// =============================================================================

/**
 * Context where a shortcut is active
 */
export type ShortcutContext =
  | 'global'
  | 'view-list'
  | 'view-kanban'
  | 'view-calendar'
  | 'view-focus'
  | 'task-focused'
  | 'modal-open';

/**
 * Category for grouping shortcuts in help display
 */
export type ShortcutCategory =
  | 'global'
  | 'navigation'
  | 'task-actions'
  | 'selection';

/**
 * Supported modifier keys
 */
export type ModifierKey = 'ctrl' | 'shift' | 'alt' | 'meta';

/**
 * View types for navigation
 */
export type ViewType = 'list' | 'kanban' | 'calendar' | 'focus' | 'statistics' | 'team-analytics';

// =============================================================================
// Core Entities
// =============================================================================

/**
 * Represents a keyboard shortcut definition
 */
export interface ShortcutDefinition {
  /** Primary key (e.g., 'n', 'f', '/', '1', 'ArrowUp', ' ') */
  key: string;
  /** Required modifier keys */
  modifiers: ModifierKey[];
  /** Action identifier to execute */
  action: string;
  /** Context where shortcut is active */
  context: ShortcutContext;
  /** Category for help display grouping */
  category: ShortcutCategory;
  /** Human-readable description */
  description: string;
  /** Whether shortcut is enabled (default true) */
  enabled?: boolean;
}

/**
 * Persisted record of shortcut usage for analytics
 */
export interface ShortcutUsage {
  /** Auto-increment primary key */
  id?: number;
  /** User who used the shortcut */
  userId: string;
  /** Normalized shortcut identifier (e.g., 'ctrl+n', '1', 'e') */
  shortcutKey: string;
  /** Date of usage (YYYY-MM-DD) */
  date: string;
  /** Number of times used on this date */
  count: number;
  /** Timestamp of last usage */
  lastUsedAt: Date;
  /** Primary view context where used */
  context: string;
}

/**
 * Runtime keyboard navigation state
 */
export interface KeyboardState {
  /** Currently focused task ID */
  focusedTaskId: string | null;
  /** Current view with focus */
  focusedView: ViewType | null;
  /** Whether help modal is showing */
  isHelpOverlayOpen: boolean;
  /** Currently held modifier keys */
  activeModifiers: Set<ModifierKey>;
  /** Last executed shortcut (for debugging) */
  lastShortcut: string | null;
}

// =============================================================================
// Context & Hook Interfaces
// =============================================================================

/**
 * Actions available from the keyboard shortcut context
 */
export interface KeyboardShortcutActions {
  /** Register a new shortcut handler */
  registerHandler: (action: string, handler: () => void) => void;
  /** Unregister a shortcut handler */
  unregisterHandler: (action: string) => void;
  /** Set the current focus context */
  setFocusContext: (context: ShortcutContext) => void;
  /** Clear focus context */
  clearFocusContext: () => void;
  /** Open help overlay */
  openHelpOverlay: () => void;
  /** Close help overlay */
  closeHelpOverlay: () => void;
  /** Toggle help overlay */
  toggleHelpOverlay: () => void;
  /** Set focused task */
  setFocusedTask: (taskId: string | null) => void;
  /** Get all registered shortcuts */
  getShortcuts: () => ShortcutDefinition[];
  /** Get shortcuts by category */
  getShortcutsByCategory: (category: ShortcutCategory) => ShortcutDefinition[];
}

/**
 * Value provided by KeyboardShortcutContext
 */
export interface KeyboardShortcutContextValue {
  /** Current keyboard state */
  state: KeyboardState;
  /** Available actions */
  actions: KeyboardShortcutActions;
  /** All registered shortcuts */
  shortcuts: ShortcutDefinition[];
}

/**
 * Return value from useKeyboardShortcuts hook
 */
export interface UseKeyboardShortcutsReturn {
  /** Current focused task ID */
  focusedTaskId: string | null;
  /** Set focused task */
  setFocusedTask: (taskId: string | null) => void;
  /** Whether help overlay is open */
  isHelpOpen: boolean;
  /** Open help overlay */
  openHelp: () => void;
  /** Close help overlay */
  closeHelp: () => void;
  /** All registered shortcuts */
  shortcuts: ShortcutDefinition[];
  /** Get modifier key display string (Ctrl or ⌘) */
  getModifierDisplay: () => string;
  /** Format shortcut for display (e.g., "⌘N" or "Ctrl+N") */
  formatShortcut: (shortcut: ShortcutDefinition) => string;
}

// =============================================================================
// Component Props
// =============================================================================

/**
 * Props for KeyboardShortcutsHelp component
 */
export interface KeyboardShortcutsHelpProps {
  /** Whether the help overlay is visible */
  isOpen: boolean;
  /** Callback when overlay should close */
  onClose: () => void;
}

/**
 * Props for shortcut hint display in tooltips/menus
 */
export interface ShortcutHintProps {
  /** The shortcut to display */
  shortcut: ShortcutDefinition;
  /** Additional CSS classes */
  className?: string;
}

// =============================================================================
// Service Interfaces
// =============================================================================

/**
 * Shortcut analytics service interface
 */
export interface ShortcutService {
  /** Record a shortcut usage */
  recordUsage: (userId: string, shortcutKey: string, context: string) => Promise<void>;
  /** Get usage statistics for a user */
  getUsageStats: (userId: string, days?: number) => Promise<ShortcutUsageStats>;
  /** Get most used shortcuts */
  getMostUsedShortcuts: (userId: string, limit?: number) => Promise<ShortcutUsageSummary[]>;
  /** Clean up old usage records */
  cleanupOldRecords: (olderThanDays: number) => Promise<number>;
}

/**
 * Aggregated usage statistics
 */
export interface ShortcutUsageStats {
  /** Total shortcut uses */
  totalUses: number;
  /** Unique shortcuts used */
  uniqueShortcuts: number;
  /** Usage by category */
  byCategory: Record<ShortcutCategory, number>;
  /** Usage by day */
  byDay: Array<{ date: string; count: number }>;
}

/**
 * Summary of shortcut usage
 */
export interface ShortcutUsageSummary {
  /** Shortcut key */
  shortcutKey: string;
  /** Total usage count */
  totalCount: number;
  /** Last used timestamp */
  lastUsed: Date;
  /** Most common context */
  primaryContext: string;
}

// =============================================================================
// Utility Types
// =============================================================================

/**
 * Platform information for modifier key display
 */
export interface PlatformInfo {
  /** Whether running on macOS */
  isMac: boolean;
  /** Modifier key symbol (⌘ or Ctrl) */
  modifierSymbol: string;
  /** Modifier key name */
  modifierName: string;
}

/**
 * Keyboard event matcher result
 */
export interface ShortcutMatch {
  /** Matched shortcut definition */
  shortcut: ShortcutDefinition;
  /** Whether the match is exact */
  exact: boolean;
}
