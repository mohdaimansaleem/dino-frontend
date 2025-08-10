

# Dino Frontend Dockerfile

FROM node:18-alpine AS builder



WORKDIR /app

# Copy package files and npm config
COPY package*.json .npmrc ./

# Install all dependencies (including dev dependencies for build)
RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build



FROM nginx:alpine



# Install bash and curl

RUN apk add --no-cache bash curl



# Copy nginx config FIRST to ensure it's not cached

COPY nginx.conf /etc/nginx/nginx.conf



# Verify nginx config is correct

RUN nginx -t



# Copy built app

COPY --from=builder /app/build /usr/share/nginx/html



# Copy scripts

COPY scripts/ /usr/local/bin/

RUN chmod +x /usr/local/bin/*.sh



EXPOSE 8080



ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]