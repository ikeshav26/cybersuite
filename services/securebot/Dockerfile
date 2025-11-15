# Base stage
FROM node:20-alpine AS base
RUN apk add --no-cache git

# Dependencies stage
FROM base AS deps
WORKDIR /app

# Copy package files
COPY services/securebot/package.json services/securebot/pnpm-lock.yaml* ./

# Install dependencies
RUN npm install

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 securebot

# Copy dependencies and source code
COPY --from=deps /app/node_modules ./node_modules
COPY services/securebot/src ./src
COPY services/securebot/package.json ./

USER securebot

EXPOSE 3003

CMD ["node", "src/index.js"]
