# Multi-stage Dockerfile for building the Vite React app and serving via nginx

# Build stage
FROM node:18-alpine AS build
WORKDIR /app

# Optional build-time arg to set where the built frontend should target the API.
# Example when building for Docker: VITE_API_URL=http://host.docker.internal:5001
ARG VITE_API_URL=''
ENV VITE_API_URL=${VITE_API_URL}

# Install dependencies (including devDependencies so build tools like Vite are available)
# Copy package files first to leverage Docker layer caching
COPY package.json package-lock.json* ./
COPY yarn.lock* ./
# Ensure the build stage installs both dependencies and devDependencies
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# Production stage (single final image)
FROM nginx:alpine

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy built files from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Expose default HTTP port
EXPOSE 80

# Copy our nginx config to enable SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Run nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
