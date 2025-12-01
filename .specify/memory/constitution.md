# <!--

# SYNC IMPACT REPORT

Version change: 0.0.0 → 1.0.0 (Initial ratification)
Modified principles: None (initial creation)
Added sections:

- Core Principles (6 principles derived from PRD)
- Technology Stack (mandatory stack requirements)
- Development Standards (quality gates and workflow)
- Governance (amendment procedures)
  Removed sections: None
  Templates requiring updates:
  ✅ plan-template.md - Compatible (Constitution Check section present)
  ✅ spec-template.md - Compatible (Requirements section aligns)
  ✅ tasks-template.md - Compatible (Phase structure matches principles)
  Follow-up TODOs: None
  ================================================================================
  -->

# TaskFlow Constitution

## Core Principles

### I. Client-Side First (NON-NEGOTIABLE)

All application logic MUST execute entirely in the browser without backend dependencies.

- **Zero Server Requirement**: The application MUST function without any backend server
- **Offline Capability**: All features except AI integration MUST work without internet connectivity
- **Local Data Persistence**: All user data MUST be stored in IndexedDB using Dexie.js or idb
- **Session Management**: User sessions MUST persist in localStorage across browser restarts

**Rationale**: Eliminates server costs, reduces complexity, and ensures user data sovereignty.

### II. AI-Augmented Intelligence

Google Gemini AI integration MUST enhance—not replace—user decision-making.

- **Graceful Degradation**: AI features MUST fail gracefully when offline or API unavailable
- **User Override**: All AI suggestions MUST be editable or dismissible by users
- **Three Creation Modes**: Task creation MUST support Manual, AI-Assisted, and Hybrid modes
- **Transparency**: AI suggestions MUST be clearly distinguished from user-entered data

**Rationale**: AI enhances productivity while preserving user autonomy and offline functionality.

### III. Performance Excellence

Local operations MUST achieve sub-100ms response times at scale.

- **Response Time**: All IndexedDB operations MUST complete in <100ms
- **Scale Support**: Application MUST support 10,000+ tasks without performance degradation
- **Efficient Rendering**: React components MUST use appropriate memoization and virtualization
- **Bundle Optimization**: Production builds MUST be code-split and lazy-loaded where appropriate

**Rationale**: Fast local operations are the core value proposition of client-side architecture.

### IV. Multi-User Experience

The application MUST support seamless multi-user workflows without authentication complexity.

- **Passwordless Auth**: Users MUST authenticate via unique identifier (email, username, or phone)
- **Auto-Creation**: New identifiers MUST automatically create user accounts
- **Instant Switching**: User context switching MUST be instantaneous via dropdown
- **Data Isolation**: Each user's tasks and preferences MUST be isolated in IndexedDB

**Rationale**: Removes friction from task management while supporting team environments.

### V. Data Integrity

User data MUST be reliably persisted and recoverable across sessions.

- **IndexedDB Schema**: Data models MUST follow the defined Task, User, and Session schemas
- **Validation**: All user input MUST be validated before persistence
- **Error Recovery**: Failed operations MUST provide clear error messages and recovery options
- **State Consistency**: React Context state MUST remain synchronized with IndexedDB

**Rationale**: User trust depends on reliable data persistence without backend backup.

### VI. Responsive & Accessible Design

The application MUST be usable across all devices and input methods.

- **Breakpoints**: UI MUST be fully functional on screens 320px and wider
- **Keyboard Navigation**: Power users MUST be able to navigate entirely via keyboard shortcuts
- **Theme Support**: Dark and light modes MUST be available and user-selectable
- **View Flexibility**: List, Kanban, Calendar, and Focus views MUST be available

**Rationale**: Different workflows and environments require flexible interaction modes.

## Technology Stack

The following technologies are MANDATORY for TaskFlow development:

| Layer              | Technology            | Version  |
| ------------------ | --------------------- | -------- |
| Frontend Framework | React                 | 18+      |
| Styling            | Tailwind CSS          | Latest   |
| Data Storage       | IndexedDB (Dexie.js)  | Latest   |
| AI Integration     | Google Gemini API     | Latest   |
| Charts/Analytics   | Recharts              | Latest   |
| State Management   | React Context API     | Built-in |
| Build Tool         | Vite                  | Latest   |
| Language           | JavaScript/TypeScript | ES2022+  |

**Deviations from this stack MUST be documented and justified in the relevant plan.md.**

## Development Standards

### Quality Gates

All code contributions MUST pass the following gates:

1. **Linting**: ESLint rules MUST pass with zero errors
2. **Type Safety**: TypeScript strict mode SHOULD be enabled for new files
3. **Component Testing**: React components MUST have corresponding test coverage
4. **Performance Audit**: Lighthouse score MUST remain above 90 for Performance metric
5. **Accessibility Audit**: Lighthouse score MUST remain above 85 for Accessibility metric

### Directory Structure

Source code MUST follow the structure defined in PRD Section 5.2:

```
src/
├── components/    # React UI components (auth/, tasks/, views/, analytics/, etc.)
├── contexts/      # React Context providers
├── services/      # Business logic (db.js, aiService.js, analyticsService.js)
├── hooks/         # Custom React hooks
├── utils/         # Helper functions and constants
└── styles/        # Global styles
```

### Commit Standards

- Commits MUST follow conventional commit format: `type(scope): description`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`
- Breaking changes MUST be marked with `!` suffix (e.g., `feat(auth)!: change session format`)

## Governance

### Authority

This constitution supersedes all other development practices for the TaskFlow project. When conflicts arise between this document and other guidance, this constitution takes precedence.

### Amendment Process

1. Propose amendment via pull request modifying this file
2. Document rationale and impact assessment
3. Update version according to semantic versioning:
   - **MAJOR**: Backward-incompatible principle changes or removals
   - **MINOR**: New principles, sections, or material expansions
   - **PATCH**: Clarifications, wording improvements, typo fixes
4. Propagate changes to dependent templates if necessary

### Compliance Review

- All PRs MUST include a "Constitution Check" confirming compliance
- Complexity deviations MUST be explicitly justified
- Template updates MUST maintain alignment with principles

**Version**: 1.0.0 | **Ratified**: 2025-12-01 | **Last Amended**: 2025-12-01
