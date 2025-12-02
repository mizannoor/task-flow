# Research: Kanban View Implementation

**Feature**: 003-kanban-view  
**Date**: December 1, 2025  
**Phase**: 0 - Outline & Research

## Research Tasks

### 1. Drag-and-Drop Library Selection

**Context**: React 19 requires a drag-and-drop solution that works with modern React without deprecated APIs.

**Decision**: Use HTML5 native Drag and Drop API with custom hooks

**Rationale**:

- Zero additional dependencies (aligns with Constitution I - Client-Side First)
- Full control over drag behavior and visual feedback
- Native touch support via pointer events
- No library compatibility concerns with React 19
- Smaller bundle size than libraries like react-dnd or dnd-kit

**Alternatives Considered**:
| Library | Rejected Because |
|---------|------------------|
| react-dnd | Complexity overhead for 3-column simple board |
| @dnd-kit/core | Additional 15KB+ dependency for simple use case |
| react-beautiful-dnd | Deprecated, no React 19 support |

### 2. Touch Device Drag-and-Drop Patterns

**Context**: FR-013 requires touch-friendly interactions on mobile (320px+).

**Decision**: Implement pointer events (pointerdown, pointermove, pointerup) as unified handler

**Rationale**:

- Pointer events work for both mouse and touch
- Native browser support (95%+ coverage)
- Single codebase for desktop and mobile
- Better performance than separate mouse/touch handlers

**Implementation Pattern**:

```javascript
// Custom hook pattern
function useDragAndDrop({ onDragStart, onDragEnd, onDragOver }) {
  // Use pointer events for unified mouse/touch handling
  // Track drag state with useRef for performance
  // Provide visual feedback via CSS transforms
}
```

### 3. Column Collapse State Persistence

**Context**: FR-016 allows users to collapse columns; state should persist across sessions.

**Decision**: Store collapse state in localStorage with key `taskflow_kanban_columns`

**Rationale**:

- Aligns with existing pattern (sort preferences in localStorage)
- Instant load without IndexedDB async overhead
- Simple JSON structure: `{ pending: false, inProgress: true, completed: false }`

### 4. Keyboard Navigation Implementation

**Context**: FR-014 requires arrow key navigation and Enter for status dropdown.

**Decision**: Implement roving tabindex pattern with focus management

**Rationale**:

- WAI-ARIA best practice for grid/list navigation
- Single tab stop enters the board, arrows navigate between cards
- Enter key opens inline status dropdown (not modal)
- Escape cancels dropdown and returns focus to card

**Key Bindings**:
| Key | Action |
|-----|--------|
| Tab | Enter/exit Kanban board (first card focused) |
| ← → | Move focus between columns |
| ↑ ↓ | Move focus between cards in column |
| Enter | Open status dropdown on focused card |
| Escape | Close dropdown, return focus to card |
| Space | Alternative to Enter (accessibility) |

### 5. Side Panel Implementation Pattern

**Context**: FR-015 requires slide-out panel for task details.

**Decision**: Portal-based panel component with CSS transform animation

**Rationale**:

- Portal ensures panel renders above all content
- CSS transforms for 60fps slide animation
- Backdrop click closes panel (optional, focus trap inside)
- Reusable for future features (Calendar view details, etc.)

**Dimensions**:

- Desktop: 400px fixed width, right-aligned
- Mobile (<640px): Full-screen overlay

### 6. Performance Strategy for Large Datasets

**Context**: SC-002/SC-004 require handling 500+ tasks and 100+ per column.

**Decision**: Implement windowed virtualization for columns with >50 cards

**Rationale**:

- Only render visible cards (15-20 typically visible)
- Maintains smooth scrolling and drag-drop
- Lazy calculation of card heights for variable content

**Implementation**:

- Use intersection observer for visibility detection
- Maintain DOM pool of ~30 cards per column maximum
- Recycle cards on scroll (virtual scrolling pattern)

### 7. Task Status Update Flow

**Context**: FR-003/FR-010 require immediate status updates on drag-drop.

**Decision**: Optimistic update with rollback on failure

**Rationale**:

- Immediate UI feedback (Constitution III - Performance)
- IndexedDB update is async but reliable
- Rollback animation if persistence fails (edge case)

**Flow**:

1. User drops card in new column
2. Immediately update TaskContext state (optimistic)
3. Call `taskService.updateTask({ status: newStatus })`
4. On success: no action needed (state already correct)
5. On failure: revert state, show toast notification, animate card back

## Technology Decisions Summary

| Decision        | Choice                        | Impact                |
| --------------- | ----------------------------- | --------------------- |
| Drag-and-drop   | Native HTML5 + pointer events | Zero dependencies     |
| Touch support   | Unified pointer events        | Single codebase       |
| Column collapse | localStorage persistence      | Instant load          |
| Keyboard nav    | Roving tabindex pattern       | WCAG compliant        |
| Side panel      | Portal + CSS transforms       | 60fps animations      |
| Large datasets  | Windowed virtualization       | 100+ cards performant |
| Status updates  | Optimistic with rollback      | Instant feedback      |

## Dependencies to Add

**None required** - All functionality achievable with existing dependencies:

- React 19 (existing)
- Tailwind CSS (existing)
- Dexie.js (existing)

## Risks and Mitigations

| Risk                             | Likelihood | Impact | Mitigation                                |
| -------------------------------- | ---------- | ------ | ----------------------------------------- |
| Touch drag conflicts with scroll | Medium     | Medium | Delay drag start by 150ms on touch        |
| Performance with 500+ tasks      | Low        | High   | Virtualization implemented proactively    |
| Keyboard focus lost during drag  | Medium     | Low    | Maintain focus reference, restore on drop |
