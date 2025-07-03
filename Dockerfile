# Stage 1: Build the React app
FROM node:18 AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app source code
COPY . ./

# Build the React app for production
RUN npm run build

# Stage 2: Serve the build using Nginx
FROM nginx:alpine

# Copy the production build to the Nginx public directory
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port 80 (standard HTTP)
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
