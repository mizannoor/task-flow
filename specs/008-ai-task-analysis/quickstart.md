# Quickstart: AI-Powered Task Analysis

**Feature**: 008-ai-task-analysis  
**Date**: December 2, 2025  
**Phase**: 1 - Design

## Overview

This guide explains how to integrate AI-powered task analysis into the TaskFlow application. The feature provides intelligent suggestions for task properties using Google Gemini AI.

## Prerequisites

1. **API Key**: Set `VITE_GEMINI_API_KEY` environment variable with a valid Google Gemini API key
2. **Dependencies**: No additional npm packages required (uses native `fetch`)

## Quick Integration

### 1. Environment Setup

Create or update `.env.local`:

```bash
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Using the Hook

```jsx
import { useAISuggestions } from '../hooks/useAISuggestions';

function TaskForm() {
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  
  const {
    suggestions,
    isLoading,
    isConfigured,
    error,
    analyzeTask,
    acceptAll,
    dismiss
  } = useAISuggestions();

  const handleGetSuggestions = async () => {
    await analyzeTask(taskName, description);
  };

  const handleAcceptAll = () => {
    const values = acceptAll();
    // Apply values to form fields
    setComplexity(values.complexity);
    setPriority(values.priority);
    // ... etc
  };

  return (
    <form>
      {/* Task name and description inputs */}
      
      <button 
        type="button"
        onClick={handleGetSuggestions}
        disabled={!isConfigured || isLoading || !taskName}
        title={!isConfigured ? 'AI not configured' : ''}
      >
        {isLoading ? 'Analyzing...' : 'Get AI Suggestions'}
      </button>

      {suggestions && (
        <AISuggestionPanel
          suggestions={suggestions}
          onAcceptAll={handleAcceptAll}
          onDismiss={dismiss}
        />
      )}
    </form>
  );
}
```

### 3. Displaying Suggestions

```jsx
import { AISuggestionPanel } from '../components/tasks/AISuggestionPanel';

// Inside your form component
{suggestions && (
  <AISuggestionPanel
    suggestions={suggestions}
    isLoading={isLoading}
    error={error}
    isConfigured={isConfigured}
    onAnalyze={handleGetSuggestions}
    onAcceptField={(field, value) => {
      // Update individual form field
      updateField(field, value);
    }}
    onAcceptAll={() => {
      // Apply all suggestions to form
      const values = acceptAll();
      applyAllValues(values);
    }}
    onDismiss={dismiss}
    showReanalyze={hasInputChanged}
    onReanalyze={handleGetSuggestions}
  />
)}
```

### 4. Marking AI-Suggested Fields

Track which fields have AI-suggested values:

```jsx
const [aiSuggestedFields, setAiSuggestedFields] = useState(new Set());

// When accepting AI suggestions
const handleAcceptField = (field, value) => {
  setFormData(prev => ({ ...prev, [field]: value }));
  setAiSuggestedFields(prev => new Set([...prev, field]));
};

// When user manually changes a field
const handleChange = (field, value) => {
  setFormData(prev => ({ ...prev, [field]: value }));
  // Remove AI indicator when user modifies
  setAiSuggestedFields(prev => {
    const next = new Set(prev);
    next.delete(field);
    return next;
  });
};

// Render sparkle icon for AI-suggested fields
<label>
  Complexity
  {aiSuggestedFields.has('complexity') && <SparkleIcon />}
</label>
```

## Key Files

| File | Purpose |
|------|---------|
| `src/services/aiService.js` | Gemini API integration |
| `src/hooks/useAISuggestions.js` | AI state management hook |
| `src/components/tasks/AISuggestionPanel.jsx` | Suggestions UI component |
| `src/components/ui/SparkleIcon.jsx` | AI indicator icon |
| `src/utils/constants.js` | AI configuration constants |

## Error Handling

The hook handles all error cases automatically:

| Scenario | User Experience |
|----------|-----------------|
| No API key | Button disabled with tooltip "AI not configured" |
| Offline | Shows defaults with "AI analysis unavailable" message |
| Timeout (10s) | Shows defaults with "AI analysis timed out" message |
| Rate limited | Shows defaults with "AI temporarily unavailable" message |
| Malformed response | Shows defaults with generic message |

## Testing

```jsx
// Mock the aiService for tests
jest.mock('../services/aiService', () => ({
  analyzeTask: jest.fn().mockResolvedValue({
    complexity: 7,
    priority: 'high',
    category: 'fix',
    tags: ['bug', 'auth'],
    estimatedDuration: 120,
    reasoning: 'Test reasoning',
    isAISuggested: true
  }),
  isConfigured: jest.fn().mockReturnValue(true),
  getDefaults: jest.fn().mockReturnValue({
    complexity: 5,
    priority: 'medium',
    category: 'development',
    tags: [],
    estimatedDuration: 60,
    reasoning: 'Using defaults',
    isAISuggested: false
  })
}));
```

## Configuration

All configuration is in `src/utils/constants.js`:

```javascript
export const AI_CONFIG = {
  MODEL: 'gemini-pro',
  ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
  MAX_TOKENS: 1024,
  TEMPERATURE: 0.7,
  TIMEOUT_MS: 10000,
  MAX_DESCRIPTION_LENGTH: 2000,
};
```

## Troubleshooting

### AI suggestions not appearing

1. Check `VITE_GEMINI_API_KEY` is set in environment
2. Verify API key is valid at [Google AI Studio](https://ai.google.dev/)
3. Check browser console for error messages

### Getting defaults instead of AI suggestions

1. Check network connectivity
2. Verify API key hasn't exceeded quota
3. Check for rate limiting (429 status)

### Suggestions seem inaccurate

1. Provide more detailed task descriptions
2. Use descriptive task names (3+ words)
3. AI works best with context about the type of work
