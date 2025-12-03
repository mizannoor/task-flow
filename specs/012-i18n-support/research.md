# Research: Multilanguage Support (i18n)

**Feature**: 012-i18n-support  
**Date**: December 3, 2025

## Research Tasks

### 1. i18n Library vs Custom Implementation

**Decision**: Custom lightweight implementation using React Context

**Rationale**:

- TaskFlow only needs 2 languages (English, Malay) - no need for heavy libraries
- Existing pattern: ThemeContext, AuthContext, TaskContext all use React Context
- No plural rules needed for these languages (simpler than German, Russian, Arabic)
- Bundle size optimization - no external dependency overhead
- Full control over interpolation syntax and fallback behavior

**Alternatives Considered**:

- `react-i18next` - Powerful but overkill for 2 languages, adds ~40KB to bundle
- `react-intl` - Full ICU support unnecessary, complex API for simple use case
- `lingui` - Good for extraction but requires build tooling changes

**Implementation Pattern**:

```javascript
// Simple context-based approach
const LanguageContext = createContext({
  language: 'en',
  t: (key, params) => key,
  setLanguage: () => {},
});
```

### 2. Translation File Format

**Decision**: TypeScript files with nested object structure

**Rationale**:

- Type safety with IDE autocomplete for translation keys
- No JSON parsing overhead at runtime
- Tree-shaking potential for unused keys
- Consistent with existing `.js` codebase (can migrate to TypeScript incrementally)
- Easy diff reviews for translation changes

**File Structure**:

```typescript
// src/i18n/locales/en.ts
export const en = {
  common: {
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    close: 'Close',
    retry: 'Retry',
  },
  auth: {
    signIn: 'Sign in to your account',
    identifier: 'Email, username, or phone number',
    // ...
  },
  tasks: {
    // ...
  },
  // ...
};
```

**Alternatives Considered**:

- JSON files - No type safety, requires async import or bundler plugin
- YAML files - Requires parser, no IDE support in React projects
- Flat key structure (`'auth.signIn'`) - Harder to organize, no tree structure benefit

### 3. Language Detection Strategy

**Decision**: Priority order: localStorage > browser language > default (English)

**Rationale**:

- User's explicit choice (localStorage) should always win
- Browser language detection covers first-time users
- English fallback ensures app always works
- Consistent with existing pattern (theme detection uses same order)

**Implementation**:

```javascript
function detectLanguage() {
  // 1. Check localStorage
  const stored = localStorage.getItem('taskflow_language');
  if (stored && SUPPORTED_LANGUAGES.includes(stored)) {
    return stored;
  }

  // 2. Check browser language
  const browserLang = navigator.language?.split('-')[0]; // 'ms-MY' → 'ms'
  if (browserLang && SUPPORTED_LANGUAGES.includes(browserLang)) {
    return browserLang;
  }

  // 3. Default to English
  return 'en';
}
```

### 4. String Interpolation Pattern

**Decision**: Use `{variable}` syntax with simple regex replacement

**Rationale**:

- Familiar syntax (similar to template literals)
- Easy to implement without external library
- Clear visual distinction between static and dynamic content
- Works with React elements when needed

**Implementation**:

```javascript
function interpolate(template, params = {}) {
  return template.replace(/{(\w+)}/g, (match, key) => {
    return params[key] !== undefined ? params[key] : match;
  });
}

// Usage
t('tasks.completedMessage', { name: 'Fix bug' });
// Template: 'Task "{name}" completed!'
// Result: 'Task "Fix bug" completed!'
```

**Alternatives Considered**:

- ICU MessageFormat - Overkill for simple interpolation, requires parser
- `${}` syntax - Conflicts with JavaScript template literals, confusing
- `{{variable}}` (Handlebars style) - More characters, no benefit

### 5. Translation Key Naming Convention

**Decision**: Dot-notation namespace hierarchy: `namespace.section.key`

**Rationale**:

- Groups related translations logically
- Matches file/component structure
- Easy to find translations by feature area
- Supports IDE navigation

