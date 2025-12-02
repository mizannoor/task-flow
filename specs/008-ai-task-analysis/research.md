# Research: AI-Powered Task Analysis

**Feature**: 008-ai-task-analysis  
**Date**: December 2, 2025  
**Phase**: 0 - Research

## Research Tasks

### 1. Gemini API Integration Approach

**Question**: What is the best approach for integrating Google Gemini API in a client-side React application?

**Decision**: Use direct REST API calls via `fetch()` rather than the official `@google/genai` SDK.

**Rationale**:
- The official SDK (`@google/genai`) is designed for Node.js environments and may have bundle size implications
- PRD Section 9.1.3 already specifies direct `fetch()` approach with the REST endpoint
- Direct REST calls provide finer control over request/response handling and error management
- Simpler dependency footprint aligns with Constitution's client-side-first principle

**Alternatives Considered**:
- `@google/genai` SDK: More ergonomic API but adds ~50KB+ to bundle, designed for server-side
- Vertex AI SDK: Requires service account authentication, not suitable for client-side

**Implementation Pattern**:
```javascript
// Direct REST API call pattern (per PRD)
const response = await fetch(`${GEMINI_ENDPOINT}?key=${API_KEY}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
  })
});
```

---

### 2. Error Handling Strategy

**Question**: How should the AI service handle various failure modes?

**Decision**: Implement tiered error handling with graceful fallback to defaults.

**Rationale**:
- Constitution Principle II requires graceful degradation when AI unavailable
- User workflow must never be blocked by AI failures
- Clear error categorization enables appropriate user feedback

**Error Categories & Handling**:

| Error Type | Detection | User Message | Fallback Action |
|------------|-----------|--------------|-----------------|
| Network/Offline | `!navigator.onLine` or fetch fails | "AI analysis unavailable - using default values" | Return defaults immediately |
| Timeout (10s) | AbortController timeout | "AI analysis timed out - using default values" | Return defaults |
| Rate Limit (429) | HTTP status code | "AI temporarily unavailable - please try again in a moment" | Return defaults |
| Invalid API Key | HTTP 401/403 | Disabled button with tooltip "AI not configured" | Return defaults silently |
| Malformed Response | JSON parse failure | "AI analysis unavailable - using default values" | Parse what's valid, default rest |
| API Error (5xx) | HTTP status >= 500 | "AI analysis unavailable - using default values" | Return defaults |

**Implementation Pattern**:
```javascript
async analyzeTask(taskName, description) {
  // Check preconditions
  if (!this.apiKey) return { ...DEFAULTS, isConfigured: false };
  if (!navigator.onLine) return { ...DEFAULTS, reason: 'offline' };
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  
  try {
    const response = await fetch(url, { signal: controller.signal, ... });
    clearTimeout(timeoutId);
    
    if (response.status === 429) return { ...DEFAULTS, reason: 'rate_limit' };
    if (response.status === 401 || response.status === 403) return { ...DEFAULTS, reason: 'invalid_key' };
    if (!response.ok) return { ...DEFAULTS, reason: 'api_error' };
    
    return this.parseResponse(await response.json());
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') return { ...DEFAULTS, reason: 'timeout' };
    return { ...DEFAULTS, reason: 'network_error' };
  }
}
```

---

### 3. Prompt Engineering Best Practices

**Question**: What prompt structure yields the most reliable structured JSON output from Gemini?

**Decision**: Use explicit JSON schema in prompt with strict instructions, then validate/parse defensively.

**Rationale**:
- Gemini occasionally wraps JSON in markdown code blocks
- Explicit schema reduces hallucination of extra fields
- Lower temperature (0.7) balances creativity with consistency

**Prompt Pattern** (per PRD 9.1.2, refined):
```javascript
const TASK_ANALYSIS_PROMPT = `
You are a task analysis assistant. Analyze the following task and provide structured suggestions.

Task Name: {taskName}
Description: {description}

Respond with a JSON object containing EXACTLY these fields:
{
  "complexity": <number 1-10>,
  "priority": <"urgent" | "high" | "medium" | "low">,
  "category": <"development" | "fix" | "support">,
  "tags": <array of 2-5 strings>,
  "estimatedDuration": <number in minutes>,
  "reasoning": <string explaining your analysis>
}

Guidelines:
- Complexity: 1=trivial, 5=moderate, 10=extremely complex
- Priority: urgent=blocking, high=important, medium=standard, low=backlog
- Category: development=new features, fix=bugs, support=maintenance
- Duration: Realistic minutes based on complexity
- Tags: 2-5 relevant keywords

Respond ONLY with the JSON object. No markdown, no explanation, no code blocks.
`;
```

**Response Parsing** (defensive):
```javascript
parseResponse(data) {
  try {
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    // Extract JSON even if wrapped in markdown code blocks
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');
    
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      complexity: this.validateComplexity(parsed.complexity),
      priority: this.validatePriority(parsed.priority),
      category: this.validateCategory(parsed.category),
      tags: this.validateTags(parsed.tags),
      estimatedDuration: this.validateDuration(parsed.estimatedDuration),
      reasoning: parsed.reasoning || 'Analysis complete',
      isAISuggested: true
    };
  } catch (error) {
    return { ...DEFAULTS, reason: 'parse_error' };
  }
}
```

---

### 4. React Integration Pattern

**Question**: How should AI suggestions integrate with the existing TaskForm component?

**Decision**: Create a custom hook (`useAISuggestions`) that encapsulates AI state and logic, plus a dedicated `AISuggestionPanel` component.

**Rationale**:
- Separation of concerns: AI logic isolated from form logic
- Reusable: Hook can be used in edit flows if needed later
- Testable: Hook and panel can be unit tested independently
- Aligns with existing patterns (e.g., `useTasks`, `useAuth` hooks)

**Architecture**:
```
TaskForm.jsx
├── uses useAISuggestions hook
│   ├── suggestions state
│   ├── loading state
│   ├── analyzeTask() function
│   └── acceptSuggestion(field) function
└── renders AISuggestionPanel
    ├── displays suggestions with Accept buttons
    ├── shows loading/error states
    └── handles Accept All / Dismiss All
