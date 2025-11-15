# Database Schema

This document describes the database schema for the Auth Service.

## Entity Relationship Diagram

```
┌─────────────┐         ┌──────────────┐
│    User     │◄───────┤   Session    │
├─────────────┤         ├──────────────┤
│ id          │         │ id           │
│ email       │         │ userId       │
│ username    │         │ token        │
│ name        │         │ refreshToken │
│ passwordHash│         │ expiresAt    │
│ role        │         │ ipAddress    │
│ ...         │         │ userAgent    │
└─────────────┘         └──────────────┘
       │
       │
       ├────────────────►┌──────────────┐
       │                 │   ApiKey     │
       │                 ├──────────────┤
       │                 │ id           │
       │                 │ userId       │
       │                 │ name         │
       │                 │ keyHash      │
       │                 │ lastUsedAt   │
       │                 │ expiresAt    │
       │                 └──────────────┘
       │
       │
       └────────────────►┌──────────────┐
                         │  AuditLog    │
                         ├──────────────┤
                         │ id           │
                         │ userId       │
                         │ action       │
                         │ resource     │
                         │ details      │
                         │ ipAddress    │
                         │ userAgent    │
                         └──────────────┘
```

## Models

### User

Stores user account information.

```prisma
model User {
  id                   String     @id @default(cuid())
  email                String     @unique
  username             String?    @unique
  name                 String?
  passwordHash         String?
  role                 UserRole   @default(USER)
  emailVerified        Boolean    @default(false)
  verificationToken    String?
  resetToken           String?
  resetTokenExpiry     DateTime?

  // OAuth fields
  oauthProvider        String?
  oauthId              String?

  // Timestamps
  createdAt            DateTime   @default(now())
  updatedAt            DateTime   @updatedAt
  lastLoginAt          DateTime?

  // Relations
  sessions             Session[]
  apiKeys              ApiKey[]
  auditLogs            AuditLog[]
}
```

**Fields:**

- `id` - Unique identifier (CUID)
- `email` - User's email address (unique, required)
- `username` - Optional username (unique if provided)
- `name` - Display name
- `passwordHash` - Bcrypt hashed password
- `role` - User role (USER, ADMIN, DEVELOPER)
- `emailVerified` - Email verification status
- `verificationToken` - Token for email verification
- `resetToken` - Token for password reset
- `resetTokenExpiry` - Expiration time for reset token
- `oauthProvider` - OAuth provider name (google, github, etc.)
- `oauthId` - OAuth provider user ID
- `createdAt` - Account creation timestamp
- `updatedAt` - Last update timestamp
- `lastLoginAt` - Last successful login

**Indexes:**

- `email` (unique)
- `username` (unique, sparse)

---

### Session

Manages user sessions and refresh tokens.

```prisma
model Session {
  id           String   @id @default(cuid())
  userId       String
  token        String   @unique
  refreshToken String   @unique
  expiresAt    DateTime
  ipAddress    String?
  userAgent    String?
  createdAt    DateTime @default(now())

  // Relations
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([refreshToken])
}
```

**Fields:**

- `id` - Unique identifier
- `userId` - Reference to User
- `token` - JWT access token
- `refreshToken` - JWT refresh token
- `expiresAt` - Session expiration time
- `ipAddress` - IP address of the session
- `userAgent` - Browser/client user agent
- `createdAt` - Session creation timestamp

**Indexes:**

- `token` (unique)
- `refreshToken` (unique)
- `userId`

**Notes:**

- Sessions are automatically deleted when user is deleted (CASCADE)
- Expired sessions should be cleaned up periodically

---

### ApiKey

API keys for programmatic access.

```prisma
model ApiKey {
  id         String    @id @default(cuid())
  userId     String
  name       String
  keyHash    String    @unique
  lastUsedAt DateTime?
  expiresAt  DateTime?
  createdAt  DateTime  @default(now())

  // Relations
  user       User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}
```

**Fields:**

- `id` - Unique identifier
- `userId` - Reference to User
- `name` - Descriptive name for the key
- `keyHash` - SHA-256 hash of the API key
- `lastUsedAt` - Last time the key was used
- `expiresAt` - Key expiration time
- `createdAt` - Key creation timestamp

**Indexes:**

- `keyHash` (unique)
- `userId`

**Security:**

- Full key is only shown once at creation
- Keys are hashed using SHA-256 before storage
- Keys can have optional expiration

---

### AuditLog

Tracks security-sensitive operations.

```prisma
model AuditLog {
  id         String   @id @default(cuid())
  userId     String
  action     String
  resource   String
  details    Json?
  ipAddress  String?
  userAgent  String?
  timestamp  DateTime @default(now())

  // Relations
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([action])
  @@index([timestamp])
}
```

**Fields:**

