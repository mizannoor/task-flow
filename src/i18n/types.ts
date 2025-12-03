/**
 * i18n Type Definitions
 * TypeScript interfaces for the internationalization system
 */

// Supported language codes
export type SupportedLanguage = 'en' | 'ms';

// Parameters for string interpolation
export interface TranslationParams {
  [key: string]: string | number;
}

// Translation function signature
export type TranslationFunction = (
  key: string,
  params?: TranslationParams
) => string;

// Language option for dropdown selector
export interface LanguageOption {
  code: SupportedLanguage;
  nativeName: string;
  englishName: string;
}

// Language Context value shape
export interface LanguageContextValue {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: TranslationFunction;
}

// Translation store structure (matches en.ts and ms.ts exports)
export interface TranslationStore {
  common: Record<string, string>;
  auth: Record<string, string>;
  tasks: Record<string, string>;
  priorities: Record<string, string>;
  statuses: Record<string, string>;
  categories: Record<string, string>;
  kanban: Record<string, string>;
  focus: Record<string, string>;
  calendar: Record<string, string>;
  timer: Record<string, string>;
  analytics: {
    personal: Record<string, string>;
    team: Record<string, string>;
    dateRanges: Record<string, string>;
  };
  settings: {
    theme: Record<string, string>;
    language: Record<string, string>;
    shortcuts: Record<string, string>;
  };
  errors: Record<string, string>;
  toast: Record<string, string>;
  sort: Record<string, string>;
  views: Record<string, string>;
  ai: Record<string, string>;
}
