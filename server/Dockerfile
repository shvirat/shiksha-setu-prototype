FROM node:20-alpine

WORKDIR /app

# Copy root workspace manifests
COPY package.json package-lock.json* ./
COPY server/package.json ./server/
COPY client/package.json ./client/

# Install dependencies across workspaces
RUN npm install

# Copy application code
COPY server/ ./server/

WORKDIR /app/server

EXPOSE 5000

CMD ["npm", "start"]
