# Auth Service Documentation

Welcome to the CyberSec Auth Service documentation.

## Quick Links

- [API Documentation](./API.md) - Complete API reference
- [Architecture](./ARCHITECTURE.md) - System architecture and design
- [Database Schema](./SCHEMA.md) - Database models and relationships

## Overview

The Auth Service provides comprehensive authentication and authorization functionality for the CyberSec platform. It handles user registration, login, session management, API key generation, and audit logging.

## Key Features

- **User Authentication** - JWT-based authentication with refresh tokens
- **User Management** - Profile updates, password changes, email verification
- **API Keys** - Programmatic access with secure key generation
- **Audit Logging** - Complete tracking of security-sensitive operations
- **Session Management** - Multi-session support with selective invalidation
- **Rate Limiting** - Protection against abuse and brute force attacks
- **Role-Based Access** - USER, ADMIN, DEVELOPER roles

## Technology Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Validation**: Zod
- **Security**: Helmet, CORS, express-rate-limit

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- pnpm 8+

### Installation

```bash
# Navigate to auth service
cd services/auth-service

# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env

# Initialize database
pnpm db:push

# Start development server
pnpm dev
```

### Environment Configuration

Required environment variables:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_EXPIRES_IN="30d"
NODE_ENV="development"
PORT="3001"
```

## Project Structure

```
auth-service/
├── src/
│   ├── controllers/      # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── user.controller.ts
│   │   └── api-key.controller.ts
│   ├── middleware/       # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── error-handler.ts
│   │   └── request-logger.ts
│   ├── routes/          # Route definitions
│   │   ├── auth.routes.ts
│   │   ├── user.routes.ts
│   │   └── api-key.routes.ts
│   ├── lib/             # Utilities
│   │   ├── auth-utils.ts
│   │   └── prisma.ts
│   ├── schemas/         # Validation schemas
│   │   └── auth.schemas.ts
│   └── index.ts         # Entry point
├── prisma/
│   └── schema.prisma    # Database schema
├── docs/                # Documentation
└── package.json
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/verify-email` - Verify email address
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### User Management

- `GET /api/users/me` - Get current user
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/password` - Change password

### API Keys

- `POST /api/api-keys` - Create API key
- `GET /api/api-keys` - List API keys
- `DELETE /api/api-keys/:id` - Revoke API key

See [API Documentation](./API.md) for detailed endpoint specifications.

## Development

### Available Scripts

```bash
# Development
pnpm dev              # Start with hot reload
pnpm build            # Build for production
pnpm start            # Start production server

# Database
pnpm db:push          # Push schema to database
pnpm db:migrate       # Run migrations
pnpm db:studio        # Open Prisma Studio
pnpm db:generate      # Generate Prisma Client

# Quality
pnpm lint             # Run ESLint
pnpm check-types      # Run TypeScript compiler
pnpm test             # Run tests
```

### Testing

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test -- --watch

# Run tests with coverage
pnpm test -- --coverage
```

## Security Considerations

### Password Security

- Passwords are hashed using bcrypt with 10 salt rounds
- Minimum password length: 8 characters
- Never store passwords in plain text

### Token Security

- JWT tokens expire after 7 days
- Refresh tokens expire after 30 days
- Tokens are signed with HS256 algorithm
- Store tokens securely (httpOnly cookies recommended)

### API Key Security

- Keys are hashed using SHA-256 before storage
- Full key only shown once at creation
- Keys can be revoked at any time
- Keys have configurable expiration

### Rate Limiting

- Auth endpoints: 5 requests per 15 minutes
- API endpoints: 100 requests per 15 minutes
- Customizable per endpoint

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Verify connection string
echo $DATABASE_URL

# Reset database
pnpm db:push --force-reset
```

### JWT Token Issues

```bash
# Verify JWT_SECRET is set
echo $JWT_SECRET

# Check token expiration settings
echo $JWT_EXPIRES_IN
```

### Common Errors

**Error: P2002 Unique constraint failed**

- Email or username already exists
- Use unique values or query existing records

**Error: Invalid credentials**

- Check email and password
- Verify user exists and is active

**Error: Invalid token**

- Token may be expired
- Use refresh token to get new access token

## Monitoring

### Logging

The service uses structured logging with different levels:

- `ERROR` - Critical errors requiring immediate attention
- `WARN` - Warning conditions
- `INFO` - Informational messages (default)
- `DEBUG` - Detailed debugging information

Logs include:

- Timestamp
- Log level
- Service name
- Message
- Contextual data

### Audit Logs

All security-sensitive operations are logged to the database:

```typescript
{
  userId: string;
  action: string;
  resource: string;
  details: object;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}
```

Query audit logs:

```sql
SELECT * FROM "AuditLog"
WHERE "userId" = 'user-id'
ORDER BY "timestamp" DESC
LIMIT 100;
```

## Production Deployment

### Environment Setup

1. Set production environment variables
2. Use strong JWT_SECRET (32+ characters)
3. Enable HTTPS/TLS
4. Configure CORS properly
5. Set up database backups
6. Enable monitoring and alerting

### Build and Deploy

```bash
# Build
pnpm build

# Start production server
NODE_ENV=production pnpm start
```

### Health Checks

```bash
# Check service health
curl http://localhost:3001/health
```

## Contributing

1. Follow TypeScript best practices
2. Write tests for new features
3. Update documentation
4. Run linter before committing
5. Use conventional commits

## License

Proprietary - CyberSec Platform

## Support

For issues or questions:

- Open an issue on GitHub
- Contact: dev@cybersec.example.com
