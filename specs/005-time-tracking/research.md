# Research: Time Tracking / Task Timer

**Feature**: 005-time-tracking  
**Date**: December 1, 2025  
**Status**: Complete

## Research Tasks

### 1. Timer State Management in React

**Context**: Need to implement a timer that updates UI every second while maintaining accuracy across component re-renders.

**Decision**: Use `useRef` for mutable timer references + `useState` for display values + `useEffect` for interval management.

**Rationale**: 
- `setInterval` in `useEffect` with proper cleanup prevents memory leaks
- Storing `startTimestamp` rather than incrementing counter ensures accuracy
- Calculate elapsed time as `Date.now() - startTimestamp` on each tick
- Display state updates trigger re-renders without affecting timer accuracy

**Alternatives Considered**:
- `requestAnimationFrame`: Overkill for 1-second updates, more CPU intensive
- External timer libraries (react-timer-hook): Adds dependency for simple use case
- Web Workers: Unnecessary complexity for UI timer

### 2. IndexedDB Timer Persistence with Dexie.js

**Context**: Timer state must survive page refreshes and browser restarts.

**Decision**: Store `timerStartedAt` and `timerPausedAt` timestamps directly on Task entity; add `accumulatedDuration` for paused time tracking.

**Rationale**:
- Existing Task table in Dexie schema can be extended via version migration
- Timestamps allow calculating elapsed time even after browser restart
- No separate timer session table needed (per clarification: cumulative only)
- Dexie's `version().stores()` handles schema migrations gracefully

**Alternatives Considered**:
- Separate TimerSession table: More complex, not needed for cumulative storage
- localStorage for timer state: Less reliable, doesn't integrate with task data
- sessionStorage: Doesn't persist across browser restarts

### 3. Single Active Timer Enforcement

**Context**: Only one timer can run at a time per user to prevent tracking overlap.

**Decision**: Store active task ID in React Context state; on timer start, check for existing active timer and auto-stop with save.

**Rationale**:
- Context state provides instant access to active timer across components
- Auto-stop behavior matches user expectation (Toggl, Clockify pattern)
- Toast notification informs user of auto-save action
- No database query needed to check active timer (in-memory state)

**Alternatives Considered**:
- Database flag for active timer: Requires query on every check
- Allow multiple timers with warning: Complicates data model and UX
- Block second timer start: Frustrating UX, requires manual stop first

### 4. Long Session Handling (4+ Hours)

**Context**: Clarification requires prompting user to review time if session exceeds 4 hours.

**Decision**: On stop action, check if session duration > 240 minutes; if so, show modal with time adjustment option before saving.

**Rationale**:
- Modal prevents accidental save of inflated time from forgotten timers
- Pre-filled with current elapsed time; user can adjust down
- Confirm action saves adjusted time; cancel discards session
- 4-hour threshold balances catching forgotten timers vs. legitimate long work

**Alternatives Considered**:
- Background notification during session: Could be ignored/dismissed
- Hard cap at 8 hours: Loses legitimate extended work time
- Always prompt on stop: Annoying for normal sessions

### 5. Browser Tab/Close Recovery

**Context**: Timer should recover state when user closes browser with timer running.

**Decision**: On app load, check for tasks with `timerStartedAt` set and no stop; calculate elapsed since start; prompt user to save or discard.

**Rationale**:
- `timerStartedAt` persists in IndexedDB across sessions
- On restore, calculate `Date.now() - timerStartedAt` for elapsed time
- Show recovery modal with options: Save, Adjust, or Discard
- Combines with 4-hour check for potentially long abandoned sessions

**Alternatives Considered**:
- Auto-save on browser close (`beforeunload`): Unreliable, may not fire
- Auto-discard abandoned timers: Loses legitimate work time
- No recovery: Poor UX, data loss

### 6. Timer Display Formatting

**Context**: Display elapsed time in HH:MM:SS format, and comparison with estimates.

**Decision**: Create `formatDuration(minutes)` and `formatElapsedTime(seconds)` utilities in `formatters.js`.

**Rationale**:
- Consistent formatting across timer display, task list, and comparisons
- `HH:MM:SS` for active timer display (second precision)
- `Xh Ym` for task cards and lists (minute precision sufficient)
- Percentage calculation for estimate comparison: `(actual / estimated) * 100`

**Alternatives Considered**:
- External date-fns/moment: Overkill for simple duration formatting
- Inline formatting: Duplicated code, inconsistent output

### 7. User Account Switching Behavior

**Context**: Timer state should be preserved per-user when switching accounts.

**Decision**: On user switch, save current timer state to IndexedDB for outgoing user; restore timer state for incoming user from IndexedDB.

**Rationale**:
- Each user's timer is independent (stored on their tasks)
- Context state resets on user switch; `useEffect` in provider loads new user's timer state
- Outgoing user's running timer auto-pauses and saves accumulated time
- Seamless experience matches multi-user passwordless auth pattern

**Alternatives Considered**:
- Discard timer on switch: Poor UX, loses work
- Prompt before switch: Adds friction to quick switching

## Technology Decisions Summary

| Area | Decision | Confidence |
|------|----------|------------|
| Timer State | useRef + useState + useEffect pattern | High |
| Persistence | Extend Task entity with timer fields | High |
| Single Timer | Context state tracking active task ID | High |
| Long Sessions | Modal prompt at 4-hour threshold | High |
| Recovery | Prompt on app load for abandoned timers | High |
| Formatting | Custom utility functions in formatters.js | High |
| User Switching | Auto-save timer on switch, restore on load | High |

## Dependencies

- **Existing**: Dexie.js, React Context, Tailwind CSS, Toast notifications
- **New**: None required - all functionality implementable with existing stack

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Timer drift over long sessions | Low | Low | Timestamp-based calculation ensures accuracy |
| IndexedDB unavailable | Very Low | High | Already handled by app-level check |
| Browser performance impact | Low | Medium | 1-second interval is lightweight |
| User forgets about running timer | Medium | Medium | Visual indicator in header; long session prompt |
