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
  DEPENDENCY_LIMITS,
} from '../../utils/constants';
import { useTranslation } from '../../hooks/useTranslation';
import { useTranslatedLabels } from '../../hooks/useTranslatedLabels';
import { useAISuggestions } from '../../hooks/useAISuggestions';
import { useDependencies } from '../../hooks/useDependencies';
import { useTasks } from '../../hooks/useTasks';
import { AISuggestionPanel } from './AISuggestionPanel';
import { SparkleIcon } from '../ui/SparkleIcon';
import { DependencySelector } from './DependencySelector';
import { DependencyList } from './DependencyList';
import { DependencyChain } from './DependencyChain';

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
  const { t } = useTranslation();
  const { priorityLabels, categoryLabels } = useTranslatedLabels();

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
        <label htmlFor="taskName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('tasks.taskName')} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="taskName"
          name="taskName"
          value={formData.taskName}
          onChange={handleChange}
          maxLength={TASK_LIMITS.NAME_MAX_LENGTH}
          autoFocus
          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm dark:bg-slate-700 dark:text-white ${errors.taskName
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-300 dark:border-slate-600 focus:border-indigo-500 focus:ring-indigo-500'
            }`}
          placeholder={t('tasks.taskNamePlaceholder')}
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
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('tasks.description')}
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          maxLength={TASK_LIMITS.DESCRIPTION_MAX_LENGTH}
          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm dark:bg-slate-700 dark:text-white dark:placeholder-gray-400 ${errors.description
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-300 dark:border-slate-600 focus:border-indigo-500 focus:ring-indigo-500'
            }`}
          placeholder={t('tasks.descriptionPlaceholder')}
          disabled={isLoading}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
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
                    ? t('ai.enterTaskNameFirst')
                    : t('ai.getAISuggestionsTitle')
              }
            >
              <SparkleIcon size={16} />
              {t('ai.getAISuggestions')}
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
              {t('tasks.priority')}
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
            {Object.entries(priorityLabels).map(([value, label]) => (
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
              {t('tasks.category')}
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
            {Object.entries(categoryLabels).map(([value, label]) => (
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
              {t('tasks.complexity')} (1-10)
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
              {t('tasks.estimatedDuration')} ({t('tasks.estimatedMinutes')})
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
        <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {t('tasks.deadline')}
        </label>
        <input
          type="date"
          id="deadline"
          name="deadline"
          value={formData.deadline}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md shadow-sm sm:text-sm dark:bg-slate-700 dark:text-white dark:[color-scheme:dark] ${errors.deadline
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-300 dark:border-slate-600 focus:border-indigo-500 focus:ring-indigo-500'
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
          <label htmlFor="userId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('tasks.assignedTo')}
          </label>
          <select
            id="userId"
            name="userId"
            value={formData.userId}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
            {t('tasks.tags')}
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
            className="block w-full rounded-none rounded-l-md border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-gray-400 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder={t('tasks.tagsPlaceholder')}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-md px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-200 ring-1 ring-inset ring-gray-300 dark:ring-slate-600 bg-white dark:bg-slate-600 hover:bg-gray-50 dark:hover:bg-slate-500"
            disabled={isLoading || !tagInput.trim()}
          >
            {t('common.add')}
          </button>
        </div>
        {/* Tag list */}
        {formData.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 px-2.5 py-0.5 text-xs font-medium text-indigo-800 dark:text-indigo-300"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-1 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-indigo-400 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800 hover:text-indigo-500 dark:hover:text-indigo-200 focus:bg-indigo-500 focus:text-white focus:outline-none"
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

      {/* Dependencies Section - Only shown in edit mode */}
      {isEditMode && initialValues?.id && (
        <DependenciesSection
          taskId={initialValues.id}
          isLoading={isLoading}
        />
      )}

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md bg-white dark:bg-slate-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-200 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600"
          disabled={isLoading}
        >
          {t('common.cancel')}
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
              {isEditMode ? t('tasks.updating') : t('tasks.creating')}
            </>
          ) : (
            <>{isEditMode ? t('tasks.editTask') : t('tasks.createTask')}</>
          )}
        </button>
      </div>
    </form>
  );
}

/**
 * Dependencies Section Component
 * Manages dependencies for an existing task
 */
function DependenciesSection({ taskId, isLoading: formLoading }) {
  const { t } = useTranslation();
  const { tasks } = useTasks();
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(null);
  const [showChainView, setShowChainView] = useState(false);

  const {
    isBlocked,
    blockedBy,
    blockedByIds,
    blocks,
    blocksIds,
    dependencyCount,
    loading: depsLoading,
    error: depsError,
    addDependency,
    removeDependency,
    canAddDependency,
    getAvailableTasksSync,
    clearError,
  } = useDependencies(taskId);

  const isLoading = formLoading || depsLoading;

  // Get dependency IDs for removal
  const [dependencyIdMap, setDependencyIdMap] = useState({});

  // Load dependency ID mapping
  useEffect(() => {
    const loadDependencyIds = async () => {
      const { getAllDependencies } = await import('../../services/dependencyService');
      const allDeps = await getAllDependencies();
      const map = {};
      allDeps.forEach((dep) => {
        if (dep.dependentTaskId === taskId) {
          map[dep.blockingTaskId] = dep.id;
        }
      });
      setDependencyIdMap(map);
    };
    loadDependencyIds();
  }, [taskId, blockedByIds]);

  const handleAddDependency = async (blockingTaskId) => {
    try {
      await addDependency(blockingTaskId);
    } catch (err) {
      // Error is already set in the hook
      console.error('Failed to add dependency:', err);
    }
  };

  const handleRemoveDependency = async (dependencyId) => {
    if (showRemoveConfirm !== dependencyId) {
      setShowRemoveConfirm(dependencyId);
      return;
    }

    try {
      await removeDependency(dependencyId);
      setShowRemoveConfirm(null);
    } catch (err) {
      console.error('Failed to remove dependency:', err);
    }
  };

  const handleCancelRemove = () => {
    setShowRemoveConfirm(null);
  };

  // Get tasks that can be added as dependencies
  const availableTasks = getAvailableTasksSync;

  // Get blocking tasks with dependency IDs
  const blockedByWithIds = blockedBy.map((task) => ({
    task,
    dependencyId: dependencyIdMap[task.id],
  }));

  return (
    <div className="border-t border-gray-200 dark:border-slate-700 pt-4 mt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
          {t('tasks.dependencies', 'Dependencies')}
          {isBlocked && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300">
              {t('tasks.blocked', 'Blocked')}
            </span>
          )}
        </h3>

        {/* View Chain button */}
        {(blockedBy.length > 0 || blocks.length > 0) && (
          <button
            type="button"
            onClick={() => setShowChainView(true)}
            className="inline-flex items-center px-2 py-1 text-xs font-medium text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 rounded hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
          >
            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            {t('dependencies.viewChain', 'View Chain')}
          </button>
        )}
      </div>

      {/* Error display */}
      {depsError && (
        <div className="mb-3 p-2 rounded bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-600 dark:text-red-400">
            {depsError.message || 'An error occurred'}
          </p>
          <button
            type="button"
            onClick={clearError}
            className="text-xs text-red-500 underline mt-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Add Dependency Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
          {t('tasks.addDependency', 'Add Blocking Task')}
        </label>
        <DependencySelector
          availableTasks={availableTasks}
          allTasks={tasks}
          onSelect={handleAddDependency}
          canAddDependency={canAddDependency}
          disabled={isLoading}
          placeholder={t('tasks.searchTasksPlaceholder', 'Search tasks to add as dependency...')}
          isLoading={depsLoading}
          currentDependencyCount={dependencyCount}
          maxDependencies={DEPENDENCY_LIMITS.MAX_DEPENDENCIES_PER_TASK}
        />
      </div>

      {/* Blocked By List */}
      {blockedBy.length > 0 && (
        <div className="mb-4">
          <DependencyList
            tasks={blockedBy}
            dependencyIds={blockedBy.map((t) => dependencyIdMap[t.id])}
            title={t('tasks.blockedBy', 'Blocked By')}
            showRemove={true}
            onRemove={handleRemoveDependency}
            isLoading={depsLoading}
            type="blocked-by"
            emptyMessage={t('tasks.noDependencies', 'No dependencies')}
          />

          {/* Remove confirmation */}
          {showRemoveConfirm && (
            <div className="mt-2 p-2 rounded bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                {t('tasks.confirmRemoveDependency', 'Remove this dependency?')}
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleRemoveDependency(showRemoveConfirm)}
                  className="px-2 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700"
                >
                  {t('common.remove', 'Remove')}
                </button>
                <button
                  type="button"
                  onClick={handleCancelRemove}
                  className="px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Blocks List (read-only info) */}
      {blocks.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
          <DependencyList
            tasks={blocks}
            dependencyIds={[]}
            title={t('tasks.blocks', 'Blocks')}
            showRemove={false}
            isLoading={depsLoading}
            type="blocks"
            emptyMessage=""
          />
        </div>
      )}

      {/* No dependencies message */}
      {blockedBy.length === 0 && blocks.length === 0 && !depsLoading && (
        <p className="text-sm text-gray-500 dark:text-gray-400 italic">
          {t('tasks.noDependenciesYet', 'No dependencies yet. Add blocking tasks above.')}
        </p>
      )}

      {/* Dependency Chain Modal */}
      <DependencyChain
        taskId={taskId}
        isOpen={showChainView}
        onClose={() => setShowChainView(false)}
      />
    </div>
  );
}

export default TaskForm;
