FROM node:24-slim

# system deps for node-gyp / native modules (better-sqlite3)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# (опционально) чтобы node-gyp точно видел python
ENV PYTHON=/usr/bin/python3

COPY package*.json ./
# если есть package-lock.json — лучше npm ci
RUN if [ -f package-lock.json ]; then npm ci --verbose; else npm install --verbose; fi

COPY . .

CMD ["npm","run","start"]

