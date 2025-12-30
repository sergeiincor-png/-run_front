# syntax=docker/dockerfile:1

########################
# 1. Dependencies
########################
FROM node:20-alpine AS deps
WORKDIR /app

# Нужны для сборки native-модулей (better-sqlite3)
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    sqlite-dev

COPY package.json package-lock.json* ./
RUN npm install

########################
# 2. Build
########################
FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    sqlite-dev

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Инициализация БД + сборка Next.js
RUN npm run db:init && npm run build

########################
# 3. Runtime
########################
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Только runtime-зависимости (без build tools)
RUN apk add --no-cache sqlite-libs

# Next.js standalone output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Данные SQLite
RUN mkdir -p /app/data

EXPOSE 3000
CMD ["node", "server.js"]
