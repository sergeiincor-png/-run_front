# syntax=docker/dockerfile:1

########################
# 1) deps (prod+dev)
########################
FROM node:20-slim AS deps
WORKDIR /app

# Для сборки нативных модулей (better-sqlite3 и т.п.)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 make g++ pkg-config \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
# ВАЖНО: тут нужны devDependencies, иначе build может не найти next/tsc/etc.
RUN npm ci

########################
# 2) builder
########################
FROM node:20-slim AS builder
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

########################
# 3) runner (минимальный)
########################
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Если у тебя better-sqlite3 используется в рантайме,
# бинарник уже собран на deps-стадии и попадёт через standalone.
# Но иногда нужен libstdc++ (обычно уже есть). Если словишь ошибку — добавим.
# RUN apt-get update && apt-get install -y --no-install-recommends libstdc++6 && rm -rf /var/lib/apt/lists/*

# Standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
# В standalone сервер лежит как server.js в корне
CMD ["node", "server.js"]
