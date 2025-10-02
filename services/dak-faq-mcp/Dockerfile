# DAK FAQ MCP Server Dockerfile for Fly.io deployment

FROM node:18-alpine

# Create app user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S app -u 1001

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
COPY tsconfig.json ./
RUN npm ci && npm cache clean --force

# Copy source code and build
COPY . .
RUN npm run build

# Remove dev dependencies and source files to reduce image size
RUN npm prune --omit=dev && \
    rm -rf src/ tsconfig.json

# Switch to non-root user
USER app

# Expose port (configurable via environment)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1));"

# Start the application  
CMD ["node", "dist/index.js"]