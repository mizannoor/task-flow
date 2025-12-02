/**
 * AI-Powered Task Analysis - Type Contracts
 * Feature: 008-ai-task-analysis
 * 
 * These types define the contracts for AI suggestion functionality.
 * Implementation should adhere to these interfaces.
 */

// =============================================================================
// Domain Types
// =============================================================================

/**
 * Valid priority values for tasks
 */
export type Priority = 'urgent' | 'high' | 'medium' | 'low';

/**
 * Valid category values for tasks
 */
export type Category = 'development' | 'fix' | 'support';

/**
 * AI-generated suggestion for task properties.
 * This is an ephemeral entity - not persisted to storage.
 */
export interface AISuggestion {
  /** Suggested complexity score (1-10) */
  complexity: number;
  
  /** Suggested priority level */
  priority: Priority;
  
  /** Suggested task category */
  category: Category;
  
  /** Suggested tags (2-5 keywords) */
  tags: string[];
  
  /** Suggested time estimate in minutes */
  estimatedDuration: number;
  
  /** AI's explanation of the suggestions */
  reasoning: string;
  
  /** Whether this came from AI (true) or defaults (false) */
  isAISuggested: boolean;
  
  /** Timestamp when analysis was performed */
  timestamp: Date;
}

/**
 * Input for AI analysis request
 */
export interface AnalysisRequest {
  /** Task name to analyze (required, 1-200 chars) */
  taskName: string;
  
  /** Task description (optional, max 2000 chars - truncated if longer) */
  description?: string;
}

/**
 * Result from AI service including metadata
 */
export interface AnalysisResult extends AISuggestion {
  /** Reason for fallback if defaults were used */
  fallbackReason?: 'offline' | 'timeout' | 'rate_limit' | 'invalid_key' | 'parse_error' | 'api_error';
}

// =============================================================================
// Hook Types
// =============================================================================

/**
 * State managed by useAISuggestions hook
 */
export interface AISuggestionState {
  /** Current suggestions (null if not yet analyzed) */
  suggestions: AISuggestion | null;
  
  /** Whether analysis is in progress */
  isLoading: boolean;
  
  /** Error message if analysis failed */
  error: string | null;
  
  /** Whether API key is configured */
  isConfigured: boolean;
  
  /** Input used for last successful analysis */
  lastAnalyzedInput: AnalysisRequest | null;
}

/**
 * Actions returned by useAISuggestions hook
 */
export interface AISuggestionActions {
  /** Trigger AI analysis for given task name and description */
  analyzeTask: (taskName: string, description?: string) => Promise<void>;
  
  /** Get single suggestion value (marks as accepted) */
  acceptSuggestion: <K extends keyof AISuggestion>(field: K) => AISuggestion[K] | undefined;
  
  /** Get all suggestion values */
  acceptAll: () => Partial<AISuggestion>;
  
  /** Clear current suggestions */
  dismiss: () => void;
  
  /** Re-analyze with previously used input */
  reanalyze: () => Promise<void>;
}

/**
 * Return type of useAISuggestions hook
 */
export type UseAISuggestionsReturn = AISuggestionState & AISuggestionActions;

// =============================================================================
// Service Types
// =============================================================================

/**
 * AI Service interface
 */
export interface IAIService {
  /** Check if service is configured (API key present) */
  isConfigured(): boolean;
  
  /** Analyze task and return suggestions */
  analyzeTask(request: AnalysisRequest): Promise<AnalysisResult>;
  
  /** Get default suggestions (for fallback) */
  getDefaults(reason?: string): AnalysisResult;
}

/**
 * Gemini API response structure
 */
export interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
    finishReason?: string;
  }>;
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
}

/**
 * Raw parsed response from Gemini (before validation)
 */
export interface RawAISuggestion {
  complexity?: unknown;
  priority?: unknown;
  category?: unknown;
  tags?: unknown;
  estimatedDuration?: unknown;
  reasoning?: unknown;
}

// =============================================================================
// Component Props Types
// =============================================================================

/**
 * Props for AISuggestionPanel component
 */
export interface AISuggestionPanelProps {
  /** Current AI suggestions */
  suggestions: AISuggestion | null;
  
  /** Whether analysis is loading */
  isLoading: boolean;
  
  /** Error message to display */
  error: string | null;
  
  /** Whether AI is configured */
  isConfigured: boolean;
  
  /** Callback when user clicks "Get AI Suggestions" */
  onAnalyze: () => void;
  
  /** Callback when user accepts a single field */
  onAcceptField: (field: keyof AISuggestion, value: unknown) => void;
  
  /** Callback when user accepts all suggestions */
  onAcceptAll: () => void;
  
  /** Callback when user dismisses suggestions */
  onDismiss: () => void;
  
  /** Whether re-analyze should be shown (input changed since last analysis) */
  showReanalyze: boolean;
  
  /** Callback for re-analyze button */
  onReanalyze: () => void;
}

/**
 * Props for individual suggestion field display
 */
export interface SuggestionFieldProps {
  /** Field label */
  label: string;
  
  /** Suggested value */
  value: string | number | string[];
  
  /** Callback when accepted */
  onAccept: () => void;
  
  /** Whether this field can be individually accepted */
  canAccept?: boolean;
}

/**
 * Set of field names that currently have AI-suggested values
 */
export type AISuggestedFields = Set<keyof AISuggestion>;

// =============================================================================
// Constants Types
// =============================================================================

/**
 * AI service configuration
 */
export interface AIConfig {
  MODEL: string;
  ENDPOINT: string;
  MAX_TOKENS: number;
  TEMPERATURE: number;
  TIMEOUT_MS: number;
  MAX_DESCRIPTION_LENGTH: number;
}

/**
 * Default values for AI suggestions
 */
export interface AIDefaults {
  COMPLEXITY: number;
  PRIORITY: Priority;
  CATEGORY: Category;
  TAGS: string[];
  ESTIMATED_DURATION: number;
  REASONING_DEFAULT: string;
  REASONING_OFFLINE: string;
  REASONING_TIMEOUT: string;
}
