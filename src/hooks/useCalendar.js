/**
 * useCalendar Hook
 * Manages calendar view state including navigation, view mode, and date selection
 * Feature: 007-calendar-view
 */

import { useState, useCallback, useMemo } from 'react';
import {
  CALENDAR_VIEW_MODES,
  CALENDAR_STORAGE_KEY,
  DEFAULT_CALENDAR_PREFERENCES,
} from '../utils/constants';
import {
  getMonthGrid,
  getWeekGrid,
  getDayView,
  addMonths,
  addWeeks,
  addDays,
  formatCalendarHeader,
} from '../utils/dateUtils';

/**
 * Load calendar preferences from localStorage
 * @returns {Object} - Stored preferences or defaults
 */
function loadPreferences() {
  try {
    const stored = localStorage.getItem(CALENDAR_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...DEFAULT_CALENDAR_PREFERENCES,
        ...parsed,
      };
    }
  } catch (error) {
    console.warn('Failed to load calendar preferences:', error);
  }
  return DEFAULT_CALENDAR_PREFERENCES;
}

/**
 * Save calendar preferences to localStorage
 * @param {Object} prefs - Preferences to save
 */
function savePreferences(prefs) {
  try {
    localStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(prefs));
  } catch (error) {
    console.warn('Failed to save calendar preferences:', error);
  }
}

/**
 * Custom hook for calendar state management
 * @param {Date} [initialDate] - Initial date to display (defaults to today)
 * @returns {Object} - Calendar state and actions
 */
export function useCalendar(initialDate = new Date()) {
  // Load persisted preferences
  const storedPrefs = useMemo(() => loadPreferences(), []);

  // State
  const [viewMode, setViewModeState] = useState(storedPrefs.viewMode);
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [selectedDate, setSelectedDate] = useState(null);
  const [sidebarOpen, setSidebarOpenState] = useState(storedPrefs.sidebarOpen);

  // Persist view mode changes
  const setViewMode = useCallback((mode) => {
    if (Object.values(CALENDAR_VIEW_MODES).includes(mode)) {
      setViewModeState(mode);
      const prefs = loadPreferences();
      savePreferences({ ...prefs, viewMode: mode });
    }
  }, []);

  // Persist sidebar state changes
  const setSidebarOpen = useCallback((open) => {
    setSidebarOpenState(open);
    const prefs = loadPreferences();
    savePreferences({ ...prefs, sidebarOpen: open });
  }, []);

  // Toggle sidebar
  const toggleSidebar = useCallback(() => {
    setSidebarOpen(!sidebarOpen);
  }, [sidebarOpen, setSidebarOpen]);

  // Navigate to previous period based on current view mode
  const goToPrevious = useCallback(() => {
    setCurrentDate((prev) => {
      switch (viewMode) {
        case CALENDAR_VIEW_MODES.MONTH:
          return addMonths(prev, -1);
        case CALENDAR_VIEW_MODES.WEEK:
          return addWeeks(prev, -1);
        case CALENDAR_VIEW_MODES.DAY:
          return addDays(prev, -1);
        default:
          return addMonths(prev, -1);
      }
    });
  }, [viewMode]);

  // Navigate to next period based on current view mode
  const goToNext = useCallback(() => {
    setCurrentDate((prev) => {
      switch (viewMode) {
        case CALENDAR_VIEW_MODES.MONTH:
          return addMonths(prev, 1);
        case CALENDAR_VIEW_MODES.WEEK:
          return addWeeks(prev, 1);
        case CALENDAR_VIEW_MODES.DAY:
          return addDays(prev, 1);
        default:
          return addMonths(prev, 1);
      }
    });
  }, [viewMode]);

  // Navigate to today
  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  // Select a specific date
  const selectDate = useCallback((date) => {
    setSelectedDate(date);
  }, []);

  // Navigate to a specific date
  const goToDate = useCallback((date) => {
    setCurrentDate(new Date(date));
  }, []);

  // Get month grid data for the current date
  const monthGrid = useMemo(() => {
    return getMonthGrid(currentDate.getFullYear(), currentDate.getMonth());
  }, [currentDate]);

  // Get week grid data for the current date
  const weekGrid = useMemo(() => {
    return getWeekGrid(currentDate);
  }, [currentDate]);

  // Get day view data for the current date
  const dayViewData = useMemo(() => {
    return getDayView(currentDate);
  }, [currentDate]);

  // Get formatted header text based on view mode
  const headerText = useMemo(() => {
    return formatCalendarHeader(currentDate, viewMode);
  }, [currentDate, viewMode]);

  // Get grid data based on current view mode
  const getGridData = useCallback(() => {
    switch (viewMode) {
      case CALENDAR_VIEW_MODES.MONTH:
        return monthGrid;
      case CALENDAR_VIEW_MODES.WEEK:
        return weekGrid;
      case CALENDAR_VIEW_MODES.DAY:
        return dayViewData;
      default:
        return monthGrid;
    }
  }, [viewMode, monthGrid, weekGrid, dayViewData]);

  return {
    // State
    state: {
      viewMode,
      currentDate,
      selectedDate,
      sidebarOpen,
    },

    // Navigation actions
    goToPrevious,
    goToNext,
    goToToday,
    goToDate,

    // Selection actions
    selectDate,

    // View mode actions
    setViewMode,

    // Sidebar actions
    setSidebarOpen,
    toggleSidebar,

    // Grid data
    monthGrid,
    weekGrid,
    dayViewData,
    getGridData,

    // Header text
    headerText,
  };
}

export default useCalendar;
