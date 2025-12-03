# Data Model: Multilanguage Support (i18n)

**Feature**: 012-i18n-support  
**Date**: December 3, 2025

## Entities

### Language

Represents a supported language in the application.

| Attribute | Type | Description | Constraints |
|-----------|------|-------------|-------------|
| code | string | ISO 639-1 language code | `'en'` \| `'ms'` |
| nativeName | string | Language name in its own language | Non-empty string |
| englishName | string | Language name in English | Non-empty string |

**Supported Languages**:
| Code | Native Name | English Name |
|------|-------------|--------------|
| `en` | English | English |
| `ms` | Bahasa Melayu | Malay |

### LanguagePreference

User's selected language stored in localStorage.

| Attribute | Type | Description | Constraints |
|-----------|------|-------------|-------------|
| value | string | Selected language code | `'en'` \| `'ms'` |

**Storage Key**: `taskflow_language`

**Validation Rules**:
- Value MUST be a supported language code
- Invalid values default to browser detection
- Empty/null values trigger browser language detection → English fallback

### TranslationStore

Complete translation dictionary for a single language.

| Attribute | Type | Description |
|-----------|------|-------------|
| common | CommonTranslations | Shared UI elements |
| auth | AuthTranslations | Authentication screens |
| tasks | TaskTranslations | Task management |
| kanban | KanbanTranslations | Kanban view |
| focus | FocusTranslations | Focus view |
| calendar | CalendarTranslations | Calendar view |
| analytics | AnalyticsTranslations | Analytics dashboards |
| settings | SettingsTranslations | User settings |
| errors | ErrorTranslations | Error messages |
| toast | ToastTranslations | Toast notifications |

### LanguageContextState (Runtime)

React Context state for language management.

| Attribute | Type | Description |
|-----------|------|-------------|
| language | `'en'` \| `'ms'` | Current active language |
| setLanguage | `(lang: string) => void` | Update language preference |
| t | `(key: string, params?: object) => string` | Translation function |
| isLoading | boolean | True during initial detection |

## Translation Key Structure

### Common (`common.*`)

```typescript
common: {
  loading: string;           // "Loading..."
  save: string;              // "Save"
  cancel: string;            // "Cancel"
  delete: string;            // "Delete"
  edit: string;              // "Edit"
  create: string;            // "Create"
  close: string;             // "Close"
  retry: string;             // "Retry"
  search: string;            // "Search"
  filter: string;            // "Filter"
  sort: string;              // "Sort"
  clear: string;             // "Clear"
  clearAll: string;          // "Clear all"
  selected: string;          // "{count} selected"
  noResults: string;         // "No results found"
  required: string;          // "Required"
  optional: string;          // "Optional"
}
```

### Authentication (`auth.*`)

```typescript
auth: {
  appName: string;                    // "TaskFlow"
  signInTitle: string;                // "Sign in to your account"
  signInDescription: string;          // "Enter your email, username, or phone..."
  noPasswordNeeded: string;           // "No password needed!"
  identifierLabel: string;            // "Email, username, or phone"
  identifierPlaceholder: string;      // "Email, username, or phone number"
  signInButton: string;               // "Sign in"
  signingIn: string;                  // "Signing in..."
  switchUser: string;                 // "Switch User"
  signOut: string;                    // "Sign Out"
  welcome: string;                    // "Welcome, {name}"
}
```

### Tasks (`tasks.*`)

```typescript
tasks: {
  // Headers
  myTasks: string;                    // "My Tasks"
  allTasks: string;                   // "All Tasks"
  createTask: string;                 // "Create Task"
  editTask: string;                   // "Edit Task"
  taskDetails: string;                // "Task Details"
  
  // Form fields
  taskName: string;                   // "Task Name"
  taskNamePlaceholder: string;        // "Enter task name"
  description: string;                // "Description"
  descriptionPlaceholder: string;     // "Enter task description"
  priority: string;                   // "Priority"
  category: string;                   // "Category"
  status: string;                     // "Status"
  complexity: string;                 // "Complexity"
  estimatedDuration: string;          // "Estimated Duration"
  deadline: string;                   // "Deadline"
  assignedTo: string;                 // "Assigned To"
  tags: string;                       // "Tags"
  tagsPlaceholder: string;            // "Add tags..."
  
  // Actions
  startTask: string;                  // "Start Task"
  completeTask: string;               // "Complete Task"
  reopenTask: string;                 // "Reopen Task"
  deleteTask: string;                 // "Delete Task"
  
  // Empty states
  emptyTitle: string;                 // "No tasks yet"
  emptyDescription: string;           // "Get started by creating a new task."
  emptyFilterTitle: string;           // "No matching tasks"
  emptyFilterDescription: string;     // "Try adjusting your filters."
  
  // Confirmation
  deleteConfirmTitle: string;         // "Delete Task"
  deleteConfirmMessage: string;       // "Are you sure you want to delete \"{name}\"?"
  reopenConfirmTitle: string;         // "Reopen Task"
  reopenConfirmMessage: string;       // "Reopen \"{name}\"?"
}
```

