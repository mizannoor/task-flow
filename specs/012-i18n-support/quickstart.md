# Quickstart: Multilanguage Support (i18n)

**Feature**: 012-i18n-support  
**Date**: December 3, 2025

## Overview

This guide explains how to use and extend the TaskFlow internationalization (i18n) system.

## Using Translations in Components

### Basic Usage

```jsx
import { useTranslation } from '../hooks/useTranslation';

function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('tasks.myTasks')}</h1>
      <button>{t('common.save')}</button>
    </div>
  );
}
```

### With Interpolation

```jsx
function TaskDeleteConfirm({ taskName }) {
  const { t } = useTranslation();

  return (
    <p>{t('tasks.deleteConfirmMessage', { name: taskName })}</p>
    // Output: "Are you sure you want to delete "Fix bug"?"
  );
}
```

### Accessing Current Language

```jsx
function LanguageDisplay() {
  const { language, setLanguage } = useTranslation();

  return (
    <div>
      <p>Current: {language}</p>
      <button onClick={() => setLanguage('ms')}>Switch to Malay</button>
    </div>
  );
}
```

## Adding New Translation Keys

### Step 1: Define the key in both language files

```typescript
// src/i18n/locales/en.ts
export const en = {
  // ... existing translations
  myFeature: {
    title: 'My Feature Title',
    description: 'This is a description for {name}',
  },
};

// src/i18n/locales/ms.ts
export const ms = {
  // ... existing translations
  myFeature: {
    title: 'Tajuk Ciri Saya',
    description: 'Ini adalah penerangan untuk {name}',
  },
};
```

### Step 2: Use in component

```jsx
function MyFeature({ featureName }) {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('myFeature.title')}</h1>
      <p>{t('myFeature.description', { name: featureName })}</p>
    </div>
  );
}
```

### Step 3: Document in contracts (optional but recommended)

Add the new keys to `specs/012-i18n-support/contracts/translation-keys.md` for reference.

## Translation Key Naming Conventions

### Namespaces

| Namespace   | Use For                              |
| ----------- | ------------------------------------ |
| `common`    | Shared UI elements (buttons, labels) |
| `auth`      | Authentication screens               |
| `tasks`     | Task management                      |
| `kanban`    | Kanban view                          |
| `focus`     | Focus view                           |
| `calendar`  | Calendar view                        |
| `timer`     | Time tracking                        |
| `analytics` | Analytics dashboards                 |
| `settings`  | User settings                        |
| `errors`    | Error messages                       |
| `toast`     | Toast notifications                  |
| `views`     | View names                           |
| `ai`        | AI features                          |

### Key Structure

```
namespace.section.key
```

Examples:

- `tasks.form.taskName` - Task form field label
- `errors.validation.taskNameRequired` - Validation error
- `toast.success.taskCreated` - Success toast message

## Migrating Hardcoded Strings

### Before (hardcoded)

```jsx
function TaskList() {
  return (
    <div>
      <h1>My Tasks</h1>
      <button>Create Task</button>
      {tasks.length === 0 && <p>No tasks yet</p>}
    </div>
  );
}
```

### After (translated)

```jsx
import { useTranslation } from '../hooks/useTranslation';

function TaskList() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('tasks.myTasks')}</h1>
      <button>{t('tasks.createTask')}</button>
      {tasks.length === 0 && <p>{t('tasks.emptyTitle')}</p>}
    </div>
  );
}
```

## Translating Constants

For constants like `PRIORITY_LABELS`, create a helper function:

```jsx
import { useTranslation } from '../hooks/useTranslation';
import { PRIORITIES } from '../utils/constants';

function PriorityBadge({ priority }) {
  const { t } = useTranslation();

  // Map constant value to translation key
  const priorityLabels = {
    [PRIORITIES.URGENT]: t('priorities.urgent'),
    [PRIORITIES.HIGH]: t('priorities.high'),
    [PRIORITIES.MEDIUM]: t('priorities.medium'),
    [PRIORITIES.LOW]: t('priorities.low'),
  };

  return <span>{priorityLabels[priority]}</span>;
}
```

Or use a translation helper hook:

```jsx
import { useTranslatedLabels } from '../hooks/useTranslatedLabels';

function PrioritySelect() {
  const { priorityLabels } = useTranslatedLabels();

  return (
    <select>
      {Object.entries(priorityLabels).map(([value, label]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}
```

## Adding a New Language

### Step 1: Create the language file

```typescript
// src/i18n/locales/zh.ts (Chinese example)
export const zh = {
  common: {
    loading: '加载中...',
    save: '保存',
    // ... all keys from en.ts
  },
  // ... all namespaces
};
```

### Step 2: Register in the i18n system

```typescript
// src/i18n/index.ts
import { en } from './locales/en';
import { ms } from './locales/ms';
import { zh } from './locales/zh'; // Add new import

export const translations = { en, ms, zh };

export const SUPPORTED_LANGUAGES = [
  { code: 'en', nativeName: 'English', englishName: 'English' },
  { code: 'ms', nativeName: 'Bahasa Melayu', englishName: 'Malay' },
  { code: 'zh', nativeName: '中文', englishName: 'Chinese' }, // Add new entry
];
```

### Step 3: Add to constants

```javascript
// src/utils/constants.js
export const SUPPORTED_LANGUAGE_CODES = ['en', 'ms', 'zh'];
```

## Testing Translations

### Manual Testing

1. Open browser DevTools
2. Run: `localStorage.setItem('taskflow_language', 'ms')`
3. Refresh the page
4. All UI should display in Malay

### Checking for Missing Keys

In development mode, missing translations log warnings to console:

```
⚠️ Missing translation for "myFeature.newKey" in "ms"
```

### Language Switching Test

1. Click language dropdown in header
2. Select "Bahasa Melayu"
3. Verify:
   - All visible text changes to Malay
   - No page reload occurred
   - Toast notification appears: "Bahasa ditukar kepada Bahasa Melayu"
4. Refresh page
5. Verify language persists (still Malay)

## Common Patterns

### Pluralization (Simple)

For English/Malay, use separate keys:

```typescript
// en.ts
taskCount: '{count} tasks',
taskCountSingular: '{count} task',

// Usage
t(count === 1 ? 'kanban.taskCountSingular' : 'kanban.taskCount', { count })
```

### Date/Number Formatting

Use browser's Intl API with current language:

```jsx
function FormattedDate({ date }) {
  const { language } = useTranslation();

  const formatted = new Intl.DateTimeFormat(language, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);

  return <span>{formatted}</span>;
}
```

### Dynamic Keys

```jsx
function StatusBadge({ status }) {
  const { t } = useTranslation();

  // Convert status value to translation key
  // 'in-progress' → 'inProgress'
  const key = status.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

  return <span>{t(`statuses.${key}`)}</span>;
}
```

## File Structure Reference

```
src/
├── i18n/
│   ├── index.ts              # Main exports
│   ├── locales/
│   │   ├── en.ts            # English translations
│   │   └── ms.ts            # Malay translations
│   ├── types.ts             # TypeScript interfaces
│   └── utils.ts             # Helper functions
├── contexts/
│   └── LanguageContext.jsx  # React Context provider
├── hooks/
│   ├── useTranslation.js    # Main translation hook
│   └── useTranslatedLabels.js # Helper for constants
└── components/
    └── ui/
        └── LanguageSelector.jsx # Language dropdown
```
