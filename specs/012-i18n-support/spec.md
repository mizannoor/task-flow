# Feature Specification: Multilanguage Support (i18n)

**Feature Branch**: `012-i18n-support`  
**Created**: December 3, 2025  
**Status**: Draft  
**Input**: User description: "Implement multilanguage support i18n for this app in the entire codebase for text that currently is hardcoded. Create en.ts for English (default) and ms.ts for Malay translation. This app will support this 2 language and user can change the language by selecting the language dropdown."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View Application in Preferred Language (Priority: P1)

A user opens the TaskFlow application and wants to view all interface text in their preferred language. The application detects the user's browser language preference or uses their saved preference, displaying all UI elements, labels, buttons, messages, and notifications in that language.

**Why this priority**: This is the core value proposition of i18n - users must be able to see the app in their preferred language for the feature to have any value at all.

**Independent Test**: Can be fully tested by opening the app in different browser language settings and verifying all visible text displays in the expected language.

**Acceptance Scenarios**:

1. **Given** a user with browser language set to Malay, **When** they open TaskFlow for the first time, **Then** all UI text displays in Malay (ms)
2. **Given** a user with browser language set to English, **When** they open TaskFlow, **Then** all UI text displays in English (en)
3. **Given** a user with an unsupported browser language (e.g., French), **When** they open TaskFlow, **Then** all UI text displays in English (default fallback)
4. **Given** any user, **When** viewing any page of the application, **Then** no hardcoded English text is visible - all text comes from language files

---

### User Story 2 - Change Language via Dropdown (Priority: P1)

A user wants to manually switch the application language using a language selector dropdown, regardless of their browser settings.

**Why this priority**: Equally critical as P1 - users must have manual control over language selection to override browser defaults or switch languages as needed.

**Independent Test**: Can be tested by clicking the language dropdown and selecting different languages, verifying immediate UI updates.

**Acceptance Scenarios**:

1. **Given** a user viewing the app in English, **When** they click the language dropdown and select "Bahasa Melayu", **Then** all UI text immediately changes to Malay without page reload
2. **Given** a user viewing the app in Malay, **When** they click the language dropdown and select "English", **Then** all UI text immediately changes to English without page reload
3. **Given** a user, **When** they look for the language selector, **Then** it is easily discoverable in the header/navigation area near other user settings

---

### User Story 3 - Language Preference Persistence (Priority: P2)

A user who has selected a language preference expects the application to remember this choice across browser sessions.

**Why this priority**: Important for user experience continuity, but the app is still usable without persistence (user can reselect).

**Independent Test**: Can be tested by selecting a language, closing the browser, reopening, and verifying the language persists.

**Acceptance Scenarios**:

1. **Given** a user who selected Malay as their language, **When** they close the browser and return later, **Then** the application displays in Malay
2. **Given** a user who never explicitly selected a language, **When** they return to the app, **Then** the browser language preference is used
3. **Given** a user who selected English, **When** they log out and log back in, **Then** their language preference is maintained

---

### User Story 4 - Dynamic Content Translation (Priority: P2)

System-generated content such as toast notifications, error messages, validation messages, and status labels should display in the user's selected language.

**Why this priority**: Important for complete internationalization but requires more comprehensive implementation across all system messages.

**Independent Test**: Can be tested by triggering various system messages (create task, validation errors, etc.) and verifying they appear in the selected language.

**Acceptance Scenarios**:

1. **Given** a user with Malay language selected, **When** they successfully create a task, **Then** the success notification appears in Malay
2. **Given** a user with Malay language selected, **When** they submit an invalid form, **Then** validation error messages appear in Malay
3. **Given** a user with English language selected, **When** a timer auto-stops, **Then** the notification message appears in English

---

### User Story 5 - Consistent Language Across All Views (Priority: P3)

All views in the application (List, Kanban, Focus, Calendar, Statistics, Team Analytics) should consistently display text in the selected language.

**Why this priority**: Ensures comprehensive coverage but each view can function in default language as baseline.

**Independent Test**: Can be tested by navigating through each view with a non-English language selected and verifying all text is translated.

**Acceptance Scenarios**:

1. **Given** a user with Malay selected, **When** they navigate to the Kanban view, **Then** all column headers, buttons, and labels display in Malay
2. **Given** a user with Malay selected, **When** they view the Statistics dashboard, **Then** all chart labels, metrics, and headings display in Malay
3. **Given** a user with Malay selected, **When** they open the keyboard shortcuts help modal, **Then** all shortcut descriptions display in Malay

---

### Edge Cases

- What happens when a translation key is missing in the selected language? → Falls back to English
- How does the system handle right-to-left (RTL) languages if added later? → Text direction should be configurable per language (out of scope for initial implementation)
- What happens if localStorage is unavailable for saving preference? → Uses browser language detection, gracefully degrades without persistence
- How are dynamic values (dates, numbers, task names) handled within translated strings? → Use interpolation placeholders
- What happens during language switch when a modal is open? → Modal content updates without closing

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST provide a language dropdown selector accessible from the main navigation/header area
- **FR-002**: System MUST support English (en) as the default language with complete translations for all UI text
- **FR-003**: System MUST support Malay (ms) with complete translations for all UI text
- **FR-004**: System MUST detect and use browser language preference for first-time users
- **FR-005**: System MUST fall back to English when browser language is not supported
- **FR-006**: System MUST persist user's language preference in local storage
- **FR-007**: System MUST apply language changes immediately without requiring page reload
- **FR-008**: System MUST translate all static UI text including:
  - Navigation labels and buttons
  - Form labels, placeholders, and validation messages
  - Modal titles and content
  - Toast notifications and alerts
  - Status labels (Pending, In Progress, Completed)
  - Priority labels (Urgent, High, Medium, Low)
  - Category labels (Development, Fix, Support)
  - Error messages
  - Empty states and loading indicators
  - Keyboard shortcut descriptions
- **FR-009**: System MUST support string interpolation for dynamic values within translations (e.g., "Task {name} completed")
- **FR-010**: System MUST display current language selection in the dropdown (with language name in its native form)
- **FR-011**: System MUST maintain language preference per browser/device (not per user account)
- **FR-012**: System MUST provide translations organized in separate TypeScript files (en.ts, ms.ts) for maintainability

### Key Entities

- **Language**: Represents a supported language with code (en, ms), native name, and English name
- **Translation**: Key-value mapping of translation keys to localized strings with interpolation support
- **LanguageContext**: Application state managing current language selection and translation function access
- **LanguagePreference**: User's stored language preference in localStorage

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can switch between 2 supported languages in under 3 seconds with immediate UI update
- **SC-002**: 100% of static UI text elements are translatable (no hardcoded strings in components)
- **SC-003**: Language preference persists across 100% of browser sessions when localStorage is available
- **SC-004**: First-time users see content in their browser language 95% of the time (when supported)
- **SC-005**: All validation and error messages display in the selected language
- **SC-006**: All toast notifications display in the selected language
- **SC-007**: Language switcher is discoverable within 5 seconds by new users (placed in familiar location)
- **SC-008**: Page maintains full functionality during and after language switch (no broken layouts or missing text)

## Assumptions

- The application is a single-page React application using React Context for state management
- Translation files will be bundled with the application (not loaded dynamically from server)
- Dates and numbers will use browser's Intl API for locale-aware formatting (separate from text translation)
- User-generated content (task names, descriptions) will NOT be translated - only system UI text
- The language selector will be placed near the theme toggle in the header for consistency
- All current hardcoded strings in the codebase will be identified and replaced with translation keys
