/**
 * BulkActionBar Component
 * Fixed bottom action bar that appears when tasks are selected
 * Provides buttons for bulk operations: Delete, Status, Reassign, Tags
 */

import { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../hooks/useAuth';
import { STATUSES, STATUS_LABELS } from '../../utils/constants';

/**
 * BulkActionBar component
 * @param {object} props
 * @param {number} props.selectedCount - Number of selected tasks
 * @param {Function} props.onClearSelection - Callback to clear all selections
 * @param {Function} props.onDelete - Callback for bulk delete action
 * @param {Function} props.onStatusChange - Callback for bulk status change (receives status)
 * @param {Function} props.onReassign - Callback for bulk reassign (receives userId)
 * @param {Function} props.onManageTags - Callback for tag management (receives mode: 'add' | 'remove')
 * @param {boolean} props.isProcessing - Whether a bulk operation is in progress
 */
export function BulkActionBar({
  selectedCount,
  onClearSelection,
  onDelete,
  onStatusChange,
  onReassign,
  onManageTags,
  isProcessing = false,
}) {
  const { t } = useTranslation();
  const { users, currentUser } = useAuth();
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showReassignDropdown, setShowReassignDropdown] = useState(false);
  const [showTagsDropdown, setShowTagsDropdown] = useState(false);

  // Don't render if no tasks selected
  if (selectedCount === 0) {
    return null;
  }

  // Close all dropdowns
  const closeAllDropdowns = () => {
    setShowStatusDropdown(false);
    setShowReassignDropdown(false);
    setShowTagsDropdown(false);
  };

  // Handle status selection
  const handleStatusSelect = (status) => {
    onStatusChange?.(status);
    setShowStatusDropdown(false);
  };

  // Handle reassign selection
  const handleReassignSelect = (userId) => {
    onReassign?.(userId);
    setShowReassignDropdown(false);
  };

  // Handle tag action
  const handleTagAction = (mode) => {
    onManageTags?.(mode);
    setShowTagsDropdown(false);
  };

  return (
    <div
      className={`
        fixed bottom-0 left-0 right-0 z-40
        bg-white dark:bg-gray-800
        border-t border-gray-200 dark:border-gray-700
        shadow-lg
        transform transition-transform duration-200 ease-out
        ${selectedCount > 0 ? 'translate-y-0' : 'translate-y-full'}
      `}
      role="toolbar"
      aria-label={t('bulk.selected', { count: selectedCount })}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Selection count */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {selectedCount === 1
                ? t('bulk.selected', { count: selectedCount })
                : t('bulk.selectedPlural', { count: selectedCount })}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Delete button */}
            <button
              onClick={onDelete}
              disabled={isProcessing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={t('bulk.delete.button')}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="hidden sm:inline">{t('bulk.delete.button')}</span>
            </button>

            {/* Status dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  closeAllDropdowns();
                  setShowStatusDropdown(!showStatusDropdown);
                }}
                disabled={isProcessing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={t('bulk.status.button')}
                aria-expanded={showStatusDropdown}
                aria-haspopup="listbox"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="hidden sm:inline">{t('bulk.status.button')}</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showStatusDropdown && (
                <div className="absolute bottom-full mb-1 left-0 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                  {Object.values(STATUSES).map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusSelect(status)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {STATUS_LABELS[status]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reassign dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  closeAllDropdowns();
                  setShowReassignDropdown(!showReassignDropdown);
                }}
                disabled={isProcessing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={t('bulk.reassign.button')}
                aria-expanded={showReassignDropdown}
                aria-haspopup="listbox"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="hidden sm:inline">{t('bulk.reassign.button')}</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showReassignDropdown && (
                <div className="absolute bottom-full mb-1 left-0 w-48 max-h-60 overflow-y-auto bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                  {users && users.length > 0 ? (
                    users.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => handleReassignSelect(user.id)}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${user.id === currentUser?.id
                            ? 'text-indigo-600 dark:text-indigo-400 font-medium'
                            : 'text-gray-700 dark:text-gray-300'
                          }`}
                      >
                        {user.displayName || user.identifier}
                        {user.id === currentUser?.id && ' (me)'}
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                      {t('common.noResults')}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tags dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  closeAllDropdowns();
                  setShowTagsDropdown(!showTagsDropdown);
                }}
                disabled={isProcessing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={t('bulk.tags.button')}
                aria-expanded={showTagsDropdown}
                aria-haspopup="menu"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span className="hidden sm:inline">{t('bulk.tags.button')}</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showTagsDropdown && (
                <div className="absolute bottom-full mb-1 left-0 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                  <button
                    onClick={() => handleTagAction('add')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {t('bulk.tags.addTags')}
                  </button>
                  <button
                    onClick={() => handleTagAction('remove')}
                    className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {t('bulk.tags.removeTags')}
                  </button>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-1 hidden sm:block" />

            {/* Clear selection button */}
            <button
              onClick={onClearSelection}
              disabled={isProcessing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={t('bulk.clearSelection')}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span className="hidden sm:inline">{t('bulk.clearSelection')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Processing indicator */}
      {isProcessing && (
        <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 flex items-center justify-center">
          <svg className="animate-spin h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      )}
    </div>
  );
}

export default BulkActionBar;
