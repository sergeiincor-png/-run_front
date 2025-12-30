# syntax=docker/dockerfile:1

FROM node:20-slim

WORKDIR /app
ENV NODE_ENV=production
ENV PYTHON=/usr/bin/python3

# === ОБЯЗАТЕЛЬНО для better-sqlite3 ===
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# === зависимости ===
COPY package.json package-lock.json ./
RUN npm ci

# === код ===
COPY . .

# === сборка Next.js ===
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
