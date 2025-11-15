# Auth Service API Documentation

## Base URL

```
http://localhost:3001/api
```

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## Authentication Endpoints

### Register User

Create a new user account.

**Endpoint:** `POST /auth/register`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "name": "John Doe",
  "username": "johndoe" // optional
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clx...",
      "email": "user@example.com",
      "username": "johndoe",
      "name": "John Doe",
      "role": "USER",
      "createdAt": "2025-11-15T14:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "message": "User registered successfully. Please verify your email."
  },
  "timestamp": "2025-11-15T14:30:00.000Z"
}
```

**Errors:**

- `409 Conflict` - Email already registered
- `409 Conflict` - Username already taken
- `422 Validation Error` - Invalid input data

---

### Login

Authenticate and receive access tokens.

**Endpoint:** `POST /auth/login`

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clx...",
      "email": "user@example.com",
      "username": "johndoe",
      "name": "John Doe",
      "role": "USER"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2025-11-15T14:30:00.000Z"
}
```

**Errors:**

- `401 Unauthorized` - Invalid credentials

---

### Logout

Invalidate the current session.

**Endpoint:** `POST /auth/logout`

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  },
  "timestamp": "2025-11-15T14:30:00.000Z"
}
```

---

### Refresh Token

Get a new access token using a refresh token.

**Endpoint:** `POST /auth/refresh`

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2025-11-15T14:30:00.000Z"
}
```

**Errors:**

- `401 Unauthorized` - Invalid refresh token
- `401 Unauthorized` - Session expired

---

### Verify Email

Verify user email address.

**Endpoint:** `POST /auth/verify-email`

**Request Body:**

```json
{
  "token": "verification-token-from-email"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "message": "Email verified successfully"
  },
  "timestamp": "2025-11-15T14:30:00.000Z"
}
```

**Errors:**

- `401 Unauthorized` - Invalid verification token

---

### Forgot Password

Request a password reset token.

**Endpoint:** `POST /auth/forgot-password`

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "message": "Password reset instructions sent to email"
  },
  "timestamp": "2025-11-15T14:30:00.000Z"
}
```

---

### Reset Password

Reset password using a reset token.

**Endpoint:** `POST /auth/reset-password`

**Request Body:**

```json
{
  "token": "reset-token-from-email",
  "password": "NewSecurePassword123"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "message": "Password reset successfully"
  },
  "timestamp": "2025-11-15T14:30:00.000Z"
}
```

**Errors:**

- `401 Unauthorized` - Invalid or expired reset token

---

## User Endpoints

### Get Current User

Get the authenticated user's profile.

**Endpoint:** `GET /users/me`

**Headers:**

```
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clx...",
      "email": "user@example.com",
      "username": "johndoe",
      "name": "John Doe",
      "role": "USER",
      "emailVerified": true,
      "createdAt": "2025-11-15T14:30:00.000Z",
      "updatedAt": "2025-11-15T14:30:00.000Z",
      "_count": {
        "sessions": 2,
        "apiKeys": 1
      }
    }
  },
  "timestamp": "2025-11-15T14:30:00.000Z"
}
```

**Errors:**

- `401 Unauthorized` - Not authenticated
- `404 Not Found` - User not found

---

### Update Profile

Update user profile information.

**Endpoint:** `PUT /users/profile`

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "name": "Jane Doe",
  "username": "janedoe",
  "email": "jane@example.com"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "message": "Profile updated successfully",
    "user": {
      "id": "clx...",
      "email": "jane@example.com",
      "username": "janedoe",
      "name": "Jane Doe",
      "role": "USER",
      "emailVerified": false,
      "updatedAt": "2025-11-15T14:30:00.000Z"
    }
  },
  "timestamp": "2025-11-15T14:30:00.000Z"
}
```

**Notes:**

- All fields are optional
- Changing email requires re-verification
- Username must be unique and match pattern `^[a-zA-Z0-9_-]+$`

**Errors:**

- `401 Unauthorized` - Not authenticated
- `422 Validation Error` - Email already in use
- `422 Validation Error` - Username already taken

---

### Change Password

Change user password.

