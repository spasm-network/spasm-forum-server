# Build stage
FROM node:20-bookworm AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Runtime stage
FROM node:20-bookworm

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production --ignore-scripts

# Copy built app from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 5000

# Health check (optional but recommended)
# HEALTHCHECK --interval=180s --timeout=10s --start-period=40s --retries=3 \
#   CMD node -e "require('http').get('http://localhost:5000/api/events', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start app
# CMD ["node", "./dist/api/index.js"]
CMD ["npm", "run", "start-docker"]
