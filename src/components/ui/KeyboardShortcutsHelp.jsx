/**
 * KeyboardShortcutsHelp Component
 * Modal overlay displaying all available keyboard shortcuts
 */

import { useEffect, useRef } from 'react';
import { useShortcutsByCategory } from '../../hooks/useKeyboardShortcuts';
import { formatShortcut } from '../../utils/platformUtils';

/**
 * Keyboard Shortcuts Help Modal
 */
export function KeyboardShortcutsHelp({ isOpen, onClose }) {
  const categories = useShortcutsByCategory();
  const modalRef = useRef(null);

  // Focus trap and escape handling
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    // Focus the modal when it opens
    modalRef.current?.focus();

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="keyboard-shortcuts-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          ref={modalRef}
          tabIndex={-1}
          className="relative transform overflow-hidden rounded-xl bg-white shadow-2xl transition-all w-full max-w-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2
              id="keyboard-shortcuts-title"
              className="text-lg font-semibold text-gray-900"
            >
              Keyboard Shortcuts
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              aria-label="Close"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-6">
              {categories.map(({ category, label, shortcuts }) => (
                <div key={category}>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                    {label}
                  </h3>
                  <div className="bg-gray-50 rounded-lg divide-y divide-gray-200">
                    {shortcuts.map((shortcut) => (
                      <div
                        key={shortcut.action}
                        className="flex items-center justify-between px-4 py-3"
                      >
                        <span className="text-sm text-gray-700">
                          {shortcut.description}
                        </span>
                        <kbd className="inline-flex items-center px-2.5 py-1.5 rounded bg-white border border-gray-300 text-xs font-mono font-semibold text-gray-800 shadow-sm">
                          {formatShortcut(shortcut)}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-500 text-center">
              Press <kbd className="px-1.5 py-0.5 rounded bg-white border border-gray-300 text-xs font-mono">Esc</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-white border border-gray-300 text-xs font-mono">{formatShortcut({ key: '/', modifiers: ['ctrl'] })}</kbd> to close
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default KeyboardShortcutsHelp;
