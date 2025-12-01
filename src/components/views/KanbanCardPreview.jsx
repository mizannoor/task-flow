/**
 * KanbanCardPreview Component
 * Hover preview popup showing extended task details
 */

import { useEffect, useRef, memo } from 'react';
import { createPortal } from 'react-dom';
import { formatDuration, formatDate } from '../../utils/formatters';

/**
 * KanbanCardPreview component
 * @param {object} props
 * @param {object} props.task - Task data to display in preview
 * @param {object} props.position - Position to render preview { x, y }
 * @param {Function} props.onClose - Callback when preview should close
 */
function KanbanCardPreviewComponent({ task, position, onClose }) {
  const previewRef = useRef(null);

  // Adjust position to keep preview in viewport
  useEffect(() => {
    if (!previewRef.current) return;

    const preview = previewRef.current;
    const rect = preview.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let adjustedX = position.x;
    let adjustedY = position.y;

    // Adjust horizontal position if overflowing right
    if (rect.right > viewportWidth - 16) {
      adjustedX = position.x - rect.width - 16; // Show on left side instead
    }

    // Adjust vertical position if overflowing bottom
    if (rect.bottom > viewportHeight - 16) {
      adjustedY = viewportHeight - rect.height - 16;
    }

    // Ensure not off-screen top or left
    adjustedX = Math.max(16, adjustedX);
    adjustedY = Math.max(16, adjustedY);

    preview.style.left = `${adjustedX}px`;
    preview.style.top = `${adjustedY}px`;
  }, [position]);

  if (!task) return null;

  const previewContent = (
    <div
      ref={previewRef}
      className="absolute z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-72 max-w-xs pointer-events-none"
      style={{
        left: position.x,
        top: position.y,
      }}
      role="tooltip"
      aria-label={`Preview for task: ${task.taskName}`}
    >
      {/* Task name */}
      <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
        {task.taskName}
      </h4>

      {/* Description */}
      {task.description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-3">
          {task.description}
        </p>
      )}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="mb-3">
          <div className="flex flex-wrap gap-1">
            {task.tags.slice(0, 5).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
              >
                {tag}
              </span>
            ))}
            {task.tags.length > 5 && (
              <span className="text-xs text-gray-500">
                +{task.tags.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Duration info */}
      <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Est: {formatDuration(task.estimatedDuration)}</span>
        </div>
        {task.actualDuration > 0 && (
          <div className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Actual: {formatDuration(task.actualDuration)}</span>
          </div>
        )}
      </div>

      {/* Created date */}
      <div className="text-xs text-gray-400 mt-2">
        Created {formatDate(task.createdAt, { relative: true })}
      </div>
    </div>
  );

  // Render via portal to ensure proper positioning
  return createPortal(previewContent, document.body);
}

export const KanbanCardPreview = memo(KanbanCardPreviewComponent);

export default KanbanCardPreview;