```

**Hook API**:
```javascript
const {
  suggestions,      // { complexity, priority, ... } | null
  isLoading,        // boolean
  isConfigured,     // boolean (API key present)
  error,            // string | null
  analyzeTask,      // (name, description) => Promise<void>
  acceptSuggestion, // (field) => value
  acceptAll,        // () => { complexity, priority, ... }
  dismiss,          // () => void
  reanalyze         // () => Promise<void>
} = useAISuggestions();
```

---

### 5. Visual Distinction for AI-Suggested Values

**Question**: How should AI-suggested values be visually distinguished in the form?

**Decision**: Use a sparkle icon (✨) indicator next to AI-populated fields, with purple/indigo accent color.

**Rationale**:
- Sparkle is widely recognized as AI indicator (used by ChatGPT, Copilot, etc.)
- Purple/indigo differentiates from existing priority/status colors
- Icon removes when user modifies field (per FR-018)
- Non-intrusive but clearly visible

**Implementation**:
- Create `SparkleIcon` component (SVG)
- Track `aiSuggestedFields` state in form (Set of field names)
- Clear field from set when user manually changes it
- Render icon conditionally next to form labels

---

### 6. Description Truncation Strategy

**Question**: How should long descriptions be truncated before sending to AI?

**Decision**: Truncate to 2000 characters at word boundary, silently (no user notification).

**Rationale**:
- 2000 chars provides sufficient context for meaningful analysis
- Word boundary prevents mid-word cuts
- Silent truncation per clarification session (users don't need to know)
- Prevents token limit exhaustion and reduces API costs

**Implementation**:
```javascript
function truncateDescription(description, maxLength = 2000) {
  if (!description || description.length <= maxLength) return description;
  
  // Find last space before maxLength
  const truncated = description.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return lastSpace > maxLength * 0.8 
    ? truncated.slice(0, lastSpace) 
    : truncated;
}
```

---

## Resolved Unknowns

| Unknown | Resolution | Source |
|---------|------------|--------|
| SDK vs REST API | Direct REST API calls | PRD 9.1.3 + bundle size concerns |
| API key provisioning | Environment variable (VITE_GEMINI_API_KEY) | Clarification session |
| Description limit | 2000 characters | Clarification session |
| Missing key behavior | Disabled button + tooltip | Clarification session |
| Request timeout | 10 seconds | Spec FR-016 |
| Model selection | gemini-pro | PRD 9.1.1 |

## Dependencies Identified

| Dependency | Version | Purpose | Risk |
|------------|---------|---------|------|
| None (native fetch) | N/A | API calls | Low - browser built-in |

**Note**: No new npm dependencies required. Feature uses native browser APIs only.
