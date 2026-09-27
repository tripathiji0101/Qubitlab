# Multi-stage production build for QubitLab Frontend SPA
# Stage 1: Build static assets with Node.js
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies cleanly using lockfile
COPY package.json package-lock.json ./
RUN npm ci

# Copy application source
COPY . .

# Build-time environment arguments (public URLs)
ARG VITE_API_URL
ARG VITE_WS_URL
ARG VITE_ICE_SERVERS
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_WS_URL=${VITE_WS_URL}
ENV VITE_ICE_SERVERS=${VITE_ICE_SERVERS}

# Build optimized production bundle to /app/dist
RUN npm run build

# Stage 2: Serve static files with production Nginx
FROM nginx:1.27-alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

# Production Health Check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -q -O - http://localhost/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
