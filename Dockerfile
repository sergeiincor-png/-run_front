# ---- Base ----
FROM node:22-slim

ENV NODE_ENV=production

# System deps for native modules (better-sqlite3 via node-gyp)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    python3 \
    make \
    g++ \
    pkg-config \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy only manifests first (better caching)
COPY package*.json ./
COPY pnpm-lock.yaml* yarn.lock* ./

# Install deps (use the lockfile you have)
RUN if [ -f yarn.lock ]; then \
      corepack enable && yarn install --frozen-lockfile; \
    elif [ -f pnpm-lock.yaml ]; then \
      corepack enable && pnpm install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then \
      npm ci; \
    else \
      npm install; \
    fi

# Copy the rest
COPY . .

# If you have a build step (Next.js etc.)
# RUN npm run build

EXPOSE 8080

# Change to your actual start command
CMD ["npm", "run", "start"]
