FROM nikolaik/python-nodejs:python3.12-nodejs18-slim

WORKDIR /app

# Install system dependencies for scientific packages
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install Node dependencies
COPY package*.json ./
RUN npm install --production

# Copy app source
COPY . .

# Create virtual env shim since app.js expects ./venv/bin/python
RUN mkdir -p venv/bin && ln -s /usr/local/bin/python3 venv/bin/python

EXPOSE 3000

CMD ["node", "app.js"]

