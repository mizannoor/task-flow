# Research: Authentication System

**Feature Branch**: `001-auth-system`  
**Date**: December 1, 2025  
**Status**: Complete

## Research Tasks

### 1. IndexedDB with Dexie.js for User Storage

**Task**: Research best practices for IndexedDB user data storage via Dexie.js

**Decision**: Use Dexie.js as the IndexedDB wrapper library

**Rationale**:
- Dexie.js provides a clean Promise-based API over IndexedDB
- Built-in schema versioning and migration support
- Excellent TypeScript support for type safety
- Mature library with active maintenance
- Recommended in PRD technology stack

**Alternatives Considered**:
- **idb**: Lighter wrapper but lacks schema management features
- **localForage**: Simpler API but less control over IndexedDB specifics
- **Raw IndexedDB**: Too verbose and error-prone for application code

**Implementation Notes**:
```javascript
// Database schema definition
const db = new Dexie('TaskFlowDB');
db.version(1).stores({
  users: '++id, identifier, &identifier', // Auto-increment, indexed, unique
  sessions: 'id, userId, createdAt'
});
```

---

### 2. Session Persistence in localStorage

**Task**: Research session persistence patterns for client-side auth

**Decision**: Store session token in localStorage with user reference

**Rationale**:
- localStorage persists across browser sessions (survives restart)
- Synchronous API is acceptable for small session data
- Simple key-value storage is sufficient for session info
- Aligns with FR-007 requirement

**Alternatives Considered**:
- **sessionStorage**: Doesn't persist across browser restarts (rejected)
- **IndexedDB for session**: Overkill for simple session data
- **Cookies**: Not needed without backend; adds complexity

**Implementation Notes**:
```javascript
// Session structure in localStorage
const SESSION_KEY = 'taskflow_session';
const session = {
  userId: string,      // Reference to user in IndexedDB
  loginAt: timestamp,  // When session was created
  token: string        // UUID for session identification
};
localStorage.setItem(SESSION_KEY, JSON.stringify(session));
```

---

### 3. Identifier Validation Patterns

**Task**: Research validation patterns for email, username, and phone

**Decision**: Use regex patterns with clear error messages

**Rationale**:
- Standard regex patterns provide consistent validation
- Client-side validation gives immediate feedback
- No server-side validation needed (client-only app)

**Validation Patterns**:

| Type | Pattern | Examples |
|------|---------|----------|
| Email | `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` | `user@example.com` |
| Username | `/^[a-zA-Z0-9_]{3,30}$/` | `john_doe`, `user123` |
| Phone | `/^\+?[0-9]{10,15}$/` | `+15551234567`, `5551234567` |

**Auto-Detection Logic**:
1. Contains `@` → treat as email
2. Starts with `+` or all digits → treat as phone
3. Otherwise → treat as username

---

### 4. React Context for Auth State

**Task**: Research React Context patterns for authentication state

**Decision**: Single AuthContext with useReducer for state management

**Rationale**:
- React Context is specified in PRD technology stack
- useReducer provides predictable state transitions
- Avoids external state management library overhead
- Aligns with client-side-first architecture

**Alternatives Considered**:
- **Zustand**: Good but adds dependency not in PRD stack
- **Redux**: Overkill for auth state alone
- **useState only**: Less organized for complex state transitions

**Implementation Notes**:
```javascript
// Auth state shape
const initialState = {
  currentUser: null,
  users: [],
  isAuthenticated: false,
  isLoading: true,
  error: null
};

// Auth actions
const AUTH_ACTIONS = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  SWITCH_USER: 'SWITCH_USER',
  SET_USERS: 'SET_USERS',
  SET_ERROR: 'SET_ERROR',
  SET_LOADING: 'SET_LOADING'
};
```

---

### 5. Multi-Tab Session Synchronization

**Task**: Research handling multiple browser tabs with different users

**Decision**: Last login wins; other tabs sync on focus via storage event

**Rationale**:
- localStorage fires `storage` events across tabs
- Simple to implement without complex sync logic
- Matches edge case specification from feature spec

**Implementation Notes**:
```javascript
// Listen for storage changes in other tabs
window.addEventListener('storage', (event) => {
  if (event.key === SESSION_KEY) {
    // Sync session from another tab
    const newSession = JSON.parse(event.newValue);
    dispatch({ type: AUTH_ACTIONS.SYNC_SESSION, payload: newSession });
  }
});
```

---

### 6. User Switcher UI Patterns

**Task**: Research accessible dropdown patterns for user switching

**Decision**: Custom dropdown with keyboard navigation and ARIA attributes

**Rationale**:
- Custom dropdown allows full styling with Tailwind
- Keyboard navigation required by Constitution Principle VI
- ARIA attributes ensure screen reader compatibility

**Accessibility Requirements**:
- `role="menu"` on dropdown container
- `role="menuitem"` on each option
- `aria-expanded` state on trigger button
- Arrow key navigation between items
- Escape key closes dropdown
- Focus trap while open

**Implementation Notes**:
```jsx
// Keyboard navigation keys
const KEYS = {
  ARROW_DOWN: 'ArrowDown',
  ARROW_UP: 'ArrowUp',
  ESCAPE: 'Escape',
  ENTER: 'Enter',
  SPACE: ' '
};
```

---

### 7. IndexedDB Unavailability Handling

**Task**: Research graceful degradation when IndexedDB is unavailable

**Decision**: Show clear error message; app cannot function without IndexedDB

**Rationale**:
- IndexedDB is core to the application (Constitution Principle I)
- No meaningful fallback exists for local storage
- Clear error is better than silent failure

**Detection Method**:
```javascript
async function checkIndexedDBAvailability() {
  try {
    const db = await Dexie.open('test');
    db.close();
    await Dexie.delete('test');
    return true;
  } catch (error) {
    return false;
  }
}
```

**Error Message**: "TaskFlow requires local storage to function. Please disable private browsing mode or enable IndexedDB in your browser settings."

---

### 8. Display Name Derivation

**Task**: Research how to derive display names from identifiers

**Decision**: Extract meaningful name from identifier type

**Rationale**:
- No separate name field simplifies data model
- Automatic derivation reduces user friction
- Matches assumption in feature spec

**Derivation Rules**:

| Identifier Type | Derivation Rule | Example |
|-----------------|-----------------|---------|
| Email | Use part before `@` | `john@example.com` → `john` |
| Username | Use as-is | `john_doe` → `john_doe` |
| Phone | Use last 4 digits with mask | `+15551234567` → `User ***4567` |

---

## Summary of Key Decisions

| Topic | Decision | Key Reason |
|-------|----------|------------|
| IndexedDB Wrapper | Dexie.js | PRD-specified, schema support |
| Session Storage | localStorage | Persists across restarts |
| State Management | React Context + useReducer | PRD-specified, no extra deps |
| Validation | Regex with auto-detection | Immediate feedback |
| Multi-Tab Sync | storage event listener | Last login wins |
| Dropdown | Custom with ARIA | Full accessibility |
| IndexedDB Fallback | Error message only | No viable fallback |
| Display Names | Auto-derived from identifier | Reduces friction |

## Open Questions

None - all research tasks resolved.
