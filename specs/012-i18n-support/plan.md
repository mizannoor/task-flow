# Implementation Plan: Multilanguage Support (i18n)

**Branch**: `012-i18n-support` | **Date**: December 3, 2025 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/012-i18n-support/spec.md`

## Summary

Implement multilanguage support (i18n) for TaskFlow by creating a React Context-based translation system with English (default) and Malay language files. The system will detect browser language, allow manual switching via dropdown, persist preference to localStorage, and replace all hardcoded UI text with translation keys supporting interpolation.

## Technical Context

**Language/Version**: JavaScript/TypeScript ES2022+ (React 18+)  
**Primary Dependencies**: React Context API (built-in), no external i18n library  
**Storage**: localStorage for language preference (`taskflow_language`)  
**Testing**: Vitest with @testing-library/react  
**Target Platform**: Modern browsers (Chrome 76+, Firefox 67+, Safari 12.1+, Edge 79+)  
**Project Type**: Single-page web application (client-side only)  
**Performance Goals**: Language switch <100ms, no page reload required  
**Constraints**: Offline-capable, bundle translations with app (no dynamic loading)  
**Scale/Scope**: ~200-300 translation keys across 2 languages

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Client-Side First | ✅ PASS | Translations bundled in app, localStorage persistence, works offline |
| II. AI-Augmented Intelligence | ✅ N/A | No AI integration in this feature |
| III. Performance Excellence | ✅ PASS | React Context memoization, <100ms switch time |
| IV. Multi-User Experience | ✅ PASS | Language preference per device (not per user), instant switching |
| V. Data Integrity | ✅ PASS | Validation for language codes, fallback to English for missing keys |
| VI. Responsive & Accessible Design | ✅ PASS | Language selector accessible via keyboard, ARIA labels translated |

**Gate Result**: ✅ PASSED - No violations

## Project Structure

### Documentation (this feature)

```text
specs/012-i18n-support/
├── plan.md              # This file
├── research.md          # Phase 0: i18n patterns research
├── data-model.md        # Phase 1: Translation structure, entities
├── quickstart.md        # Phase 1: Developer setup guide
├── contracts/           # Phase 1: Translation key contracts
│   └── translation-keys.md
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── i18n/                       # NEW: Translation infrastructure
│   ├── index.ts                # Exports and barrel file
│   ├── locales/                # Language files
│   │   ├── en.ts              # English translations (default)
│   │   └── ms.ts              # Malay translations
│   ├── types.ts               # TypeScript interfaces
│   └── utils.ts               # Interpolation, language detection
├── contexts/
│   └── LanguageContext.jsx    # NEW: i18n React Context
├── components/
│   └── ui/
│       └── LanguageSelector.jsx  # NEW: Dropdown component
├── hooks/
│   └── useTranslation.js      # NEW: Translation hook
└── utils/
    └── constants.js           # ADD: i18n constants (storage key, supported languages)
```

**Structure Decision**: Single project following existing TaskFlow patterns. New `src/i18n/` directory mirrors the approach used for services and utils, keeping translation concerns isolated while maintaining cohesion with the React Context pattern already used for Auth, Tasks, Theme, and KeyboardShortcuts.

## Complexity Tracking

> No Constitution violations - this section is empty.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| - | - | - |
