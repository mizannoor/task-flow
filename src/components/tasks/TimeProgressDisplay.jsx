/**
 * TimeProgressDisplay Component
 * Shows tracked time vs estimated time with visual progress indicator
 */

import { formatDurationComparison, getTimeStatusColor } from '../../utils/formatters';

/**
 * TimeProgressDisplay component
 * @param {object} props
 * @param {number} props.actualMinutes - Actual tracked time in minutes
 * @param {number} props.estimatedMinutes - Estimated time in minutes
 * @param {string} [props.variant='default'] - Display variant: 'default' | 'compact' | 'bar'
 * @param {string} [props.className] - Additional CSS classes
 */
export function TimeProgressDisplay({ 
  actualMinutes = 0, 
  estimatedMinutes = 0, 
  variant = 'default',
  className = '' 
}) {
  const comparison = formatDurationComparison(actualMinutes, estimatedMinutes);
  
  // Don't render anything if no time data
  if (actualMinutes <= 0 && estimatedMinutes <= 0) {
    return null;
  }

  // Compact variant - inline text only
  if (variant === 'compact') {
    const colorClass = getTimeStatusColor(actualMinutes, estimatedMinutes);
    return (
      <span className={`text-xs font-medium ${colorClass} ${className}`}>
        {comparison.display}
      </span>
    );
  }

  // Bar variant - with progress bar
  if (variant === 'bar') {
    const progressPercent = comparison.percentage !== null 
      ? Math.min(100, comparison.percentage) 
      : 0;
    
    const barColor = 
      comparison.status === 'under' ? 'bg-green-500' :
      comparison.status === 'on-track' ? 'bg-yellow-500' :
      comparison.status === 'over' ? 'bg-red-500' :
      'bg-gray-300';

    return (
      <div className={`space-y-1 ${className}`}>
        <div className="flex justify-between text-xs">
          <span className="text-gray-500">Time Progress</span>
          <span className={getTimeStatusColor(actualMinutes, estimatedMinutes)}>
            {comparison.percentage !== null ? `${comparison.percentage}%` : '—'}
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${barColor} transition-all duration-300`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>{comparison.actualFormatted}</span>
          <span>{comparison.estimatedFormatted}</span>
        </div>
      </div>
    );
  }

  // Default variant - text with icon
  const iconColor = 
    comparison.status === 'under' ? 'text-green-500' :
    comparison.status === 'on-track' ? 'text-yellow-500' :
    comparison.status === 'over' ? 'text-red-500' :
    'text-gray-400';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Status icon */}
      <div className={`flex-shrink-0 ${iconColor}`}>
        {comparison.status === 'under' && (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        {comparison.status === 'on-track' && (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        {comparison.status === 'over' && (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        )}
        {comparison.status === 'no-estimate' && (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </div>

      {/* Time display */}
      <div className="flex flex-col">
        <span className={`text-sm font-medium ${getTimeStatusColor(actualMinutes, estimatedMinutes)}`}>
          {comparison.display}
        </span>
        {comparison.status !== 'no-estimate' && (
          <span className="text-xs text-gray-500">
            {comparison.status === 'under' && 'Under estimate'}
            {comparison.status === 'on-track' && 'On track'}
            {comparison.status === 'over' && 'Over estimate'}
          </span>
        )}
      </div>
    </div>
  );
}

export default TimeProgressDisplay;
