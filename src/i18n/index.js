/**
 * i18n Module
 * Internationalization infrastructure for TaskFlow
 */

// Translation files
import { en } from './locales/en';
import { ms } from './locales/ms';

// Utility functions
export {
  detectLanguage,
  setStoredLanguage,
  isValidLanguage,
  getNestedValue,
  interpolate,
  createTranslator,
  getLanguageNativeName,
} from './utils';

// All translations
export const translations = {
  en,
  ms,
};

// Re-export individual translations for direct access
export { en, ms };

// Default export
export default translations;
