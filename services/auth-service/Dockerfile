# Base stage with pnpm
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN apk add --no-cache libc6-compat openssl

# Dependencies stage
FROM base AS deps
WORKDIR /app

# Copy workspace files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY services/auth-service/package.json ./services/auth-service/
COPY packages/config/package.json ./packages/config/
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/
COPY packages/typescript-config/package.json ./packages/typescript-config/

# Install dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Builder stage
FROM base AS builder
WORKDIR /app

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/services/auth-service/node_modules ./services/auth-service/node_modules

# Copy source code
COPY packages ./packages
COPY services/auth-service ./services/auth-service
COPY turbo.json ./

# Generate Prisma client
WORKDIR /app/services/auth-service
RUN pnpm db:generate

# Build the service
WORKDIR /app
RUN pnpm --filter @cybersec/auth-service build

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 authservice

# Copy all node_modules (workspace root + packages)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages

# Copy built application
COPY --from=builder /app/services/auth-service/dist ./dist
COPY --from=builder /app/services/auth-service/prisma ./prisma
COPY --from=builder /app/services/auth-service/package.json ./

# Create startup script for migrations
RUN echo '#!/bin/sh' > /app/docker-entrypoint.sh && \
    echo 'set -e' >> /app/docker-entrypoint.sh && \
    echo 'echo "Running database migrations..."' >> /app/docker-entrypoint.sh && \
    echo 'npx prisma db push --skip-generate' >> /app/docker-entrypoint.sh && \
    echo 'echo "Starting auth service..."' >> /app/docker-entrypoint.sh && \
    echo 'exec node dist/index.js' >> /app/docker-entrypoint.sh && \
    chmod +x /app/docker-entrypoint.sh && \
    chown authservice:nodejs /app/docker-entrypoint.sh

USER authservice

EXPOSE 3001

ENTRYPOINT ["/app/docker-entrypoint.sh"]
