/**
 * useAISuggestions Hook
 * State management for AI-powered task analysis suggestions
 */

import { useState, useCallback, useRef } from 'react';
import * as aiService from '../services/aiService';

/**
 * Custom hook for managing AI task suggestions
 * @returns {object} - AI suggestions state and actions
 */
export function useAISuggestions() {
  // State
  const [suggestions, setSuggestions] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastAnalyzedInput, setLastAnalyzedInput] = useState(null);

  // Track pending request for debouncing
  const pendingRequestRef = useRef(null);

  // Check if AI is configured
  const isConfigured = aiService.isConfigured();

  /**
   * Analyze a task and get AI suggestions
   * @param {string} taskName - Task name to analyze
   * @param {string} [description] - Task description (optional)
   */
  const analyzeTask = useCallback(async (taskName, description = '') => {
    // Cancel any pending request
    if (pendingRequestRef.current) {
      pendingRequestRef.current.cancelled = true;
    }

    // Create new request tracker
    const currentRequest = { cancelled: false };
    pendingRequestRef.current = currentRequest;

    setIsLoading(true);
    setError(null);

    try {
      const result = await aiService.analyzeTask(taskName, description);

      // Check if this request was cancelled
      if (currentRequest.cancelled) {
        return;
      }

      // Store the analyzed input for re-analysis detection
      setLastAnalyzedInput({ taskName, description });

      // Check if result has an error
      if (result.error) {
        setError(result.error);
      }

      setSuggestions(result);
    } catch (err) {
      if (!currentRequest.cancelled) {
        console.error('AI analysis error:', err);
        setError('An unexpected error occurred');
        setSuggestions(aiService.getDefaults('error'));
      }
    } finally {
      if (!currentRequest.cancelled) {
        setIsLoading(false);
      }
    }
  }, []);

  /**
   * Re-analyze with the last used input (for when input changes)
   * @param {string} taskName - Current task name
   * @param {string} [description] - Current description
   */
  const reanalyze = useCallback(async (taskName, description = '') => {
    return analyzeTask(taskName, description);
  }, [analyzeTask]);

  /**
   * Accept a single suggestion field
   * @param {string} field - Field name to accept
   * @returns {*} - The suggestion value for that field
   */
  const acceptSuggestion = useCallback((field) => {
    if (!suggestions || !(field in suggestions)) {
      return undefined;
    }
    return suggestions[field];
  }, [suggestions]);

  /**
   * Accept all suggestions
   * @returns {object} - Object with all suggestion values
   */
  const acceptAll = useCallback(() => {
    if (!suggestions) {
      return {};
    }

    return {
      complexity: suggestions.complexity,
      priority: suggestions.priority,
      category: suggestions.category,
      tags: suggestions.tags,
      estimatedDuration: suggestions.estimatedDuration,
    };
  }, [suggestions]);

  /**
   * Dismiss all suggestions and reset state
   */
  const dismiss = useCallback(() => {
    // Cancel any pending request
    if (pendingRequestRef.current) {
      pendingRequestRef.current.cancelled = true;
    }

    setSuggestions(null);
    setIsLoading(false);
    setError(null);
    setLastAnalyzedInput(null);
  }, []);

  return {
    // State
    suggestions,
    isLoading,
    error,
    isConfigured,
    lastAnalyzedInput,

    // Actions
    analyzeTask,
    reanalyze,
    acceptSuggestion,
    acceptAll,
    dismiss,
  };
}

export default useAISuggestions;
