# Data Model: AI-Powered Task Analysis

**Feature**: 008-ai-task-analysis  
**Date**: December 2, 2025  
**Phase**: 1 - Design

## Entities

### AISuggestion

Represents the result of AI analysis on a task. This is an **ephemeral entity** - not persisted to IndexedDB. It exists only during task creation/editing session until the user saves the task.

| Field               | Type       | Constraints                                     | Description                         |
| ------------------- | ---------- | ----------------------------------------------- | ----------------------------------- |
| `complexity`        | `number`   | 1-10 (integer)                                  | Suggested task complexity score     |
| `priority`          | `string`   | `"urgent"` \| `"high"` \| `"medium"` \| `"low"` | Suggested priority level            |
| `category`          | `string`   | `"development"` \| `"fix"` \| `"support"`       | Suggested task category             |
| `tags`              | `string[]` | 2-5 items, max 30 chars each                    | Suggested keywords for organization |
| `estimatedDuration` | `number`   | 1-99999 (minutes)                               | Suggested time estimate             |
| `reasoning`         | `string`   | max 500 chars                                   | AI's explanation of suggestions     |
| `isAISuggested`     | `boolean`  | always `true` for AI results                    | Distinguishes from defaults         |
| `timestamp`         | `Date`     | auto-generated                                  | When analysis was performed         |

### AnalysisRequest

Represents input to the AI service. Used internally by `aiService`.

| Field         | Type     | Constraints              | Description                 |
| ------------- | -------- | ------------------------ | --------------------------- |
| `taskName`    | `string` | 1-200 chars, required    | Task name to analyze        |
| `description` | `string` | 0-2000 chars (truncated) | Task description (optional) |

### FallbackDefaults

Static default values used when AI is unavailable. Defined as constants.

| Field               | Value                                             | Notes                         |
| ------------------- | ------------------------------------------------- | ----------------------------- |
| `complexity`        | `5`                                               | Middle of 1-10 scale          |
| `priority`          | `"medium"`                                        | Safe default                  |
| `category`          | `"development"`                                   | Most common type              |
| `tags`              | `[]`                                              | Empty array                   |
| `estimatedDuration` | `60`                                              | 1 hour default                |
| `reasoning`         | `"Using default values due to AI unavailability"` | Explains source               |
| `isAISuggested`     | `false`                                           | Distinguishes from AI results |

### AISuggestionState (Hook State)

Internal state managed by `useAISuggestions` hook.

| Field               | Type                                | Initial | Description                      |
| ------------------- | ----------------------------------- | ------- | -------------------------------- |
| `suggestions`       | `AISuggestion \| null`              | `null`  | Current AI suggestions           |
| `isLoading`         | `boolean`                           | `false` | Whether analysis is in progress  |
| `error`             | `string \| null`                    | `null`  | Error message if analysis failed |
| `isConfigured`      | `boolean`                           | derived | Whether API key is present       |
| `lastAnalyzedInput` | `{ taskName, description } \| null` | `null`  | Input used for last analysis     |

## Relationships

```
┌─────────────────────────────────────────────────────────────────┐
│                         TaskForm                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   useAISuggestions                       │    │
│  │  ┌─────────────┐    ┌─────────────────────────────────┐ │    │
│  │  │AnalysisReq. │───►│         AIService               │ │    │
│  │  └─────────────┘    │  ┌─────────────────────────────┐│ │    │
│  │                     │  │     Gemini API (external)   ││ │    │
│  │                     │  └─────────────────────────────┘│ │    │
│  │  ┌─────────────┐    │                                 │ │    │
│  │  │AISuggestion │◄───│  OR FallbackDefaults            │ │    │
│  │  └─────────────┘    └─────────────────────────────────┘ │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              AISuggestionPanel (UI)                      │    │
│  │  - Displays suggestions                                  │    │
│  │  - Accept/Dismiss actions                                │    │
│  │  - Reasoning expandable                                  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                   Form Fields                            │    │
│  │  - Values populated from suggestions                     │    │
│  │  - aiSuggestedFields tracks which are AI-sourced         │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ (on save)
┌─────────────────────────────────────────────────────────────────┐
│                    Task (existing entity)                        │
│  - Receives final values (AI or manual)                          │
│  - No AI metadata persisted                                      │
└─────────────────────────────────────────────────────────────────┘
```

