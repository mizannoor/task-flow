/**
 * i18n Utility Functions
 * Helper functions for language detection, interpolation, and validation
 */

import { LANGUAGE_STORAGE_KEY, DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from '../utils/constants';

/**
 * Check if a language code is supported
 * @param code - Language code to validate
 * @returns True if the language is supported
 */
export function isValidLanguage(code) {
  return SUPPORTED_LANGUAGES.some(lang => lang.code === code);
}

/**
 * Detect the user's preferred language
 * Priority: localStorage > browser language > default (English)
 * @returns The detected language code
 */
export function detectLanguage() {
  // 1. Check localStorage for saved preference
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored && isValidLanguage(stored)) {
      return stored;
    }
  } catch {
    // localStorage unavailable, continue to browser detection
  }

  // 2. Check browser language
  if (typeof navigator !== 'undefined' && navigator.language) {
    // Extract primary language code (e.g., 'ms-MY' → 'ms')
    const browserLang = navigator.language.split('-')[0].toLowerCase();
    if (isValidLanguage(browserLang)) {
      return browserLang;
    }
  }

  // 3. Fallback to default (English)
  return DEFAULT_LANGUAGE;
}

/**
 * Save language preference to localStorage
 * @param language - Language code to save
 * @returns True if save was successful
 */
export function setStoredLanguage(language) {
  try {
    if (isValidLanguage(language)) {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      return true;
    }
  } catch {
    // localStorage unavailable
    if (process.env.NODE_ENV === 'development') {
      console.warn('Unable to save language preference to localStorage');
    }
  }
  return false;
}

/**
 * Get a nested value from an object using dot notation
 * @param obj - The object to traverse
 * @param path - Dot-notation path (e.g., 'common.loading')
 * @returns The value at the path, or undefined if not found
 */
export function getNestedValue(obj, path) {
  if (!obj || !path) return undefined;
  
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return undefined;
    }
    current = current[key];
  }
  
  return current;
}

/**
 * Interpolate variables into a translation string
 * Replaces {variable} placeholders with provided values
 * @param template - The translation string with placeholders
 * @param params - Object containing variable values
 * @returns The interpolated string
 * 
 * @example
 * interpolate('Hello, {name}!', { name: 'World' })
 * // Returns: 'Hello, World!'
 */
export function interpolate(template, params = {}) {
  if (!template || typeof template !== 'string') {
    return template;
  }
  
  return template.replace(/{(\w+)}/g, (match, key) => {
    const value = params[key];
    return value !== undefined ? String(value) : match;
  });
}

/**
 * Create a translation function for a specific language
 * @param translations - Object containing all translation stores
 * @param language - Current language code
 * @returns A translation function
 */
export function createTranslator(translations, language) {
  return function t(key, params) {
    // Try requested language
    let value = getNestedValue(translations[language], key);
    
    // Fallback to English if key not found in requested language
    if (value === undefined && language !== 'en') {
      value = getNestedValue(translations['en'], key);
      
      if (process.env.NODE_ENV === 'development' && value !== undefined) {
        console.warn(`Missing translation for "${key}" in "${language}"`);
      }
    }
    
    // Last resort: return the key itself
    if (value === undefined) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Missing translation key: "${key}"`);
      }
      return key;
    }
    
    // Apply interpolation if params provided
    return params ? interpolate(value, params) : value;
  };
}

/**
 * Get the native name for a language code
 * @param code - Language code
 * @returns Native name of the language
 */
export function getLanguageNativeName(code) {
  const lang = SUPPORTED_LANGUAGES.find(l => l.code === code);
  return lang ? lang.nativeName : code;
}
