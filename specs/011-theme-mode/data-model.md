# Data Model: Theme Mode (Dark/Light)

**Feature**: 011-theme-mode  
**Date**: December 3, 2025

## Entities

### ThemePreference

Represents the user's selected theme mode stored in localStorage.

| Attribute | Type | Description | Constraints |
|-----------|------|-------------|-------------|
| value | string | Current theme mode | Enum: 'light', 'dark' |

**Storage Key**: `taskflow_theme`

**Validation Rules**:
- Value MUST be either 'light' or 'dark'
- Invalid values default to 'light'
- Empty/null values trigger OS preference detection

### ThemeState (Runtime)

React Context state for theme management.

| Attribute | Type | Description |
|-----------|------|-------------|
| theme | 'light' \| 'dark' | Current active theme |
| isDark | boolean | Convenience flag (theme === 'dark') |
| isSystemDefault | boolean | True if using OS preference (no saved value) |

### ThemeColors (Configuration)

Color palette configuration for each theme mode.

| Category | Light Mode | Dark Mode |
|----------|------------|-----------|
| **Backgrounds** | | |
| background | #FFFFFF | #0F172A |
| surface | #F8FAFC | #1E293B |
| surfaceHover | #F1F5F9 | #334155 |
| **Text** | | |
| textPrimary | #0F172A | #FFFFFF |
| textSecondary | #475569 | #CBD5E1 |
| textMuted | #94A3B8 | #64748B |
| **Accents** | | |
| primary | #3B82F6 | #60A5FA |
| secondary | #64748B | #94A3B8 |
| accent | #6366F1 | #818CF8 |
| **Status** | | |
| success | #22C55E | #4ADE80 |
| warning | #F59E0B | #FBBF24 |
| error | #EF4444 | #F87171 |
| **Borders** | | |
| border | #E2E8F0 | #334155 |
| borderHover | #CBD5E1 | #475569 |
| **Inputs** | | |
| inputBg | #FFFFFF | #1E293B |
| inputBorder | #D1D5DB | #475569 |
| inputFocus | #3B82F6 | #60A5FA |
| placeholder | #9CA3AF | #64748B |

### Priority Badge Colors

| Priority | Light Mode | Dark Mode |
|----------|------------|-----------|
| Urgent | #EF4444 (red-500) | #F87171 (red-400) |
| High | #F97316 (orange-500) | #FB923C (orange-400) |
| Medium | #EAB308 (yellow-500) | #FACC15 (yellow-400) |
| Low | #22C55E (green-500) | #4ADE80 (green-400) |

## State Transitions

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Load                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │ Check localStorage for theme  │
              └───────────────────────────────┘
                              │
            ┌─────────────────┴─────────────────┐
            │                                   │
            ▼                                   ▼
   ┌─────────────────┐               ┌─────────────────────┐
   │ Value exists?   │──── No ──────▶│ Detect OS preference │
   │ 'light'/'dark'  │               │ (prefers-color-scheme)│
   └─────────────────┘               └─────────────────────┘
            │                                   │
            │ Yes                               ▼
            │                        ┌─────────────────────┐
            │                        │ Set isSystemDefault │
            │                        │      = true         │
            │                        └─────────────────────┘
            │                                   │
            └─────────────────┬─────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │  Apply theme to <html> class  │
              │  (add/remove 'dark' class)    │
              └───────────────────────────────┘
```

## Storage Schema

### localStorage

```javascript
// Key: 'taskflow_theme'
// Value: 'light' | 'dark'

// Example:
localStorage.setItem('taskflow_theme', 'dark');
const theme = localStorage.getItem('taskflow_theme'); // 'dark'
```

## Relationships

```
┌─────────────────┐         ┌─────────────────────┐
│  ThemeContext   │────────▶│  KeyboardShortcut   │
│                 │         │      Context        │
│  - theme        │         │  - switchToDark     │
│  - setTheme()   │◀────────│  - switchToLight    │
│  - toggleTheme()│         │                     │
└─────────────────┘         └─────────────────────┘
         │
         │ provides
         ▼
┌─────────────────┐         ┌─────────────────────┐
│  ThemeToggle    │         │   All Components    │
│   Component     │         │                     │
│                 │         │ - Use dark: prefix  │
│  (header)       │         │ - Access chartColors│
└─────────────────┘         └─────────────────────┘
```

## Constraints

1. **Single Value**: Only one theme can be active at a time
2. **Valid Values**: Theme must be 'light' or 'dark'; invalid values fallback to 'light'
3. **Persistence**: Theme preference persists across browser sessions
4. **Immediate Application**: Theme change takes effect immediately without page reload
5. **OS Detection Fallback**: When no saved preference, OS preference is used
6. **No User Binding**: Theme is browser-level, not per-user (different from task data)
