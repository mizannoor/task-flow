/**
 * TaskForm Component
 * Form for creating and editing tasks with validation
 */

import { useState, useEffect, useMemo } from 'react';
import { validateCreateTaskInput, validateUpdateTaskInput } from '../../utils/validators';
import { formatDateForInput } from '../../utils/formatters';
import {
  PRIORITIES,
  PRIORITY_LABELS,
  CATEGORIES,
  CATEGORY_LABELS,
  TASK_DEFAULTS,
  TASK_LIMITS,
  AI_ERROR_MESSAGES,
} from '../../utils/constants';
import { useAISuggestions } from '../../hooks/useAISuggestions';
import { AISuggestionPanel } from './AISuggestionPanel';
import { SparkleIcon } from '../ui/SparkleIcon';

/**
 * TaskForm component
 * @param {object} props
 * @param {object} props.initialValues - Initial form values (for edit mode)
 * @param {Function} props.onSubmit - Callback when form is submitted with valid data
 * @param {Function} props.onCancel - Callback when cancel is clicked
 * @param {boolean} props.isLoading - Whether form submission is in progress
 * @param {boolean} props.isEditMode - Whether form is in edit mode
 * @param {object[]} props.users - List of users for assignment dropdown
 * @param {string} props.currentUserId - Current user's ID
 */
