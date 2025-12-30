# syntax=docker/dockerfile:1

FROM node:22-slim

ENV NODE_ENV=production
WORKDIR /app

# Системные зависимости для better-sqlite3
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    pkg-config \
    ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Сначала зависимости (для кеша)
COPY package.json package-lock.json ./
RUN npm ci

# Потом весь код
COPY . .

# Сборка Next.js
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
