# Research: Theme Mode (Dark/Light)

**Feature**: 011-theme-mode  
**Date**: December 3, 2025

## Research Tasks

### 1. Tailwind CSS Dark Mode Configuration

**Decision**: Use `darkMode: 'class'` strategy

**Rationale**:

- The `class` strategy allows programmatic control via JavaScript (adding/removing `dark` class on `<html>`)
- Works with localStorage persistence (no dependency on OS setting unless desired)
- Already the recommended approach in Tailwind documentation
- Supports instant switching without page reload

**Alternatives Considered**:

- `darkMode: 'media'` - Only respects OS preference, no user control. Rejected because users need to toggle manually.

**Implementation**:

```javascript
// tailwind.config.js
export default {
  darkMode: 'class',
  // ...rest of config
};
```

### 2. Theme Persistence Strategy

**Decision**: Use localStorage with key `taskflow_theme`

**Rationale**:

- Consistent with existing patterns (SESSION_KEY, VIEW_STORAGE_KEY already use localStorage)
- Simple synchronous API for fast initial render
- PRD Section 7.3 already specifies `localStorage.setItem('taskflow_theme', 'dark' | 'light')`
- Works offline

**Alternatives Considered**:

- IndexedDB via Dexie.js - Overkill for a single string value; async API would cause flash of wrong theme
- Cookies - Unnecessary server-side access for client-only app

### 3. OS Theme Detection

**Decision**: Use `window.matchMedia('(prefers-color-scheme: dark)')` for initial detection

**Rationale**:

- Standard browser API with excellent support (Chrome 76+, Firefox 67+, Safari 12.1+, Edge 79+)
- Only used when no saved preference exists
- Can listen for changes with `addListener()` if real-time OS sync is desired (out of scope)

**Implementation**:

```javascript
function getSystemTheme() {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}
```

### 4. Color Palette for Dark Mode

**Decision**: Use PRD-defined color palette (Section 8.1.1)

**Rationale**:

- Colors already specified and tested for WCAG AA compliance
- Consistent with existing design system

**Light Theme** (current):
| Element | Hex |
|---------|-----|
| Background | #FFFFFF |
| Surface | #F8FAFC |
| Primary | #3B82F6 |
| Text Primary | #0F172A |
| Text Secondary | #475569 |

**Dark Theme**:
| Element | Hex |
|---------|-----|
| Background | #0F172A (slate-900) |
| Surface | #1E293B (slate-800) |
| Primary | #60A5FA (blue-400) |
| Text Primary | #FFFFFF |
| Text Secondary | #CBD5E1 (slate-300) |

### 5. Keyboard Shortcut Integration

**Decision**: Extend existing KEYBOARD_SHORTCUTS array in constants.js

**Rationale**:

- Consistent with existing shortcut infrastructure (010-keyboard-shortcuts feature)
- Shortcuts registered in KeyboardShortcutContext will work globally
- Help overlay (Ctrl+/) will automatically include theme shortcuts

**Implementation**: Add two new shortcut definitions:

```javascript
{
  key: 'd',
  modifiers: ['ctrl', 'alt'],
  action: 'switchToDark',
  context: SHORTCUT_CONTEXTS.GLOBAL,
  category: SHORTCUT_CATEGORIES.GLOBAL,
  description: 'Switch to dark mode',
  enabled: true,
},
{
  key: 'l',
  modifiers: ['ctrl', 'alt'],
  action: 'switchToLight',
  context: SHORTCUT_CONTEXTS.GLOBAL,
  category: SHORTCUT_CATEGORIES.GLOBAL,
  description: 'Switch to light mode',
  enabled: true,
}
```

### 6. Theme Toggle Component Placement

**Decision**: Top-right header area, next to UserSwitcher

**Rationale**:

- Follows common UI patterns (GitHub, VS Code, etc.)
- Specification explicitly requires "top-right header"
- Non-intrusive but discoverable

### 7. Transition Animation

**Decision**: Use CSS transitions with 150ms duration

**Rationale**:

- Smooth enough to avoid jarring effect
- Fast enough to feel responsive (SC-001 requires <1 second)
- Standard Tailwind transition duration

**Implementation**:

```css
/* globals.css */
html {
  transition:
    background-color 150ms ease-in-out,
    color 150ms ease-in-out;
}
```

### 8. Chart Theming (Recharts)

**Decision**: Use dynamic colors via ThemeContext

**Rationale**:

- Recharts doesn't automatically respect Tailwind dark mode
- Colors must be passed programmatically to chart components
- Theme context can provide chart-specific color palettes

**Implementation**: ThemeContext will export `chartColors` object:

```javascript
const chartColors = isDark
  ? {
      primary: '#60A5FA',
      secondary: '#94A3B8',
      success: '#4ADE80',
      warning: '#FBBF24',
      error: '#F87171',
      grid: '#334155',
      text: '#CBD5E1',
    }
  : {
      primary: '#3B82F6',
      secondary: '#64748B',
      success: '#22C55E',
      warning: '#F59E0B',
      error: '#EF4444',
      grid: '#E2E8F0',
      text: '#475569',
    };
```

## Summary

All research questions resolved. Implementation approach:

1. Enable Tailwind `darkMode: 'class'`
2. Create ThemeContext with localStorage persistence
3. Add `dark` class to `<html>` element for dark mode
4. Use Tailwind's `dark:` prefix for component styling
5. Add CSS variables for chart colors and custom elements
6. Integrate shortcuts with existing KeyboardShortcutContext
7. Create ThemeToggle component for header