export function TaskForm({
  initialValues = {},
  onSubmit,
  onCancel,
  isLoading = false,
  isEditMode = false,
  users = [],
  currentUserId,
}) {
  // Form state
  const [formData, setFormData] = useState({
    taskName: '',
    description: '',
    complexity: TASK_DEFAULTS.COMPLEXITY,
    priority: TASK_DEFAULTS.PRIORITY,
    category: TASK_DEFAULTS.CATEGORY,
    estimatedDuration: TASK_DEFAULTS.ESTIMATED_DURATION,
    deadline: '',
    userId: currentUserId || '',
    tags: [],
  });

  // Validation errors
  const [errors, setErrors] = useState({});

  // Tag input state
  const [tagInput, setTagInput] = useState('');

  // AI suggestions state
  const {
    suggestions,
    isLoading: isAILoading,
    error: aiError,
    isConfigured: isAIConfigured,
    lastAnalyzedInput,
    analyzeTask,
    acceptSuggestion,
    acceptAll: getAcceptAllValues,
    dismiss: dismissSuggestions,
    reanalyze,
  } = useAISuggestions();

  // Track which fields have AI-suggested values
  const [aiSuggestedFields, setAiSuggestedFields] = useState(new Set());

  // Track which fields have been manually modified after AI suggestions
  const [modifiedFields, setModifiedFields] = useState(new Set());

  // Track previous suggestions for visual diff
  const [previousSuggestions, setPreviousSuggestions] = useState(null);

  // Check if input has changed since last analysis
  const hasInputChanged = useMemo(() => {
    if (!lastAnalyzedInput) return false;
    return (
      formData.taskName !== lastAnalyzedInput.taskName ||
      formData.description !== lastAnalyzedInput.description
    );
  }, [formData.taskName, formData.description, lastAnalyzedInput]);

  // Initialize form with initial values (for edit mode)
  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      setFormData({
        taskName: initialValues.taskName || '',
        description: initialValues.description || '',
        complexity: initialValues.complexity ?? TASK_DEFAULTS.COMPLEXITY,
        priority: initialValues.priority || TASK_DEFAULTS.PRIORITY,
        category: initialValues.category || TASK_DEFAULTS.CATEGORY,
        estimatedDuration: initialValues.estimatedDuration ?? TASK_DEFAULTS.ESTIMATED_DURATION,
        deadline: formatDateForInput(initialValues.deadline) || '',
        userId: initialValues.userId || currentUserId || '',
        tags: initialValues.tags || [],
      });
    }
  }, [initialValues, currentUserId]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type } = e.target;

    let processedValue = value;
    if (type === 'number') {
      processedValue = value === '' ? '' : parseInt(value, 10);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }

    // Clear AI suggested indicator when user manually modifies a field
    if (aiSuggestedFields.has(name)) {
      setAiSuggestedFields((prev) => {
        const next = new Set(prev);
        next.delete(name);
        return next;
      });
      setModifiedFields((prev) => new Set([...prev, name]));
    }
  };

  // Handle tag addition
  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, trimmedTag],
      }));
    }
    setTagInput('');
  };

  // Handle tag removal
  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  // Handle tag input key press
  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Handle AI analysis request
  const handleGetAISuggestions = async () => {
    if (!formData.taskName.trim()) return;
    setPreviousSuggestions(suggestions);
    await analyzeTask(formData.taskName, formData.description);
  };

  // Handle accepting a single AI suggestion field
  const handleAcceptField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setAiSuggestedFields((prev) => new Set([...prev, field]));
    setModifiedFields((prev) => {
      const next = new Set(prev);
      next.delete(field);
      return next;
    });
  };

  // Handle accepting all AI suggestions
  const handleAcceptAll = () => {
    const values = getAcceptAllValues();
    if (!values || Object.keys(values).length === 0) return;

    setFormData((prev) => ({
      ...prev,
      ...values,
    }));

    // Mark all suggestion fields as AI-suggested
    const fields = new Set(['complexity', 'priority', 'category', 'tags', 'estimatedDuration']);
    setAiSuggestedFields(fields);
    setModifiedFields(new Set());
  };

  // Handle accepting remaining (non-modified) suggestions
  const handleAcceptRemaining = () => {
    const values = getAcceptAllValues();
    if (!values || Object.keys(values).length === 0) return;

    const fieldsToAccept = ['complexity', 'priority', 'category', 'tags', 'estimatedDuration']
      .filter((field) => !modifiedFields.has(field));

    const newFormData = { ...formData };
    const newAiFields = new Set(aiSuggestedFields);

    fieldsToAccept.forEach((field) => {
      if (field in values) {
        newFormData[field] = values[field];
        newAiFields.add(field);
      }
    });

    setFormData(newFormData);
    setAiSuggestedFields(newAiFields);
  };

  // Handle dismissing AI suggestions
  const handleDismissSuggestions = () => {
    dismissSuggestions();
    setPreviousSuggestions(null);
    // Don't clear aiSuggestedFields - keep them if user already accepted some
  };

  // Handle re-analysis
  const handleReanalyze = async () => {
    setPreviousSuggestions(suggestions);
    await reanalyze(formData.taskName, formData.description);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Prepare data for validation
    const submitData = {
      ...formData,
      complexity: formData.complexity === '' ? undefined : formData.complexity,
      estimatedDuration: formData.estimatedDuration === '' ? undefined : formData.estimatedDuration,
      deadline: formData.deadline ? new Date(formData.deadline) : null,
    };

    // Validate
    const validation = isEditMode
      ? validateUpdateTaskInput(submitData)
      : validateCreateTaskInput(submitData);

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    // Submit
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Task Name */}
      <div>
        <label htmlFor="taskName" className="block text-sm font-medium text-gray-700">
          Task Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="taskName"
          name="taskName"
          value={formData.taskName}
          onChange={handleChange}
          maxLength={TASK_LIMITS.NAME_MAX_LENGTH}
          autoFocus
          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${errors.taskName
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
            }`}
          placeholder="Enter task name"
          disabled={isLoading}
          aria-invalid={errors.taskName ? 'true' : 'false'}
          aria-describedby={errors.taskName ? 'taskName-error' : undefined}
        />
        {errors.taskName && (
          <p className="mt-1 text-sm text-red-600" id="taskName-error">
            {errors.taskName}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          maxLength={TASK_LIMITS.DESCRIPTION_MAX_LENGTH}
          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${errors.description
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
            }`}
          placeholder="Enter task description (optional)"
          disabled={isLoading}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          {formData.description.length}/{TASK_LIMITS.DESCRIPTION_MAX_LENGTH} characters
        </p>
      </div>

      {/* AI Suggestions Section */}
      {!isEditMode && (
        <div className="relative">
          {/* Get AI Suggestions Button */}
          {!suggestions && !isAILoading && (
            <button
              type="button"
              onClick={handleGetAISuggestions}
              disabled={!formData.taskName.trim() || !isAIConfigured || isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={
                !isAIConfigured
                  ? AI_ERROR_MESSAGES.NOT_CONFIGURED
                  : !formData.taskName.trim()
                    ? 'Enter a task name first'
                    : 'Get AI suggestions for this task'
              }
            >
              <SparkleIcon size={16} />
              Get AI Suggestions
            </button>
          )}

          {/* AI Suggestion Panel */}
          <AISuggestionPanel
            suggestions={suggestions}
            isLoading={isAILoading}
            error={aiError}
            isConfigured={isAIConfigured}
            onAnalyze={handleGetAISuggestions}
            onAcceptField={handleAcceptField}
            onAcceptAll={handleAcceptAll}
            onAcceptRemaining={handleAcceptRemaining}
            onDismiss={handleDismissSuggestions}
            showReanalyze={hasInputChanged && suggestions !== null}
            onReanalyze={handleReanalyze}
            modifiedFields={modifiedFields}
            previousSuggestions={previousSuggestions}
            isReanalyzing={isAILoading && suggestions !== null}
          />
        </div>
      )}

      {/* Priority and Category - Side by side */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Priority */}
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            <span className="inline-flex items-center gap-1">
              Priority
              {aiSuggestedFields.has('priority') && <SparkleIcon size={14} />}
            </span>
          </label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            disabled={isLoading}
          >
            {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            <span className="inline-flex items-center gap-1">
              Category
              {aiSuggestedFields.has('category') && <SparkleIcon size={14} />}
            </span>
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            disabled={isLoading}
          >
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Complexity and Duration - Side by side */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Complexity */}
        <div>
          <label htmlFor="complexity" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            <span className="inline-flex items-center gap-1">
              Complexity (1-10)
              {aiSuggestedFields.has('complexity') && <SparkleIcon size={14} />}
            </span>
          </label>
          <input
            type="number"
            id="complexity"
            name="complexity"
            value={formData.complexity}
            onChange={handleChange}
            min={TASK_LIMITS.COMPLEXITY_MIN}
            max={TASK_LIMITS.COMPLEXITY_MAX}
            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm dark:bg-gray-700 dark:text-white ${errors.complexity
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
            disabled={isLoading}
          />
          {errors.complexity && (
            <p className="mt-1 text-sm text-red-600">{errors.complexity}</p>
          )}
        </div>

        {/* Estimated Duration */}
        <div>
          <label htmlFor="estimatedDuration" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            <span className="inline-flex items-center gap-1">
              Est. Duration (minutes)
              {aiSuggestedFields.has('estimatedDuration') && <SparkleIcon size={14} />}
            </span>
          </label>
          <input
            type="number"
            id="estimatedDuration"
            name="estimatedDuration"
            value={formData.estimatedDuration}
            onChange={handleChange}
            min={TASK_LIMITS.DURATION_MIN}
            max={TASK_LIMITS.DURATION_MAX}
            className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm dark:bg-gray-700 dark:text-white ${errors.estimatedDuration
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
            disabled={isLoading}
          />
          {errors.estimatedDuration && (
            <p className="mt-1 text-sm text-red-600">{errors.estimatedDuration}</p>
          )}
        </div>
      </div>

      {/* Deadline */}
      <div>
        <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">
          Deadline
        </label>
        <input
          type="date"
          id="deadline"
          name="deadline"
          value={formData.deadline}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm ${errors.deadline
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500'
            }`}
          disabled={isLoading}
        />
        {errors.deadline && (
          <p className="mt-1 text-sm text-red-600">{errors.deadline}</p>
        )}
      </div>

      {/* Assign To (if users available) */}
      {users.length > 0 && (
        <div>
          <label htmlFor="userId" className="block text-sm font-medium text-gray-700">
            Assign To
          </label>
          <select
            id="userId"
            name="userId"
            value={formData.userId}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            disabled={isLoading}
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.displayName} {user.id === currentUserId ? '(You)' : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Tags */}
      <div>
        <label htmlFor="tagInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          <span className="inline-flex items-center gap-1">
            Tags
            {aiSuggestedFields.has('tags') && <SparkleIcon size={14} />}
          </span>
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <input
            type="text"
            id="tagInput"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={handleTagKeyPress}
            className="block w-full rounded-none rounded-l-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Add a tag"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-md px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            disabled={isLoading || !tagInput.trim()}
          >
            Add
          </button>
        </div>
        {/* Tag list */}
        {formData.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:bg-indigo-500 focus:text-white focus:outline-none"
                  disabled={isLoading}
                >
                  <span className="sr-only">Remove {tag}</span>
                  <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                    <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          disabled={isLoading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
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
              {isEditMode ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>{isEditMode ? 'Update Task' : 'Create Task'}</>
          )}
        </button>
      </div>
    </form>
  );
}

export default TaskForm;
