/**
 * useTranslation Hook
 * Provides easy access to the translation function and language state
 */

import { useLanguage } from '../contexts/LanguageContext';

/**
 * Hook for accessing translations in components
 * @returns {Object} Translation utilities
 * @returns {Function} t - Translation function: t('key') or t('key', { param: value })
 * @returns {string} language - Current language code ('en' or 'ms')
 * @returns {Function} setLanguage - Function to change language
 * @returns {Array} supportedLanguages - Array of supported language objects
 * 
 * @example
 * function MyComponent() {
 *   const { t, language, setLanguage } = useTranslation();
 *   return <h1>{t('tasks.myTasks')}</h1>;
 * }
 */
export function useTranslation() {
  const { t, language, setLanguage, supportedLanguages, getLanguageNativeName } = useLanguage();

  return {
    t,
    language,
    setLanguage,
    supportedLanguages,
    getLanguageNativeName,
  };
}

export default useTranslation;
