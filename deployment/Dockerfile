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

# Install curl, bash, and gettext for health checks, config generation, and envsubst
RUN apk add --no-cache curl bash gettext

# Copy built app to nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx configuration template and fallback
COPY nginx.conf.template /etc/nginx/nginx.conf.template
COPY nginx.conf /etc/nginx/nginx.conf

# Remove default nginx config to avoid conflicts
RUN rm -f /etc/nginx/conf.d/default.conf

# Copy config generation script
COPY scripts/generate-config.sh /usr/local/bin/generate-config.sh
RUN chmod +x /usr/local/bin/generate-config.sh

# Copy debug script
COPY scripts/debug-container.sh /usr/local/bin/debug-container.sh
RUN chmod +x /usr/local/bin/debug-container.sh

# Environment validation is handled by generate-config.sh

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