**Namespace Structure**:
| Namespace | Description |
|-----------|-------------|
| `common` | Shared UI elements (buttons, labels, loading states) |
| `auth` | Login, user switcher |
| `tasks` | Task form, list, modal, validation |
| `kanban` | Kanban view specific |
| `focus` | Focus view specific |
| `calendar` | Calendar view specific |
| `analytics` | Personal and team analytics |
| `settings` | Theme, keyboard shortcuts |
| `errors` | Error messages, validation |
| `toast` | Toast notifications |

### 6. Handling Missing Translations

**Decision**: Fallback chain: requested language → English → return key

**Rationale**:

- English as fallback ensures app remains usable
- Returning key as last resort makes missing translations visible in development
- Console warning in dev mode for missing keys aids debugging

**Implementation**:

```javascript
function translate(key, params, language, translations) {
  // Try requested language
  let value = getNestedValue(translations[language], key);

  // Fallback to English
  if (!value && language !== 'en') {
    value = getNestedValue(translations['en'], key);
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Missing translation for "${key}" in "${language}"`);
    }
  }

  // Last resort: return key
  if (!value) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Missing translation key: "${key}"`);
    }
    return key;
  }

  return params ? interpolate(value, params) : value;
}
```

### 7. Language Selector UI Pattern

**Decision**: Dropdown in header near theme toggle, showing native language names

**Rationale**:

- Consistent placement with theme toggle (user preferences area)
- Native names (`English`, `Bahasa Melayu`) help users find their language
- Dropdown pattern matches existing filter dropdowns
- Shows current language clearly

**Display Format**:

```javascript
const LANGUAGE_OPTIONS = [
  { code: 'en', nativeName: 'English', englishName: 'English' },
  { code: 'ms', nativeName: 'Bahasa Melayu', englishName: 'Malay' },
];
```

### 8. Constants to Translate

**Decision**: Replace static label objects in constants.js with translation keys

**Rationale**:

- `PRIORITY_LABELS`, `STATUS_LABELS`, `CATEGORY_LABELS` etc. are static strings
- Moving to translation keys allows dynamic language switching
- Components call `t('priorities.urgent')` instead of `PRIORITY_LABELS.urgent`

**Affected Constants**:
| Current Constant | Translation Key Pattern |
|-----------------|------------------------|
| `PRIORITY_LABELS` | `priorities.{value}` |
| `STATUS_LABELS` | `statuses.{value}` |
| `CATEGORY_LABELS` | `categories.{value}` |
| `SORT_FIELD_LABELS` | `sort.{value}` |
| `PERIOD_LABELS` | `dateRanges.{value}` |
| `FOCUS_TIER_LABELS` | `focusTiers.{value}` |
| `ERROR_MESSAGES` | `errors.{key}` |
| `TASK_ERROR_MESSAGES` | `taskErrors.{key}` |
| `TIMER_ERROR_MESSAGES` | `timerErrors.{key}` |
| `AI_ERROR_MESSAGES` | `aiErrors.{key}` |

### 9. Component Update Strategy

**Decision**: Incremental migration using `useTranslation` hook

**Rationale**:

- Hook-based approach consistent with existing patterns (`useAuth`, `useTheme`, `useTasks`)
- Components can be migrated one at a time
- Easy to search for remaining hardcoded strings
- No breaking changes to component APIs

**Migration Pattern**:

```javascript
// Before
function TaskEmptyState() {
  return <h3>No tasks yet</h3>;
}

// After
function TaskEmptyState() {
  const { t } = useTranslation();
  return <h3>{t('tasks.emptyState.title')}</h3>;
}
```

### 10. localStorage Key

**Decision**: Use `taskflow_language` as storage key

**Rationale**:

- Follows existing pattern: `taskflow_session`, `taskflow_theme`, `taskflow_view_preference`
- Clear namespace avoids conflicts with other apps
- Consistent prefix for all TaskFlow preferences

**Implementation**:

```javascript
// src/utils/constants.js
export const LANGUAGE_STORAGE_KEY = 'taskflow_language';
```