- `id` - Unique identifier
- `userId` - Reference to User
- `action` - Action performed (e.g., USER_REGISTERED, LOGIN, PASSWORD_CHANGED)
- `resource` - Resource affected (e.g., USER, API_KEY)
- `details` - Additional context (JSON)
- `ipAddress` - IP address of the request
- `userAgent` - Browser/client user agent
- `timestamp` - When the action occurred

**Indexes:**

- `userId`
- `action`
- `timestamp`

**Common Actions:**

- `USER_REGISTERED`
- `USER_LOGIN`
- `USER_LOGOUT`
- `PASSWORD_CHANGED`
- `PROFILE_UPDATED`
- `EMAIL_VERIFIED`
- `API_KEY_CREATED`
- `API_KEY_REVOKED`

---

## Enums

### UserRole

```prisma
enum UserRole {
  USER       // Regular user
  ADMIN      // Administrator with elevated privileges
  DEVELOPER  // Developer with API access
}
```

---

## Migrations

### Initial Migration

```bash
# Create migration
pnpm db:migrate

# Apply to database
pnpm db:push
```

### Schema Changes

When making schema changes:

1. Update `prisma/schema.prisma`
2. Create migration: `pnpm db:migrate`
3. Apply migration: `pnpm db:push`
4. Generate client: `pnpm db:generate`

---

## Queries

### Common Queries

**Find user by email:**

```typescript
const user = await prisma.user.findUnique({
  where: { email: "user@example.com" },
  include: {
    sessions: true,
    apiKeys: true,
  },
});
```

**Create session:**

```typescript
const session = await prisma.session.create({
  data: {
    userId: user.id,
    token: accessToken,
    refreshToken: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  },
});
```

**List user's API keys:**

```typescript
const apiKeys = await prisma.apiKey.findMany({
  where: { userId: user.id },
  orderBy: { createdAt: "desc" },
  select: {
    id: true,
    name: true,
    lastUsedAt: true,
    expiresAt: true,
    createdAt: true,
  },
});
```

**Audit log query:**

```typescript
const logs = await prisma.auditLog.findMany({
  where: {
    userId: user.id,
    action: "PASSWORD_CHANGED",
  },
  orderBy: { timestamp: "desc" },
  take: 10,
});
```

---

## Data Retention

### Session Cleanup

Expired sessions should be cleaned up:

```typescript
await prisma.session.deleteMany({
  where: {
    expiresAt: { lt: new Date() },
  },
});
```

Run as a scheduled job (e.g., daily).

### Audit Log Retention

Keep audit logs for compliance:

- Retain for 90 days minimum
- Archive old logs to cold storage
- Implement rotation policy

```typescript
// Delete logs older than 90 days
await prisma.auditLog.deleteMany({
  where: {
    timestamp: {
      lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    },
  },
});
```

---

## Performance Optimization

### Indexes

Current indexes:

- User: email, username
- Session: token, refreshToken, userId
- ApiKey: keyHash, userId
- AuditLog: userId, action, timestamp

### Query Optimization

Use `select` to limit fields:

```typescript
const user = await prisma.user.findUnique({
  where: { id },
  select: {
    id: true,
    email: true,
    name: true,
    // Don't fetch passwordHash unless needed
  },
});
```

Use pagination:

```typescript
const users = await prisma.user.findMany({
  skip: (page - 1) * limit,
  take: limit,
  orderBy: { createdAt: "desc" },
});
```

---

## Backup and Recovery

### Backup Strategy

1. **Automated daily backups**
   - PostgreSQL pg_dump
   - Store in secure location
   - Retain for 30 days

2. **Point-in-time recovery**
   - Enable WAL archiving
   - Test recovery procedures

3. **Replication**
   - Set up read replicas
   - Failover procedures

### Backup Commands

```bash
# Backup
pg_dump -U postgres -d cybersec > backup_$(date +%Y%m%d).sql

# Restore
psql -U postgres -d cybersec < backup_20251115.sql
```

---

## Security Considerations

### Sensitive Data

- **Never log passwords** - Even hashed
- **Hash API keys** - Store SHA-256 hash only
- **Encrypt at rest** - Enable PostgreSQL encryption
- **Secure connections** - Use SSL/TLS for database connections

### Access Control

- **Principle of least privilege** - Limit database user permissions
- **Separate credentials** - Different users for different services
- **Regular audits** - Review access logs

### Compliance

- **GDPR** - Support data export and deletion
- **Data minimization** - Only store necessary data
- **Retention policies** - Delete old data appropriately

---

## Troubleshooting

### Common Issues

**Unique constraint violation:**

```
Error: P2002: Unique constraint failed on the fields: (`email`)
```

Solution: User with that email already exists

**Foreign key constraint:**

```
Error: P2003: Foreign key constraint failed
```

Solution: Referenced record doesn't exist

**Connection timeout:**

```
Error: P1001: Can't reach database server
```

Solution: Check database is running and connection string is correct

---

## References

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Database Design Best Practices](https://www.prisma.io/dataguide)