**Endpoint:** `PUT /users/password`

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewSecurePassword123"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "message": "Password changed successfully. All other sessions have been logged out."
  },
  "timestamp": "2025-11-15T14:30:00.000Z"
}
```

**Notes:**

- New password must be at least 8 characters
- All sessions except the current one will be invalidated

**Errors:**

- `401 Unauthorized` - Not authenticated
- `401 Unauthorized` - Current password is incorrect
- `404 Not Found` - User not found

---

## API Key Endpoints

### Create API Key

Generate a new API key for programmatic access.

**Endpoint:** `POST /api-keys`

**Headers:**

```
Authorization: Bearer <token>
```

**Request Body:**

```json
{
  "name": "Production API Key",
  "expiresInDays": 90
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "data": {
    "apiKey": {
      "id": "clx...",
      "name": "Production API Key",
      "key": "sk_live_1234567890abcdef...",
      "expiresAt": "2026-02-13T14:30:00.000Z",
      "createdAt": "2025-11-15T14:30:00.000Z"
    },
    "message": "API key created successfully. Store this key securely - it won't be shown again."
  },
  "timestamp": "2025-11-15T14:30:00.000Z"
}
```

**Notes:**

- The full API key is only returned once during creation
- Store it securely as it cannot be retrieved later
- Default expiry is 90 days if not specified

**Errors:**

- `401 Unauthorized` - Not authenticated

---

### List API Keys

Get all API keys for the authenticated user.

**Endpoint:** `GET /api-keys`

**Headers:**

```
Authorization: Bearer <token>
```

**Query Parameters:**

- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 20, max: 100)

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "apiKeys": [
      {
        "id": "clx...",
        "name": "Production API Key",
        "lastUsedAt": "2025-11-15T14:00:00.000Z",
        "expiresAt": "2026-02-13T14:30:00.000Z",
        "createdAt": "2025-11-15T14:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 1,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  },
  "timestamp": "2025-11-15T14:30:00.000Z"
}
```

**Errors:**

- `401 Unauthorized` - Not authenticated

---

### Revoke API Key

Revoke (delete) an API key.

**Endpoint:** `DELETE /api-keys/:id`

**Headers:**

```
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "data": {
    "message": "API key revoked successfully"
  },
  "timestamp": "2025-11-15T14:30:00.000Z"
}
```

**Errors:**

- `401 Unauthorized` - Not authenticated
- `404 Not Found` - API key not found

---

## Error Response Format

All errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "additional error context"
    },
    "stack": "stack trace (development only)"
  },
  "timestamp": "2025-11-15T14:30:00.000Z"
}
```

### Common Error Codes

- `UNAUTHORIZED` - Authentication required or invalid credentials
- `FORBIDDEN` - Insufficient permissions
- `INVALID_TOKEN` - Invalid or expired token
- `VALIDATION_ERROR` - Request validation failed
- `NOT_FOUND` - Resource not found
- `CONFLICT` - Resource already exists
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `INTERNAL_SERVER_ERROR` - Server error

---

## Rate Limiting

Rate limiting is applied to prevent abuse:

- **Authentication endpoints**: 5 requests per 15 minutes per IP
- **API endpoints**: 100 requests per 15 minutes per user

When rate limited, you'll receive a `429 Too Many Requests` response.

---

## Security Best Practices

1. **Store tokens securely** - Use httpOnly cookies or secure storage
2. **Don't expose API keys** - Never commit them to version control
3. **Use HTTPS in production** - Always encrypt traffic
4. **Rotate API keys regularly** - Create new keys and revoke old ones
5. **Implement proper session management** - Log out when done
6. **Validate all input** - Never trust client data
7. **Monitor audit logs** - Track suspicious activity

---

## Audit Logging

All sensitive operations are logged in the audit log:

- User registration
- Login attempts
- Password changes
- Profile updates
- API key creation/revocation

Audit logs include:

- User ID
- Action performed
- Resource affected
- IP address
- User agent
- Timestamp
- Additional details

---

## Development

### Running the Service

```bash
cd services/auth-service
pnpm install
pnpm db:push  # Initialize database
pnpm dev      # Start development server
```

### Environment Variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_EXPIRES_IN="30d"
NODE_ENV="development"
PORT="3001"
```

### Testing with cURL

**Register:**

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123",
    "name": "Test User"
  }'
```

**Login:**

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123"
  }'
```

**Get Profile:**

```bash
curl http://localhost:3001/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Support

For issues or questions, please contact the development team or open an issue on GitHub.
