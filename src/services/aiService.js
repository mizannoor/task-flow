/**
 * AI Service
 * Google Gemini API integration for task analysis
 */

import {
  AI_CONFIG,
  AI_DEFAULTS,
  AI_ERROR_MESSAGES,
  AI_ANALYSIS_PROMPT,
  PRIORITIES,
  CATEGORIES,
} from '../utils/constants';

// Get API key from environment variable
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

/**
 * Check if AI service is configured with a valid API key
 * @returns {boolean} - True if API key is present
 */
export function isConfigured() {
  return Boolean(API_KEY && API_KEY.trim().length > 0);
}

/**
 * Get default suggestion values when AI is unavailable
 * @param {string} [reason] - Reason for using defaults (offline, timeout, etc.)
 * @returns {object} - Default suggestion object
 */
export function getDefaults(reason = 'default') {
  const reasoningMap = {
    offline: AI_DEFAULTS.REASONING_OFFLINE,
    timeout: AI_DEFAULTS.REASONING_TIMEOUT,
    default: AI_DEFAULTS.REASONING_DEFAULT,
  };

  return {
    complexity: AI_DEFAULTS.COMPLEXITY,
    priority: AI_DEFAULTS.PRIORITY,
    category: AI_DEFAULTS.CATEGORY,
    tags: [...AI_DEFAULTS.TAGS],
    estimatedDuration: AI_DEFAULTS.ESTIMATED_DURATION,
    reasoning: reasoningMap[reason] || AI_DEFAULTS.REASONING_DEFAULT,
    isAISuggested: false,
    timestamp: new Date(),
    fallbackReason: reason,
  };
}

/**
 * Truncate description to maximum allowed length
 * @param {string} description - Task description
 * @param {number} [maxLength] - Maximum length (default: 2000)
 * @returns {string} - Truncated description
 */
export function truncateDescription(description, maxLength = AI_CONFIG.MAX_DESCRIPTION_LENGTH) {
  if (!description || description.length <= maxLength) {
    return description || '';
  }

  // Find last space before maxLength to avoid cutting mid-word
  const truncated = description.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  // Use word boundary if it's reasonably close to the limit (80%+)
  return lastSpace > maxLength * 0.8 ? truncated.slice(0, lastSpace) : truncated;
}

/**
 * Build the analysis prompt with task details
 * @param {string} taskName - Task name to analyze
 * @param {string} [description] - Task description (optional)
 * @returns {string} - Formatted prompt
 */
export function buildPrompt(taskName, description = '') {
  const truncatedDescription = truncateDescription(description);
  
  return AI_ANALYSIS_PROMPT
    .replace('{taskName}', taskName)
    .replace('{description}', truncatedDescription || 'No description provided');
}

/**
 * Validate complexity value
 * @param {unknown} value - Value to validate
 * @returns {number} - Valid complexity (1-10) or default
 */
function validateComplexity(value) {
  const num = Number(value);
  if (Number.isInteger(num) && num >= 1 && num <= 10) {
    return num;
  }
  return AI_DEFAULTS.COMPLEXITY;
}

/**
 * Validate priority value
 * @param {unknown} value - Value to validate
 * @returns {string} - Valid priority or default
 */
function validatePriority(value) {
  const validPriorities = Object.values(PRIORITIES);
  if (typeof value === 'string' && validPriorities.includes(value.toLowerCase())) {
    return value.toLowerCase();
  }
  return AI_DEFAULTS.PRIORITY;
}

/**
 * Validate category value
 * @param {unknown} value - Value to validate
 * @returns {string} - Valid category or default
 */
function validateCategory(value) {
  const validCategories = Object.values(CATEGORIES);
  if (typeof value === 'string' && validCategories.includes(value.toLowerCase())) {
    return value.toLowerCase();
  }
  return AI_DEFAULTS.CATEGORY;
}

/**
 * Validate tags array
 * @param {unknown} value - Value to validate
 * @returns {string[]} - Valid tags array (2-5 items) or default
 */
