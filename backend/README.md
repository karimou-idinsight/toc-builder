# TOC Builder Backend

Express.js backend API server for the Theory of Change Builder application with multi-user authentication and role-based permissions.

## Features

- **User Authentication**: JWT-based authentication with email/password
- **Role-Based Access Control**: Owner, Contributor, Reviewer, Viewer roles per board
- **Board Management**: Create, update, delete boards with permissions
- **User Invitations**: Invite users to boards via email
- **Session Management**: Redis-based session storage
- **Rate Limiting**: API rate limiting with Redis
- **Database Migrations**: PostgreSQL with db-migrate
- **Security**: Password hashing, JWT tokens, CORS protection

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Cache/Sessions**: Redis
- **Authentication**: Passport.js + JWT
- **Migrations**: db-migrate
- **Security**: bcrypt, CORS, rate limiting

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- Redis (v6 or higher)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp ../env.example ../.env
```

3. Configure your `.env` file with your database and Redis credentials:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=toc_builder
DB_USER=postgres
DB_PASSWORD=your_password_here

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# Session Configuration
SESSION_SECRET=your_session_secret_here

# Server Configuration
PORT=3001
NODE_ENV=development
```

4. Run database migrations:
```bash
# From project root
npm run migrate

# Or from backend directory
npm run migrate
```

5. Start the development server:
```bash
npm run dev
```

## Database Setup

### Create Database
```sql
CREATE DATABASE toc_builder;
CREATE DATABASE toc_test; -- for testing
```

### Run Migrations
```bash
# Run all pending migrations
npm run migrate

# Check migration status
npm run migrate:check

# Rollback last migration
npm run migrate:down

# Reset all migrations (WARNING: deletes all data)
npm run migrate:reset
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `POST /api/auth/verify-email` - Verify email address

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/change-password` - Change password
- `DELETE /api/users/account` - Deactivate account
- `GET /api/users/boards` - Get user's boards
- `GET /api/users/search` - Search users
- `GET /api/users/stats` - Get user statistics

### Boards
- `GET /api/boards` - Get user's boards
- `GET /api/boards/public` - Get public boards
- `POST /api/boards` - Create new board
- `GET /api/boards/:id` - Get specific board
- `PUT /api/boards/:id` - Update board
- `DELETE /api/boards/:id` - Delete board

### Board Permissions
- `GET /api/boards/:id/permissions` - Get board permissions
- `POST /api/boards/:id/permissions` - Add user permission
- `PUT /api/boards/:id/permissions/:userId` - Update user permission
- `DELETE /api/boards/:id/permissions/:userId` - Remove user permission

### Board Invitations
- `POST /api/boards/:id/invite` - Invite user to board
- `GET /api/boards/:id/invitations` - Get board invitations
- `POST /api/boards/invitations/:token/accept` - Accept invitation
- `POST /api/boards/invitations/:token/decline` - Decline invitation
- `GET /api/boards/invitations/pending` - Get pending invitations

## User Roles

### Owner
- Full control over the board
- Can add/remove users
- Can delete the board
- Can change board settings

### Contributor
- Can edit board content
- Can invite users (with lower roles)
- Cannot delete the board

### Reviewer
- Can view and comment on board content
- Cannot edit content
- Cannot invite users

### Viewer
- Read-only access to the board
- Cannot edit or invite

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Rate Limiting

The API implements rate limiting to prevent abuse:
- Registration: 5 requests per 15 minutes
- Login: 10 requests per 15 minutes
- Password reset: 3 requests per 15 minutes
- General API: 100 requests per 15 minutes

## Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error message",
  "details": "Additional details (development only)"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `429` - Too Many Requests
- `500` - Internal Server Error

## Development

### Project Structure
```
toc-builder/          # Project root
├── database.json     # Database configuration
├── migrations/       # Database migrations
├── env.example       # Environment variables template
├── .env              # Environment variables (create from env.example)
├── backend/          # Backend API server
│   ├── config/       # Database and Redis configuration
│   ├── middleware/   # Authentication and other middleware
│   ├── models/       # Data models (User, Board, etc.)
│   ├── routes/       # API route handlers
│   ├── server.js     # Main server file
│   └── package.json  # Backend dependencies and scripts
└── web/              # Frontend Next.js application
```

### Adding New Migrations
```bash
# From project root
npx db-migrate create migration-name --sql-file

# Or from backend directory
npm run migrate:create migration-name --sql-file
```

### Testing
```bash
# Run tests (when implemented)
npm test

# Run tests with coverage
npm run test:coverage
```

## Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Use a production PostgreSQL database
3. Use a production Redis instance
4. Set secure JWT secrets
5. Enable SSL/TLS
6. Use a process manager like PM2

## Security Considerations

- Passwords are hashed using bcrypt with salt rounds of 12
- JWT tokens expire after 7 days by default
- Sessions are stored in Redis with secure cookies
- CORS is configured for the frontend domain
- Rate limiting prevents brute force attacks
- Input validation on all endpoints

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
