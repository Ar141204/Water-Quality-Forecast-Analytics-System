# Stage 1: Python Environment
FROM python:3.12-slim as python-base

WORKDIR /app

# Install system dependencies for scientific packages
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Stage 2: Application
FROM node:18-slim

WORKDIR /app

# Copy Python environment from Stage 1
COPY --from=python-base /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=python-base /usr/local/bin /usr/local/bin

# Install app dependencies
COPY package*.json ./
RUN npm install --production

# Copy app source
COPY . .

# Create virtual env shim since app.js expects ./venv/bin/python
# We just symlink the system python to that path
RUN mkdir -p venv/bin && ln -s /usr/local/bin/python3 venv/bin/python

EXPOSE 3000

CMD ["node", "app.js"]