function validateTags(value) {
  if (!Array.isArray(value)) {
    return [...AI_DEFAULTS.TAGS];
  }

  // Filter to valid string tags and limit to 5
  const validTags = value
    .filter((tag) => typeof tag === 'string' && tag.trim().length > 0)
    .map((tag) => tag.trim().slice(0, 30)) // Max 30 chars per tag
    .slice(0, 5); // Max 5 tags

  return validTags;
}

/**
 * Validate duration value
 * @param {unknown} value - Value to validate
 * @returns {number} - Valid duration in minutes or default
 */
function validateDuration(value) {
  const num = Number(value);
  if (Number.isFinite(num) && num >= 1 && num <= 99999) {
    return Math.round(num);
  }
  return AI_DEFAULTS.ESTIMATED_DURATION;
}

/**
 * Parse and validate Gemini API response
 * @param {object} data - Raw API response
 * @returns {object} - Validated suggestion object or defaults
 */
export function parseResponse(data) {
  try {
    // Extract text from Gemini response structure
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Extract JSON even if wrapped in markdown code blocks
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn('AI response did not contain valid JSON');
      return getDefaults('parse_error');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      complexity: validateComplexity(parsed.complexity),
      priority: validatePriority(parsed.priority),
      category: validateCategory(parsed.category),
      tags: validateTags(parsed.tags),
      estimatedDuration: validateDuration(parsed.estimatedDuration),
      reasoning: typeof parsed.reasoning === 'string' && parsed.reasoning.trim()
        ? parsed.reasoning.trim()
        : 'Analysis complete',
      isAISuggested: true,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    return getDefaults('parse_error');
  }
}

/**
 * Analyze a task using Google Gemini AI
 * @param {string} taskName - Task name to analyze
 * @param {string} [description] - Task description (optional)
 * @returns {Promise<object>} - AI suggestions or defaults
 */
export async function analyzeTask(taskName, description = '') {
  // Check if API is configured
  if (!isConfigured()) {
    return {
      ...getDefaults('not_configured'),
      error: AI_ERROR_MESSAGES.NOT_CONFIGURED,
    };
  }

  // Check if offline
  if (!navigator.onLine) {
    return {
      ...getDefaults('offline'),
      error: AI_ERROR_MESSAGES.OFFLINE,
    };
  }

  // Setup abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), AI_CONFIG.TIMEOUT_MS);

  try {
    const prompt = buildPrompt(taskName, description);

    const response = await fetch(`${AI_CONFIG.ENDPOINT}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: AI_CONFIG.TEMPERATURE,
          maxOutputTokens: AI_CONFIG.MAX_TOKENS,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle rate limiting
    if (response.status === 429) {
      return {
        ...getDefaults('rate_limit'),
        error: AI_ERROR_MESSAGES.RATE_LIMIT,
      };
    }

    // Handle invalid API key
    if (response.status === 401 || response.status === 403) {
      return {
        ...getDefaults('invalid_key'),
        error: AI_ERROR_MESSAGES.NOT_CONFIGURED,
      };
    }

    // Handle other API errors
    if (!response.ok) {
      console.error(`AI API error: ${response.status} ${response.statusText}`);
      return {
        ...getDefaults('api_error'),
        error: AI_ERROR_MESSAGES.GENERIC,
      };
    }

    const data = await response.json();
    return parseResponse(data);
  } catch (error) {
    clearTimeout(timeoutId);

    // Handle timeout
    if (error.name === 'AbortError') {
      return {
        ...getDefaults('timeout'),
        error: AI_ERROR_MESSAGES.TIMEOUT,
      };
    }

    // Handle network errors
    console.error('AI analysis failed:', error);
    return {
      ...getDefaults('network_error'),
      error: AI_ERROR_MESSAGES.GENERIC,
    };
  }
}

export default {
  isConfigured,
  getDefaults,
  truncateDescription,
  buildPrompt,
  parseResponse,
  analyzeTask,
};
