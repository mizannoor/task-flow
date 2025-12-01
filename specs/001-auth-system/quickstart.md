# Quickstart: Authentication System

**Feature Branch**: `001-auth-system`  
**Date**: December 1, 2025

## Overview

This guide provides a quick reference for implementing the TaskFlow authentication system with passwordless login and multi-user switching.

## Prerequisites

- Node.js 18+
- React 18+
- Vite (build tool)

## Installation

```bash
# Install dependencies
npm install dexie uuid

# Optional: TypeScript types
npm install -D @types/uuid
```

## Project Setup

### 1. Database Service (`src/services/db.js`)

```javascript
import Dexie from 'dexie';

// Initialize database
const db = new Dexie('TaskFlowDB');

db.version(1).stores({
  users: '&id, &identifier, identifierType, createdAt'
});

export { db };
```

### 2. Validation Utils (`src/utils/validators.js`)

```javascript
export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  USERNAME: /^[a-zA-Z0-9_]{3,30}$/,
  PHONE: /^\+?[0-9]{10,15}$/,
};

export function validateIdentifier(identifier) {
  const trimmed = identifier?.trim();
  
  if (!trimmed) {
    return { isValid: false, type: null, error: 'Please enter an identifier' };
  }
  
  if (trimmed.includes('@')) {
    return PATTERNS.EMAIL.test(trimmed)
      ? { isValid: true, type: 'email' }
      : { isValid: false, type: 'email', error: 'Invalid email format' };
  }
  
  if (/^\+?\d+$/.test(trimmed)) {
    return PATTERNS.PHONE.test(trimmed)
      ? { isValid: true, type: 'phone' }
      : { isValid: false, type: 'phone', error: 'Phone must be 10-15 digits' };
  }
  
  return PATTERNS.USERNAME.test(trimmed)
    ? { isValid: true, type: 'username' }
    : { isValid: false, type: 'username', error: 'Username must be 3-30 alphanumeric chars' };
}

export function deriveDisplayName(identifier, type) {
  switch (type) {
    case 'email':
      return identifier.split('@')[0];
    case 'phone':
      return `User ***${identifier.slice(-4)}`;
    default:
      return identifier;
  }
}
```

### 3. Auth Context (`src/contexts/AuthContext.jsx`)

```jsx
import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../services/db';
import { validateIdentifier, deriveDisplayName } from '../utils/validators';

const AuthContext = createContext(null);
const SESSION_KEY = 'taskflow_session';

// Initial state
const initialState = {
  currentUser: null,
  users: [],
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Reducer
function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        currentUser: action.payload.user,
        users: action.payload.users,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGOUT':
      return { ...state, currentUser: null, isAuthenticated: false, error: null };
    case 'SWITCH_USER':
      return { ...state, currentUser: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

// Provider component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize: check for existing session
  useEffect(() => {
    async function initAuth() {
      try {
        const sessionData = localStorage.getItem(SESSION_KEY);
        const users = await db.users.toArray();
        
        if (sessionData) {
          const session = JSON.parse(sessionData);
          const user = users.find(u => u.id === session.userId);
          
          if (user) {
            dispatch({ type: 'LOGIN_SUCCESS', payload: { user, users } });
            return;
          }
        }
        
        dispatch({ type: 'SET_LOADING', payload: false });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: { code: 'UNKNOWN_ERROR', message: error.message } });
      }
    }
    
    initAuth();
  }, []);

  // Login function
  const login = useCallback(async (identifier) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    const validation = validateIdentifier(identifier);
    if (!validation.isValid) {
      dispatch({ type: 'SET_ERROR', payload: { code: 'VALIDATION_FAILED', message: validation.error } });
      throw new Error(validation.error);
    }
    
    try {
      let user = await db.users.where('identifier').equals(identifier.trim()).first();
      
      if (!user) {
        // Create new user
        user = {
          id: uuidv4(),
          identifier: identifier.trim(),
          identifierType: validation.type,
          displayName: deriveDisplayName(identifier.trim(), validation.type),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await db.users.add(user);
      }
      
      // Create session
      const session = { userId: user.id, token: uuidv4(), loginAt: new Date(), lastActiveAt: new Date() };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
      
      const users = await db.users.toArray();
      dispatch({ type: 'LOGIN_SUCCESS', payload: { user, users } });
      
      return user;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: { code: 'UNKNOWN_ERROR', message: error.message } });
      throw error;
    }
  }, []);

  // Logout function
  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    dispatch({ type: 'LOGOUT' });
  }, []);

  // Switch user function
  const switchUser = useCallback(async (userId) => {
    const user = state.users.find(u => u.id === userId);
    if (!user) throw new Error('User not found');
    
    const session = { userId: user.id, token: uuidv4(), loginAt: new Date(), lastActiveAt: new Date() };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    
    dispatch({ type: 'SWITCH_USER', payload: user });
  }, [state.users]);

  const value = { ...state, login, logout, switchUser, addAccount: login };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
```