## State Transitions

### AISuggestionState Lifecycle

```
                    ┌─────────────┐
                    │   IDLE      │ suggestions: null
                    │             │ isLoading: false
                    └──────┬──────┘
                           │ analyzeTask()
                           ▼
                    ┌─────────────┐
                    │  LOADING    │ suggestions: null
                    │             │ isLoading: true
                    └──────┬──────┘
                           │
           ┌───────────────┼───────────────┐
           │ success       │ failure       │ timeout/offline
           ▼               ▼               ▼
    ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
    │  SUCCESS    │ │   ERROR     │ │  DEFAULTS   │
    │             │ │             │ │             │
    │ suggestions │ │ suggestions │ │ suggestions │
    │ = AI result │ │ = null      │ │ = defaults  │
    │ isLoading   │ │ isLoading   │ │ isLoading   │
    │ = false     │ │ = false     │ │ = false     │
    │ isAISuggest │ │ error set   │ │ isAISuggest │
    │ = true      │ │             │ │ = false     │
    └──────┬──────┘ └──────┬──────┘ └──────┬──────┘
           │               │               │
           └───────────────┼───────────────┘
                           │ dismiss() / user saves
                           ▼
                    ┌─────────────┐
                    │   IDLE      │
                    └─────────────┘
```

## Validation Rules

### AISuggestion Validation (on parse)

| Field               | Validation                    | Fallback                     |
| ------------------- | ----------------------------- | ---------------------------- |
| `complexity`        | Integer 1-10                  | Default: 5                   |
| `priority`          | One of valid enum values      | Default: "medium"            |
| `category`          | One of valid enum values      | Default: "development"       |
| `tags`              | Array of strings, max 5 items | Default: []                  |
| `estimatedDuration` | Positive integer 1-99999      | Default: 60                  |
| `reasoning`         | Non-empty string              | Default: "Analysis complete" |

### AnalysisRequest Validation (before send)

| Field         | Validation                       | Action            |
| ------------- | -------------------------------- | ----------------- |
| `taskName`    | Required, 1-200 chars            | Reject if invalid |
| `description` | Optional, truncate to 2000 chars | Silent truncation |

## Constants Location

All AI-related constants will be added to `src/utils/constants.js`:

```javascript
// AI Service Configuration
export const AI_CONFIG = {
  MODEL: 'gemini-pro',
  ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
  MAX_TOKENS: 1024,
  TEMPERATURE: 0.7,
  TIMEOUT_MS: 10000,
  MAX_DESCRIPTION_LENGTH: 2000,
};

// AI Suggestion Defaults
export const AI_DEFAULTS = {
  COMPLEXITY: 5,
  PRIORITY: 'medium',
  CATEGORY: 'development',
  TAGS: [],
  ESTIMATED_DURATION: 60,
  REASONING_DEFAULT: 'Using default values due to AI unavailability',
  REASONING_OFFLINE: 'AI analysis unavailable - using default values',
  REASONING_TIMEOUT: 'AI analysis timed out - using default values',
};

// AI Error Messages
export const AI_ERROR_MESSAGES = {
  NOT_CONFIGURED: 'AI not configured',
  OFFLINE: 'AI analysis unavailable - using default values',
  TIMEOUT: 'AI analysis timed out - using default values',
  RATE_LIMIT: 'AI temporarily unavailable - please try again in a moment',
  GENERIC: 'AI analysis unavailable - using default values',
};
```