### Priorities (`priorities.*`)

```typescript
priorities: {
  urgent: string;       // "Urgent"
  high: string;         // "High"
  medium: string;       // "Medium"
  low: string;          // "Low"
}
```

### Statuses (`statuses.*`)

```typescript
statuses: {
  pending: string;      // "Pending"
  inProgress: string;   // "In Progress"
  completed: string;    // "Completed"
}
```

### Categories (`categories.*`)

```typescript
categories: {
  development: string;  // "Development"
  fix: string;          // "Fix"
  support: string;      // "Support"
}
```

### Kanban View (`kanban.*`)

```typescript
kanban: {
  title: string;              // "Kanban Board"
  collapseColumn: string;     // "Collapse column"
  expandColumn: string;       // "Expand column"
  taskCount: string;          // "{count} tasks"
  dropHere: string;           // "Drop here"
  moveToColumn: string;       // "Move to {column}"
}
```

### Focus View (`focus.*`)

```typescript
focus: {
  title: string;              // "Today's Focus"
  subtitle: string;           // "Your priority tasks for today"
  overdue: string;            // "Overdue"
  dueToday: string;           // "Due Today"
  inProgress: string;         // "In Progress"
  highPriority: string;       // "High Priority"
  emptyTitle: string;         // "All caught up!"
  emptyDescription: string;   // "No urgent tasks need attention."
  maxTasksNote: string;       // "Showing top {count} priority tasks"
}
```

### Calendar View (`calendar.*`)

```typescript
calendar: {
  title: string;              // "Calendar"
  today: string;              // "Today"
  month: string;              // "Month"
  week: string;               // "Week"
  noDeadline: string;         // "No deadline"
  tasksOnDate: string;        // "{count} tasks on {date}"
}
```

### Time Tracking (`timer.*`)

```typescript
timer: {
  startTimer: string;         // "Start Timer"
  stopTimer: string;          // "Stop Timer"
  pauseTimer: string;         // "Pause Timer"
  resumeTimer: string;        // "Resume Timer"
  timeSpent: string;          // "Time Spent"
  addManualTime: string;      // "Add Manual Time"
  hours: string;              // "Hours"
  minutes: string;            // "Minutes"
  longSessionTitle: string;   // "Long Session Detected"
  longSessionMessage: string; // "You've been working for {duration}. Would you like to continue or stop?"
  continueSession: string;    // "Continue"
  stopSession: string;        // "Stop & Save"
  recoveryTitle: string;      // "Timer Recovery"
  recoveryMessage: string;    // "A timer was running when the browser closed. Would you like to recover it?"
  recoverTimer: string;       // "Recover Timer"
  discardTimer: string;       // "Discard"
}
```

### Analytics (`analytics.*`)

```typescript
analytics: {
  personal: {
    title: string;                  // "Personal Analytics"
    completionRate: string;         // "Completion Rate"
    tasksCompleted: string;         // "Tasks Completed"
    averageTime: string;            // "Average Time"
    productivityTrend: string;      // "Productivity Trend"
    byCategory: string;             // "By Category"
    byPriority: string;             // "By Priority"
    estimationAccuracy: string;     // "Estimation Accuracy"
    streak: string;                 // "Current Streak"
    streakDays: string;             // "{count} days"
  },
  team: {
    title: string;                  // "Team Analytics"
    leaderboard: string;            // "Leaderboard"
    teamVelocity: string;           // "Team Velocity"
    workloadDistribution: string;   // "Workload Distribution"
    comparisons: string;            // "Comparisons"
  },
  dateRanges: {
    today: string;            // "Today"
    thisWeek: string;         // "This Week"
    lastWeek: string;         // "Last Week"
    thisMonth: string;        // "This Month"
    lastMonth: string;        // "Last Month"
    last30Days: string;       // "Last 30 Days"
  }
}
```

### Settings (`settings.*`)

```typescript
settings: {
  theme: {
    title: string;            // "Theme"
    light: string;            // "Light"
    dark: string;             // "Dark"
    switchToLight: string;    // "Switch to light mode"
    switchToDark: string;     // "Switch to dark mode"
  },
  language: {
    title: string;            // "Language"
    selectLanguage: string;   // "Select Language"
  },
  shortcuts: {
    title: string;            // "Keyboard Shortcuts"
    navigation: string;       // "Navigation"
    taskActions: string;      // "Task Actions"
    views: string;            // "Views"
    other: string;            // "Other"
  }
}
```

### Errors (`errors.*`)

