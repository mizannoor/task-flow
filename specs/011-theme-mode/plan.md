# Implementation Plan: Theme Mode (Dark/Light)

**Branch**: `011-theme-mode` | **Date**: December 3, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/011-theme-mode/spec.md`

## Summary

Implement comprehensive dark/light theme support for TaskFlow, enabling users to switch themes via a header toggle (top-right) or keyboard shortcuts (Ctrl+Alt+D for dark, Ctrl+Alt+L for light). The implementation will use Tailwind CSS's `darkMode: 'class'` strategy, persist preferences in localStorage, detect OS theme for first-time users, and ensure WCAG AA contrast compliance across all UI elements.

## Technical Context

**Language/Version**: JavaScript ES2022+ (React 18+)  
**Primary Dependencies**: React, Tailwind CSS, React Context API  
**Storage**: localStorage for theme preference persistence  
**Testing**: Jest + React Testing Library  
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge)  
**Project Type**: Single web application (client-side only)  
**Performance Goals**: Theme switch in <100ms, no layout shifts  
**Constraints**: Offline-capable, client-side only, WCAG AA compliance (4.5:1 contrast)  
**Scale/Scope**: All existing views (List, Kanban, Calendar, Focus, Analytics)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                     | Status  | Notes                                                                              |
| ----------------------------- | ------- | ---------------------------------------------------------------------------------- |
| I. Client-Side First          | ✅ PASS | Theme stored in localStorage, no backend required                                  |
| II. AI-Augmented Intelligence | ✅ N/A  | Feature does not involve AI                                                        |
| III. Performance Excellence   | ✅ PASS | Theme switch via CSS class toggle is <100ms                                        |
| IV. Multi-User Experience     | ✅ PASS | Theme preference stored per browser (localStorage), instant switching              |
| V. Data Integrity             | ✅ PASS | Theme value validated (only 'light' or 'dark' accepted)                            |
| VI. Responsive & Accessible   | ✅ PASS | Theme toggle is keyboard accessible, colors meet WCAG AA contrast requirements     |

**Result**: All gates passed. Proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/011-theme-mode/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── theme-types.ts   # TypeScript interface definitions
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── Dashboard.jsx           # UPDATE: Add ThemeProvider wrapper, theme toggle in header
│   └── ui/
│       └── ThemeToggle.jsx     # NEW: Theme toggle button component
├── contexts/
│   └── ThemeContext.jsx        # NEW: Theme state management and persistence
├── hooks/
│   └── useTheme.js             # NEW: Theme access hook
├── utils/
│   ├── constants.js            # UPDATE: Add theme constants and keyboard shortcuts
│   └── themeUtils.js           # NEW: Theme detection and validation utilities
└── styles/
    └── globals.css             # UPDATE: Add dark mode CSS variables and overrides

tailwind.config.js              # UPDATE: Enable darkMode: 'class'
```

**Structure Decision**: Single project structure following existing patterns. ThemeContext provides global theme state. Tailwind's `dark:` prefix handles component-level styling. CSS variables in globals.css provide color tokens for both themes.

## Complexity Tracking

> No constitution violations requiring justification.

---

## Post-Design Constitution Re-Check

_Re-evaluated after Phase 1 design completion._

| Principle                     | Status  | Design Verification                                                                                      |
| ----------------------------- | ------- | -------------------------------------------------------------------------------------------------------- |
| I. Client-Side First          | ✅ PASS | ThemeContext stores preference in localStorage; no server calls                                          |
| II. AI-Augmented Intelligence | ✅ N/A  | No AI components in this feature                                                                         |
| III. Performance Excellence   | ✅ PASS | Single class toggle on `<html>` element; CSS handles all styling; no React re-renders needed for colors |
| IV. Multi-User Experience     | ✅ PASS | Theme persists per browser; switching users doesn't affect theme (personal preference)                   |
| V. Data Integrity             | ✅ PASS | Theme value validated via themeUtils; only 'light'/'dark' accepted; fallback to 'light'                 |
| VI. Responsive & Accessible   | ✅ PASS | WCAG AA colors defined per PRD; keyboard shortcuts integrate with existing system; toggle is focusable  |
