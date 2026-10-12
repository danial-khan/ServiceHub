FROM node:22.11-alpine

WORKDIR /app

# Copy backend package files
COPY package*.json ./
RUN npm ci --only=production

# Copy backend source and build
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Copy public assets (catalog.json will be here)
COPY public ./public

# Expose default port
EXPOSE 9000

# Set default environment
ENV PORT=9000
ENV MODULES_DIR=/app/modules

# Run the server
CMD ["node", "dist/server.js"]
