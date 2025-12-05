/**
 * BulkTagModal Component
 * Modal for adding or removing tags from multiple tasks
 */

import { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';

/**
 * BulkTagModal component
 * Uses key prop to reset state when modal opens
 * @param {object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {'add' | 'remove'} props.mode - Tag operation mode
 * @param {string[]} props.existingTags - Tags that exist on selected tasks (for remove mode)
 * @param {Function} props.onConfirm - Callback when tags are confirmed (receives tags array)
 * @param {Function} props.onCancel - Callback when modal is cancelled
 * @param {boolean} props.isLoading - Whether operation is in progress
 * @param {number} props.resetKey - Key to trigger state reset
 */
export function BulkTagModal({
  isOpen,
  mode = 'add',
  existingTags = [],
  onConfirm,
  onCancel,
  isLoading = false,
  resetKey = 0,
}) {
  const { t } = useTranslation();

  if (!isOpen) {
    return null;
  }

  return (
    <BulkTagModalContent
      key={resetKey}
      mode={mode}
      existingTags={existingTags}
      onConfirm={onConfirm}
      onCancel={onCancel}
      isLoading={isLoading}
      t={t}
    />
  );
}

/**
 * Inner component that resets when key changes
 */
function BulkTagModalContent({
  mode,
  existingTags,
  onConfirm,
  onCancel,
  isLoading,
  t,
}) {
  const [inputValue, setInputValue] = useState('');
  const [selectedTags, setSelectedTags] = useState(new Set());

  // Prevent clicking behind modal
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      onCancel();
    }
  };

  // Handle tag input for add mode
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // Handle tag toggle for remove mode
  const handleTagToggle = (tag) => {
    const newSelected = new Set(selectedTags);
    if (newSelected.has(tag)) {
      newSelected.delete(tag);
    } else {
      newSelected.add(tag);
    }
    setSelectedTags(newSelected);
  };

  // Parse comma-separated tags and trim/filter
  const parseTags = (input) => {
    return input
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
  };

  // Handle confirm
  const handleConfirm = () => {
    if (mode === 'add') {
      const tags = parseTags(inputValue);
      if (tags.length > 0) {
        onConfirm(tags);
      }
    } else {
      const tags = Array.from(selectedTags);
      if (tags.length > 0) {
        onConfirm(tags);
      }
    }
  };

  // Check if confirm is enabled
  const isConfirmEnabled = mode === 'add'
    ? parseTags(inputValue).length > 0
    : selectedTags.size > 0;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 transition-opacity" />

      {/* Modal container */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md">
          {/* Modal content */}
          <div className="bg-white dark:bg-gray-800 px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              {/* Tag icon */}
              <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/30 sm:mx-0 sm:h-10 sm:w-10">
                <svg
                  className="h-6 w-6 text-indigo-600 dark:text-indigo-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 6h.008v.008H6V6z"
                  />
                </svg>
              </div>

              {/* Content */}
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left flex-1">
                <h3
                  className="text-lg font-semibold leading-6 text-gray-900 dark:text-white"
                  id="modal-title"
                >
                  {mode === 'add' ? t('bulk.tags.addTags') : t('bulk.tags.removeTags')}
                </h3>
                <div className="mt-4">
                  {mode === 'add' ? (
                    // Add mode: text input for comma-separated tags
                    <div>
                      <label
                        htmlFor="tags-input"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        {t('bulk.tags.enterTags')}
                      </label>
                      <input
                        type="text"
                        id="tags-input"
                        value={inputValue}
                        onChange={handleInputChange}
                        placeholder="tag1, tag2, tag3"
                        disabled={isLoading}
                        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                        autoFocus
                      />
                      {parseTags(inputValue).length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {parseTags(inputValue).map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    // Remove mode: checkbox list of existing tags
                    <div>
                      {existingTags.length > 0 ? (
                        <>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                            {t('bulk.tags.selectTagsToRemove')}
                          </p>
                          <div className="max-h-48 overflow-y-auto rounded border border-gray-200 dark:border-gray-700">
                            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                              {existingTags.map((tag) => (
                                <li key={tag} className="px-3 py-2">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={selectedTags.has(tag)}
                                      onChange={() => handleTagToggle(tag)}
                                      disabled={isLoading}
                                      className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500 dark:bg-gray-700 dark:checked:bg-indigo-600"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                      {tag}
                                    </span>
                                  </label>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t('bulk.tags.noTagsToRemove')}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Modal actions */}
          <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 gap-3">
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isLoading || !isConfirmEnabled}
              className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed sm:w-auto"
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
                  {t('common.loading')}
                </>
              ) : (
                mode === 'add' ? t('common.add') : t('common.remove')
              )}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="mt-3 inline-flex w-full justify-center rounded-md bg-white dark:bg-gray-600 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed sm:mt-0 sm:w-auto"
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BulkTagModal;