### 4. Login Form (`src/components/auth/LoginForm.jsx`)

```jsx
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export function LoginForm({ onLoginSuccess }) {
  const [identifier, setIdentifier] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, error } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const user = await login(identifier);
      onLoginSuccess?.(user);
    } catch (err) {
      // Error handled by context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Welcome to TaskFlow</h1>
      
      <label htmlFor="identifier" className="block text-sm font-medium mb-2">
        Email, Username, or Phone
      </label>
      
      <input
        id="identifier"
        type="text"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        placeholder="Enter your identifier"
        className="w-full p-3 border rounded-lg mb-4"
        disabled={isSubmitting}
        autoFocus
      />
      
      {error && (
        <p className="text-red-500 text-sm mb-4">{error.message}</p>
      )}
      
      <button
        type="submit"
        disabled={isSubmitting || !identifier.trim()}
        className="w-full bg-blue-600 text-white p-3 rounded-lg disabled:opacity-50"
      >
        {isSubmitting ? 'Signing in...' : 'Continue'}
      </button>
    </form>
  );
}
```

### 5. User Switcher (`src/components/auth/UserSwitcher.jsx`)

```jsx
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export function UserSwitcher({ onAddAccount }) {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, users, switchUser, logout } = useAuth();
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative" onKeyDown={handleKeyDown}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
      >
        <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center">
          {currentUser?.displayName?.[0]?.toUpperCase()}
        </span>
        <span>{currentUser?.displayName}</span>
      </button>

      {isOpen && (
        <div role="menu" className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-lg">
          {users.map((user) => (
            <button
              key={user.id}
              role="menuitem"
              onClick={() => { switchUser(user.id); setIsOpen(false); }}
              className={`w-full text-left p-3 hover:bg-gray-50 ${
                user.id === currentUser?.id ? 'bg-blue-50' : ''
              }`}
            >
              {user.id === currentUser?.id && '✓ '}{user.displayName}
            </button>
          ))}
          
          <hr className="my-1" />
          
          <button
            role="menuitem"
            onClick={() => { onAddAccount?.(); setIsOpen(false); }}
            className="w-full text-left p-3 hover:bg-gray-50"
          >
            + Add Another Account
          </button>
          
          <button
            role="menuitem"
            onClick={() => { logout(); setIsOpen(false); }}
            className="w-full text-left p-3 hover:bg-gray-50 text-red-600"
          >
            🚪 Logout
          </button>
        </div>
      )}
    </div>
  );
}
```

### 6. App Integration (`src/App.jsx`)

```jsx
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/auth/LoginForm';
import { UserSwitcher } from './components/auth/UserSwitcher';

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return (
    <div>
      <header className="flex justify-between items-center p-4 border-b">
        <h1 className="text-xl font-bold">TaskFlow</h1>
        <UserSwitcher />
      </header>
      <main className="p-4">
        {/* Dashboard content */}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
```

## Testing

```javascript
// Example test for validators
import { validateIdentifier } from './validators';

describe('validateIdentifier', () => {
  test('validates email', () => {
    expect(validateIdentifier('test@example.com')).toEqual({ isValid: true, type: 'email' });
  });
  
  test('validates username', () => {
    expect(validateIdentifier('john_doe')).toEqual({ isValid: true, type: 'username' });
  });
  
  test('validates phone', () => {
    expect(validateIdentifier('+15551234567')).toEqual({ isValid: true, type: 'phone' });
  });
  
  test('rejects invalid input', () => {
    expect(validateIdentifier('ab')).toMatchObject({ isValid: false });
  });
});
```

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/services/db.js` | IndexedDB setup with Dexie.js |
| `src/utils/validators.js` | Identifier validation functions |
| `src/contexts/AuthContext.jsx` | Auth state management |
| `src/components/auth/LoginForm.jsx` | Login UI component |
| `src/components/auth/UserSwitcher.jsx` | User switching dropdown |
| `src/hooks/useAuth.js` | Re-export of useAuth hook |

## Success Criteria Checklist

- [ ] First-time registration < 10 seconds
- [ ] Session persists across browser restart
- [ ] User switching < 500ms
- [ ] Clear validation error messages
- [ ] Supports 10+ user accounts
- [ ] Keyboard navigation works
- [ ] Responsive on mobile devices
