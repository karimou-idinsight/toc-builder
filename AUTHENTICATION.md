# Authentication & Authorization System

## Overview

This document describes the multi-user authentication and authorization system implemented for the TOC Builder application.

## Backend Implementation

### Database Schema

#### Users Table
```sql
- id: SERIAL PRIMARY KEY
- email: VARCHAR(255) UNIQUE NOT NULL
- password_hash: VARCHAR(255) NOT NULL
- first_name: VARCHAR(100) NOT NULL
- last_name: VARCHAR(100) NOT NULL
- avatar_url: VARCHAR(500)
- is_active: BOOLEAN DEFAULT true
- email_verified: BOOLEAN DEFAULT false
- role: VARCHAR(20) DEFAULT 'user' (user | super_admin)
- email_verification_token: VARCHAR(255)
- password_reset_token: VARCHAR(255)
- password_reset_expires: TIMESTAMP
- last_login: TIMESTAMP
- created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- updated_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

#### Boards Table
```sql
- id: SERIAL PRIMARY KEY
- title: VARCHAR(255) NOT NULL
- description: TEXT
- owner_id: INTEGER NOT NULL REFERENCES users(id)
- is_public: BOOLEAN DEFAULT false
- settings: JSONB DEFAULT '{}'
- created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- updated_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

#### Board Permissions Table
```sql
- id: SERIAL PRIMARY KEY
- board_id: INTEGER NOT NULL REFERENCES boards(id)
- user_id: INTEGER NOT NULL REFERENCES users(id)
- role: VARCHAR(20) (owner | contributor | reviewer | viewer)
- granted_by: INTEGER REFERENCES users(id)
- created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- updated_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- UNIQUE(board_id, user_id)
```

#### Board Invitations Table
```sql
- id: SERIAL PRIMARY KEY
- board_id: INTEGER NOT NULL REFERENCES boards(id)
- email: VARCHAR(255) NOT NULL
- role: VARCHAR(20) (contributor | reviewer | viewer)
- token: VARCHAR(255) UNIQUE NOT NULL
- invited_by: INTEGER NOT NULL REFERENCES users(id)
- expires_at: TIMESTAMP NOT NULL
- accepted_at: TIMESTAMP
- created_at: TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- UNIQUE(board_id, email)
```

### User Roles

#### System Roles
1. **super_admin**
   - Full system access
   - Can manage all users
   - Can view and modify any board
   - Can view system statistics
   - Cannot be deactivated by other admins

2. **user**
   - Standard user account
   - Can create and own boards
   - Can be invited to boards

#### Board Roles
1. **owner**
   - Full control over the board
   - Can delete the board
   - Can add/remove users
   - Can change board settings

2. **contributor**
   - Can edit board content
   - Can invite users (with lower roles)
   - Cannot delete the board

3. **reviewer**
   - Can view and comment on board content
   - Cannot edit content
   - Cannot invite users

4. **viewer**
   - Read-only access to the board
   - Cannot edit or invite

### API Endpoints

#### Authentication (`/api/auth/*`)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/verify-email` - Verify email address

