/**
 * AISuggestionPanel Component
 * Displays AI-generated task suggestions with accept/dismiss actions
 */

import { useState } from 'react';
import { SparkleIcon } from '../ui/SparkleIcon';
import { PriorityBadge, CategoryBadge } from '../ui/Badge';
import {
  PRIORITY_LABELS,
  CATEGORY_LABELS,
  AI_ERROR_MESSAGES,
} from '../../utils/constants';

/**
 * Loading spinner component
 */
function LoadingSpinner() {
  return (
    <svg
      className="animate-spin h-5 w-5 text-indigo-500"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

/**
 * Individual suggestion field row
 */
function SuggestionField({
  label,
  value,
  onAccept,
  renderValue,
  isHighlighted = false,
}) {
  return (
    <div
      className={`flex items-center justify-between py-2 px-3 rounded-lg ${isHighlighted ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
        }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}:
        </span>
        <span className="text-sm text-gray-900 dark:text-white">
          {renderValue ? renderValue(value) : String(value)}
        </span>
      </div>
      <button
        type="button"
        onClick={onAccept}
        className="text-xs px-2 py-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 dark:text-indigo-400 dark:hover:text-indigo-300 dark:hover:bg-indigo-900/30 rounded transition-colors"
        aria-label={`Accept ${label.toLowerCase()} suggestion`}
      >
        Accept
      </button>
    </div>
  );
}

/**
 * AISuggestionPanel - Main panel component for displaying AI suggestions
 * @param {object} props
 * @param {object|null} props.suggestions - AI suggestion object
 * @param {boolean} props.isLoading - Whether analysis is in progress
 * @param {string|null} props.error - Error message if analysis failed
 * @param {boolean} props.isConfigured - Whether AI is configured
 * @param {Function} props.onAnalyze - Callback to trigger AI analysis
 * @param {Function} props.onAcceptField - Callback when user accepts a single field
 * @param {Function} props.onAcceptAll - Callback when user accepts all suggestions
 * @param {Function} props.onAcceptRemaining - Callback for Accept Remaining
 * @param {Function} props.onDismiss - Callback when user dismisses suggestions
 * @param {boolean} props.showReanalyze - Whether to show re-analyze button
 * @param {Function} props.onReanalyze - Callback for re-analysis
 * @param {Set} props.modifiedFields - Fields that have been manually modified
 * @param {object|null} props.previousSuggestions - Previous suggestions for comparison
 * @param {boolean} props.isReanalyzing - Whether re-analysis is in progress
 */
export function AISuggestionPanel({
  suggestions,
  isLoading,
  error,
  isConfigured,
  onAnalyze,
  onAcceptField,
  onAcceptAll,
  onAcceptRemaining,
  onDismiss,
  showReanalyze = false,
  onReanalyze,
  modifiedFields = new Set(),
  previousSuggestions = null,
  isReanalyzing = false,
}) {
  const [isReasoningExpanded, setIsReasoningExpanded] = useState(false);

  // Helper to check if a value changed from previous suggestions
  const hasValueChanged = (field) => {
    if (!previousSuggestions || !suggestions) return false;
    return JSON.stringify(previousSuggestions[field]) !== JSON.stringify(suggestions[field]);
  };

  // Render tags as badges
  const renderTags = (tags) => {
    if (!tags || tags.length === 0) {
      return <span className="text-gray-400 italic">No tags</span>;
    }
    return (
      <div className="flex flex-wrap gap-1">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
          >
            {tag}
          </span>
        ))}
      </div>
    );
  };

  // Render priority as badge
  const renderPriority = (priority) => (
    <PriorityBadge priority={priority} size="sm" />
  );

  // Render category as badge
  const renderCategory = (category) => (
    <CategoryBadge category={category} size="sm" />
  );

  // Render duration with formatting
  const renderDuration = (minutes) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${minutes}m`;
  };

  // Loading state
  if (isLoading && !suggestions) {
    return (
      <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
        <div className="flex items-center gap-3">
          <LoadingSpinner />
          <span className="text-sm text-indigo-700 dark:text-indigo-300">
            Analyzing task...
          </span>
        </div>
      </div>
    );
  }

  // No suggestions yet - show analyze button (handled by parent component)
  if (!suggestions && !error) {
    return null;
  }

  // Error state without suggestions
  if (error && !suggestions) {
    return (
      <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-amber-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span className="text-sm text-amber-700 dark:text-amber-300">
              {error}
            </span>
          </div>
          <button
            type="button"
            onClick={onAnalyze}
            className="text-sm px-3 py-1.5 bg-amber-100 hover:bg-amber-200 dark:bg-amber-800 dark:hover:bg-amber-700 text-amber-700 dark:text-amber-200 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Has suggestions - show panel
  return (
    <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg border border-indigo-200 dark:border-indigo-700 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-indigo-50 dark:bg-indigo-900/30 border-b border-indigo-200 dark:border-indigo-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SparkleIcon size={18} />
            <span className="font-medium text-indigo-900 dark:text-indigo-100">
              AI Suggestions
            </span>
            {suggestions && !suggestions.isAISuggested && (
              <span className="text-xs text-amber-600 dark:text-amber-400">
                (defaults)
              </span>
            )}
          </div>
          {isReanalyzing && (
            <div className="flex items-center gap-2">
              <LoadingSpinner />
              <span className="text-xs text-indigo-600 dark:text-indigo-400">
                Re-analyzing...
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Error notification (when showing defaults) */}
      {error && suggestions && (
        <div className="px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800">
          <p className="text-xs text-amber-700 dark:text-amber-300">{error}</p>
        </div>
      )}

      {/* Suggestions list */}
      <div className="p-4 space-y-1">
        <SuggestionField
          label="Complexity"
          value={`${suggestions.complexity}/10`}
          onAccept={() => onAcceptField('complexity', suggestions.complexity)}
          isHighlighted={hasValueChanged('complexity')}
        />
        <SuggestionField
          label="Priority"
          value={suggestions.priority}
          renderValue={renderPriority}
          onAccept={() => onAcceptField('priority', suggestions.priority)}
          isHighlighted={hasValueChanged('priority')}
        />
        <SuggestionField
          label="Category"
          value={suggestions.category}
          renderValue={renderCategory}
          onAccept={() => onAcceptField('category', suggestions.category)}
          isHighlighted={hasValueChanged('category')}
        />
        <SuggestionField
          label="Tags"
          value={suggestions.tags}
          renderValue={renderTags}
          onAccept={() => onAcceptField('tags', suggestions.tags)}
          isHighlighted={hasValueChanged('tags')}
        />
        <SuggestionField
          label="Duration"
          value={suggestions.estimatedDuration}
          renderValue={renderDuration}
          onAccept={() => onAcceptField('estimatedDuration', suggestions.estimatedDuration)}
          isHighlighted={hasValueChanged('estimatedDuration')}
        />
      </div>

      {/* Reasoning section (collapsible) */}
      <div className="border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={() => setIsReasoningExpanded(!isReasoningExpanded)}
          className="w-full px-4 py-2 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          aria-expanded={isReasoningExpanded}
        >
          <span>{isReasoningExpanded ? 'Hide Reasoning' : 'Show Reasoning'}</span>
          <svg
            className={`h-4 w-4 transition-transform ${isReasoningExpanded ? 'rotate-180' : ''
              }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        {isReasoningExpanded && (
          <div className="px-4 pb-3">
            <p className="text-sm text-gray-600 dark:text-gray-400 italic">
              {suggestions.reasoning}
            </p>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/30 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onAcceptAll}
          className="flex-1 min-w-[120px] px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        >
          Accept All
        </button>
        {modifiedFields.size > 0 && (
          <button
            type="button"
            onClick={onAcceptRemaining}
            className="flex-1 min-w-[120px] px-4 py-2 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900/50 dark:hover:bg-indigo-900/70 text-indigo-700 dark:text-indigo-300 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            Accept Remaining
          </button>
        )}
        {showReanalyze && (
          <button
            type="button"
            onClick={onReanalyze}
            disabled={isReanalyzing}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Re-analyze
          </button>
        )}
        <button
          type="button"
          onClick={onDismiss}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

export default AISuggestionPanel;
