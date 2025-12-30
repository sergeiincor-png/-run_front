# syntax=docker/dockerfile:1

FROM node:20-slim AS deps
WORKDIR /app

# Для better-sqlite3 (нужна сборка native)
RUN apt-get update && apt-get install -y --no-install-recommends \
  python3 make g++ pkg-config \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# важно: next.config.js => output: "standalone"
RUN npm run build

FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# если приложение слушает 3000
EXPOSE 3000

# Копируем standalone-сборку
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Если нужна sqlite база/папка — убедись что она монтируется volume'ом или копируется отдельно
CMD ["node", "server.js"]
