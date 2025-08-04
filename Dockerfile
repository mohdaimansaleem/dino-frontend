# Build stage

FROM node:18-alpine as build
WORKDIR /app

# Copy package files and npm config
COPY package*.json .npmrc ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build with minimal environment variables (only needed for build process)
ENV GENERATE_SOURCEMAP=false
ENV NODE_ENV=production

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Install curl and bash for health checks and config generation
RUN apk add --no-cache curl bash

# Copy built app to nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy config generation script
COPY scripts/generate-config.sh /usr/local/bin/generate-config.sh
RUN chmod +x /usr/local/bin/generate-config.sh

# Copy environment validation script
COPY scripts/validate-env.sh /usr/local/bin/validate-env.sh
RUN chmod +x /usr/local/bin/validate-env.sh

# Copy startup script
COPY scripts/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Set proper permissions for nginx
RUN chmod -R 755 /usr/share/nginx/html

EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
 CMD curl -f http://localhost:8080/health || exit 1

# Use custom entrypoint that generates config and starts nginx
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]