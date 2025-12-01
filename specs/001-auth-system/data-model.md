# Data Model: Authentication System

**Feature Branch**: `001-auth-system`  
**Date**: December 1, 2025  
**Status**: Complete

## Entities

### User

Represents an individual registered in the TaskFlow application.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `string` | Primary Key, UUID v4 | Unique identifier for the user |
| `identifier` | `string` | Unique, Required, 3-254 chars | Login identifier (email, username, or phone) |
| `identifierType` | `IdentifierType` | Required | Type of identifier: 'email', 'username', 'phone' |
| `displayName` | `string` | Required, 1-100 chars | Derived display name shown in UI |
| `createdAt` | `Date` | Required | Timestamp when user was created |
| `updatedAt` | `Date` | Required | Timestamp of last profile update |
| `preferences` | `UserPreferences` | Optional | User settings and preferences |

**Validation Rules**:
- `identifier` must be unique across all users
- `identifier` format validated based on `identifierType`:
  - Email: Valid email format (`x@y.z`)
  - Username: 3-30 alphanumeric + underscore characters
  - Phone: 10-15 digits with optional `+` prefix

**IndexedDB Schema**:
```javascript
// Dexie.js schema definition
users: '&id, &identifier, identifierType, createdAt'
// &id = primary key
// &identifier = unique index
```

---

### Session

Represents an active user session stored in localStorage.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `userId` | `string` | Required, Foreign Key → User.id | Reference to authenticated user |
| `token` | `string` | Required, UUID v4 | Unique session identifier |
| `loginAt` | `Date` | Required | Timestamp when session was created |
| `lastActiveAt` | `Date` | Required | Timestamp of last user activity |

**Storage**: localStorage (JSON serialized)

**Key**: `taskflow_session`

---

### UserPreferences

Embedded object for user-specific settings.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `theme` | `'light' \| 'dark'` | `'light'` | UI theme preference |
| `defaultView` | `ViewType` | `'list'` | Preferred task view mode |

---

## Type Definitions

### IdentifierType

```typescript
type IdentifierType = 'email' | 'username' | 'phone';
```

### ViewType

```typescript
type ViewType = 'list' | 'kanban' | 'calendar' | 'focus';
```

### UserPreferences

```typescript
interface UserPreferences {
  theme: 'light' | 'dark';
  defaultView: ViewType;
}
```

---

## State Shapes

### AuthState (React Context)

```typescript
interface AuthState {
  currentUser: User | null;      // Currently logged-in user
  users: User[];                 // All users in the system
  isAuthenticated: boolean;      // True if valid session exists
  isLoading: boolean;            // True during async operations
  error: AuthError | null;       // Last error, if any
}
```

### AuthError

```typescript
interface AuthError {
  code: AuthErrorCode;
  message: string;
  field?: string;                // For validation errors
}

type AuthErrorCode =
  | 'INVALID_IDENTIFIER'
  | 'VALIDATION_FAILED'
  | 'STORAGE_UNAVAILABLE'
  | 'SESSION_CORRUPTED'
  | 'USER_NOT_FOUND'
  | 'UNKNOWN_ERROR';
```

---

## Relationships

```
┌─────────────┐         ┌─────────────┐
│    User     │         │   Session   │
├─────────────┤         ├─────────────┤
│ id (PK)     │◄────────│ userId (FK) │
│ identifier  │         │ token       │
│ displayName │         │ loginAt     │
│ preferences │         │ lastActiveAt│
│ createdAt   │         └─────────────┘
│ updatedAt   │              │
└─────────────┘              │
                             ▼
                      ┌─────────────┐
                      │ localStorage │
                      │ (1 session)  │
                      └─────────────┘
```

**Relationship Notes**:
- One-to-One: One active Session per browser (stored in localStorage)
- One-to-Many: One User can have multiple sessions across different browsers (but only one per browser instance)
- Session references User via `userId`

---

## Data Flow

### Login/Registration Flow

```
User Input → Validation → Check IndexedDB → Create/Fetch User → Create Session → Update Context
```

1. User enters identifier
2. Validate format based on detected type
3. Query IndexedDB for existing user
4. If not found: Create new user record
5. Create session in localStorage
6. Update AuthContext state

### User Switch Flow

```
Select User → Clear Current Session → Create New Session → Update Context
```

1. User selects different user from dropdown
2. Remove current session from localStorage
3. Create new session for selected user
4. Update AuthContext with new currentUser

### Logout Flow

```
Click Logout → Clear Session → Update Context → Redirect
```

1. User clicks logout
2. Remove session from localStorage
3. Set currentUser to null
4. Redirect to login form

---

## Indexes

### Users Table (IndexedDB)

| Index Name | Fields | Type | Purpose |
|------------|--------|------|---------|
| Primary | `id` | Unique | Record lookup |
| identifier | `identifier` | Unique | Login lookup |
| identifierType | `identifierType` | Non-unique | Filter by type |
| createdAt | `createdAt` | Non-unique | Sort by creation date |

---

## Migration Notes

### Version 1 (Initial)

```javascript
db.version(1).stores({
  users: '&id, &identifier, identifierType, createdAt'
});
```

**Future Migrations**:
- Version 2 might add `lastLoginAt` field
- Version 3 might add `avatar` field for user profiles
