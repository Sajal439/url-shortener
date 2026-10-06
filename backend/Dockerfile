# ───────────────────────────────────────────
# Stage 1: "builder" — compile TypeScript
# ───────────────────────────────────────────
# We use a multi-stage build. Why?
# Stage 1 has TypeScript compiler (devDependencies) — big, not needed in prod
# Stage 2 copies only the compiled JS output — small, production-ready
FROM node:22-alpine AS builder

# alpine = minimal Linux (~5MB vs ~200MB for full Ubuntu)
# It's the standard base for production Node images

WORKDIR /app

# Copy package files first — before source code.
# Docker caches each layer. If package.json didn't change,
# Docker reuses the cached node_modules layer (much faster rebuilds).
COPY package*.json ./
COPY prisma ./prisma/

# Install ALL deps (including devDependencies for the TypeScript compiler)
RUN npm ci

# Generate Prisma client (must run after npm install, before build)
RUN npx prisma generate

# Now copy source and compile
COPY tsconfig.json ./
COPY src ./src/
RUN npm run build

# ───────────────────────────────────────────
# Stage 2: "runner" — lean production image
# ───────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

# Only copy what production needs:
# - compiled JS (from builder stage)
# - package files (to install prod deps only)
# - prisma (client is needed at runtime)
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src/generated ./src/generated
COPY package*.json ./

# Install ONLY production dependencies (no TypeScript compiler etc.)
RUN npm ci --omit=dev

# Run as non-root user — security best practice
# Never run Node in production as root
USER node

EXPOSE 3000

# Use "node" not "npm start" — node handles signals (SIGTERM) correctly
# npm wraps node and swallows SIGTERM, breaking graceful shutdown
CMD ["node", "dist/server.js"]