# Base stage with pnpm
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN apk add --no-cache libc6-compat

# Dependencies stage
FROM base AS deps
WORKDIR /app

# Copy workspace files
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY services/ai-service/package.json ./services/ai-service/
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
COPY --from=deps /app/services/ai-service/node_modules ./services/ai-service/node_modules

# Copy source code
COPY packages ./packages
COPY services/ai-service ./services/ai-service
COPY turbo.json ./

# Build the service
RUN pnpm --filter @cybersec/ai-service build

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 aiservice

# Copy all node_modules (workspace root + packages)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages

# Copy built application
COPY --from=builder /app/services/ai-service/dist ./dist
COPY --from=builder /app/services/ai-service/package.json ./

USER aiservice

EXPOSE 3004

CMD ["node", "dist/index.js"]
