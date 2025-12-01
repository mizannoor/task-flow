/**
 * EmptyState Component
 * Displays a placeholder message when there's no content to show
 */

/**
 * EmptyState component
 * @param {object} props
 * @param {string} props.title - Main message
 * @param {string} props.description - Secondary description
 * @param {React.ReactNode} props.icon - Custom icon (optional)
 * @param {React.ReactNode} props.action - Action button or link
 * @param {string} props.variant - Style variant: 'default' | 'compact' | 'inline'
 */
export function EmptyState({
  title = 'No items',
  description,
  icon,
  action,
  variant = 'default',
}) {
  // Variant classes
  const variantClasses = {
    default: 'py-12',
    compact: 'py-6',
    inline: 'py-4',
  };

  // Default icon
  const defaultIcon = (
    <svg
      className="mx-auto h-12 w-12 text-gray-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      />
    </svg>
  );

  return (
    <div className={`text-center ${variantClasses[variant]}`}>
      {/* Icon */}
      <div className="mb-4">{icon || defaultIcon}</div>

      {/* Title */}
      <h3 className="text-sm font-medium text-gray-900">{title}</h3>

      {/* Description */}
      {description && (
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      )}

      {/* Action */}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/**
 * TaskEmptyState - Specific empty state for task list
 */
export function TaskEmptyState({ onCreateTask }) {
  return (
    <EmptyState
      icon={
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
      }
      title="No tasks yet"
      description="Get started by creating a new task."
      action={
        onCreateTask && (
          <button
            type="button"
            onClick={onCreateTask}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg
              className="-ml-1 mr-2 h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            New Task
          </button>
        )
      }
    />
  );
}

/**
 * SearchEmptyState - Specific empty state for search results
 */
export function SearchEmptyState({ searchQuery, onClearSearch }) {
  return (
    <EmptyState
      icon={
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      }
      title="No results found"
      description={
        searchQuery
          ? `No tasks match "${searchQuery}". Try a different search term.`
          : 'No tasks match your current filters.'
      }
      action={
        onClearSearch && (
          <button
            type="button"
            onClick={onClearSearch}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Clear filters
          </button>
        )
      }
    />
  );
}

/**
 * FilterEmptyState - Empty state when no tasks match filters
 */
export function FilterEmptyState({ onClearFilters }) {
  return (
    <EmptyState
      icon={
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
      }
      title="No matching tasks"
      description="No tasks match your current filters. Try adjusting your filters."
      action={
        onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Clear all filters
          </button>
        )
      }
    />
  );
}

export default EmptyState;