```typescript
errors: {
  // General
  unknown: string;                    // "An unexpected error occurred"
  networkError: string;               // "Network error. Please check your connection."
  storageUnavailable: string;         // "Local storage is not available..."
  
  // Auth
  identifierRequired: string;         // "Please enter an email, username, or phone number"
  invalidIdentifier: string;          // "Invalid identifier format"
  userNotFound: string;               // "User not found"
  sessionCorrupted: string;           // "Your session data is corrupted..."
  
  // Task validation
  taskNameRequired: string;           // "Task name is required"
  taskNameTooLong: string;            // "Task name must be at most {max} characters"
  descriptionTooLong: string;         // "Description must be at most {max} characters"
  invalidComplexity: string;          // "Complexity must be between {min} and {max}"
  invalidDuration: string;            // "Duration must be between {min} and {max} minutes"
  invalidDeadline: string;            // "Invalid deadline date"
  
  // Timer
  timerTaskNotInProgress: string;     // "Timer can only be started on tasks that are in progress"
  timerAlreadyRunning: string;        // "Timer is already running"
  noActiveTimer: string;              // "No active timer"
  invalidManualTime: string;          // "Please enter a valid time"
}
```

### Toast Notifications (`toast.*`)

```typescript
toast: {
  // Success
  taskCreated: string;          // "Task created successfully"
  taskUpdated: string;          // "Task updated successfully"
  taskDeleted: string;          // "Task deleted successfully"
  taskStarted: string;          // "Task \"{name}\" started!"
  taskCompleted: string;        // "Task \"{name}\" completed!"
  taskReopened: string;         // "Task \"{name}\" reopened"
  timerStopped: string;         // "Timer stopped. {duration} saved."
  languageChanged: string;      // "Language changed to {language}"
  
  // Errors
  taskCreateFailed: string;     // "Failed to create task"
  taskUpdateFailed: string;     // "Failed to update task"
  taskDeleteFailed: string;     // "Failed to delete task"
  taskStartFailed: string;      // "Failed to start task"
  taskCompleteFailed: string;   // "Failed to complete task"
}
```

### Sort Options (`sort.*`)

```typescript
sort: {
  priority: string;           // "Priority"
  complexity: string;         // "Complexity"
  estimatedDuration: string;  // "Duration"
  createdAt: string;          // "Created"
  deadline: string;           // "Deadline"
  taskName: string;           // "Name"
  ascending: string;          // "Ascending"
  descending: string;         // "Descending"
}
```

## State Transitions

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Load                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │ Check localStorage for        │
              │ 'taskflow_language'           │
              └───────────────────────────────┘
                              │
            ┌─────────────────┴─────────────────┐
            │                                   │
            ▼                                   ▼
   ┌─────────────────┐               ┌─────────────────────┐
   │ Valid value?    │──── No ──────▶│ Detect browser lang │
   │ 'en' or 'ms'    │               │ navigator.language  │
   └─────────────────┘               └─────────────────────┘
            │                                   │
            │ Yes                               ▼
            │                        ┌─────────────────────┐
            │                        │ Supported lang?     │
            │                        │ 'en', 'ms', 'ms-MY' │
            │                        └─────────────────────┘
            │                                   │
            │                    ┌──────────────┴──────────────┐
            │                    │                             │
            │                    ▼ Yes                         ▼ No
            │            ┌───────────────┐            ┌───────────────┐
            │            │ Use detected  │            │ Default to    │
            │            │ language      │            │ English 'en'  │
            │            └───────────────┘            └───────────────┘
            │                    │                             │
            └────────────────────┴─────────────────────────────┘
                                 │
                                 ▼
              ┌───────────────────────────────┐
              │ Load translations for lang    │
              │ Initialize Context            │
              └───────────────────────────────┘
                                 │
                                 ▼
              ┌───────────────────────────────┐
              │ Render app with translations  │
              └───────────────────────────────┘


                    ┌─────────────────┐
                    │ User Changes    │
                    │ Language        │
                    └─────────────────┘
                            │
                            ▼
              ┌───────────────────────────────┐
              │ 1. Update Context state       │
              │ 2. Save to localStorage       │
              │ 3. Re-render components       │
              └───────────────────────────────┘
                            │
                            ▼
              ┌───────────────────────────────┐
              │ Show toast: "Language         │
              │ changed to {language}"        │
              └───────────────────────────────┘
```

## TypeScript Interfaces

```typescript
// src/i18n/types.ts

export type SupportedLanguage = 'en' | 'ms';

export interface Language {
  code: SupportedLanguage;
  nativeName: string;
  englishName: string;
}

export interface TranslationParams {
  [key: string]: string | number;
}

export type TranslationFunction = (
  key: string,
  params?: TranslationParams
) => string;

export interface LanguageContextValue {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: TranslationFunction;
}

export interface TranslationStore {
  common: CommonTranslations;
  auth: AuthTranslations;
  tasks: TaskTranslations;
  priorities: PriorityTranslations;
  statuses: StatusTranslations;
  categories: CategoryTranslations;
  kanban: KanbanTranslations;
  focus: FocusTranslations;
  calendar: CalendarTranslations;
  timer: TimerTranslations;
  analytics: AnalyticsTranslations;
  settings: SettingsTranslations;
  errors: ErrorTranslations;
  toast: ToastTranslations;
  sort: SortTranslations;
}
```
