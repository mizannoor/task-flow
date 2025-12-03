/**
 * UserSwitcher Component
 * Dropdown for switching between user accounts
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../hooks/useTranslation';

// Keyboard navigation keys
const KEYS = {
  ARROW_DOWN: 'ArrowDown',
  ARROW_UP: 'ArrowUp',
  ESCAPE: 'Escape',
  ENTER: 'Enter',
  SPACE: ' ',
  TAB: 'Tab',
};

export function UserSwitcher() {
  const {
    currentUser,
    users,
    logout,
    switchUser,
    addAccount,
    isLoading,
  } = useAuth();
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newIdentifier, setNewIdentifier] = useState('');
  const [addError, setAddError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const menuItemsRef = useRef([]);
  const addInputRef = useRef(null);
  const searchInputRef = useRef(null);

  // Filter out current user from the list
  const otherUsers = users.filter(user => user.id !== currentUser?.id);

  // Filter users by search query
  const filteredUsers = searchQuery.trim()
    ? otherUsers.filter(user =>
      user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.identifier.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : otherUsers;

  // Show search when there are 5+ other users
  const showSearch = otherUsers.length >= 5;

  /**
   * Toggle dropdown open/close
   */
  const toggleDropdown = useCallback(() => {
    setIsOpen(prev => !prev);
    setFocusedIndex(-1);
    setShowAddForm(false);
    setNewIdentifier('');
    setAddError(null);
    setSearchQuery('');
  }, []);

  /**
   * Close dropdown
   */
  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setFocusedIndex(-1);
    setShowAddForm(false);
    setNewIdentifier('');
    setAddError(null);
    setSearchQuery('');
    buttonRef.current?.focus();
  }, []);

  /**
   * Handle switching to another user
   */
  const handleSwitchUser = useCallback(async (userId) => {
    try {
      await switchUser(userId);
      closeDropdown();
    } catch (error) {
      console.error('Error switching user:', error);
    }
  }, [switchUser, closeDropdown]);

  /**
   * Handle logout
   */
  const handleLogout = useCallback(() => {
    logout();
    closeDropdown();
  }, [logout, closeDropdown]);

  /**
   * Handle adding a new account
   */
  const handleAddAccount = useCallback(async (e) => {
    e.preventDefault();
    setAddError(null);

    if (!newIdentifier.trim()) {
      setAddError(t('errors.identifierRequired'));
      return;
    }

    try {
      await addAccount(newIdentifier);
      closeDropdown();
    } catch (error) {
      setAddError(error.message);
    }
  }, [newIdentifier, addAccount, closeDropdown]);

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = useCallback((e) => {
    if (!isOpen) {
      if (e.key === KEYS.ARROW_DOWN || e.key === KEYS.ENTER || e.key === KEYS.SPACE) {
        e.preventDefault();
        setIsOpen(true);
        setFocusedIndex(0);
      }
      return;
    }

    switch (e.key) {
      case KEYS.ESCAPE:
        e.preventDefault();
        closeDropdown();
        break;

      case KEYS.ARROW_DOWN:
        e.preventDefault();
        setFocusedIndex(prev => {
          const maxIndex = filteredUsers.length + 1; // +1 for logout, +1 for add if shown
          return prev < maxIndex ? prev + 1 : 0;
        });
        break;

      case KEYS.ARROW_UP:
        e.preventDefault();
        setFocusedIndex(prev => {
          const maxIndex = filteredUsers.length + 1;
          return prev > 0 ? prev - 1 : maxIndex;
        });
        break;

      case KEYS.ENTER:
      case KEYS.SPACE:
        e.preventDefault();
        if (focusedIndex >= 0 && menuItemsRef.current[focusedIndex]) {
          menuItemsRef.current[focusedIndex].click();
        }
        break;

      case KEYS.TAB:
        closeDropdown();
        break;

      default:
        break;
    }
  }, [isOpen, focusedIndex, filteredUsers.length, closeDropdown]);

  /**
   * Handle click outside to close dropdown
   */
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeDropdown();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, closeDropdown]);

  /**
   * Focus the search input when dropdown opens and search is shown
   */
  useEffect(() => {
    if (isOpen && showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, showSearch]);

  /**
   * Focus the add input when form is shown
   */
  useEffect(() => {
    if (showAddForm && addInputRef.current) {
      addInputRef.current.focus();
    }
  }, [showAddForm]);

  /**
   * Focus menu items based on focusedIndex
   */
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && menuItemsRef.current[focusedIndex]) {
      menuItemsRef.current[focusedIndex].focus();
    }
  }, [isOpen, focusedIndex]);

  if (!currentUser) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-indigo-500 rounded-md px-3 py-2"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-controls="user-switcher-menu"
      >
        {/* Avatar */}
        <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50">
          <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
            {currentUser.displayName?.charAt(0).toUpperCase() || 'U'}
          </span>
        </span>
        {/* Name */}
        <span className="hidden sm:block">{currentUser.displayName}</span>
        {/* Chevron */}
        <svg
          className={`h-5 w-5 text-gray-400 dark:text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          id="user-switcher-menu"
          className="absolute right-0 mt-2 w-64 origin-top-right rounded-md bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-slate-700 focus:outline-none z-50"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="user-switcher-button"
        >
          {/* Current user info */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {currentUser.displayName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {currentUser.identifier}
            </p>
          </div>

          {/* Search input for 5+ users */}
          {showSearch && (
            <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-700">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('common.searchUsers')}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded focus:ring-indigo-500 focus:border-indigo-500"
                aria-label={t('common.searchUsers')}
              />
            </div>
          )}

          {/* Other users */}
          {filteredUsers.length > 0 && (
            <div className="py-1 border-b border-gray-100 dark:border-slate-700 max-h-48 overflow-y-auto">
              <p className="px-4 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('auth.switchAccount')}
              </p>
              {filteredUsers.map((user, index) => (
                <button
                  key={user.id}
                  ref={el => menuItemsRef.current[index] = el}
                  type="button"
                  onClick={() => handleSwitchUser(user.id)}
                  className={`w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 focus:bg-gray-100 dark:focus:bg-slate-700 focus:outline-none ${focusedIndex === index ? 'bg-gray-100 dark:bg-slate-700' : ''
                    }`}
                  role="menuitem"
                  disabled={isLoading}
                >
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-200 dark:bg-slate-600 mr-3">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                      {user.displayName?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </span>
                  <div className="flex flex-col items-start truncate">
                    <span className="truncate">{user.displayName}</span>
                    <span className="text-xs text-gray-400 truncate">{user.identifier}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No results message when searching */}
          {showSearch && searchQuery && filteredUsers.length === 0 && (
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
              No users found matching "{searchQuery}"
            </div>
          )}

          {/* Add another account */}
          <div className="py-1 border-b border-gray-100 dark:border-slate-700">
            {showAddForm ? (
              <form onSubmit={handleAddAccount} className="px-4 py-2">
                <input
                  ref={addInputRef}
                  type="text"
                  value={newIdentifier}
                  onChange={(e) => {
                    setNewIdentifier(e.target.value);
                    setAddError(null);
                  }}
                  placeholder="Email, username, or phone"
                  className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={isLoading}
                />
                {addError && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{addError}</p>
                )}
                <div className="mt-2 flex space-x-2">
                  <button
                    type="submit"
                    className="flex-1 px-2 py-1 text-xs font-medium text-white bg-indigo-600 dark:bg-indigo-500 rounded hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {t('common.add')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setNewIdentifier('');
                      setAddError(null);
                    }}
                    className="flex-1 px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-slate-600 rounded hover:bg-gray-200 dark:hover:bg-slate-500"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              </form>
            ) : (
              <button
                ref={el => menuItemsRef.current[filteredUsers.length] = el}
                type="button"
                onClick={() => setShowAddForm(true)}
                className={`w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 focus:bg-gray-100 dark:focus:bg-slate-700 focus:outline-none ${focusedIndex === filteredUsers.length ? 'bg-gray-100 dark:bg-slate-700' : ''
                  }`}
                role="menuitem"
              >
                <svg
                  className="h-6 w-6 mr-3 text-gray-400 dark:text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                {t('auth.addAnotherAccount')}
              </button>
            )}
          </div>

          {/* Logout */}
          <div className="py-1">
            <button
              ref={el => menuItemsRef.current[filteredUsers.length + 1] = el}
              type="button"
              onClick={handleLogout}
              className={`w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 focus:bg-red-50 dark:focus:bg-red-900/20 focus:outline-none ${focusedIndex === filteredUsers.length + 1 ? 'bg-red-50 dark:bg-red-900/20' : ''
                }`}
              role="menuitem"
            >
              <svg
                className="h-6 w-6 mr-3 text-red-400 dark:text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              {t('auth.logout')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserSwitcher;