#### Users (`/api/users/*`)
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/change-password` - Change password
- `DELETE /api/users/account` - Deactivate account
- `GET /api/users/boards` - Get user's boards
- `GET /api/users/search` - Search users (for invitations)
- `GET /api/users/stats` - Get user statistics

#### Boards (`/api/boards/*`)
- `GET /api/boards` - Get user's boards
- `GET /api/boards/public` - Get public boards
- `POST /api/boards` - Create new board
- `GET /api/boards/:id` - Get specific board
- `PUT /api/boards/:id` - Update board
- `DELETE /api/boards/:id` - Delete board
- `GET /api/boards/:id/permissions` - Get board permissions
- `POST /api/boards/:id/permissions` - Add user permission
- `PUT /api/boards/:id/permissions/:userId` - Update user permission
- `DELETE /api/boards/:id/permissions/:userId` - Remove user permission
- `POST /api/boards/:id/invite` - Invite user to board
- `GET /api/boards/:id/invitations` - Get board invitations
- `POST /api/boards/invitations/:token/accept` - Accept invitation
- `POST /api/boards/invitations/:token/decline` - Decline invitation
- `GET /api/boards/invitations/pending` - Get pending invitations

#### Admin (`/api/admin/*`) - Super Admin Only
- `GET /api/admin/users` - Get all users
- `GET /api/admin/users/:userId` - Get specific user
- `POST /api/admin/users` - Create new user
- `PUT /api/admin/users/:userId` - Update user
- `PUT /api/admin/users/:userId/deactivate` - Deactivate user
- `PUT /api/admin/users/:userId/activate` - Activate user
- `PUT /api/admin/users/:userId/reset-password` - Reset user password
- `GET /api/admin/stats` - Get system statistics

### Security Features

1. **Password Security**
   - Passwords hashed with bcrypt (12 salt rounds)
   - Minimum 8 characters required
   - Password reset tokens expire after 1 hour

2. **JWT Authentication**
   - Access tokens expire after 7 days
   - Refresh tokens expire after 30 days
   - Tokens include user ID only (no sensitive data)

3. **Rate Limiting**
   - Registration: 5 requests per 15 minutes
   - Login: 10 requests per 15 minutes
   - Password reset: 3 requests per 15 minutes
   - General API: 100 requests per 15 minutes
   - User search: 20 requests per minute
   - Admin user creation: 10 requests per minute

4. **Session Management**
   - Redis-backed sessions
   - Secure cookies in production
   - 24-hour session expiry

5. **CORS Protection**
   - Configured for frontend domain
   - Credentials allowed

## Frontend Implementation

### Authentication Context

**Location:** `web/src/app/context/AuthContext.js`

Provides global authentication state and methods:
- `user` - Current authenticated user
- `loading` - Loading state
- `error` - Error state
- `login(email, password)` - Login user
- `register(userData)` - Register new user
- `logout()` - Logout user
- `checkAuth()` - Check current authentication status
- `refreshAccessToken()` - Refresh JWT token
- `isSuperAdmin()` - Check if user is super admin
- `isAuthenticated` - Boolean authentication status

### API Client

**Location:** `web/src/app/utils/authApi.js`

Provides typed API methods with automatic token handling:
- `authApi` - Authentication endpoints
- `userApi` - User profile and management
- `boardApi` - Board operations and permissions
- `adminApi` - Super admin operations

Features:
- Automatic JWT token injection
- Automatic token refresh on 401 errors
- Request/response error handling
- Centralized API URL configuration

### Protected Routes

**Location:** `web/src/app/components/ProtectedRoute.js`

Wrapper component for protecting routes:
```jsx
<ProtectedRoute requireAuth={true}>
  {/* Protected content */}
</ProtectedRoute>

<ProtectedRoute requireSuperAdmin={true}>
  {/* Super admin only content */}
</ProtectedRoute>
```

Features:
- Automatic redirect to login if not authenticated
- Automatic redirect to home if insufficient permissions
- Loading state handling
- Unauthorized error display

### Pages

#### Login Page
**Location:** `web/src/app/login/page.js`
- Email/password form
- Link to registration
- Link to password reset
- Demo credentials display
- Error handling

#### Register Page
**Location:** `web/src/app/register/page.js`
- Full name, email, password form
- Password confirmation
- Password strength requirements
- Link to login
- Error handling

## Super Admin User

### Default Credentials
- **Email:** admin@tocbuilder.com
- **Password:** admin123
- **Role:** super_admin

### Capabilities
1. **User Management**
   - View all users with pagination
   - Create new users with any role
   - Update user details (name, email, role)
   - Activate/deactivate user accounts
   - Reset user passwords

2. **System Monitoring**
   - View total user count
   - View active vs inactive users
   - View verified vs unverified users
   - View board statistics
   - View public/private board counts

## Running Migrations

To set up the database with the super admin user:

```bash
# From project root
npm run migrate

# Or from backend directory
npm run migrate
```

This will:
1. Create users table
2. Create boards, permissions, and invitations tables
3. Add role column to users
4. Create super admin user with default credentials

## Environment Variables

### Backend (.env)
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=toc_builder
DB_USER=postgres
DB_PASSWORD=your_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# Session
SESSION_SECRET=your_session_secret_here

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Testing the System

### 1. Start Backend
```bash
cd backend
npm run dev
```

### 2. Start Frontend
```bash
cd web
npm run dev
```

### 3. Access Application
- Frontend: http://localhost:3000
- Login: http://localhost:3000/login
- Register: http://localhost:3000/register
- Admin Dashboard: http://localhost:3000/admin (super admin only)

### 4. Test Super Admin
1. Navigate to http://localhost:3000/login
2. Login with admin@tocbuilder.com / admin123
3. Should redirect to /admin
4. Test user management features

### 5. Test Regular User
1. Navigate to http://localhost:3000/register
2. Create a new account
3. Should redirect to / (home)
4. Test board creation and management

## Next Steps

### Remaining Tasks
1. ✅ Backend authentication system
2. ✅ Frontend authentication context
3. ✅ Login and register pages
4. ✅ Protected route wrapper
5. ⏳ Super admin dashboard UI
6. ⏳ User management UI
7. ⏳ Integrate authentication with existing board pages
8. ⏳ Add board permissions UI
9. ⏳ Add invitation system UI

### Future Enhancements
- Email verification system
- Password reset via email
- Two-factor authentication
- OAuth integration (Google, GitHub)
- Audit logging
- Activity tracking
- User avatars with upload
- Advanced permissions (custom roles)
- Team/organization management
