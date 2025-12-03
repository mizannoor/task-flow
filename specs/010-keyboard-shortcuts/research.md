# Research: Keyboard Shortcuts

**Feature**: 010-keyboard-shortcuts  
**Date**: December 3, 2025  
**Status**: Complete

## Research Tasks

### 1. React Keyboard Event Handling Best Practices

**Task**: Research best practices for handling keyboard events in React applications.

**Decision**: Use `useEffect` with document-level event listeners for global shortcuts, and component-level `onKeyDown` handlers for context-specific shortcuts.

**Rationale**:

- Document-level listeners capture shortcuts regardless of focus location
- React's synthetic events work well for component-specific handlers
- Using `useCallback` with stable dependencies prevents unnecessary re-registrations
- Event delegation pattern is more efficient than attaching listeners to every element

**Alternatives Considered**:

- **Third-party library (react-hotkeys, mousetrap)**: Rejected due to added bundle size and limited customization; native event handling is sufficient for our needs
- **Context-only approach**: Rejected because some shortcuts need to work even when no specific context is active

**Implementation Pattern**:

```javascript
// Global shortcuts via useEffect
useEffect(() => {
  const handleKeyDown = (e) => {
    if (shouldIgnoreShortcut(e)) return;
    // Handle shortcuts
  };
  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [dependencies]);
```

---

### 2. Platform Detection (macOS vs Windows/Linux)

**Task**: Research reliable methods to detect operating system for modifier key display.

**Decision**: Use `navigator.platform` with fallback to `navigator.userAgentData?.platform` for modern browsers.

**Rationale**:

- `navigator.platform` has wide browser support (including older browsers)
- `userAgentData` is the modern approach but not universally supported yet
- Checking for "Mac" prefix covers macOS, while assuming Windows/Linux for others
- This approach aligns with how VS Code and other apps handle platform detection

**Alternatives Considered**:

- **navigator.userAgent parsing**: More complex and less reliable
- **Feature detection for key events**: Would require user interaction first

**Implementation Pattern**:

```javascript
export function isMac() {
  return (
    navigator.platform?.toLowerCase().includes('mac') ||
    navigator.userAgentData?.platform?.toLowerCase().includes('macos')
  );
}

export function getModifierKey() {
  return isMac() ? '⌘' : 'Ctrl';
}
```

---

### 3. Input Field Detection for Shortcut Suppression

**Task**: Research how to detect when user is typing in an input field to disable single-key shortcuts.

**Decision**: Check `e.target.tagName` for INPUT, TEXTAREA, SELECT, and check for `contenteditable` attribute.

**Rationale**:

- Simple and reliable detection method
- Covers all standard form elements
- `contenteditable` check handles rich text editors
- Modifier shortcuts (Ctrl+N) should still work in inputs

**Alternatives Considered**:

- **isContentEditable property**: Less reliable across browsers
- **Focus tracking via context**: More complex, requires wrapping all inputs

**Implementation Pattern**:

```javascript
function shouldIgnoreShortcut(event, requiresModifier) {
  const target = event.target;
  const isInputElement =
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.tagName === 'SELECT' ||
    target.isContentEditable;

  // Allow modifier shortcuts even in input fields
  if (requiresModifier) return false;

  return isInputElement;
}
```

---

### 4. Preventing Browser Default Shortcuts

**Task**: Research how to reliably prevent browser default behavior for shortcuts like Ctrl+N.

**Decision**: Use `event.preventDefault()` immediately when a registered shortcut is detected.

**Rationale**:

- `preventDefault()` must be called synchronously in the event handler
- Chrome, Firefox, Safari, and Edge all respect this for most shortcuts
- Some system-level shortcuts (Ctrl+W, Ctrl+T) cannot be overridden in all browsers

**Known Limitations**:

