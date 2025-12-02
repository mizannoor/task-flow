# Quickstart: Kanban View Implementation

**Feature**: 003-kanban-view  
**Date**: December 1, 2025  
**Phase**: 1 - Design & Contracts

## Prerequisites

- Node.js 18+ installed
- Repository cloned and on branch `003-kanban-view`
- Dependencies installed (`npm install`)

## Quick Setup

```bash
# Ensure you're on the correct branch
git checkout 003-kanban-view

# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

## Implementation Order

### Phase 1: Core Components (P1 - Must Have)

```
1. src/hooks/useDragAndDrop.js           # Drag-drop state management
2. src/components/views/KanbanCard.jsx   # Task card component
3. src/components/views/KanbanColumn.jsx # Column with drop zone
4. src/components/views/KanbanView.jsx   # Main board container
5. Integration with Dashboard.jsx        # Add view toggle
```

### Phase 2: Interactions (P2 - Drag-Drop)

```
6. Drag-drop visual feedback            # Ghost card, drop indicators
7. Status update on drop                # TaskContext integration
8. Touch support                        # Pointer events
```

### Phase 3: Enhancements (P3-P5)

```
9. src/components/views/TaskSidePanel.jsx    # Slide-out panel
10. src/components/views/KanbanCardPreview.jsx # Hover preview
11. Keyboard navigation                       # Roving tabindex
12. Column collapse                           # Toggle + persistence
```

## Key Files Reference

| File                           | Purpose                | Dependency |
| ------------------------------ | ---------------------- | ---------- |
| `src/contexts/TaskContext.jsx` | Task state, updateTask | Existing   |
| `src/hooks/useTasks.js`        | Task access hook       | Existing   |
| `src/utils/constants.js`       | STATUSES, PRIORITIES   | Existing   |
| `src/services/taskService.js`  | IndexedDB operations   | Existing   |

## Component Hierarchy

```
Dashboard.jsx
└── KanbanView.jsx
    ├── FilterBar.jsx (existing, reused)
    ├── KanbanColumn.jsx (×3)
    │   └── KanbanCard.jsx (×n)
    │       └── KanbanCardPreview.jsx (on hover)
    └── TaskSidePanel.jsx (on card click)
```

## Testing Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- src/components/views/KanbanView.test.jsx
```

## Key Constants to Use

```javascript
import {
  STATUSES, // { PENDING, IN_PROGRESS, COMPLETED }
  STATUS_LABELS, // Display names
  STATUS_COLORS, // Tailwind classes
  PRIORITIES, // { URGENT, HIGH, MEDIUM, LOW }
  PRIORITY_ORDER, // Sort values
  PRIORITY_COLORS, // Tailwind classes
} from '../../utils/constants';
```

## Storage Key

```javascript
// Column collapse state
const KANBAN_STORAGE_KEY = 'taskflow_kanban_columns';
```

## Styling Patterns

Use existing Tailwind patterns from TaskList/TaskRow:

```jsx
// Card container
<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 cursor-grab">

// Priority badge
<span className={`px-2 py-0.5 text-xs font-medium rounded ${PRIORITY_COLORS[task.priority]}`}>

// Column header
<div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-t-lg">

// Count badge
<span className="bg-gray-200 text-gray-700 text-xs font-medium px-2 py-0.5 rounded-full">
```

## Accessibility Checklist

- [ ] All cards have `role="button"` or are buttons
- [ ] Drag handles have `aria-grabbed` state
- [ ] Columns have `aria-dropeffect` during drag
- [ ] Focus visible on all interactive elements
- [ ] Keyboard navigation works without mouse
- [ ] Screen reader announcements for drag operations

## Success Validation

Run these checks before marking implementation complete:

1. **Visual**: Board displays three columns with correct task distribution
2. **Drag-Drop**: Cards move between columns, status updates persist
3. **Performance**: 500 tasks load < 1 second
4. **Mobile**: Touch drag works on 320px screen
5. **Keyboard**: Navigate and change status without mouse
6. **Persistence**: Column collapse state survives page reload
