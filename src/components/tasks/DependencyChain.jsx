/**
 * DependencyChain Component
 * Visual tree representation of upstream and downstream task dependencies
 */

import { useState, useMemo } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useDependencies } from '../../hooks/useDependencies';
import { useTasks } from '../../hooks/useTasks';
import { Modal } from '../ui/Modal';
import { STATUS_COLORS, STATUSES } from '../../utils/constants';
import {
  getUpstreamDependencies,
  getDownstreamDependencies,
} from '../../utils/dependencyUtils';

/**
 * DependencyChain component
 * @param {object} props
 * @param {string} props.taskId - The task ID to show dependencies for
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Callback when modal closes
 * @param {Function} props.onTaskClick - Callback when a task in the chain is clicked
 */
export function DependencyChain({
  taskId,
  isOpen,
  onClose,
  onTaskClick,
}) {
  const { t } = useTranslation();
  const { allTasks: tasks } = useTasks();
  const {
    dependencies,
    loading,
    error,
  } = useDependencies(taskId);

  const [activeTab, setActiveTab] = useState('upstream');

  // Get the current task
  const currentTask = useMemo(() => {
    return tasks.find((t) => t.id === taskId);
  }, [tasks, taskId]);

  // Compute upstream dependencies (recursive)
  const upstreamChain = useMemo(() => {
    if (!taskId || !dependencies) return [];
    return getUpstreamDependencies(taskId, dependencies, tasks);
  }, [taskId, dependencies, tasks]);

  // Compute downstream dependencies (recursive)
  const downstreamChain = useMemo(() => {
    if (!taskId || !dependencies) return [];
    return getDownstreamDependencies(taskId, dependencies, tasks);
  }, [taskId, dependencies, tasks]);

  // Handle task click in the chain
  const handleTaskClick = (clickedTaskId) => {
    if (onTaskClick) {
      onClose();
      onTaskClick(clickedTaskId);
    }
  };

  if (!currentTask) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('dependencies.chainTitle', 'Dependency Chain')}
      size="lg"
    >
      <div className="space-y-4">
        {/* Current Task Header */}
        <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg border-2 border-indigo-300 dark:border-indigo-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-indigo-900 dark:text-indigo-100">
                  {t('dependencies.currentTask', 'Current Task')}
                </p>
                <p className="text-sm text-indigo-700 dark:text-indigo-300 truncate max-w-xs">
                  {currentTask.taskName}
                </p>
              </div>
            </div>
            <TaskStatusBadge status={currentTask.status} />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setActiveTab('upstream')}
            className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'upstream'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              {t('dependencies.upstream', 'Blocked By')}
              {upstreamChain.length > 0 && (
                <span className="px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 rounded-full">
                  {upstreamChain.length}
                </span>
              )}
            </div>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('downstream')}
            className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'downstream'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
              {t('dependencies.downstream', 'Blocks')}
              {downstreamChain.length > 0 && (
                <span className="px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 rounded-full">
                  {downstreamChain.length}
                </span>
              )}
            </div>
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <svg className="w-6 h-6 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
              {t('common.loading', 'Loading...')}
            </span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400">
              {error.message || t('common.errorGeneric', 'An error occurred')}
            </p>
          </div>
        )}

        {/* Chain Content */}
        {!loading && !error && (
          <div className="max-h-80 overflow-y-auto">
            {activeTab === 'upstream' ? (
              <DependencyTree
                items={upstreamChain}
                emptyMessage={t('dependencies.noUpstream', 'No blocking dependencies')}
                direction="up"
                onTaskClick={handleTaskClick}
              />
            ) : (
              <DependencyTree
                items={downstreamChain}
                emptyMessage={t('dependencies.noDownstream', 'Does not block any tasks')}
                direction="down"
                onTaskClick={handleTaskClick}
              />
            )}
          </div>
        )}

        {/* Legend */}
        <div className="pt-3 border-t border-gray-200 dark:border-slate-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            {t('dependencies.legend', 'Legend:')}
          </p>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {t('status.completed', 'Completed')}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {t('status.in_progress', 'In Progress')}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {t('status.pending', 'Pending')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

/**
 * DependencyTree component - renders the tree visualization
 */
function DependencyTree({ items, emptyMessage, onTaskClick }) {
  if (items.length === 0) {
    return (
      <div className="py-8 text-center">
        <svg
          className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
        <p className="text-sm text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <DependencyTreeNode
          key={`${item.task.id}-${index}`}
          item={item}
          onTaskClick={onTaskClick}
        />
      ))}
    </div>
  );
}

/**
 * DependencyTreeNode component - single node in the tree
 */
function DependencyTreeNode({ item, onTaskClick }) {
  const { task, depth } = item;
  const isCompleted = task.status === STATUSES.COMPLETED;

  // Calculate indent based on depth
  const indentPx = (depth - 1) * 24;

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case STATUSES.COMPLETED:
        return 'bg-green-500';
      case STATUSES.IN_PROGRESS:
        return 'bg-blue-500';
      default:
        return 'bg-yellow-500';
    }
  };

  return (
    <div
      style={{ marginLeft: `${indentPx}px` }}
      className="relative"
    >
      {/* Connector line */}
      {depth > 1 && (
        <div
          className="absolute left-[-12px] top-1/2 w-3 h-px bg-gray-300 dark:bg-gray-600"
          style={{ transform: 'translateY(-50%)' }}
        />
      )}

      {/* Task node */}
      <button
        type="button"
        onClick={() => onTaskClick(task.id)}
        className={`w-full p-2 rounded-lg text-left transition-colors flex items-center gap-2 ${isCompleted
            ? 'bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30'
            : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
      >
        {/* Status indicator */}
        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${getStatusColor(task.status)}`} />

        {/* Task info */}
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm truncate ${isCompleted
                ? 'text-gray-500 dark:text-gray-400 line-through'
                : 'text-gray-900 dark:text-gray-100'
              }`}
            title={task.taskName}
          >
            {task.taskName}
          </p>
        </div>

        {/* Depth indicator */}
        {depth > 1 && (
          <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
            L{depth}
          </span>
        )}

        {/* Navigate icon */}
        <svg
          className="w-4 h-4 text-gray-400 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  );
}

/**
 * TaskStatusBadge component - compact status badge
 */
function TaskStatusBadge({ status }) {
  const getStatusStyles = () => {
    switch (status) {
      case STATUSES.COMPLETED:
        return 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300';
      case STATUSES.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-300';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-300';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case STATUSES.COMPLETED:
        return 'Completed';
      case STATUSES.IN_PROGRESS:
        return 'In Progress';
      default:
        return 'Pending';
    }
  };

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusStyles()}`}>
      {getStatusLabel()}
    </span>
  );
}

export default DependencyChain;