- `Ctrl+N` can be overridden in Chrome/Firefox/Edge
- Safari may still open new window for `Cmd+N` in some cases (can't override)
- Full-screen mode can affect shortcut availability

**Implementation Pattern**:

```javascript
const handleKeyDown = (e) => {
  const shortcut = matchShortcut(e);
  if (shortcut) {
    e.preventDefault();
    e.stopPropagation();
    executeShortcut(shortcut);
  }
};
```

---

### 5. Screen Reader Compatibility

**Task**: Research best practices for keyboard shortcuts with screen readers.

**Decision**: Announce shortcut actions via ARIA live regions and ensure shortcuts don't conflict with screen reader navigation.

**Rationale**:

- Screen readers use many keyboard shortcuts (e.g., arrow keys for virtual cursor)
- NVDA, JAWS, and VoiceOver have "focus mode" where they pass keys through
- Using modifiers (Ctrl+key) reduces conflicts with screen reader shortcuts
- ARIA live regions provide feedback without disrupting navigation

**Best Practices**:

- Document all shortcuts in an accessible help dialog
- Use `role="status"` or `aria-live="polite"` for action feedback
- Single-key shortcuts should only work when a specific element has focus
- Provide visual focus indicators that meet WCAG contrast requirements

**Implementation Pattern**:

```javascript
// Announce action to screen readers
const announce = (message) => {
  const el = document.getElementById('sr-announcer');
  if (el) el.textContent = message;
};

// In JSX
<div id="sr-announcer" role="status" aria-live="polite" className="sr-only" />;
```

---

### 6. Existing Kanban Keyboard Integration

**Task**: Research how to integrate global shortcuts with existing `useKanbanKeyboard` hook.

**Decision**: Create a hierarchical shortcut system where view-specific hooks can register/unregister handlers.

**Rationale**:

- `useKanbanKeyboard` already handles arrow key navigation within Kanban board
- Global shortcuts should defer to view-specific handlers when appropriate
- A context-based registry allows views to "claim" certain shortcuts

**Integration Points** (from existing `useKanbanKeyboard.js`):

- Arrow keys: Navigate between cards/columns (already implemented)
- Space: Toggle selection (already implemented)
- Enter: Open card details (already implemented)
- Escape: Close dropdown/clear focus (already implemented)

**New Global Shortcuts**:

- `E`, `D`, `C`, `S`: Delegate to focused task's actions
- `Ctrl+N`, `Ctrl+F`, `Ctrl+/`: Always global, not delegated

---

### 7. IndexedDB Schema for Shortcut Analytics

**Task**: Research optimal schema for storing shortcut usage events.

**Decision**: Add a `shortcutUsage` table to existing Dexie.js database with daily aggregation.

**Rationale**:

- Store aggregated counts per shortcut per day (not individual events) to minimize storage
- Include view context to understand where shortcuts are used
- User-specific to support multi-user analytics
- Retention: Keep last 90 days of data

**Schema Design**:

```javascript
// New table in db.js (Version 4)
db.version(4).stores({
  // ... existing tables ...
  shortcutUsage: '++id, [userId+shortcutKey+date], userId, date'
});

// Record structure
{
  id: number,           // Auto-increment
  userId: string,       // User ID
  shortcutKey: string,  // e.g., 'ctrl+n', '1', 'e'
  date: string,         // YYYY-MM-DD
  count: number,        // Usage count for this day
  lastUsedAt: Date,     // Last usage timestamp
  context: string       // View where most used: 'list', 'kanban', etc.
}
```

---

## Summary of Decisions

| Area               | Decision                            | Key Rationale                    |
| ------------------ | ----------------------------------- | -------------------------------- |
| Event Handling     | Document-level + component handlers | Global reach + context awareness |
| Platform Detection | navigator.platform                  | Wide browser support             |
| Input Detection    | tagName + contenteditable check     | Simple, reliable                 |
| Browser Prevention | Immediate preventDefault()          | Required for override            |
| Screen Readers     | ARIA live regions                   | Non-disruptive feedback          |
| Kanban Integration | Hierarchical shortcut registry      | Preserves existing behavior      |
| Analytics Storage  | Daily aggregated counts             | Minimal storage footprint        |

## Open Questions

None - all research items resolved.
