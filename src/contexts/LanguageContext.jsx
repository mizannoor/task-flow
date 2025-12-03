/**
 * Language Context
 * Provides internationalization (i18n) state and translation function
 * throughout the application
 */

import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { translations, detectLanguage, setStoredLanguage, createTranslator, getLanguageNativeName } from '../i18n';
import { SUPPORTED_LANGUAGES } from '../utils/constants';

// Create context with default values
const LanguageContext = createContext({
  language: 'en',
  setLanguage: () => { },
  t: (key) => key,
  supportedLanguages: SUPPORTED_LANGUAGES,
});

/**
 * Language Provider Component
 * Wraps the application to provide language context
 */
export function LanguageProvider({ children }) {
  // Initialize language from detection (localStorage > browser > default)
  const [language, setLanguageState] = useState(() => detectLanguage());

  // Create memoized translator function
  const t = useMemo(
    () => createTranslator(translations, language),
    [language]
  );

  // Handle language change with persistence
  const setLanguage = useCallback((newLanguage) => {
    if (newLanguage !== language) {
      setLanguageState(newLanguage);
      setStoredLanguage(newLanguage);
    }
  }, [language]);

  // Sync HTML lang attribute
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      language,
      setLanguage,
      t,
      supportedLanguages: SUPPORTED_LANGUAGES,
      getLanguageNativeName,
    }),
    [language, setLanguage, t]
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Hook to access language context
 * @returns {Object} Language context value
 */
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Export context for advanced usage
export { LanguageContext };

export default LanguageProvider;
