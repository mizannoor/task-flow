/**
 * Language Selector Component
 * Dropdown for switching between supported languages
 */

import { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';

/**
 * LanguageSelector - Dropdown to switch application language
 * Displays the current language and allows selection from supported languages
 */
export function LanguageSelector({ className = '' }) {
  const { language, setLanguage, supportedLanguages, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Get current language object
  const currentLanguage = supportedLanguages.find(lang => lang.code === language) || supportedLanguages[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on Escape key
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  const handleLanguageChange = (langCode) => {
    if (langCode !== language) {
      setLanguage(langCode);
    }
    setIsOpen(false);
  };

  const handleKeyDown = (event, langCode) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleLanguageChange(langCode);
    }
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg
          text-gray-700 dark:text-gray-200
          hover:bg-gray-100 dark:hover:bg-gray-700
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          dark:focus:ring-offset-gray-800
          transition-colors duration-200"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={t('settings.language.selectLanguage')}
      >
        {/* Globe Icon */}
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
          />
        </svg>

        <span className="hidden sm:inline">{currentLanguage.nativeName}</span>

        {/* Chevron */}
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-lg
            bg-white dark:bg-gray-800
            shadow-lg ring-1 ring-black ring-opacity-5
            focus:outline-none"
          role="listbox"
          aria-label={t('settings.language.selectLanguage')}
        >
          <div className="py-1">
            {supportedLanguages.map((lang) => (
              <button
                key={lang.code}
                type="button"
                role="option"
                aria-selected={lang.code === language}
                onClick={() => handleLanguageChange(lang.code)}
                onKeyDown={(e) => handleKeyDown(e, lang.code)}
                className={`
                  w-full px-4 py-2 text-left text-sm
                  flex items-center justify-between
                  ${lang.code === language
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                  focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-700
                  transition-colors duration-150
                `}
              >
                <span className="flex flex-col">
                  <span className="font-medium">{lang.nativeName}</span>
                  {lang.nativeName !== lang.englishName && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {lang.englishName}
                    </span>
                  )}
                </span>

                {/* Checkmark for selected language */}
                {lang.code === language && (
                  <svg
                    className="w-4 h-4 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default LanguageSelector;
